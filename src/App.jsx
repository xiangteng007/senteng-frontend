import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  FileText,
  FileSignature,
  RefreshCw,
  Receipt,
  CreditCard,
  Building2,
  TrendingUp,
  Settings,
  Link2,
  FolderOpen,
  Bell,
  Calculator,
  Ruler,
  LogOut,
  ShoppingCart,
  ClipboardList,
  Menu,
  X,
  Layers,
  Wallet,
  Package,
  HardHat
} from 'lucide-react';

// Import P0 pages from design-system
import MaterialCalculator from './pages/MaterialCalculator';
import CostEstimator from './pages/CostEstimator';
import EngineeringEstimateWorkspace from './pages/EngineeringEstimateWorkspace';
import QuotationEditor from './pages/QuotationEditor';
import BimManagement from './pages/BimManagement';
import CmmAdminPage from './pages/CmmAdminPage';
import ContractsPage from './pages/Contracts';
import ConstructionPage from './pages/Construction';

// Import refactored core pages with working Add functionality
import ProjectsPage from './pages/Projects';
import ClientsPage from './pages/Clients';
import VendorsPage from './pages/Vendors';
import InventoryPage from './pages/Inventory';
import FinancePage from './pages/Finance';
import CalendarPage from './pages/Calendar';
import QuotationsPage from './pages/Quotations';
import ChangeOrdersPage from './pages/ChangeOrders';
import PaymentsPage from './pages/Payments';
import ProfitAnalysisPage from './pages/ProfitAnalysis';
import InvoicesPage from './pages/Invoices';
import InvoiceHelperPage from './pages/InvoiceHelperPage';
import UserManagement from './pages/UserManagement';
import LoginPage from './pages/LoginPage';
// CustomersPage removed - using Clients instead
import ProcurementsPage from './pages/Procurements';
import SiteLogsPage from './pages/SiteLogs';
import IntegrationsPage from './pages/IntegrationsPage';
import StoragePage from './pages/StoragePage';
import DashboardPage from './pages/Dashboard';
import { clientsApi, projectsApi } from './services/api';

// Import shared components
import { Badge } from './components/common/Badge';
import { Card } from './components/common/Card';
import { ToastContainer } from './components/common/Toast';
import { BottomNav } from './components/layout/BottomNav';

// --- MAIN LAYOUT & APP ---


const SidebarGroup = ({ label, children }) => (
  <div className="mb-4">
    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
    <div className="space-y-1">{children}</div>
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${active
      ? 'bg-gray-800 text-white shadow-md'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
  >
    <Icon size={18} className={active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const App = () => {
  const { user, loading, signOut } = useAuth();
  // URL path to tab mappings
  const ROUTES = {
    '/': 'dashboard',
    '/dashboard': 'dashboard',
    '/clients': 'clients',
    '/projects': 'projects',
    '/events': 'events',
    '/quotations': 'quotations',
    '/contracts': 'contracts',
    '/change-orders': 'change-orders',
    '/invoices': 'invoices',
    '/payments': 'payments',
    '/finance': 'finance',
    '/profit-analysis': 'profit-analysis',
    '/inventory': 'inventory',
    '/vendors': 'vendors',
    '/users': 'users',
    '/integrations': 'integrations',
    '/storage': 'storage',
    '/engineering-estimate': 'engineering-estimate',
    '/material-calc': 'material-calc',
    '/cost-estimator': 'cost-estimator',
    '/cost-est': 'cost-estimator',
    '/cmm-admin': 'cmm-admin',
    '/quotation-edit': 'quotation-edit',
    '/bim': 'bim',
    '/invoice-helper': 'invoice-helper',
    '/procurements': 'procurements',
    '/site-logs': 'site-logs'
  };

  // Get initial tab from URL
  const getTabFromPath = (path) => ROUTES[path] || 'dashboard';
  const [activeTab, setActiveTab] = useState(() => getTabFromPath(window.location.pathname));
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch clients and projects data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, projectsData] = await Promise.all([
          clientsApi.getAll(),
          projectsApi.getAll()
        ]);
        // API returns { items: [], total: N }, extract the items array
        setClients(clientsData?.items || clientsData || []);
        setProjects(projectsData?.items || projectsData || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  // Proper addToast function with full signature (message, type, options)
  const addToast = (message, type = 'info', options = {}) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, action: options.action }]);
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Navigate function that updates both URL and state
  const navigate = (tab) => {
    const path = Object.keys(ROUTES).find(key => ROUTES[key] === tab && key !== '/') || '/';
    window.history.pushState({ tab }, '', path);
    setActiveTab(tab);
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.tab) {
        setActiveTab(event.state.tab);
      } else {
        setActiveTab(getTabFromPath(window.location.pathname));
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Set initial history state
    window.history.replaceState({ tab: activeTab }, '', window.location.pathname);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPage events={[]} finance={{}} projects={projects} clients={clients} />;
      case 'clients': return <ClientsPage data={clients} allProjects={projects} addToast={addToast} onUpdateClients={setClients} />;
      case 'projects': return <ProjectsPage
        data={{ projects }}
        allClients={clients}
        addToast={addToast}
        allTransactions={transactions}
        onAddGlobalTx={(tx) => {
          const txWithId = { ...tx, id: tx.id || `tx-${Date.now()}`, createdAt: tx.createdAt || new Date().toISOString() };
          setTransactions(prev => [txWithId, ...prev]);
        }}
        onUpdateProject={(updatedProject) => {
          setProjects(prev => {
            const exists = prev.find(p => p.id === updatedProject.id);
            if (exists) {
              return prev.map(p => p.id === updatedProject.id ? updatedProject : p);
            }
            return [updatedProject, ...prev];
          });
        }}
        onDeleteProject={async (projectId) => {
          try {
            await projectsApi.delete(projectId);
            setProjects(prev => prev.filter(p => p.id !== projectId));
          } catch (error) {
            console.error('Delete project failed:', error);
            addToast(`刪除失敗: ${error.message}`, 'error');
          }
        }}
      />;
      case 'events': return <CalendarPage addToast={addToast} />;
      case 'quotations': return <QuotationsPage addToast={addToast} projects={projects} clients={clients} />;
      case 'contracts': return <ContractsPage />;
      case 'change-orders': return <ChangeOrdersPage />;
      case 'invoices': return <InvoicesPage />;
      case 'payments': return <PaymentsPage />;
      case 'finance': return <FinancePage data={{}} />;
      case 'profit-analysis': return <ProfitAnalysisPage />;
      case 'inventory': return <InventoryPage data={[]} addToast={addToast} />;
      case 'vendors': return <VendorsPage data={[]} addToast={addToast} />;
      case 'users': return <UserManagement addToast={addToast} />;
      case 'integrations': return <IntegrationsPage />;
      case 'storage': return <StoragePage />;
      case 'engineering-estimate': return <EngineeringEstimateWorkspace addToast={addToast} />;
      case 'material-calc': return <MaterialCalculator addToast={addToast} />;
      case 'cost-estimator': return <CostEstimator addToast={addToast} />;
      case 'quotation-edit': return <QuotationEditor />;
      case 'bim': return <BimManagement />;
      case 'invoice-helper': return <InvoiceHelperPage />;
      case 'cmm-admin': return <CmmAdminPage addToast={addToast} />;
      // case 'customers' removed - use clients instead
      case 'procurements': return <ProcurementsPage addToast={addToast} />;
      case 'site-logs': return <SiteLogsPage addToast={addToast} />;
      default: return <DashboardPage events={[]} finance={{}} projects={projects} clients={clients} />;
    }
  };

  const titles = {
    dashboard: '儀表板',
    clients: '客戶管理',
    projects: '專案管理',
    construction: '工程管理',
    events: '行事曆',
    quotations: '報價單',
    contracts: '合約管理',
    'change-orders': '變更單',
    invoices: '發票管理',
    payments: '付款管理',
    finance: '財務管理',
    'profit-analysis': '利潤分析',
    inventory: '庫存管理',
    vendors: '廠商管理',
    users: '使用者管理',
    integrations: '整合設定',
    storage: '文件管理',
    'engineering-estimate': '工程估算工作區',
    'quotation-edit': '報價編輯',
    'bim': 'BIM 管理',
    'invoice-helper': '發票小幫手',
    'procurements': '採購管理',
    'site-logs': '工地日誌',
    'cost-estimator': '成本估算',
    'material-calc': '材料估算'
  };
  const getTitle = () => titles[activeTab] || '儀表板';

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">載入中...</p>
        </div>
      </div>
    );
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 selection:bg-gray-200">

      {/* Sidebar */}
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 z-30 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-gray-200">S</div>
            <span className="mt-0.5">SENTENG</span>
          </h1>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto">
          {/* 📊 總覽 */}
          <div className="mb-2">
            <SidebarItem icon={LayoutDashboard} label="儀表板" active={activeTab === 'dashboard'} onClick={() => navigate('dashboard')} />
          </div>

          {/* 🏗️ 專案工程 */}
          <SidebarGroup label="專案工程">
            <SidebarItem icon={Briefcase} label="專案管理" active={activeTab === 'projects'} onClick={() => navigate('projects')} />
            <SidebarItem icon={Calendar} label="行事曆" active={activeTab === 'events'} onClick={() => navigate('events')} />
            <SidebarItem icon={ClipboardList} label="工地日誌" active={activeTab === 'site-logs'} onClick={() => navigate('site-logs')} />
          </SidebarGroup>

          {/* 📋 商務合約 */}
          <SidebarGroup label="商務合約">
            <SidebarItem icon={FileText} label="報價單" active={activeTab === 'quotations'} onClick={() => navigate('quotations')} />
            <SidebarItem icon={FileSignature} label="合約管理" active={activeTab === 'contracts'} onClick={() => navigate('contracts')} />
            <SidebarItem icon={RefreshCw} label="變更單" active={activeTab === 'change-orders'} onClick={() => navigate('change-orders')} />
          </SidebarGroup>

          {/* 💰 財務會計 */}
          <SidebarGroup label="財務會計">
            <SidebarItem icon={Receipt} label="發票管理" active={activeTab === 'invoices'} onClick={() => navigate('invoices')} />
            <SidebarItem icon={CreditCard} label="付款管理" active={activeTab === 'payments'} onClick={() => navigate('payments')} />
            <SidebarItem icon={Wallet} label="財務管理" active={activeTab === 'finance'} onClick={() => navigate('finance')} />
            <SidebarItem icon={TrendingUp} label="利潤分析" active={activeTab === 'profit-analysis'} onClick={() => navigate('profit-analysis')} />
          </SidebarGroup>

          {/* 📦 資源管理 */}
          <SidebarGroup label="資源管理">
            <SidebarItem icon={Users} label="客戶管理" active={activeTab === 'clients'} onClick={() => navigate('clients')} />
            <SidebarItem icon={HardHat} label="廠商管理" active={activeTab === 'vendors'} onClick={() => navigate('vendors')} />
            <SidebarItem icon={Package} label="庫存管理" active={activeTab === 'inventory'} onClick={() => navigate('inventory')} />
            <SidebarItem icon={ShoppingCart} label="採購管理" active={activeTab === 'procurements'} onClick={() => navigate('procurements')} />
          </SidebarGroup>

          {/* 📐 工程估算 */}
          <SidebarGroup label="工程估算">
            <SidebarItem icon={Layers} label="工程估算" active={activeTab === 'engineering-estimate'} onClick={() => navigate('engineering-estimate')} />
            <SidebarItem icon={Calculator} label="材料估算" active={activeTab === 'material-calc'} onClick={() => navigate('material-calc')} />
            <SidebarItem icon={Ruler} label="成本估算" active={activeTab === 'cost-estimator'} onClick={() => navigate('cost-estimator')} />
            <SidebarItem icon={Building2} label="BIM 管理" active={activeTab === 'bim'} onClick={() => navigate('bim')} />
          </SidebarGroup>

          {/* ⚙️ 系統設定 */}
          <SidebarGroup label="系統設定">
            <SidebarItem icon={Users} label="使用者管理" active={activeTab === 'users'} onClick={() => navigate('users')} />
            <SidebarItem icon={Link2} label="整合設定" active={activeTab === 'integrations'} onClick={() => navigate('integrations')} />
            <SidebarItem icon={FolderOpen} label="文件管理" active={activeTab === 'storage'} onClick={() => navigate('storage')} />
            <SidebarItem icon={Settings} label="CMM 資料管理" active={activeTab === 'cmm-admin'} onClick={() => navigate('cmm-admin')} />
            <SidebarItem icon={Receipt} label="發票小幫手" active={activeTab === 'invoice-helper'} onClick={() => navigate('invoice-helper')} />
          </SidebarGroup>
        </nav>

        <div className="p-4 border-t border-gray-50">
          <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                {user?.displayName?.[0] || user?.email?.[0] || 'G'}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 truncate max-w-[100px]">{user?.displayName || '訪客'}</p>
              <p className="text-xs text-gray-400">v3.2.1 ({user?.role || 'guest'})</p>
            </div>
            <button
              onClick={signOut}
              className="p-2 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              title="登出"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 flex-1 flex flex-col min-h-screen">

        {/* Top Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10 px-4 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="text-xl font-bold text-gray-800">{getTitle()}</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell size={20} className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{user?.displayName || '訪客'}</p>
                <p className="text-xs text-gray-400">{user?.role === 'super_admin' ? '最高管理員' : user?.role === 'admin' ? '管理員' : '使用者'}</p>
              </div>
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full object-cover shadow-lg shadow-gray-200" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold shadow-lg shadow-gray-200">
                  {user?.displayName?.[0] || user?.email?.[0] || 'G'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </div>

      </main>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav
        currentPath={activeTab}
        onNavigate={navigate}
        className="lg:hidden"
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default App;
