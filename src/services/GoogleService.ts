/**
 * GoogleService.ts
 *
 * Google Apps Script integration via JSONP
 * Handles Calendar, Drive, and Sheets operations
 */

// ==========================================
// Types
// ==========================================

export interface GASResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    warning?: string;
}

export interface GASRawResponse {
    success?: boolean;
    status?: string;
    data?: unknown;
    error?: string;
    message?: string;
}

export interface CalendarEvent {
    title: string;
    date: string;
    time: string;
    description?: string;
    location?: string;
}

export interface CalendarEventResult {
    eventId: string;
}

export interface DriveFolder {
    folderId: string;
    folderUrl: string;
}

export interface DriveFile {
    fileId: string;
    fileUrl: string;
}

export interface DriveFolderItem {
    id: string;
    name: string;
    url: string;
}

export interface SheetResult {
    sheetId: string;
    sheetUrl: string;
    folderUrl?: string;
}

export interface InventoryItem {
    name: string;
    spec?: string;
    quantity: number;
    unit: string;
    safeStock: number;
    location?: string;
    status: string;
    mainCategory?: string;
    category?: string;
}

export interface MaterialCalculationRecord {
    category?: string;
    subType?: string;
    label?: string;
    value?: number;
    unit?: string;
    wastageValue?: number;
    createdAt?: string;
}

export interface EstimateItem {
    category?: string;
    name: string;
    spec: string;
    unit: string;
    price: number;
    quantity: number;
    note?: string;
}

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    type: string;
    category: string;
    description?: string;
    accountId?: string;
    accountName?: string;
    projectId?: string;
    projectName?: string;
}

export interface FinanceReportOptions {
    dateRange?: { start: string; end: string };
    accountsMap?: Record<string, string>;
    projectsMap?: Record<string, string>;
}

export interface FinanceSearchOptions {
    startDate?: string;
    endDate?: string;
}

export interface FinanceSearchResult {
    id: string;
    date: string;
    description: string;
    amount: number;
    sheetName: string;
}

// ==========================================
// Constants
// ==========================================

const GAS_API_URL =
    'https://script.google.com/macros/s/AKfycbxlg_08fpYZNte11U_LawwNRoGThe4Mps5v__MfOib5kMZfFqs3jzvqBxa55CKHhDcepw/exec';

const PROJECT_ROOT_FOLDER_ID = '16xsGbEcb-ZXcLT9HanWtuVv8LfcIApoN';
const VENDOR_PARENT_FOLDER_ID = '1cO5aF3MBBO6FoBHXgRokEUW1uaGjUjFy';
const CLIENT_PARENT_FOLDER_ID = '1UcrNx19PWNvOR1gau8oywjFsIlNh22r0';
const INVENTORY_FOLDER_ID = '1ZyCVPGlXq9RwucEM8kCGUoJe8_iiihJ7';
const MATERIAL_CALC_FOLDER_ID = '1IXPh77aQVduJMcXLWFtgAQxVkPVP8Baq';
const FINANCE_FOLDER_ID = '1QlXwt1Ew8ffQGFpr-40PZ91eocOlV8Eg';

// ==========================================
// JSONP Helper
// ==========================================

declare global {
    interface Window {
        [key: string]: ((response: GASRawResponse) => void) | undefined;
    }
}

const callGASWithJSONP = <T = unknown>(
    action: string,
    data: Record<string, unknown> = {}
): Promise<GASResponse<T>> => {
    return new Promise((resolve, reject) => {
        const callbackName = `gas_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const dataStr = encodeURIComponent(JSON.stringify(data));
        const url = `${GAS_API_URL}?action=${action}&data=${dataStr}&callback=${callbackName}`;

        console.log(`🔗 GAS API Request: ${action}`, data);

        const script = document.createElement('script');
        script.src = url;
        script.async = true;

        const timeout = setTimeout(() => {
            cleanup();
            console.error('❌ GAS API Timeout');
            reject(new Error('Request timeout'));
        }, 30000);

        window[callbackName] = (response: GASRawResponse) => {
            clearTimeout(timeout);
            cleanup();
            console.log('✅ GAS API Response:', response);

            if (response.success === true) {
                resolve({ success: true, data: response.data as T });
            } else if (response.status === 'success') {
                resolve({ success: true, data: response as unknown as T });
            } else {
                const errorMsg =
                    response.error ||
                    (response.data as { error?: string })?.error ||
                    response.message ||
                    'Unknown error';
                resolve({ success: false, error: errorMsg });
            }
        };

        const cleanup = () => {
            delete window[callbackName];
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };

        script.onerror = (e: unknown) => {
            clearTimeout(timeout);
            cleanup();
            console.error('❌ Script load failed:', e);
            reject(new Error('Script load failed - Google Apps Script 無法連線，請檢查 GAS 部署狀態'));
        };

        document.head.appendChild(script);
    });
};

// ==========================================
// Service
// ==========================================

export const GoogleService = {
    login: (): Promise<{ name: string; email: string; photo: string }> =>
        new Promise(resolve =>
            setTimeout(() => resolve({ name: 'Admin', email: 'admin@senteng.co', photo: 'A' }), 1500)
        ),

    loadFromSheet: async (sheetType: string): Promise<GASResponse<unknown[]>> => {
        console.log(`📥 Loading ${sheetType} from Google Sheets...`);

        try {
            const result = await callGASWithJSONP<{ items?: unknown[]; status?: string }>(
                'load_from_sheet',
                { sheetType }
            );

            if (result.success && result.data?.items) {
                console.log(`✅ Loaded ${result.data.items.length} ${sheetType} items`);
                return { success: true, data: result.data.items };
            } else if (result.success && result.data?.status === 'empty') {
                console.log(`📭 No ${sheetType} data found in Sheets`);
                return { success: true, data: [] };
            } else {
                console.error(`❌ Failed to load ${sheetType}:`, result.error);
                return { success: false, error: result.error, data: [] };
            }
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message, data: [] };
        }
    },

    fetchCalendarEvents: (): Promise<unknown[]> =>
        new Promise(resolve => {
            setTimeout(() => resolve([]), 1000);
        }),

    addToCalendar: async (event: CalendarEvent): Promise<GASResponse<CalendarEventResult>> => {
        console.log(`📅 Adding calendar event: ${event.title}`);

        try {
            const result = await callGASWithJSONP<CalendarEventResult>('add_calendar_event', {
                title: event.title,
                startTime: event.date + 'T' + event.time,
                endTime: event.date + 'T' + event.time,
                description: event.description || '',
                location: event.location || '',
            });

            if (result.success) {
                console.log('✅ Calendar event created successfully');
            } else {
                console.error('❌ Calendar event creation failed:', result.error);
            }

            return result;
        } catch (error) {
            console.error('GAS API Error:', error);
            console.warn('📌 GAS 不可用，行程已儲存在本地但未同步到 Google 日曆');
            return {
                success: true,
                data: { eventId: `local-${Date.now()}` },
                warning: 'Google 日曆同步失敗，行程僅儲存在本地。',
            };
        }
    },

    updateCalendarEvent: async (
        eventId: string,
        updates: Partial<CalendarEvent>
    ): Promise<GASResponse> => {
        console.log(`📅 Updating calendar event: ${eventId}`);

        try {
            const result = await callGASWithJSONP('update_calendar_event', {
                eventId,
                ...updates,
            });

            if (result.success) {
                console.log('✅ Calendar event updated successfully');
            } else {
                console.error('❌ Calendar event update failed:', result.error);
            }

            return result;
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message };
        }
    },

    deleteCalendarEvent: async (eventId: string): Promise<GASResponse> => {
        console.log(`📅 Deleting calendar event: ${eventId}`);

        try {
            const result = await callGASWithJSONP('delete_calendar_event', { eventId });

            if (result.success) {
                console.log('✅ Calendar event deleted successfully');
            } else {
                console.error('❌ Calendar event deletion failed:', result.error);
            }

            return result;
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message };
        }
    },

    syncToSheet: async (sheetName: string, data: unknown[]): Promise<GASResponse> => {
        console.log(`📊 Syncing to Sheet [${sheetName}]:`, data.length, 'records');

        try {
            const result = await callGASWithJSONP('sync_to_sheet', {
                sheetName,
                records: data,
            });

            if (result.success) {
                console.log(`✅ Synced to Sheet [${sheetName}]`);
            } else {
                console.error(`❌ Sheet sync failed [${sheetName}]:`, result.error);
            }

            return result;
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message };
        }
    },

    uploadToDrive: async (
        file: File,
        _folderName: string,
        folderUrl?: string
    ): Promise<GASResponse<DriveFile>> => {
        console.log(`📤 Uploading file: ${file.name}`);

        try {
            let folderId: string | null = null;
            if (folderUrl) {
                const match = folderUrl.match(/folders\/([a-zA-Z0-9_-]+)/);
                folderId = match ? match[1] : null;
            }

            const result = await callGASWithJSONP<{ fileUrl?: string; fileId?: string }>(
                'upload_to_drive',
                {
                    fileName: file.name,
                    fileSize: file.size,
                    mimeType: file.type,
                    folderId: folderId,
                }
            );

            if (result.success && result.data) {
                const fileUrl =
                    result.data.fileUrl ||
                    `https://drive.google.com/file/d/${result.data.fileId || 'unknown'}/view`;
                console.log(`✅ File uploaded: ${fileUrl}`);
                return {
                    success: true,
                    data: { fileUrl, fileId: result.data.fileId || '' },
                };
            } else {
                console.error(`❌ File upload failed:`, result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message };
        }
    },

    getOrCreateProjectRoot: async (): Promise<GASResponse<DriveFolder>> => {
        const folderUrl = `https://drive.google.com/drive/folders/${PROJECT_ROOT_FOLDER_ID}`;
        console.log(`📁 GAS API Request: get_or_create_project_root`);
        console.log(`✅ Project root folder ready: ${folderUrl}`);

        return {
            success: true,
            data: { folderUrl, folderId: PROJECT_ROOT_FOLDER_ID },
        };
    },

    createDriveFolder: async (
        folderName: string,
        parentFolderId?: string | null
    ): Promise<GASResponse<DriveFolder>> => {
        console.log(`📁 Creating Drive folder: ${folderName}`);

        try {
            const result = await callGASWithJSONP<{ folderUrl?: string; folderId?: string }>(
                'create_drive_folder',
                {
                    folderName,
                    parentId: parentFolderId,
                }
            );

            if (result.success && result.data) {
                const folderUrl =
                    result.data.folderUrl ||
                    `https://drive.google.com/drive/folders/${result.data.folderId || 'unknown'}`;
                console.log(`✅ Drive folder created: ${folderUrl}`);
                return {
                    success: true,
                    data: { folderUrl, folderId: result.data.folderId || '' },
                };
            } else {
                console.error(`❌ Drive folder creation failed:`, result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message };
        }
    },

    createVendorFolder: async (vendorName: string): Promise<GASResponse<DriveFolder>> => {
        console.log(`📁 Creating vendor folder: ${vendorName}`);
        return GoogleService.createDriveFolder(vendorName, VENDOR_PARENT_FOLDER_ID);
    },

    createClientFolder: async (clientName: string): Promise<GASResponse<DriveFolder>> => {
        console.log(`📁 Creating client folder: ${clientName}`);
        return GoogleService.createDriveFolder(clientName, CLIENT_PARENT_FOLDER_ID);
    },

    listDriveFolders: async (
        parentFolderId?: string | null
    ): Promise<GASResponse<{ folders: DriveFolderItem[] }>> => {
        console.log(`📂 Listing Drive folders...`);

        try {
            const result = await callGASWithJSONP<{ folders?: DriveFolderItem[] }>('list_drive_folders', {
                parentFolderId,
            });

            if (result.success) {
                console.log(`✅ Found ${result.data?.folders?.length || 0} folders`);
                return { success: true, data: { folders: result.data?.folders || [] } };
            } else {
                console.error(`❌ List folders failed:`, result.error);
                return { success: false, error: result.error, data: { folders: [] } };
            }
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message, data: { folders: [] } };
        }
    },

    createCostEstimatorFolder: async (): Promise<GASResponse<SheetResult & DriveFolder>> => {
        console.log(`📁 Creating Cost Estimator folder and database...`);

        try {
            const result = await callGASWithJSONP<{
                folderUrl?: string;
                folderId?: string;
                sheetId?: string;
                sheetUrl?: string;
            }>('create_cost_estimator_folder', {
                folderName: '營建物料成本快速估算指標與公式',
            });

            if (result.success && result.data) {
                const folderUrl =
                    result.data.folderUrl ||
                    `https://drive.google.com/drive/folders/${result.data.folderId || 'unknown'}`;
                console.log(`✅ Cost Estimator folder created: ${folderUrl}`);
                return {
                    success: true,
                    data: {
                        folderUrl,
                        folderId: result.data.folderId || '',
                        sheetId: result.data.sheetId || '',
                        sheetUrl: result.data.sheetUrl || '',
                    },
                };
            } else {
                console.error(`❌ Cost Estimator folder creation failed:`, result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message };
        }
    },

    getMaterialPrices: async (): Promise<GASResponse<unknown>> => {
        console.log(`📊 Fetching material prices from Drive...`);

        try {
            const result = await callGASWithJSONP('get_material_prices', {});

            if (result.success) {
                console.log(`✅ Material prices loaded`);
                return { success: true, data: result.data };
            } else {
                console.error(`❌ Failed to load material prices:`, result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message };
        }
    },

    updateMaterialPrice: async (
        category: string,
        material: { name: string; price: number }
    ): Promise<GASResponse> => {
        console.log(`📝 Updating material price: ${material.name}...`);

        try {
            const result = await callGASWithJSONP('update_material_price', {
                category,
                material,
            });

            if (result.success) {
                console.log(`✅ Material price updated`);
                return { success: true };
            } else {
                console.error(`❌ Failed to update material price:`, result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message };
        }
    },

    exportEstimateToSheet: async (
        estimateName: string,
        items: EstimateItem[],
        totalCost: number
    ): Promise<GASResponse<SheetResult>> => {
        console.log(`📊 Exporting estimate to Sheet: ${estimateName}...`);

        try {
            const result = await callGASWithJSONP<SheetResult>('export_estimate_to_sheet', {
                estimateName,
                items: items.map(item => ({
                    category: item.category || '未分類',
                    name: item.name,
                    spec: item.spec,
                    unit: item.unit,
                    price: item.price,
                    quantity: item.quantity,
                    subtotal: item.price * item.quantity,
                    note: item.note || '',
                })),
                totalCost,
                createdAt: new Date().toISOString(),
            });

            if (result.success && result.data) {
                const sheetUrl = result.data.sheetUrl || '';
                console.log(`✅ Estimate exported to Sheet: ${sheetUrl}`);
                return {
                    success: true,
                    data: {
                        sheetUrl,
                        sheetId: result.data.sheetId || '',
                        folderUrl: result.data.folderUrl,
                    },
                };
            } else {
                console.error(`❌ Failed to export estimate:`, result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message };
        }
    },

    initInventorySheet: async (): Promise<GASResponse<SheetResult & DriveFolder>> => {
        console.log(`📦 Initializing Inventory Sheet...`);

        try {
            const result = await callGASWithJSONP<{
                folderId?: string;
                folderUrl?: string;
                sheetId?: string;
                sheetUrl?: string;
            }>('init_inventory_sheet', {
                parentId: INVENTORY_FOLDER_ID,
            });

            if (result.success && result.data) {
                console.log(`✅ Inventory Sheet initialized`);
                return {
                    success: true,
                    data: {
                        folderId: result.data.folderId || '',
                        folderUrl: result.data.folderUrl || '',
                        sheetId: result.data.sheetId || '',
                        sheetUrl: result.data.sheetUrl || '',
                    },
                };
            } else {
                console.error(`❌ Failed to initialize Inventory Sheet:`, result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message };
        }
    },

    syncInventoryToSheet: async (
        sheetId: string,
        items: InventoryItem[]
    ): Promise<GASResponse<{ sheetUrl?: string; updatedAt?: string }>> => {
        console.log(`📦 Syncing ${items.length} items to Inventory Sheet...`);

        try {
            const result = await callGASWithJSONP<{ sheetUrl?: string; updatedAt?: string }>(
                'sync_inventory_to_sheet',
                {
                    sheetId,
                    items: JSON.stringify(
                        items.map(item => ({
                            name: item.name,
                            spec: item.spec || '',
                            quantity: item.quantity,
                            unit: item.unit,
                            safeStock: item.safeStock,
                            location: item.location || '',
                            status: item.status,
                            mainCategory: item.mainCategory || '',
                            category: item.category || '其他',
                        }))
                    ),
                }
            );

            if (result.success) {
                console.log(`✅ Inventory synced to Sheet`);
                return {
                    success: true,
                    data: {
                        sheetUrl: result.data?.sheetUrl,
                        updatedAt: result.data?.updatedAt,
                    },
                };
            } else {
                console.error(`❌ Failed to sync inventory:`, result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message };
        }
    },

    syncTransactionToProjectSheet: async (
        projectFolderId: string,
        projectName: string,
        transaction: Transaction
    ): Promise<GASResponse<SheetResult>> => {
        console.log(`💰 Syncing transaction to project: ${projectName}...`);

        try {
            const result = await callGASWithJSONP<SheetResult>('sync_project_transaction', {
                folderId: projectFolderId,
                projectName,
                transaction: JSON.stringify(transaction),
            });

            if (result.success) {
                console.log(`✅ Transaction synced to project Sheet`);
                return {
                    success: true,
                    data: {
                        sheetUrl: result.data?.sheetUrl || '',
                        sheetId: result.data?.sheetId || '',
                    },
                };
            } else {
                console.error(`❌ Failed to sync transaction:`, result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message };
        }
    },

    syncAllProjectTransactions: async (
        projectFolderId: string,
        projectName: string,
        transactions: Transaction[]
    ): Promise<GASResponse<SheetResult>> => {
        console.log(`💰 Syncing ${transactions.length} transactions to project: ${projectName}...`);

        try {
            const result = await callGASWithJSONP<SheetResult>('sync_all_project_transactions', {
                folderId: projectFolderId,
                projectName,
                transactions: JSON.stringify(transactions),
            });

            if (result.success) {
                console.log(`✅ All transactions synced to project Sheet`);
                return {
                    success: true,
                    data: {
                        sheetUrl: result.data?.sheetUrl || '',
                        sheetId: result.data?.sheetId || '',
                    },
                };
            } else {
                console.error(`❌ Failed to sync transactions:`, result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message };
        }
    },

    exportMaterialCalculationToFolder: async (
        records: MaterialCalculationRecord[],
        customName = ''
    ): Promise<GASResponse<SheetResult>> => {
        const now = new Date();
        const dateStr = now
            .toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            })
            .replace(/\//g, '-');
        const timeStr = now
            .toLocaleTimeString('zh-TW', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            })
            .replace(/:/g, '-');
        const sheetName = customName.trim() || `物料算量_${dateStr}_${timeStr}`;

        console.log(`📊 Exporting material calculation to Sheet: ${sheetName}...`);

        try {
            const result = await callGASWithJSONP<{
                sheetUrl?: string;
                sheetId?: string;
                folderUrl?: string;
                data?: { sheetUrl?: string; sheetId?: string; folderUrl?: string };
            }>('export_material_calculation_to_folder', {
                sheetName,
                folderName: '物料算量',
                parentFolderId: MATERIAL_CALC_FOLDER_ID,
                records: records.map((r, index) => ({
                    index: index + 1,
                    category: r.category || '未分類',
                    subType: r.subType || '',
                    label: r.label || `項目 ${index + 1}`,
                    value: r.value || 0,
                    unit: r.unit || '',
                    wastageValue: r.wastageValue || r.value || 0,
                    createdAt: r.createdAt || '',
                })),
                createdAt: now.toISOString(),
            });

            if (result.success && result.data) {
                const innerData = result.data.data || result.data;
                const sheetUrl = innerData.sheetUrl || '';
                const sheetId = innerData.sheetId || '';
                const folderUrl = innerData.folderUrl || '';

                console.log(`✅ Material calculation exported to Sheet: ${sheetUrl}`);
                return {
                    success: true,
                    data: { sheetUrl, sheetId, folderUrl },
                };
            } else {
                console.error(`❌ Failed to export material calculation:`, result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message };
        }
    },

    initFinanceReportFolder: async (): Promise<GASResponse<DriveFolder>> => {
        console.log(`📁 Initializing '財務報表' folder...`);

        try {
            const result = await callGASWithJSONP<{ folderId?: string; folderUrl?: string }>(
                'init_finance_folder',
                {
                    parentId: FINANCE_FOLDER_ID,
                }
            );

            if (result.success && result.data) {
                const folderUrl =
                    result.data.folderUrl ||
                    `https://drive.google.com/drive/folders/${result.data.folderId || 'unknown'}`;
                console.log(`✅ Finance report folder ready: ${folderUrl}`);
                return {
                    success: true,
                    data: {
                        folderId: result.data.folderId || '',
                        folderUrl: folderUrl,
                    },
                };
            } else {
                console.error(`❌ Finance report folder failed:`, result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message };
        }
    },

    exportFinanceReport: async (
        transactions: Transaction[],
        options: FinanceReportOptions = {}
    ): Promise<
        GASResponse<{
            sheetUrl?: string;
            rowsAdded?: number;
            yearMonth?: string;
            isNewSheet?: boolean;
        }>
    > => {
        const { dateRange, accountsMap = {}, projectsMap = {} } = options;
        console.log(`📊 Exporting ${transactions.length} transactions to finance report...`);

        try {
            const folderResult = await GoogleService.initFinanceReportFolder();
            if (!folderResult.success) {
                return { success: false, error: `無法建立財務報表資料夾: ${folderResult.error}` };
            }

            const enrichedTransactions = transactions.map(tx => ({
                ...tx,
                accountName: accountsMap[tx.accountId || ''] || tx.accountName || '',
                projectName: projectsMap[tx.projectId || ''] || tx.projectName || '',
            }));

            const result = await callGASWithJSONP<{
                sheetUrl?: string;
                rowsAdded?: number;
                yearMonth?: string;
                isNewSheet?: boolean;
            }>('export_finance_report', {
                transactions: enrichedTransactions,
                dateRange,
                folderId: folderResult.data?.folderId,
            });

            if (result.success) {
                console.log(`✅ Finance report exported: ${result.data?.sheetUrl}`);
                return {
                    success: true,
                    data: {
                        sheetUrl: result.data?.sheetUrl,
                        rowsAdded: result.data?.rowsAdded,
                        yearMonth: result.data?.yearMonth,
                        isNewSheet: result.data?.isNewSheet,
                    },
                };
            } else {
                console.error(`❌ Finance report export failed:`, result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message };
        }
    },

    searchFinanceRecords: async (
        query: string,
        options: FinanceSearchOptions = {}
    ): Promise<GASResponse<{ results: FinanceSearchResult[]; count: number }>> => {
        const { startDate, endDate } = options;
        console.log(`🔍 Searching finance records: "${query}"...`);

        try {
            const folderResult = await GoogleService.initFinanceReportFolder();
            if (!folderResult.success) {
                return {
                    success: false,
                    error: `無法存取財務報表資料夾: ${folderResult.error}`,
                    data: { results: [], count: 0 },
                };
            }

            const result = await callGASWithJSONP<{ results?: FinanceSearchResult[]; count?: number }>(
                'search_finance_records',
                {
                    query,
                    folderId: folderResult.data?.folderId,
                    startDate,
                    endDate,
                }
            );

            if (result.success) {
                console.log(`✅ Found ${result.data?.count || 0} records`);
                return {
                    success: true,
                    data: {
                        results: result.data?.results || [],
                        count: result.data?.count || 0,
                    },
                };
            } else {
                console.error(`❌ Finance search failed:`, result.error);
                return { success: false, error: result.error, data: { results: [], count: 0 } };
            }
        } catch (error) {
            console.error('GAS API Error:', error);
            return { success: false, error: (error as Error).message, data: { results: [], count: 0 } };
        }
    },
};

export default GoogleService;
