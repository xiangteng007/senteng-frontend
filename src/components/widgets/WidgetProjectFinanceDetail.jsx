/**
 * WidgetProjectFinanceDetail.jsx
 *
 * 專案收支 Widget - 從 Projects.jsx 提取
 */

import React from 'react';

const categoryColors = {
    材料費: 'bg-orange-400',
    人工費: 'bg-blue-400',
    設備費: 'bg-purple-400',
    運輸費: 'bg-yellow-400',
    其他支出: 'bg-gray-400',
};

const WidgetProjectFinanceDetail = ({ transactions = [], size, onAddTx, onSyncToSheet, project }) => {
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

export { WidgetProjectFinanceDetail };
export default WidgetProjectFinanceDetail;
