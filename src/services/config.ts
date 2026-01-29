/**
 * config.ts
 *
 * Development environment configuration - TypeScript 版本
 */

// ==========================================
// Environment Detection
// ==========================================

export const IS_DEV_MODE: boolean = import.meta.env.MODE === 'development';
export const USE_MOCK_GOOGLE_API: boolean = IS_DEV_MODE;

// ==========================================
// API URLs
// ==========================================

export const GAS_API_URL: string =
    'https://script.google.com/macros/s/AKfycbxUrPvBxCavNiXkhVkK-Afqrfkx4N64NEFQFGzXCFUK5h5Qq_5JZlZT7ptrBiTTPvqMfg/exec';

// ==========================================
// Types
// ==========================================

export interface MockFolderResponse {
    success: boolean;
    url: string;
    folderId: string;
    message: string;
}

export interface MockSyncResponse {
    success: boolean;
    message: string;
    recordCount: number;
}

export interface MockCalendarEventResponse {
    success: boolean;
    eventId: string;
    eventTitle?: string;
    eventUrl?: string;
    message: string;
}

// ==========================================
// Mock Responses (for development)
// ==========================================

export const MOCK_RESPONSES = {
    createDriveFolder: (folderName: string): MockFolderResponse => ({
        success: true,
        url: `https://drive.google.com/drive/folders/mock-${Date.now()}`,
        folderId: `mock-id-${Date.now()}`,
        message: `[開發模式] 模擬建立資料夾: ${folderName}`,
    }),

    syncToSheet: (sheetName: string, recordCount: number): MockSyncResponse => ({
        success: true,
        message: `[開發模式] 模擬同步 ${recordCount} 筆資料到 ${sheetName}`,
        recordCount,
    }),

    addCalendarEvent: (title: string): MockCalendarEventResponse => ({
        success: true,
        eventId: `mock-event-${Date.now()}`,
        eventTitle: title,
        eventUrl: `https://calendar.google.com/calendar/event?eid=mock`,
        message: `[開發模式] 模擬建立行程: ${title}`,
    }),

    updateCalendarEvent: (eventId: string): MockCalendarEventResponse => ({
        success: true,
        eventId,
        message: `[開發模式] 模擬更新行程: ${eventId}`,
    }),

    deleteCalendarEvent: (eventId: string): MockCalendarEventResponse => ({
        success: true,
        eventId,
        message: `[開發模式] 模擬刪除行程: ${eventId}`,
    }),
};
