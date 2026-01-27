/**
 * Material Calculator Export Utilities
 * 匯出 Excel/PDF 功能
 */
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * 匯出計算結果為 Excel
 * @param {Array} data - 計算結果資料
 * @param {string} filename - 檔案名稱
 */
export const exportToExcel = (data, filename = '材料計算清單') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '計算結果');

    // 設定欄寬
    const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: 15 }));
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `${filename}_${formatDate()}.xlsx`);
};

/**
 * 匯出元素為 PDF
 * @param {HTMLElement} element - 要匯出的 DOM 元素
 * @param {string} filename - 檔案名稱
 */
export const exportToPDF = async (element, filename = '材料計算清單') => {
    if (!element) return;

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}_${formatDate()}.pdf`);
};

/**
 * 格式化日期
 */
const formatDate = () => {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
};

/**
 * 歷史記錄管理
 */
const HISTORY_KEY = 'materialCalculator_history';
const MAX_HISTORY = 20;

export const saveToHistory = (record) => {
    const history = getHistory();
    const newRecord = {
        ...record,
        id: Date.now(),
        timestamp: new Date().toISOString(),
    };

    history.unshift(newRecord);
    if (history.length > MAX_HISTORY) {
        history.pop();
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return newRecord;
};

export const getHistory = () => {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
        return [];
    }
};

export const deleteFromHistory = (id) => {
    const history = getHistory().filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return history;
};

export const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
};

/**
 * 資料持久化 (輸入值暫存)
 */
const DRAFT_KEY = 'materialCalculator_draft';

export const saveDraft = (calculatorType, data) => {
    const drafts = getDrafts();
    drafts[calculatorType] = {
        data,
        savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
};

export const getDrafts = () => {
    try {
        return JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
    } catch {
        return {};
    }
};

export const getDraft = (calculatorType) => {
    return getDrafts()[calculatorType]?.data || null;
};

export const clearDraft = (calculatorType) => {
    const drafts = getDrafts();
    delete drafts[calculatorType];
    localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
};
