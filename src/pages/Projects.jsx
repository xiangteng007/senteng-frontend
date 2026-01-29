import React, { useState } from 'react';
import { WidgetWrapper } from '../components/common/WidgetWrapper';
import {
  WidgetProjectStats,
  WidgetProjectList,
  WidgetProjectInfo,
  WidgetProjectFiles,
} from '../components/widgets/ProjectWidgets';
import { WidgetProjectVendors } from '../components/widgets/ProjectVendorsWidget';
import { WidgetProjectInventory } from '../components/widgets/ProjectInventoryWidget';
import { WidgetProjectRecords } from '../components/widgets/WidgetProjectRecords';
import { WidgetProjectFinanceDetail } from '../components/widgets/WidgetProjectFinanceDetail';
import { AddVendorModal } from '../components/project/AddVendorModal';
import { AddInventoryModal } from '../components/project/AddInventoryModal';
import {
  Plus,
  ChevronLeft,
  Calendar as CalendarIcon,
  Upload,
  ImageIcon,
  Edit2,
  Save,
  X,
  Trash2,
  Database,
  ClipboardList,
  MapPin,
  Users,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { InputField } from '../components/common/InputField';
import { LocationField } from '../components/common/LocationField';
import { ProgressBar } from '../components/common/Indicators';
import SearchableSelect from '../components/common/SearchableSelect';
import { projectsApi } from '../services/api';
import { GoogleService } from '../services/GoogleService';
import WidgetProjectProgress from '../components/common/WidgetProjectProgress';

const Projects = ({

  data,
  loading,
  addToast,
  onSelectProject,
  activeProject: propActiveProject,
  setActiveProject: propSetActiveProject,
  onUpdateProject,
  onDeleteProject,
  allTransactions = [],
  onAddGlobalTx,
  accounts = [],
  allVendors,
  allInventory,
  allClients,
}) => {
  // Use internal state if props not provided
  const [internalActiveProject, setInternalActiveProject] = useState(null);
  const activeProject = propActiveProject !== undefined ? propActiveProject : internalActiveProject;
  const setActiveProject = propSetActiveProject || setInternalActiveProject;

  // List View State
  const [listWidgets, setListWidgets] = useState([
    { id: 'wp-stats', type: 'project-stats', title: '專案概況', size: 'S' },
    { id: 'wp-list', type: 'project-list', title: '專案列表', size: 'L' },
  ]);

  // Detail View State
  const [detailWidgets, setDetailWidgets] = useState([
    { id: 'wp-info', type: 'info', title: '基本資訊', size: 'S' },
    { id: 'wp-vendors', type: 'vendors', title: '參與廠商', size: 'M' },
    { id: 'wp-records', type: 'records', title: '工程紀錄', size: 'L' },
    { id: 'wp-finance', type: 'finance', title: '專案收支', size: 'M' },
    { id: 'wp-inventory', type: 'inventory', title: '庫存追蹤', size: 'M' },
    { id: 'wp-progress', type: 'progress', title: '進度追蹤', size: 'L' },
    { id: 'wp-files', type: 'files', title: '檔案中心', size: 'M' },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    type: '翻修',
    budget: '',
    location: '',
    startDate: '',
    endDate: '',
    status: '設計中',
  });

  // Edit & Delete State
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Vendor & Inventory Modals
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Folder selection state
  const [folderMode, setFolderMode] = useState('auto'); // 'auto' = 自動新增, 'link' = 關聯現有
  const [existingFolderUrl, setExistingFolderUrl] = useState('');
  const [existingFolders, setExistingFolders] = useState([]);
  const [projectRootId, setProjectRootId] = useState(null);

  // Detail Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    type: '工程紀錄',
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
    location: '',
    attendees: '',
    todos: [],
    photos: [],
  });

  // Transaction Modal
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [newTx, setNewTx] = useState({
    type: '支出',
    category: '材料費',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    desc: '',
    vendor: '',
    invoiceNo: '',
    status: '已付款',
  });

  const handleResize = (widgets, setWidgets) => (id, size) =>
    setWidgets(prev => prev.map(w => (w.id === id ? { ...w, size } : w)));

  // Edit Handlers
  const startEdit = () => {
    setEditFormData({ ...activeProject });
    setIsEditing(true);
  };

  const saveEdit = () => {
    onUpdateProject(editFormData);
    setActiveProject(editFormData);
    setIsEditing(false);
    addToast('專案資訊已更新！', 'success');
  };

  const cancelEdit = () => {
    setEditFormData({});
    setIsEditing(false);
  };

  // Add Project Handler with Google Drive Integration
  const handleAddProject = async () => {
    if (!newProject.name || !newProject.client) {
      addToast('請填寫專案名稱和客戶', 'error');
      return;
    }

    // 如果選擇關聯現有資料夾，需要填寫URL
    if (folderMode === 'link' && !existingFolderUrl) {
      addToast('請填寫或選擇現有資料夾', 'error');
      return;
    }

    setIsSaving(true);
    try {
      let driveUrl = existingFolderUrl;

      if (folderMode === 'auto') {
        // Step 1: 獲取或建立「專案管理」根資料夾
        const rootResult = await GoogleService.getOrCreateProjectRoot();
        if (rootResult.success) {
          // Step 2: 在「專案管理」下建立專案資料夾
          const folderName = `${newProject.name} - ${newProject.client}`;
          const driveResult = await GoogleService.createDriveFolder(
            folderName,
            rootResult.folderId
          );
          if (driveResult.success) {
            driveUrl = driveResult.url;
          }
        }
      }

      // Map frontend type to backend enum: INTERIOR, ARCHITECTURE, CONSTRUCTION, RENOVATION
      const typeMap = {
        翻修: 'RENOVATION',
        新建: 'CONSTRUCTION',
        設計: 'INTERIOR',
        裝潢: 'INTERIOR',
      };
      const projectData = {
        name: newProject.name,
        customerId: newProject.client,
        projectType: typeMap[newProject.type] || 'INTERIOR',
        costBudget: parseFloat(newProject.budget) || 0,
        address: newProject.location,
        startDate: newProject.startDate || null,
        endDate: newProject.endDate || null,
        driveFolder: driveUrl,
      };

      const savedProject = await projectsApi.create(projectData);
      onUpdateProject(savedProject);

      addToast(`專案「${newProject.name}」已建立！`, 'success', {
        link: driveUrl,
        linkText: '開啟 Drive 資料夾',
      });

      setIsAddModalOpen(false);
      setFolderMode('auto');
      setExistingFolderUrl('');
      setNewProject({
        name: '',
        client: '',
        type: '翻修',
        budget: '',
        location: '',
        startDate: '',
        endDate: '',
        status: '設計中',
      });
    } catch (error) {
      console.error('Create project failed:', error);
      addToast(`建立失敗: ${error.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // File Upload Handler - Upload to project's Drive folder
  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (file) {
      if (!activeProject.driveFolder) {
        addToast('此專案沒有 Drive 資料夾', 'error');
        return;
      }

      addToast('正在上傳檔案...', 'info');
      const res = await GoogleService.uploadToDrive(
        file,
        activeProject.name,
        activeProject.driveFolder
      );

      if (res.success) {
        const fileRecord = {
          id: `file-${Date.now()}`,
          name: file.name,
          url: res.url,
          uploadDate: new Date().toLocaleDateString('zh-TW'),
          size: file.size,
        };
        const updatedProject = {
          ...activeProject,
          files: [...(activeProject.files || []), fileRecord],
        };
        onUpdateProject(updatedProject);
        setActiveProject(updatedProject);
        addToast(`檔案「${file.name}」已上傳至 Drive`, 'success', {
          link: res.url,
          linkText: '開啟檔案',
        });
      } else {
        addToast(`檔案上傳失敗: ${res.error}`, 'error');
      }
    }
  };
  // Delete Handler - 只從列表中移除，不刪除 Drive 資料夾
  const handleDeleteProject = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    // Remove project from data array
    if (onDeleteProject) {
      onDeleteProject(activeProject.id);
    }
    addToast(`專案「${activeProject.name}」已從列表移除（Drive 資料夾保留）`, 'success');
    setIsDeleteModalOpen(false);
    setActiveProject(null);
  };

  // Vendor Handlers
  const handleAddVendor = vendorData => {
    const updatedProject = {
      ...activeProject,
      vendors: [...(activeProject.vendors || []), vendorData],
    };
    onUpdateProject(updatedProject);
    setActiveProject(updatedProject);
    setIsVendorModalOpen(false);
    addToast(`廠商「${vendorData.name}」已加入專案`, 'success');
  };

  const handleRemoveVendor = vendorId => {
    const updatedProject = {
      ...activeProject,
      vendors: activeProject.vendors.filter(v => v.vendorId !== vendorId),
    };
    onUpdateProject(updatedProject);
    setActiveProject(updatedProject);
    addToast('廠商已移除', 'info');
  };

  // Record Handler - Save records with metadata via API
  const handleAddRecord = async () => {
    const record = {
      ...newRecord,
      id: `r-${Date.now()}`,
      date: new Date().toLocaleDateString('zh-TW'),
      time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
      author: '使用者A',
    };

    try {
      const updatedRecords = [record, ...(activeProject.records || [])];
      const updatedProject = await projectsApi.update(activeProject.id, {
        records: updatedRecords,
      });

      onUpdateProject(updatedProject);
      setActiveProject(updatedProject);

      setNewRecord({ type: '工程', content: '', photos: [] });
      setIsRecordModalOpen(false);
      addToast('工程紀錄已新增', 'success');
    } catch (error) {
      console.error('Add record failed:', error);
      addToast(`新增失敗: ${error.message}`, 'error');
    }
  };

  // Inventory Handlers
  const handleAddInventory = inventoryData => {
    const updatedProject = {
      ...activeProject,
      inventory: [...(activeProject.inventory || []), inventoryData],
    };
    onUpdateProject(updatedProject);
    setActiveProject(updatedProject);
    setIsInventoryModalOpen(false);
    addToast(
      `已記錄${inventoryData.type === '出' ? '出庫' : '入庫'}：${inventoryData.itemName} x${inventoryData.quantity}`,
      'success'
    );
  };

  // Sync project transactions to Sheet
  const handleSyncProjectFinance = async () => {
    if (!activeProject?.folderId) {
      addToast('此專案沒有 Drive 資料夾', 'error');
      return;
    }

    const projectTx = allTransactions.filter(t => t.projectId === activeProject.id);
    if (projectTx.length === 0) {
      addToast('尚無收支記錄可同步', 'info');
      return;
    }

    addToast('正在同步專案收支...', 'info');
    try {
      const result = await GoogleService.syncAllProjectTransactions(
        activeProject.folderId,
        activeProject.name,
        projectTx.map(t => ({
          date: t.date,
          type: t.type,
          category: t.category || '',
          amount: t.amount,
          target: '',
          account: accounts?.find(a => a.id === t.accountId)?.name || '',
          invoiceNo: '',
          note: t.desc || '',
        }))
      );

      if (result.success) {
        addToast(`已同步 ${projectTx.length} 筆收支到專案 Sheet`, 'success', {
          action: { label: '開啟 Sheet', onClick: () => window.open(result.sheetUrl, '_blank') },
        });
      } else {
        addToast(`同步失敗: ${result.error}`, 'error');
      }
    } catch (error) {
      addToast(`同步失敗: ${error.message}`, 'error');
    }
  };

  if (activeProject) {
    const projectTx = allTransactions.filter(t => t.projectId === activeProject.id);

    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <button
          onClick={() => setActiveProject(null)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-4"
        >
          <ChevronLeft size={16} /> 返回列表
        </button>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div>
              {isEditing ? (
                <input
                  value={editFormData.name}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="text-2xl font-bold text-gray-800 bg-yellow-50 border-2 border-yellow-300 rounded px-2 py-1"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-800">{activeProject.name}</h2>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-mono bg-gray-100 px-1.5 rounded">{activeProject.code}</span>
                <span>·</span>
                {isEditing ? (
                  <select
                    value={editFormData.status}
                    onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="px-2 py-0.5 rounded-full text-xs border-2 border-blue-300"
                  >
                    <option>設計中</option>
                    <option>施工中</option>
                    <option>完工驗收</option>
                    <option>已完工</option>
                  </select>
                ) : (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs text-white ${activeProject.status === '施工中' ? 'bg-morandi-orange-500' : 'bg-morandi-blue-500'}`}
                  >
                    {activeProject.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <X size={16} /> 取消
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Save size={16} /> 儲存
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={startEdit}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Edit2 size={16} /> 編輯
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Trash2 size={16} /> 刪除
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto">
          {detailWidgets.map((w, i) => (
            <WidgetWrapper
              key={w.id}
              widget={w}
              onResize={handleResize(detailWidgets, setDetailWidgets)}
            >
              {w.type === 'info' && <WidgetProjectInfo project={activeProject} size={w.size} />}
              {/* Reuse Widgets */}
              {w.type === 'files' && (
                <WidgetProjectFiles
                  files={activeProject.files || []}
                  size={w.size}
                  onUpload={() => { }}
                />
              )}
              {w.type === 'records' && (
                <WidgetProjectRecords
                  records={activeProject.records || []}
                  size={w.size}
                  onAddRecord={() => setIsRecordModalOpen(true)}
                />
              )}
              {w.type === 'finance' && (
                <WidgetProjectFinanceDetail
                  transactions={projectTx}
                  size={w.size}
                  onAddTx={() => setIsTxModalOpen(true)}
                  onSyncToSheet={handleSyncProjectFinance}
                  project={activeProject}
                />
              )}
              {w.type === 'vendors' && (
                <WidgetProjectVendors
                  vendors={activeProject.vendors || []}
                  size={w.size}
                  onAddVendor={() => setIsVendorModalOpen(true)}
                  onRemoveVendor={handleRemoveVendor}
                />
              )}
              {w.type === 'inventory' && (
                <WidgetProjectInventory
                  inventory={activeProject.inventory || []}
                  size={w.size}
                  onAddRecord={() => setIsInventoryModalOpen(true)}
                />
              )}
              {w.type === 'progress' && (
                <WidgetProjectProgress
                  project={activeProject}
                  onUpdateProject={onUpdateProject}
                  size={w.size}
                  addToast={addToast}
                />
              )}
            </WidgetWrapper>
          ))}
        </div>

        <Modal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          title="新增工程/會議紀錄"
          onConfirm={() => {
            if (!newRecord.title && !newRecord.content) {
              return addToast('請填寫標題或內容', 'error');
            }
            const record = {
              id: `r-${Date.now()}`,
              author: 'Admin',
              createdAt: new Date().toISOString(),
              ...newRecord,
              todos: newRecord.todos.filter(t => t.trim() !== ''),
            };
            onUpdateProject({
              ...activeProject,
              records: [record, ...(activeProject.records || [])],
            });
            setNewRecord({
              type: '工程紀錄',
              date: new Date().toISOString().split('T')[0],
              title: '',
              content: '',
              location: '',
              attendees: '',
              todos: [],
              photos: [],
            });
            setIsRecordModalOpen(false);
            addToast('紀錄已新增', 'success');
          }}
        >
          <div className="space-y-4">
            {/* 紀錄類型 + 日期 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <ClipboardList size={14} /> 紀錄類型
                </label>
                <select
                  value={newRecord.type}
                  onChange={e => setNewRecord({ ...newRecord, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="工程紀錄">🔧 工程紀錄</option>
                  <option value="會議紀錄">📋 會議紀錄</option>
                  <option value="驗收紀錄">✅ 驗收紀錄</option>
                  <option value="施工日誌">📝 施工日誌</option>
                  <option value="其他">📌 其他</option>
                </select>
              </div>
              <InputField
                label="日期"
                type="date"
                value={newRecord.date}
                onChange={e => setNewRecord({ ...newRecord, date: e.target.value })}
              />
            </div>

            {/* 標題 */}
            <InputField
              label="標題"
              value={newRecord.title}
              onChange={e => setNewRecord({ ...newRecord, title: e.target.value })}
              placeholder="例：二樓泥作完成驗收"
            />

            {/* 內容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">內容</label>
              <textarea
                value={newRecord.content}
                onChange={e => setNewRecord({ ...newRecord, content: e.target.value })}
                placeholder="詳細描述工程進度或會議內容..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
              />
            </div>

            {/* 地點 + 參與人員 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin size={14} /> 地點
                </label>
                <input
                  type="text"
                  value={newRecord.location}
                  onChange={e => setNewRecord({ ...newRecord, location: e.target.value })}
                  placeholder="例：現場/會議室"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Users size={14} /> 參與人員
                </label>
                <input
                  type="text"
                  value={newRecord.attendees}
                  onChange={e => setNewRecord({ ...newRecord, attendees: e.target.value })}
                  placeholder="例：王工程師、李監工"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 待辦事項 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">待辦事項</label>
              <div className="space-y-2">
                {newRecord.todos.map((todo, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={todo}
                      onChange={e => {
                        const updated = [...newRecord.todos];
                        updated[idx] = e.target.value;
                        setNewRecord({ ...newRecord, todos: updated });
                      }}
                      placeholder="待辦事項..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = newRecord.todos.filter((_, i) => i !== idx);
                        setNewRecord({ ...newRecord, todos: updated });
                      }}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setNewRecord({ ...newRecord, todos: [...newRecord.todos, ''] })}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 py-1"
                >
                  <Plus size={14} /> 新增待辦事項
                </button>
              </div>
            </div>
          </div>
        </Modal>

        {/* Transaction Modal */}
        <Modal
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          title="新增收支"
          onConfirm={() => {
            if (!newTx.amount || Number(newTx.amount) <= 0) {
              return addToast('請填寫有效金額', 'error');
            }
            // Handle custom vendor/client input
            const vendorValue =
              newTx.vendor === '__other__' ? newTx.vendorCustom || '' : newTx.vendor;
            const tx = {
              id: `tx-${Date.now()}`,
              projectId: activeProject.id,
              projectName: activeProject.name,
              ...newTx,
              vendor: vendorValue,
              amount: Number(newTx.amount),
              createdAt: new Date().toISOString(),
            };

            // Update project's local transactions
            const updatedTx = [...(activeProject.transactions || []), tx];
            onUpdateProject({ ...activeProject, transactions: updatedTx });

            // Sync to global finance transactions
            if (onAddGlobalTx) {
              onAddGlobalTx(tx);
            }

            setNewTx({
              type: '支出',
              category: '材料費',
              amount: '',
              date: new Date().toISOString().split('T')[0],
              desc: '',
              vendor: '',
              invoiceNo: '',
              status: '已付款',
            });
            setIsTxModalOpen(false);
            addToast('收支已新增並同步至財務管理', 'success');
          }}
        >
          <div className="space-y-4">
            {/* 收入/支出 Toggle Tab - 與財務管理相同樣式 */}
            <div className="flex gap-4 mb-2 bg-gray-50 p-1 rounded-xl">
              <button
                type="button"
                onClick={() =>
                  setNewTx({
                    ...newTx,
                    type: '收入',
                    category: '工程款',
                    vendor: '',
                    status: '待收款',
                  })
                }
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newTx.type === '收入' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400'}`}
              >
                收入
              </button>
              <button
                type="button"
                onClick={() =>
                  setNewTx({
                    ...newTx,
                    type: '支出',
                    category: '材料費',
                    vendor: '',
                    status: '待付款',
                  })
                }
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newTx.type === '支出' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
              >
                支出
              </button>
            </div>

            {/* 金額 + 日期 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="金額"
                type="number"
                value={newTx.amount}
                onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
                placeholder="請輸入金額"
              />
              <InputField
                label="日期"
                type="date"
                value={newTx.date}
                onChange={e => setNewTx({ ...newTx, date: e.target.value })}
              />
            </div>

            {/* 類別 + 廠商/客戶 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="類別"
                type="select"
                value={newTx.category}
                onChange={e => setNewTx({ ...newTx, category: e.target.value })}
              >
                <option value="">請選擇類別</option>
                {newTx.type === '支出' ? (
                  <>
                    <option value="材料費">材料費</option>
                    <option value="人工費">人工費</option>
                    <option value="設備費">設備費</option>
                    <option value="運輸費">運輸費</option>
                    <option value="其他支出">其他支出</option>
                  </>
                ) : (
                  <>
                    <option value="工程款">工程款</option>
                    <option value="追加款">追加款</option>
                    <option value="其他收入">其他收入</option>
                  </>
                )}
              </InputField>
              <InputField
                label={newTx.type === '支出' ? '廠商' : '客戶'}
                type="select"
                value={newTx.vendor}
                onChange={e => setNewTx({ ...newTx, vendor: e.target.value })}
              >
                <option value="">請選擇{newTx.type === '支出' ? '廠商' : '客戶'}</option>
                {newTx.type === '支出'
                  ? (allVendors || []).map(v => (
                    <option key={v.id} value={v.name}>
                      {v.name}
                    </option>
                  ))
                  : (allClients || []).map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                <option value="__other__">手動輸入...</option>
              </InputField>
            </div>

            {/* 手動輸入廠商/客戶 */}
            {newTx.vendor === '__other__' && (
              <InputField
                label={newTx.type === '支出' ? '廠商名稱' : '客戶名稱'}
                value={newTx.vendorCustom || ''}
                onChange={e => setNewTx({ ...newTx, vendorCustom: e.target.value })}
                placeholder={`輸入${newTx.type === '支出' ? '廠商' : '客戶'}名稱`}
              />
            )}

            {/* 發票號碼 + 付款狀態 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="發票號碼"
                value={newTx.invoiceNo}
                onChange={e => setNewTx({ ...newTx, invoiceNo: e.target.value })}
                placeholder="例：AB12345678"
              />
              <InputField
                label="付款狀態"
                type="select"
                value={newTx.status}
                onChange={e => setNewTx({ ...newTx, status: e.target.value })}
              >
                {newTx.type === '支出' ? (
                  <>
                    <option value="待付款">待付款</option>
                    <option value="已付款">已付款</option>
                  </>
                ) : (
                  <>
                    <option value="待收款">待收款</option>
                    <option value="已收款">已收款</option>
                  </>
                )}
              </InputField>
            </div>

            {/* 關聯專案 (已自動選取當前專案) */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <span className="text-sm text-blue-600 font-medium">📁 關聯專案：</span>
              <span className="text-sm text-blue-800 ml-2">
                {activeProject?.name || '未知專案'}
              </span>
            </div>

            {/* 摘要 */}
            <InputField
              label="摘要"
              value={newTx.desc}
              onChange={e => setNewTx({ ...newTx, desc: e.target.value })}
              placeholder="例：購買水泥 20 包"
            />
          </div>
        </Modal>

        <AddVendorModal
          isOpen={isVendorModalOpen}
          onClose={() => setIsVendorModalOpen(false)}
          onConfirm={handleAddVendor}
          allVendors={allVendors || []}
        />

        <AddInventoryModal
          isOpen={isInventoryModalOpen}
          onClose={() => setIsInventoryModalOpen(false)}
          onConfirm={handleAddInventory}
          allInventory={allInventory || []}
        />

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="從列表移除專案"
          onConfirm={confirmDelete}
          confirmText="確定移除"
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-medium">📁 Drive 資料夾將會保留</p>
            </div>
            <p className="text-gray-700">
              您確定要從列表移除專案「<span className="font-bold">{activeProject?.name}</span>」嗎？
            </p>
            <p className="text-sm text-gray-500">
              專案將從系統列表中移除，但 Google Drive 中的資料夾及所有檔案將會保留。
            </p>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <>
      {/* Projects List View */}
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-morandi-text-primary">專案管理</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-morandi-text-accent text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
          >
            <Plus size={16} /> <span className="hidden sm:inline">新增專案</span>
            <span className="sm:hidden">新增</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-auto">
          {listWidgets.map((w, i) => (
            <WidgetWrapper
              key={w.id}
              widget={w}
              onResize={handleResize(listWidgets, setListWidgets)}
            >
              {w.type === 'project-stats' && (
                <WidgetProjectStats data={data?.projects || data || []} size={w.size} />
              )}
              {w.type === 'project-list' && (
                <WidgetProjectList
                  data={data?.projects || data || []}
                  size={w.size}
                  onSelectProject={setActiveProject}
                  onAdd={() => setIsAddModalOpen(true)}
                />
              )}
            </WidgetWrapper>
          ))}
        </div>
      </div>
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="建立新專案"
        onConfirm={handleAddProject}
        confirmDisabled={isSaving}
        confirmText={isSaving ? '處理中...' : '確認'}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="專案名稱"
            value={newProject.name}
            onChange={e => setNewProject({ ...newProject, name: e.target.value })}
            placeholder="例：信義區住宅翻修"
          />
          <SearchableSelect
            label="客戶"
            value={newProject.client}
            onChange={clientId => setNewProject({ ...newProject, client: clientId })}
            options={allClients || []}
            placeholder="請選擇客戶..."
            searchPlaceholder="搜尋客戶名稱或編號..."
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="專案類型"
            type="select"
            value={newProject.type}
            onChange={e => setNewProject({ ...newProject, type: e.target.value })}
          >
            <option value="翻修">翻修</option>
            <option value="新建">新建</option>
            <option value="設計">設計</option>
            <option value="裝潢">裝潢</option>
          </InputField>
          <InputField
            label="預算"
            type="number"
            value={newProject.budget}
            onChange={e => setNewProject({ ...newProject, budget: e.target.value })}
            placeholder="例：500000"
          />
        </div>
        <LocationField
          label="專案地點"
          value={newProject.location || ''}
          onChange={e => setNewProject({ ...newProject, location: e.target.value })}
          placeholder="例：台北市信義區松智路1號"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="開始日期"
            type="date"
            value={newProject.startDate}
            onChange={e => setNewProject({ ...newProject, startDate: e.target.value })}
          />
          <InputField
            label="預計完工"
            type="date"
            value={newProject.endDate}
            onChange={e => setNewProject({ ...newProject, endDate: e.target.value })}
          />
        </div>

        {/* Drive 資料夾設定 */}
        <div className="border-t pt-4 mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">Drive 資料夾設定</label>
          <div className="flex gap-4 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="folderMode"
                value="auto"
                checked={folderMode === 'auto'}
                onChange={() => setFolderMode('auto')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">自動建立新資料夾</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="folderMode"
                value="link"
                checked={folderMode === 'link'}
                onChange={() => setFolderMode('link')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">關聯現有資料夾</span>
            </label>
          </div>

          {folderMode === 'auto' && (
            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              將在「專案管理」資料夾下自動建立：
              <strong>
                {newProject.name || '[專案名稱]'} - {newProject.client || '[客戶]'}
              </strong>
            </p>
          )}

          {folderMode === 'link' && (
            <InputField
              label="現有資料夾連結"
              value={existingFolderUrl}
              onChange={e => setExistingFolderUrl(e.target.value)}
              placeholder="貼上 Google Drive 資料夾連結，例：https://drive.google.com/drive/folders/xxxxx"
            />
          )}
        </div>
      </Modal>
    </>
  );
};
export default Projects;
