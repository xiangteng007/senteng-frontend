/**
 * reportExport.ts
 *
 * Report export service for generating PDF and Excel files.
 * Supports client data, quotations, contracts, payments/invoices.
 */

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ==========================================
// Types
// ==========================================

export interface ExportOptions {
    sheetName?: string;
    columnHeaders?: Record<string, string>;
    columnWidths?: Array<{ wch: number }>;
}

export interface Client {
    name: string;
    shortName?: string;
    taxId?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    status?: string;
    createdAt?: string | Date;
}

export interface QuotationItem {
    itemName: string;
    specification?: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    notes?: string;
}

export interface Quotation {
    quotationNo: string;
    clientName: string;
    projectName: string;
    quotationDate: string | Date;
    validUntil: string | Date;
    totalAmount: number;
    status: string;
    items?: QuotationItem[];
}

export interface Payment {
    paymentNo: string;
    projectName: string;
    clientName: string;
    paymentDate: string | Date;
    amount: number;
    status: string;
    paidDate?: string | Date;
    notes?: string;
}

export interface Contract {
    contractNo: string;
    projectName: string;
    clientName: string;
    contractDate: string | Date;
    startDate: string | Date;
    endDate?: string | Date;
    totalAmount: number;
    status: string;
}

// ==========================================
// Helper Functions
// ==========================================

function formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatCurrency(amount: number | null | undefined): string {
    if (amount == null) return '';
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0,
    }).format(amount);
}

// ==========================================
// Export Functions
// ==========================================

/**
 * Export data to Excel file
 */
export function exportToExcel<T extends Record<string, unknown>>(
    data: T[],
    filename: string,
    options: ExportOptions = {}
): void {
    const { sheetName = 'Sheet1', columnHeaders = null, columnWidths = null } = options;

    // Transform data with custom headers if provided
    let exportData: Record<string, unknown>[] = data as Record<string, unknown>[];
    if (columnHeaders) {
        exportData = data.map(row => {
            const newRow: Record<string, unknown> = {};
            Object.entries(columnHeaders).forEach(([field, header]) => {
                newRow[header] = row[field] ?? '';
            });
            return newRow;
        });
    }

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths if provided
    if (columnWidths) {
        worksheet['!cols'] = columnWidths;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate and save file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${filename}.xlsx`);
}

/**
 * Export client list to Excel
 */
export function exportClientsToExcel(clients: Client[]): void {
    const columnHeaders: Record<string, string> = {
        name: '客戶名稱',
        shortName: '簡稱',
        taxId: '統一編號',
        contactPerson: '聯絡人',
        phone: '電話',
        email: 'Email',
        address: '地址',
        status: '狀態',
        createdAt: '建立日期',
    };

    const columnWidths = [
        { wch: 25 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 25 },
        { wch: 40 },
        { wch: 10 },
        { wch: 12 },
    ];

    exportToExcel(clients, `客戶清單_${formatDate(new Date())}`, {
        sheetName: '客戶清單',
        columnHeaders,
        columnWidths,
    });
}

/**
 * Export quotation to Excel
 */
export function exportQuotationToExcel(quotation: Quotation): void {
    // Header info
    const headerData = [
        {
            報價單號: quotation.quotationNo,
            客戶: quotation.clientName,
            專案: quotation.projectName,
            日期: formatDate(quotation.quotationDate),
            有效期限: formatDate(quotation.validUntil),
            總金額: formatCurrency(quotation.totalAmount),
            狀態: quotation.status,
        },
    ];

    // Line items
    const lineItems = (quotation.items || []).map((item, index) => ({
        項次: index + 1,
        項目名稱: item.itemName,
        規格: item.specification || '',
        單位: item.unit,
        數量: item.quantity,
        單價: item.unitPrice,
        金額: item.amount,
        備註: item.notes || '',
    }));

    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();

    const headerSheet = XLSX.utils.json_to_sheet(headerData);
    XLSX.utils.book_append_sheet(workbook, headerSheet, '報價資訊');

    const itemsSheet = XLSX.utils.json_to_sheet(lineItems);
    itemsSheet['!cols'] = [
        { wch: 6 },
        { wch: 30 },
        { wch: 20 },
        { wch: 8 },
        { wch: 10 },
        { wch: 12 },
        { wch: 12 },
        { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(workbook, itemsSheet, '項目明細');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `報價單_${quotation.quotationNo}.xlsx`);
}

/**
 * Export payment/invoice summary to Excel
 */
export function exportPaymentsToExcel(payments: Payment[], title = '請款紀錄'): void {
    const columnHeaders: Record<string, string> = {
        paymentNo: '請款單號',
        projectName: '專案名稱',
        clientName: '客戶',
        paymentDate: '請款日期',
        amount: '金額',
        status: '狀態',
        paidDate: '收款日期',
        notes: '備註',
    };

    const data = payments.map(p => ({
        ...p,
        paymentDate: formatDate(p.paymentDate),
        paidDate: p.paidDate ? formatDate(p.paidDate) : '',
        amount: formatCurrency(p.amount),
    }));

    exportToExcel(data, `${title}_${formatDate(new Date())}`, {
        sheetName: title,
        columnHeaders,
        columnWidths: [
            { wch: 15 },
            { wch: 25 },
            { wch: 20 },
            { wch: 12 },
            { wch: 15 },
            { wch: 10 },
            { wch: 12 },
            { wch: 30 },
        ],
    });
}

/**
 * Export contract summary to Excel
 */
export function exportContractsToExcel(contracts: Contract[]): void {
    const columnHeaders: Record<string, string> = {
        contractNo: '合約編號',
        projectName: '專案名稱',
        clientName: '客戶',
        contractDate: '合約日期',
        startDate: '開始日期',
        endDate: '結束日期',
        totalAmount: '合約金額',
        status: '狀態',
    };

    const data = contracts.map(c => ({
        ...c,
        contractDate: formatDate(c.contractDate),
        startDate: formatDate(c.startDate),
        endDate: c.endDate ? formatDate(c.endDate) : '',
        totalAmount: formatCurrency(c.totalAmount),
    }));

    exportToExcel(data, `合約清單_${formatDate(new Date())}`, {
        sheetName: '合約清單',
        columnHeaders,
        columnWidths: [
            { wch: 15 },
            { wch: 25 },
            { wch: 20 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 15 },
            { wch: 10 },
        ],
    });
}
