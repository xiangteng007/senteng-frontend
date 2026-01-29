/**
 * WidgetProjectRecords.jsx
 *
 * 工程/會議紀錄 Widget - 從 Projects.jsx 提取
 */

import React from 'react';
import { Plus, MapPin, Users, ImageIcon } from 'lucide-react';

const typeIcons = {
    工程紀錄: '🔧',
    會議紀錄: '📋',
    驗收紀錄: '✅',
    施工日誌: '📝',
    其他: '📌',
    工程: '🔧', // 向後相容
};

const WidgetProjectRecords = ({ records = [], size, onAddRecord }) => {
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

export { WidgetProjectRecords };
export default WidgetProjectRecords;
