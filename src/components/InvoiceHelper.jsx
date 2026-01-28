/**
 * 手開發票小幫手 (InvoiceHelper.jsx)
 * 參考 Simpany 設計，幫助正確填寫二聯式/三聯式發票
 */

import React, { useState, useMemo } from 'react';
import { Receipt, Calculator, FileText, Printer, Copy, Check } from 'lucide-react';

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
      // 處理連續零的情況
      if (result && !result.endsWith('零') && unitIndex !== 4 && unitIndex !== 0) {
        result += '零';
      }
      // 萬位補零
      if (unitIndex === 4 && amountNum >= 10000) {
        result = result.replace(/零+$/, '') + '萬';
      }
    } else {
      result += CHINESE_NUMERALS[digit] + CHINESE_UNITS[unitIndex];
    }
  }

  // 清理並加上「元整」
  result = result.replace(/零+$/, '').replace(/零萬/, '萬').replace(/零億/, '億');
  return result + '元整';
};

// 發票格式類型
const INVOICE_FORMATS = {
  THREE_COPY: 'THREE_COPY', // 三聯式（開給公司）
  TWO_COPY: 'TWO_COPY', // 二聯式（開給個人）
};

// 稅率類型
const TAX_TYPES = {
  TAXABLE: { rate: 0.05, label: '應稅 5%' },
  ZERO_RATE: { rate: 0, label: '零稅率' },
  EXEMPT: { rate: 0, label: '免稅' },
};

const InvoiceHelper = () => {
  const [format, setFormat] = useState(INVOICE_FORMATS.THREE_COPY);
  const [taxType, setTaxType] = useState('TAXABLE');
  const [priceWithTax, setPriceWithTax] = useState('');
  const [buyerTaxId, setBuyerTaxId] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [copied, setCopied] = useState(null);

  // 計算金額
  const calculations = useMemo(() => {
    const total = parseFloat(priceWithTax) || 0;
    const rate = TAX_TYPES[taxType].rate;

    // 內含稅計算：含稅金額 / 1.05 = 未稅金額
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

  const formatNumber = num => {
    return new Intl.NumberFormat('zh-TW').format(num || 0);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 space-y-6">
      {/* 標題 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Receipt className="text-purple-600" size={28} />
          手開發票小幫手
        </h2>
        <p className="text-gray-500 text-sm mt-1">輸入金額自動計算稅額，還有中文大寫金額轉換</p>
      </div>

      {/* 發票格式切換 */}
      <div className="flex bg-white rounded-xl p-1 shadow-sm">
        <button
          onClick={() => setFormat(INVOICE_FORMATS.THREE_COPY)}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            format === INVOICE_FORMATS.THREE_COPY
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="text-lg">三聯式發票</div>
          <div
            className={`text-xs ${format === INVOICE_FORMATS.THREE_COPY ? 'text-purple-200' : 'text-gray-400'}`}
          >
            開給公司行號（需統編）
          </div>
        </button>
        <button
          onClick={() => setFormat(INVOICE_FORMATS.TWO_COPY)}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            format === INVOICE_FORMATS.TWO_COPY
              ? 'bg-amber-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="text-lg">二聯式發票</div>
          <div
            className={`text-xs ${format === INVOICE_FORMATS.TWO_COPY ? 'text-amber-200' : 'text-gray-400'}`}
          >
            開給個人消費者
          </div>
        </button>
      </div>

      {/* 輸入區 */}
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        {/* 三聯式才需要統編 */}
        {format === INVOICE_FORMATS.THREE_COPY && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                買受人統一編號 *
              </label>
              <input
                type="text"
                value={buyerTaxId}
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                  setBuyerTaxId(value);
                }}
                placeholder="8碼統編"
                maxLength={8}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg font-mono focus:border-purple-500 focus:outline-none"
              />
              {buyerTaxId && buyerTaxId.length !== 8 && (
                <p className="text-xs text-red-500 mt-1">統編需為8碼數字</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                買受人名稱（抬頭）
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={e => setBuyerName(e.target.value)}
                placeholder="公司名稱"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 稅率選擇 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">稅率類型</label>
          <div className="flex gap-2">
            {Object.entries(TAX_TYPES).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setTaxType(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  taxType === key
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 金額輸入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">收款金額（含稅）</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
              $
            </span>
            <input
              type="number"
              value={priceWithTax}
              onChange={e => setPriceWithTax(e.target.value)}
              placeholder="輸入含稅金額"
              className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-lg text-2xl font-bold focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 計算結果 */}
      {calculations.total > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Calculator size={18} className="text-purple-600" />
            計算結果
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500">銷售額（未稅）</p>
              <p className="text-xl font-bold text-gray-800">
                ${formatNumber(calculations.priceWithoutTax)}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-600">營業稅額</p>
              <p className="text-xl font-bold text-blue-700">
                ${formatNumber(calculations.taxAmount)}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-sm text-purple-600">總計（含稅）</p>
              <p className="text-xl font-bold text-purple-700">
                ${formatNumber(calculations.total)}
              </p>
            </div>
          </div>

          {/* 中文大寫金額 */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 mb-1">中文大寫金額</p>
                <p className="text-lg font-bold text-amber-900">{calculations.chineseTotal}</p>
              </div>
              <button
                onClick={() => copyToClipboard(calculations.chineseTotal, 'chinese')}
                className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1"
              >
                {copied === 'chinese' ? <Check size={16} /> : <Copy size={16} />}
                {copied === 'chinese' ? '已複製' : '複製'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 發票示意圖預覽 */}
      {calculations.total > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <FileText size={18} className="text-purple-600" />
            發票填寫示意
          </h3>

          <div
            className={`border-2 ${format === INVOICE_FORMATS.THREE_COPY ? 'border-purple-300' : 'border-amber-300'} rounded-lg p-6 bg-gradient-to-br ${format === INVOICE_FORMATS.THREE_COPY ? 'from-purple-50 to-white' : 'from-amber-50 to-white'}`}
          >
            {/* 發票頭部 */}
            <div className="text-center mb-4 pb-4 border-b-2 border-dashed border-gray-300">
              <p
                className={`font-bold text-lg ${format === INVOICE_FORMATS.THREE_COPY ? 'text-purple-700' : 'text-amber-700'}`}
              >
                {format === INVOICE_FORMATS.THREE_COPY ? '三聯式統一發票' : '二聯式統一發票'}
              </p>
              <p className="text-sm text-gray-500">
                （{format === INVOICE_FORMATS.THREE_COPY ? '收執聯' : '收執聯'}）
              </p>
            </div>

            {/* 發票內容 */}
            <div className="space-y-3">
              {format === INVOICE_FORMATS.THREE_COPY && (
                <>
                  <div className="flex">
                    <span className="w-24 text-gray-500">買受人：</span>
                    <span className="font-medium">{buyerName || '（請填寫公司名稱）'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-500">統一編號：</span>
                    <span className="font-mono font-bold text-lg">{buyerTaxId || '________'}</span>
                  </div>
                </>
              )}

              <div className="flex">
                <span className="w-24 text-gray-500">銷售額：</span>
                <span className="font-bold">${formatNumber(calculations.priceWithoutTax)}</span>
              </div>

              <div className="flex">
                <span className="w-24 text-gray-500">營業稅：</span>
                <span className="font-bold">${formatNumber(calculations.taxAmount)}</span>
              </div>

              <div className="flex items-center pt-2 border-t border-gray-200">
                <span className="w-24 text-gray-500">總計：</span>
                <span className="font-bold text-xl text-green-600">
                  ${formatNumber(calculations.total)}
                </span>
              </div>

              <div className="bg-yellow-50 rounded-lg p-3 mt-4">
                <p className="text-sm text-gray-600">中文大寫：</p>
                <p className="font-bold text-amber-800">{calculations.chineseTotal}</p>
              </div>
            </div>

            {/* 提示 */}
            <div className="mt-4 pt-4 border-t border-dashed border-gray-300 text-center">
              <p className="text-sm text-gray-400">記得要蓋發票專用章 📌</p>
            </div>
          </div>
        </div>
      )}

      {/* 快速操作按鈕 */}
      {calculations.total > 0 && (
        <div className="flex gap-2">
          <button
            onClick={() =>
              copyToClipboard(
                `銷售額: ${formatNumber(calculations.priceWithoutTax)}, 稅額: ${formatNumber(calculations.taxAmount)}, 總計: ${formatNumber(calculations.total)}`,
                'all'
              )
            }
            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            {copied === 'all' ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
            複製全部金額
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <Printer size={18} />
            列印
          </button>
        </div>
      )}
    </div>
  );
};

export default InvoiceHelper;
