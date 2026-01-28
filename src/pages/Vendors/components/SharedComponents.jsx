// Vendors 共用組件
// 從 Vendors.jsx 提取

import React from 'react';
import {
  Star,
  HardHat,
  Building,
  Wrench,
  Tag,
  ChevronRight,
  Trash2,
  User,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from 'lucide-react';

// 狀態配置
export const STATUS_CONFIG = {
  長期合作: { color: 'green', bg: 'bg-green-100 text-green-700' },
  合作中: { color: 'blue', bg: 'bg-blue-100 text-blue-700' },
  觀察中: { color: 'yellow', bg: 'bg-yellow-100 text-yellow-700' },
  黑名單: { color: 'red', bg: 'bg-red-100 text-red-700' },
};

// 類別配置
export const CATEGORY_CONFIG = {
  工程工班: { icon: HardHat, color: 'orange' },
  建材供應: { icon: Building, color: 'blue' },
  設備廠商: { icon: Wrench, color: 'purple' },
  其他: { icon: Tag, color: 'gray' },
};

// 前端分類到後端 enum 的映射
export const categoryToVendorType = category => {
  const mapping = {
    工程工班: 'SUBCONTRACTOR',
    建材供應: 'SUPPLIER',
    設備廠商: 'SUPPLIER',
    顧問: 'CONSULTANT',
    其他: 'SUPPLIER',
  };
  return mapping[category] || 'SUPPLIER';
};

// 前端狀態到後端 enum 的映射
export const statusToVendorStatus = status => {
  const mapping = {
    長期合作: 'ACTIVE',
    合作中: 'ACTIVE',
    觀察中: 'INACTIVE',
    黑名單: 'BLACKLISTED',
  };
  return mapping[status] || 'ACTIVE';
};

// 星星評分組件
export const StarRating = ({ rating, onChange, readonly = false }) => {
  const stars = [1, 2, 3, 4, 5];
  const currentRating = parseFloat(rating) || 0;

  return (
    <div className="flex items-center gap-1">
      {stars.map(star => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star.toString())}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          disabled={readonly}
        >
          <Star
            size={readonly ? 14 : 20}
            className={star <= currentRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        </button>
      ))}
      {!readonly && <span className="ml-2 text-sm text-gray-500">{currentRating}/5</span>}
    </div>
  );
};

// 統計卡片
export const StatCard = ({ icon: Icon, label, value, color = 'gray', onClick }) => (
  <button
    onClick={onClick}
    className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-all text-left w-full ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center ${
        color === 'blue'
          ? 'bg-blue-100 text-blue-600'
          : color === 'green'
            ? 'bg-green-100 text-green-600'
            : color === 'yellow'
              ? 'bg-yellow-100 text-yellow-600'
              : color === 'orange'
                ? 'bg-orange-100 text-orange-600'
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

// 廠商列表項目
export const VendorRow = ({ vendor, onSelect, onDelete }) => {
  const statusConfig = STATUS_CONFIG[vendor.status] || STATUS_CONFIG['合作中'];
  const categoryConfig = CATEGORY_CONFIG[vendor.category] || CATEGORY_CONFIG['其他'];
  const CategoryIcon = categoryConfig.icon;

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group gap-2 sm:gap-0"
      onClick={() => onSelect(vendor)}
    >
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            categoryConfig.color === 'orange'
              ? 'bg-orange-100 text-orange-600'
              : categoryConfig.color === 'blue'
                ? 'bg-blue-100 text-blue-600'
                : categoryConfig.color === 'purple'
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-gray-100 text-gray-600'
          }`}
        >
          <CategoryIcon size={20} className="sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-gray-800 flex items-center gap-2 flex-wrap">
            <span className="truncate">{vendor.name}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${statusConfig.bg}`}
            >
              {vendor.status}
            </span>
          </div>
          <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
            {vendor.tradeType && (
              <span className="flex items-center gap-1">
                <Wrench size={12} /> {vendor.tradeType}
              </span>
            )}
            {vendor.contactPerson && (
              <span className="hidden sm:flex items-center gap-1">
                <User size={12} /> {vendor.contactPerson}
              </span>
            )}
            <StarRating rating={vendor.rating} readonly />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          onClick={e => {
            e.stopPropagation();
            onDelete(vendor.id);
          }}
          className="sm:opacity-0 sm:group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 size={16} />
        </button>
        <ChevronRight size={20} className="text-gray-300" />
      </div>
    </div>
  );
};

// 評價記錄項目
export const ReviewItem = ({ review }) => (
  <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        review.sentiment === 'positive'
          ? 'bg-green-100'
          : review.sentiment === 'negative'
            ? 'bg-red-100'
            : 'bg-gray-100'
      }`}
    >
      {review.sentiment === 'positive' ? (
        <ThumbsUp size={14} className="text-green-600" />
      ) : review.sentiment === 'negative' ? (
        <ThumbsDown size={14} className="text-red-600" />
      ) : (
        <MessageSquare size={14} className="text-gray-600" />
      )}
    </div>
    <div className="flex-1">
      <div className="text-sm font-medium text-gray-800">{review.project}</div>
      <div className="text-xs text-gray-500 mt-0.5">
        {review.date} - {review.note}
      </div>
    </div>
  </div>
);
