/**
 * 發票小幫手獨立頁面 (InvoiceHelperPage.jsx)
 * 精緻設計的手開發票計算工具，位於「工程估算」群組
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Receipt,
  Calculator,
  FileText,
  Copy,
  Check,
  Building2,
  User,
  Trash2,
  History,
  Star,
  Info,
  Sparkles,
} from 'lucide-react';

// ============================================
// 常量與工具函數
// ============================================

// 中文大寫數字對照表
const CHINESE_NUMERALS = {
  0: '零',
  1: '壹',
  2: '貳',
  3: '參',
  4: '肆',
  5: '伍',
  6: '陸',
  7: '柒',
  8: '捌',
  9: '玖',
};

const CHINESE_UNITS = ['', '拾', '佰', '仟', '萬', '拾', '佰', '仟', '億'];

// 將數字轉換為中文大寫金額
const toChineseAmount = amount => {
  if (!amount || amount === 0) return '零元整';

  const amountNum = Math.round(amount);
  const amountStr = amountNum.toString();
  let result = '';

  for (let i = 0; i < amountStr.length; i++) {
    const digit = amountStr[i];
    const unitIndex = amountStr.length - 1 - i;

    if (digit === '0') {
      if (result && !result.endsWith('零') && unitIndex !== 4 && unitIndex !== 0) {
        result += '零';
      }
      if (unitIndex === 4 && amountNum >= 10000) {
        result = result.replace(/零+$/, '') + '萬';
      }
    } else {
      result += CHINESE_NUMERALS[digit] + CHINESE_UNITS[unitIndex];
    }
  }

  result = result.replace(/零+$/, '').replace(/零萬/, '萬').replace(/零億/, '億');
  return result + '元整';
};

// 格式化數字
const formatNumber = num => {
  return new Intl.NumberFormat('zh-TW').format(num || 0);
};

// 發票格式類型
const INVOICE_FORMATS = {
  THREE_COPY: 'THREE_COPY',
  TWO_COPY: 'TWO_COPY',
};

// 稅率類型
const TAX_TYPES = {
  TAXABLE: { rate: 0.05, label: '應稅 5%', description: '一般商品及服務' },
  ZERO_RATE: { rate: 0, label: '零稅率', description: '外銷商品' },
  EXEMPT: { rate: 0, label: '免稅', description: '特定免稅項目' },
};

// ============================================
// 主要元件
// ============================================

const InvoiceHelperPage = () => {
  const [format, setFormat] = useState(INVOICE_FORMATS.THREE_COPY);
  const [taxType, setTaxType] = useState('TAXABLE');
  const [priceWithTax, setPriceWithTax] = useState('');
  const [buyerTaxId, setBuyerTaxId] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [copied, setCopied] = useState(null);
  const [recentTaxIds, setRecentTaxIds] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // 載入常用統編
  useEffect(() => {
    const stored = localStorage.getItem('invoiceHelper_recentTaxIds');
    if (stored) {
      try {
        setRecentTaxIds(JSON.parse(stored));
      } catch {
        console.error('Failed to parse recent tax IDs');
      }
    }
  }, []);

  // 儲存常用統編
  const saveRecentTaxId = (taxId, name) => {
    if (!taxId || taxId.length !== 8) return;

    const newEntry = { taxId, name, timestamp: Date.now() };
    const filtered = recentTaxIds.filter(r => r.taxId !== taxId);
    const updated = [newEntry, ...filtered].slice(0, 5);

    setRecentTaxIds(updated);
    localStorage.setItem('invoiceHelper_recentTaxIds', JSON.stringify(updated));
  };

  // 計算金額
  const calculations = useMemo(() => {
    const total = parseFloat(priceWithTax) || 0;
    const rate = TAX_TYPES[taxType].rate;

    const priceWithoutTax = rate > 0 ? Math.round(total / (1 + rate)) : total;
    const taxAmount = total - priceWithoutTax;

    return {
      total,
      priceWithoutTax,
      taxAmount,
      chineseTotal: toChineseAmount(total),
    };
  }, [priceWithTax, taxType]);

  // 複製到剪貼簿
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  // 清除所有輸入
  const handleReset = () => {
    setPriceWithTax('');
    setBuyerTaxId('');
    setBuyerName('');
  };

  // 儲存並清除
  const handleSaveAndReset = () => {
    if (buyerTaxId.length === 8) {
      saveRecentTaxId(buyerTaxId, buyerName);
    }
    handleReset();
  };

  // 選擇歷史記錄
  const selectFromHistory = item => {
    setBuyerTaxId(item.taxId);
    setBuyerName(item.name || '');
    setShowHistory(false);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] animate-fade-in">
      {/* 頁面標題 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200">
            <Receipt size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              手開發票小幫手
              <Sparkles size={20} className="text-amber-500" />
            </h1>
            <p className="text-gray-500 text-sm">
              輸入含稅金額，自動計算銷售額與稅額，還有中文大寫轉換
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左欄：輸入區 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 發票格式切換 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-purple-600" />
              發票格式
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat(INVOICE_FORMATS.THREE_COPY)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                  format === INVOICE_FORMATS.THREE_COPY
                    ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100'
                    : 'border-gray-200 hover:border-purple-200 hover:bg-gray-50'
                }`}
              >
                <Building2
                  size={24}
                  className={`mx-auto mb-2 ${
                    format === INVOICE_FORMATS.THREE_COPY ? 'text-purple-600' : 'text-gray-400'
                  }`}
                />
                <div
                  className={`font-semibold ${
                    format === INVOICE_FORMATS.THREE_COPY ? 'text-purple-700' : 'text-gray-700'
                  }`}
                >
                  三聯式
                </div>
                <div className="text-xs text-gray-500 mt-1">開給公司行號</div>
                {format === INVOICE_FORMATS.THREE_COPY && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </button>

              <button
                onClick={() => setFormat(INVOICE_FORMATS.TWO_COPY)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                  format === INVOICE_FORMATS.TWO_COPY
                    ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-100'
                    : 'border-gray-200 hover:border-amber-200 hover:bg-gray-50'
                }`}
              >
                <User
                  size={24}
                  className={`mx-auto mb-2 ${
                    format === INVOICE_FORMATS.TWO_COPY ? 'text-amber-600' : 'text-gray-400'
                  }`}
                />
                <div
                  className={`font-semibold ${
                    format === INVOICE_FORMATS.TWO_COPY ? 'text-amber-700' : 'text-gray-700'
                  }`}
                >
                  二聯式
                </div>
                <div className="text-xs text-gray-500 mt-1">開給個人消費者</div>
                {format === INVOICE_FORMATS.TWO_COPY && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* 買受人資訊（三聯式） */}
          {format === INVOICE_FORMATS.THREE_COPY && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Building2 size={18} className="text-purple-600" />
                  買受人資訊
                </h3>
                {recentTaxIds.length > 0 && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    <History size={14} />
                    常用
                  </button>
                )}
              </div>

              {/* 常用統編選擇 */}
              {showHistory && recentTaxIds.length > 0 && (
                <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-xs text-purple-600 mb-2">快速選擇常用統編：</p>
                  <div className="space-y-2">
                    {recentTaxIds.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectFromHistory(item)}
                        className="w-full flex items-center gap-3 p-2 bg-white rounded-lg hover:bg-purple-100 transition-colors text-left"
                      >
                        <Star size={14} className="text-amber-500" />
                        <span className="font-mono text-sm">{item.taxId}</span>
                        <span className="text-gray-500 text-sm truncate">
                          {item.name || '未命名'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">統一編號 *</label>
                  <input
                    type="text"
                    value={buyerTaxId}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setBuyerTaxId(value);
                    }}
                    placeholder="請輸入 8 碼統編"
                    maxLength={8}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg font-mono tracking-widest focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all"
                  />
                  {buyerTaxId && buyerTaxId.length !== 8 && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <Info size={12} /> 統編需為 8 碼數字
                    </p>
                  )}
                  {buyerTaxId.length === 8 && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <Check size={12} /> 格式正確
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    公司名稱（抬頭）
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={e => setBuyerName(e.target.value)}
                    placeholder="例：森騰室內裝修有限公司"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 稅率選擇 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calculator size={18} className="text-purple-600" />
              稅率類型
            </h3>

            <div className="space-y-3">
              {Object.entries(TAX_TYPES).map(([key, { label, description }]) => (
                <button
                  key={key}
                  onClick={() => setTaxType(key)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-300 ${
                    taxType === key
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-medium ${taxType === key ? 'text-purple-700' : 'text-gray-700'}`}
                    >
                      {label}
                    </span>
                    {taxType === key && (
                      <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 金額輸入 */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 shadow-lg shadow-purple-200">
            <label className="block text-sm font-medium text-purple-200 mb-2">
              收款金額（含稅）
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300 text-2xl font-bold">
                $
              </span>
              <input
                type="number"
                value={priceWithTax}
                onChange={e => setPriceWithTax(e.target.value)}
                placeholder="輸入金額"
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur border-2 border-white/20 rounded-xl text-3xl font-bold text-white placeholder-purple-300 focus:border-white/50 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all"
              />
            </div>

            {/* 快速操作 */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleReset}
                className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 size={14} /> 清除
              </button>
              <button
                onClick={handleSaveAndReset}
                className="flex-1 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
              >
                <Star size={14} /> 儲存常用
              </button>
            </div>
          </div>
        </div>

        {/* 中欄：計算結果 */}
        <div className="lg:col-span-1 space-y-6">
          {calculations.total > 0 ? (
            <>
              {/* 計算結果卡片 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <Calculator size={18} className="text-purple-600" />
                  計算結果
                </h3>

                <div className="space-y-4">
                  {/* 銷售額 */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">銷售額（未稅）</span>
                      <button
                        onClick={() =>
                          copyToClipboard(calculations.priceWithoutTax.toString(), 'sales')
                        }
                        className="text-gray-400 hover:text-purple-600 transition-colors"
                      >
                        {copied === 'sales' ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">
                      ${formatNumber(calculations.priceWithoutTax)}
                    </p>
                  </div>

                  {/* 稅額 */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-600">
                        營業稅額 ({(TAX_TYPES[taxType].rate * 100).toFixed(0)}%)
                      </span>
                      <button
                        onClick={() => copyToClipboard(calculations.taxAmount.toString(), 'tax')}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        {copied === 'tax' ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      ${formatNumber(calculations.taxAmount)}
                    </p>
                  </div>

                  {/* 總計 */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-green-100">總計金額（含稅）</span>
                      <button
                        onClick={() => copyToClipboard(calculations.total.toString(), 'total')}
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        {copied === 'total' ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <p className="text-3xl font-bold">${formatNumber(calculations.total)}</p>
                  </div>
                </div>
              </div>

              {/* 中文大寫 */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                    <FileText size={18} />
                    中文大寫金額
                  </h3>
                  <button
                    onClick={() => copyToClipboard(calculations.chineseTotal, 'chinese')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                      copied === 'chinese'
                        ? 'bg-green-500 text-white'
                        : 'bg-amber-200 text-amber-800 hover:bg-amber-300'
                    }`}
                  >
                    {copied === 'chinese' ? <Check size={14} /> : <Copy size={14} />}
                    {copied === 'chinese' ? '已複製' : '複製'}
                  </button>
                </div>
                <div className="bg-white rounded-xl p-4 border border-amber-200">
                  <p className="text-xl font-bold text-amber-900 leading-relaxed">
                    {calculations.chineseTotal}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
              <Calculator size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">輸入金額開始計算</h3>
              <p className="text-sm text-gray-400">
                在左側輸入含稅金額，
                <br />
                系統將自動計算銷售額與稅額
              </p>
            </div>
          )}
        </div>

        {/* 右欄：發票預覽 */}
        <div className="lg:col-span-1">
          {calculations.total > 0 ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-8">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Receipt size={18} className="text-purple-600" />
                發票填寫示意
              </h3>

              {/* 發票模擬 */}
              <div
                className={`border-2 rounded-xl overflow-hidden ${
                  format === INVOICE_FORMATS.THREE_COPY ? 'border-purple-200' : 'border-amber-200'
                }`}
              >
                {/* 發票頭部 */}
                <div
                  className={`px-6 py-4 text-center ${
                    format === INVOICE_FORMATS.THREE_COPY
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  }`}
                >
                  <p className="font-bold text-lg">
                    {format === INVOICE_FORMATS.THREE_COPY ? '三聯式統一發票' : '二聯式統一發票'}
                  </p>
                  <p className="text-sm opacity-80">收執聯</p>
                </div>

                {/* 發票內容 */}
                <div className="p-6 space-y-4 bg-gradient-to-br from-gray-50 to-white">
                  {format === INVOICE_FORMATS.THREE_COPY && (
                    <div className="pb-4 border-b border-dashed border-gray-200">
                      <div className="flex gap-2 mb-2">
                        <span className="text-gray-500 text-sm w-20">買受人：</span>
                        <span className="font-medium text-gray-800">
                          {buyerName || '（請填寫）'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-gray-500 text-sm w-20">統一編號：</span>
                        <span className="font-mono font-bold text-lg tracking-widest text-purple-700">
                          {buyerTaxId || '________'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">銷售額</span>
                      <span className="font-semibold text-gray-800">
                        ${formatNumber(calculations.priceWithoutTax)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">營業稅</span>
                      <span className="font-semibold text-gray-800">
                        ${formatNumber(calculations.taxAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className="font-semibold text-gray-700">總計</span>
                      <span className="font-bold text-xl text-green-600">
                        ${formatNumber(calculations.total)}
                      </span>
                    </div>
                  </div>

                  {/* 中文金額 */}
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">中文大寫：</p>
                    <p className="font-bold text-amber-800 bg-amber-50 rounded-lg p-2 text-center">
                      {calculations.chineseTotal}
                    </p>
                  </div>
                </div>

                {/* 發票底部 */}
                <div
                  className={`px-6 py-3 text-center text-xs ${
                    format === INVOICE_FORMATS.THREE_COPY
                      ? 'bg-purple-50 text-purple-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  📌 記得要蓋發票專用章
                </div>
              </div>

              {/* 提示資訊 */}
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex gap-2">
                  <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    {format === INVOICE_FORMATS.THREE_COPY ? (
                      <p>三聯式發票需填寫買受人統一編號，買受人可作為進項扣抵</p>
                    ) : (
                      <p>二聯式發票開給個人消費者，無需填寫統一編號</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200 sticky top-8">
              <Receipt size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">發票預覽</h3>
              <p className="text-sm text-gray-400">輸入金額後將顯示發票填寫示意</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceHelperPage;
