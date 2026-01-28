/**
 * StoragePage.jsx
 *
 * 文件管理系統 - 整合 Google Drive 資料夾
 * 提供公司文件庫的瀏覽與連結
 */

import React from 'react';
import {
  FolderOpen,
  ExternalLink,
  FileText,
  Image,
  Film,
  Archive,
  HardDrive,
  RefreshCw,
} from 'lucide-react';

const DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1psz5gGuYxwSm7Ui3KHgknnVaI3GJqq4s';

// 常用資料夾結構 (可根據實際資料夾結構調整)
const FOLDER_SECTIONS = [
  {
    id: 'projects',
    name: '專案文件',
    description: '各專案的設計圖、合約、變更單等資料',
    icon: FolderOpen,
    color: 'blue',
  },
  {
    id: 'templates',
    name: '範本文件',
    description: '報價單、合約、請款單等標準範本',
    icon: FileText,
    color: 'purple',
  },
  {
    id: 'gallery',
    name: '素材庫',
    description: '建材圖片、完工照片、設計參考',
    icon: Image,
    color: 'emerald',
  },
  {
    id: 'videos',
    name: '影音資料',
    description: '施工紀錄、教學影片、展示影片',
    icon: Film,
    color: 'orange',
  },
  {
    id: 'archive',
    name: '歷史檔案',
    description: '已完工專案的歸檔資料',
    icon: Archive,
    color: 'gray',
  },
];

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600 border-blue-200',
  purple: 'bg-purple-100 text-purple-600 border-purple-200',
  emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  orange: 'bg-orange-100 text-orange-600 border-orange-200',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
};

const FolderCard = ({ folder }) => {
  const IconComponent = folder.icon;
  const colors = colorClasses[folder.color] || colorClasses.gray;

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all group cursor-pointer"
      onClick={() => window.open(DRIVE_FOLDER_URL, '_blank')}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colors}`}>
          <IconComponent size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {folder.name}
            </h3>
            <ExternalLink
              size={14}
              className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
          <p className="text-sm text-gray-500">{folder.description}</p>
        </div>
      </div>
    </div>
  );
};

export default function StoragePage() {
  const handleOpenDrive = () => {
    window.open(DRIVE_FOLDER_URL, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">文件管理</h1>
          <p className="text-gray-500 text-sm mt-1">公司文件庫，整合 Google Drive 雲端硬碟</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw size={18} />
            重新整理
          </button>
          <button
            onClick={handleOpenDrive}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            <HardDrive size={18} />
            開啟 Google Drive
          </button>
        </div>
      </div>

      {/* Main Drive Link Card */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl border border-blue-100 p-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center border border-blue-100">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"
              alt="Google Drive"
              className="w-12 h-12"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">森騰設計 SENTENG.CO</h2>
            <p className="text-gray-600 mb-3">
              公司雲端文件庫，包含專案文件、設計圖、合約範本、建材資料等
            </p>
            <a
              href={DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <span className="underline">drive.google.com/drive/folders/1psz5g...</span>
              <ExternalLink size={16} />
            </a>
          </div>
          <button
            onClick={handleOpenDrive}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 flex items-center gap-2 shadow-lg transition-all"
          >
            <FolderOpen size={20} />
            瀏覽檔案
          </button>
        </div>
      </div>

      {/* Folder Sections */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">文件分類</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FOLDER_SECTIONS.map(folder => (
            <FolderCard key={folder.id} folder={folder} />
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
            💡
          </div>
          <div>
            <h4 className="font-medium text-amber-800 mb-1">使用提示</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 點擊上方「開啟 Google Drive」可直接瀏覽公司雲端硬碟</li>
              <li>• 各專案的文件會在新增專案時自動建立資料夾</li>
              <li>• 需要 Google 帳號存取權限才能查看檔案</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
