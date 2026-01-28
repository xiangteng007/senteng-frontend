// Projects 嵌入式 Widget 組件
// 從 Projects.jsx 提取 (lines 20-221)

import React from 'react';
import { Plus, ImageIcon, MapPin, Users } from 'lucide-react';

/**
 * 工程/會議紀錄 Widget
 */
export const WidgetProjectRecords = ({ records, size, onAddRecord }) => {
  const typeIcons = {
    工程紀錄: '🔧',
    會議紀錄: '📋',
    驗收紀錄: '✅',
    施工日誌: '📝',
    其他: '📌',
    工程: '🔧', // 向後相容
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between mb-3 items-center">
        <h4 className="text-xs font-bold text-gray-600">工程/會議紀錄</h4>
        <button
          onClick={onAddRecord}
          className="text-morandi-blue-600 hover:bg-morandi-blue-50 p-1.5 rounded-lg transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        {records.length === 0 ? (
          <div className="text-center text-gray-400 text-xs py-8">尚無紀錄，點擊 + 新增</div>
        ) : (
          records.map(r => (
            <div
              key={r.id}
              className="bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-morandi-blue-200 transition-colors"
            >
              {/* 標題列 */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{typeIcons[r.type] || '📝'}</span>
                  <span className="text-xs font-bold text-gray-800">
                    {r.title || r.type || '紀錄'}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">{r.date}</span>
              </div>

              {/* 內容 */}
              {r.content && (
                <div className="text-xs text-gray-600 mb-2 leading-relaxed line-clamp-3">
                  {r.content}
                </div>
              )}

              {/* 地點 + 參與人員 */}
              {(r.location || r.attendees) && (
                <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 mb-2">
                  {r.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={10} /> {r.location}
                    </span>
                  )}
                  {r.attendees && (
                    <span className="flex items-center gap-1">
                      <Users size={10} /> {r.attendees}
                    </span>
                  )}
                </div>
              )}

              {/* 待辦事項 */}
              {r.todos && r.todos.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-[10px] text-gray-500 mb-1">待辦事項：</div>
                  <ul className="text-[10px] text-gray-600 space-y-0.5">
                    {r.todos.slice(0, 3).map((todo, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <span className="w-3 h-3 border border-gray-300 rounded flex-shrink-0"></span>
                        <span className="truncate">{todo}</span>
                      </li>
                    ))}
                    {r.todos.length > 3 && (
                      <li className="text-gray-400">+{r.todos.length - 3} 項更多...</li>
                    )}
                  </ul>
                </div>
              )}

              {/* 照片 */}
              {r.photos && r.photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 mt-2">
                  {r.photos.map((p, idx) => (
                    <div
                      key={idx}
                      className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center shrink-0"
                    >
                      <ImageIcon size={14} className="text-gray-400" />
                    </div>
                  ))}
                </div>
              )}

              {/* 作者 */}
              <div className="text-[10px] text-gray-400 mt-2 text-right">記錄者：{r.author}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/**
 * 專案財務詳情 Widget
 */
export const WidgetProjectFinanceDetail = ({
  transactions,
  size,
  onAddTx,
  onSyncToSheet,
  project,
}) => {
  const income = transactions.filter(t => t.type === '收入').reduce((acc, c) => acc + c.amount, 0);
  const expense = transactions.filter(t => t.type === '支出').reduce((acc, c) => acc + c.amount, 0);
  const balance = income - expense;

  // 按類別分組支出
  const expenseByCategory = transactions
    .filter(t => t.type === '支出')
    .reduce((acc, t) => {
      const cat = t.category || '其他支出';
      acc[cat] = (acc[cat] || 0) + t.amount;
      return acc;
    }, {});

  const categoryColors = {
    材料費: 'bg-orange-400',
    人工費: 'bg-blue-400',
    設備費: 'bg-purple-400',
    運輸費: 'bg-yellow-400',
    其他支出: 'bg-gray-400',
  };

  return (
    <div className="flex flex-col h-full">
      {/* 收支摘要 */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-500">收入</div>
          <div className="text-sm font-bold text-green-600">${income.toLocaleString()}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-500">支出</div>
          <div className="text-sm font-bold text-red-600">${expense.toLocaleString()}</div>
        </div>
        <div
          className={`${balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'} rounded-lg p-2 text-center`}
        >
          <div className="text-xs text-gray-500">淨額</div>
          <div
            className={`text-sm font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}
          >
            ${balance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 支出類別分佈 */}
      {expense > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">支出分佈</div>
          <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
            {Object.entries(expenseByCategory).map(([cat, amount]) => (
              <div
                key={cat}
                className={`${categoryColors[cat] || 'bg-gray-400'}`}
                style={{ width: `${(amount / expense) * 100}%` }}
                title={`${cat}: $${amount.toLocaleString()}`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {Object.entries(expenseByCategory).map(([cat, amount]) => (
              <span key={cat} className="text-[10px] text-gray-500 flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${categoryColors[cat] || 'bg-gray-400'}`}
                ></span>
                {cat} ${amount.toLocaleString()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 交易列表 */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar mb-2">
        {transactions.length > 0 ? (
          transactions.slice(0, 10).map(t => (
            <div
              key={t.id}
              className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 truncate">
                  {t.desc || t.category || '無摘要'}
                </div>
                <div className="text-[10px] text-gray-400">
                  {t.date} · {t.category || '-'}
                </div>
              </div>
              <span
                className={`font-bold ml-2 ${t.type === '收入' ? 'text-green-600' : 'text-red-500'}`}
              >
                {t.type === '收入' ? '+' : '-'}${t.amount.toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 text-xs py-4">尚無收支記錄</div>
        )}
        {transactions.length > 10 && (
          <div className="text-center text-xs text-gray-400">
            ...還有 {transactions.length - 10} 筆
          </div>
        )}
      </div>

      {/* 操作按鈕 */}
      <div className="flex gap-2">
        <button
          onClick={onAddTx}
          className="flex-1 py-1.5 text-xs bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          新增收支
        </button>
        {project?.folderId && (
          <button
            onClick={onSyncToSheet}
            className="py-1.5 px-3 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            title="同步到專案 Sheet"
          >
            同步
          </button>
        )}
      </div>
    </div>
  );
};
