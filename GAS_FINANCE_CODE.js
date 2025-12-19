// ========================================
// 財務報表功能 - 請將此代碼複製貼到 GAS 編輯器末尾
// ========================================

// 在 doGet 函數的 switch(action) 中新增以下 case:
// case 'init_finance_folder': return handleInitFinanceFolder();
// case 'export_finance_report': return handleExportFinanceReport(JSON.parse(e.parameter.data || '{}'));
// case 'search_finance_records': return handleSearchFinanceRecords(JSON.parse(e.parameter.data || '{}'));

// ========================================
// 財務報表資料夾管理
// ========================================

function handleInitFinanceFolder() {
    try {
        const rootFolder = getOrCreateProjectRoot();
        const folderName = '財務報表';

        // 查找或建立「財務報表」資料夾
        const folders = rootFolder.getFoldersByName(folderName);
        let financeFolder;

        if (folders.hasNext()) {
            financeFolder = folders.next();
        } else {
            financeFolder = rootFolder.createFolder(folderName);
        }

        return jsonp({
            success: true,
            folderId: financeFolder.getId(),
            folderUrl: financeFolder.getUrl(),
            folderName: folderName
        });
    } catch (error) {
        return jsonp({ success: false, error: error.message });
    }
}

// ========================================
// 月度報表 Sheet 管理
// ========================================

function getOrCreateMonthlySheet(folderId, yearMonth) {
    const folder = DriveApp.getFolderById(folderId);
    const sheetName = yearMonth + '-收支明細';

    // 查找現有的 Sheet
    const files = folder.getFilesByName(sheetName);
    if (files.hasNext()) {
        const file = files.next();
        return {
            spreadsheet: SpreadsheetApp.openById(file.getId()),
            isNew: false,
            sheetUrl: file.getUrl()
        };
    }

    // 建立新的 Sheet
    const ss = SpreadsheetApp.create(sheetName);
    const sheet = ss.getActiveSheet();

    // 設定標題列
    const headers = ['日期', '類型', '帳戶', '分類', '說明', '金額', '關聯專案', '建立時間'];
    const widths = [100, 60, 120, 100, 250, 100, 150, 150];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
        .setBackground('#4285F4')
        .setFontColor('#FFFFFF')
        .setFontWeight('bold')
        .setHorizontalAlignment('center');

    // 設定欄位寬度
    for (let i = 0; i < widths.length; i++) {
        sheet.setColumnWidth(i + 1, widths[i]);
    }

    // 凍結標題列
    sheet.setFrozenRows(1);

    // 移動到財務報表資料夾
    const file = DriveApp.getFileById(ss.getId());
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    return {
        spreadsheet: ss,
        isNew: true,
        sheetUrl: file.getUrl()
    };
}

// ========================================
// 匯出財務報表
// ========================================

function handleExportFinanceReport(data) {
    try {
        const { transactions, dateRange, folderId } = data;

        if (!transactions || transactions.length === 0) {
            return jsonp({ success: false, error: '無交易資料可匯出' });
        }

        // 根據日期確定月份
        const firstDate = transactions[0].date || new Date().toISOString().slice(0, 10);
        const yearMonth = firstDate.slice(0, 7); // e.g., "2025-12"

        // 取得或建立月度 Sheet
        const { spreadsheet, isNew, sheetUrl } = getOrCreateMonthlySheet(folderId, yearMonth);
        const sheet = spreadsheet.getActiveSheet();

        // 準備資料列
        const rows = transactions.map(tx => [
            tx.date || '',
            tx.type || '',
            tx.accountName || '',
            tx.category || '',
            tx.desc || '',
            tx.type === '收入' ? tx.amount : -tx.amount,
            tx.projectName || '',
            new Date().toISOString()
        ]);

        // 寫入資料
        const lastRow = sheet.getLastRow();
        sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length).setValues(rows);

        // 格式化金額欄位
        const amountRange = sheet.getRange(lastRow + 1, 6, rows.length, 1);
        amountRange.setNumberFormat('#,##0');

        // 設定條件格式（收入綠色，支出紅色）
        const typeRange = sheet.getRange(lastRow + 1, 2, rows.length, 1);

        return jsonp({
            success: true,
            sheetUrl: sheetUrl,
            rowsAdded: rows.length,
            yearMonth: yearMonth,
            isNewSheet: isNew
        });
    } catch (error) {
        return jsonp({ success: false, error: error.message });
    }
}

// ========================================
// 跨 Sheet 搜尋財務記錄
// ========================================

function handleSearchFinanceRecords(data) {
    try {
        const { query, folderId, startDate, endDate } = data;

        if (!query || query.trim() === '') {
            return jsonp({ success: false, error: '請輸入搜尋關鍵字' });
        }

        const folder = DriveApp.getFolderById(folderId);
        const files = folder.getFilesByType(MimeType.GOOGLE_SHEETS);
        const results = [];

        while (files.hasNext()) {
            const file = files.next();
            const ss = SpreadsheetApp.openById(file.getId());
            const sheet = ss.getActiveSheet();
            const data = sheet.getDataRange().getValues();

            // 跳過標題列
            for (let i = 1; i < data.length; i++) {
                const row = data[i];
                const rowDate = row[0];

                // 日期範圍篩選
                if (startDate && rowDate < startDate) continue;
                if (endDate && rowDate > endDate) continue;

                // 關鍵字搜尋（搜尋說明、分類、專案欄位）
                const searchText = (row[3] + ' ' + row[4] + ' ' + row[6]).toLowerCase();
                if (searchText.includes(query.toLowerCase())) {
                    results.push({
                        date: row[0],
                        type: row[1],
                        account: row[2],
                        category: row[3],
                        desc: row[4],
                        amount: row[5],
                        project: row[6],
                        sourceSheet: file.getName()
                    });
                }
            }
        }

        return jsonp({
            success: true,
            results: results,
            count: results.length
        });
    } catch (error) {
        return jsonp({ success: false, error: error.message });
    }
}

// ========================================
// 輔助函數：取得「專案管理」根資料夾
// ========================================
// 注意：如果此函數已存在，請勿重複新增
function getOrCreateProjectRoot() {
    const rootFolderName = '專案管理';
    const folders = DriveApp.getFoldersByName(rootFolderName);

    if (folders.hasNext()) {
        return folders.next();
    }

    return DriveApp.createFolder(rootFolderName);
}
