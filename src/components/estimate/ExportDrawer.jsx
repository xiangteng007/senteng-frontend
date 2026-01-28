/**
 * ExportDrawer.jsx
 *
 * 匯出估價單到 Google Sheets 的側邊抽屜
 */

import React, { useState } from 'react';
import { FileSpreadsheet, X, ExternalLink, Loader2, Check, AlertCircle } from 'lucide-react';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  'https://senteng-erp-api-b8ewhqeth9dbbhea.eastasia-01.azurewebsites.net';

const ExportDrawer = ({ open, onClose, estimateLines, addToast }) => {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [sheetUrl, setSheetUrl] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: `估價單_${new Date().toISOString().split('T')[0]}`,
    projectName: '',
  });

  if (!open) return null;

  const handleExport = async () => {
    setStatus('loading');
    setError('');
    setSheetUrl('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('請先登入');
      }

      const response = await fetch(`${API_BASE}/api/v2/exports/google-sheets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          estimateLines,
          options: {
            title: formData.title,
            projectName: formData.projectName,
            includeMetadata: true,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `匯出失敗 (${response.status})`);
      }

      const result = await response.json();
      setSheetUrl(result.sheetUrl);
      setStatus('success');
      addToast?.('估價單已成功匯出到 Google Sheets', 'success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
      addToast?.(err.message, 'error');
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setSheetUrl('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />

      {/* Drawer */}
      <div
        className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col"
        style={{ backdropFilter: 'blur(20px)' }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-gray-600" />
            <span className="font-medium">匯出到 Google Sheets</span>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Status Messages */}
          {status === 'success' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                <Check size={18} />
                匯出成功！
              </div>
              <a
                href={sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-green-600 hover:text-green-800 underline text-sm"
              >
                <ExternalLink size={14} />在 Google Sheets 中開啟
              </a>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
                <AlertCircle size={18} />
                匯出失敗
              </div>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          {status !== 'success' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">試算表標題</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="估價單_2026-01-27"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  專案名稱（選填）
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="例：台北市信義區住宅翻新"
                />
              </div>

              {/* Summary */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">匯出內容預覽</div>
                <div className="flex justify-between text-sm">
                  <span>估價項目數</span>
                  <span className="font-medium">{estimateLines?.length || 0} 項</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>預估總計</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('zh-TW', {
                      style: 'currency',
                      currency: 'TWD',
                      minimumFractionDigits: 0,
                    }).format(
                      estimateLines?.reduce(
                        (sum, line) => sum + (line.quantity || 0) * (line.unitPrice || 0),
                        0
                      ) || 0
                    )}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="text-sm text-gray-500">
                <p>匯出後將建立包含以下工作表的 Google 試算表：</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>摘要 — 分類小計與總計</li>
                  <li>估價明細 — 完整項目清單</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200">
          {status === 'success' ? (
            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              完成
            </button>
          ) : (
            <button
              onClick={handleExport}
              disabled={status === 'loading' || !estimateLines?.length}
              className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  匯出中...
                </>
              ) : (
                <>
                  <FileSpreadsheet size={16} />
                  匯出到 Google Sheets
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportDrawer;
