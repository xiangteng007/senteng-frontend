/**
 * ClientWidgets.jsx
 *
 * Extracted widgets from Clients.jsx for better maintainability
 */

import React from 'react';
import { Phone, Mail, Trash2, ChevronRight, MessageCircle } from 'lucide-react';

// 狀態配置 (shared with Clients.jsx)
export const STATUS_CONFIG = {
    洽談中: { color: 'blue', bg: 'bg-blue-100 text-blue-700' },
    '提案/報價': { color: 'yellow', bg: 'bg-yellow-100 text-yellow-700' },
    預售屋: { color: 'purple', bg: 'bg-purple-100 text-purple-700' },
    工程中: { color: 'orange', bg: 'bg-orange-100 text-orange-700' },
    已簽約: { color: 'green', bg: 'bg-green-100 text-green-700' },
    已完工: { color: 'gray', bg: 'bg-gray-100 text-gray-700' },
    暫緩: { color: 'red', bg: 'bg-red-100 text-red-700' },
};

/**
 * 統計卡片組件
 */
export const StatCard = ({ icon: Icon, label, value, color = 'gray', onClick }) => (
    <button
        onClick={onClick}
        className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-all text-left w-full ${onClick ? 'cursor-pointer' : ''}`}
    >
        <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${color === 'blue'
                    ? 'bg-blue-100 text-blue-600'
                    : color === 'green'
                        ? 'bg-green-100 text-green-600'
                        : color === 'yellow'
                            ? 'bg-yellow-100 text-yellow-600'
                            : color === 'red'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-600'
                }`}
        >
            <Icon size={20} />
        </div>
        <div>
            <div className="text-2xl font-bold text-gray-800">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
        </div>
    </button>
);

/**
 * 客戶列表項目組件
 */
export const ClientRow = ({ client, onSelect, onDelete }) => {
    const statusConfig = STATUS_CONFIG[client.status] || STATUS_CONFIG['洽談中'];

    return (
        <div
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group gap-2 sm:gap-0"
            onClick={() => onSelect(client)}
        >
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-base sm:text-lg font-bold text-gray-600 flex-shrink-0">
                    {client.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="font-bold text-gray-800 flex items-center gap-2 flex-wrap">
                        <span className="truncate">{client.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${statusConfig.bg}`}>
                            {client.status}
                        </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                        {client.phone && (
                            <span className="flex items-center gap-1">
                                <Phone size={12} /> {client.phone}
                            </span>
                        )}
                        {client.email && (
                            <span className="hidden sm:flex items-center gap-1">
                                <Mail size={12} /> <span className="truncate max-w-[150px]">{client.email}</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(client.id);
                    }}
                    className="sm:opacity-0 sm:group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    aria-label={`刪除 ${client.name}`}
                >
                    <Trash2 size={16} />
                </button>
                <ChevronRight size={20} className="text-gray-300" />
            </div>
        </div>
    );
};

/**
 * 聯絡記錄項目組件
 */
export const ContactLogItem = ({ log }) => (
    <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <MessageCircle size={14} className="text-blue-600" />
        </div>
        <div className="flex-1">
            <div className="text-sm font-medium text-gray-800">{log.type}</div>
            <div className="text-xs text-gray-500 mt-0.5">
                {log.date} - {log.note}
            </div>
        </div>
    </div>
);
