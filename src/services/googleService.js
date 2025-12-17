
import { MOCK_DB } from './MockData';

// GAS deployment URL
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbxUrPvBxCavNiXkhVkK-Afqrfkx4N64NEFQFGzXCFUK5h5Qq_5JZlZT7ptrBiTTPvqMfg/exec";

// Helper function for API calls with better error handling
const callGAS = async (payload) => {
  try {
    const response = await fetch(GAS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    // GAS returns text/html by default, try to parse as JSON
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      // If not JSON, treat as success if status is ok
      if (response.ok) {
        return { success: true, message: 'Operation completed' };
      }
      throw new Error(`Invalid response format: ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return { success: true, data };
  } catch (error) {
    console.error('GAS API Error:', error);
    return {
      success: false,
      error: error.message || 'Network error occurred',
      details: error
    };
  }
};

export const GoogleService = {
  login: () => new Promise(resolve => setTimeout(() => resolve({ name: "Admin", email: "admin@senteng.co", photo: "A" }), 1500)),

  // Still using Mock Data for read operations
  fetchSheetData: async (sheetName) => {
    try {
      fetch(`${GAS_API_URL}?type=init`).then(res => res.json()).then(d => console.log("GAS Connection Checked:", d)).catch(() => { });
    } catch (e) {
      console.error("GAS Connect Failed", e);
    }

    return new Promise(resolve => {
      setTimeout(() => { if (MOCK_DB[sheetName]) resolve(MOCK_DB[sheetName]); }, 800);
    });
  },

  fetchCalendarEvents: () => new Promise(resolve => { setTimeout(() => resolve(MOCK_DB.calendar), 1000); }),

  addToCalendar: async (event) => {
    console.log(`📅 Adding calendar event: ${event.title}`);
    const result = await callGAS({
      action: 'add_calendar_event',
      title: event.title,
      startTime: event.date + 'T' + event.time,
      endTime: event.date + 'T' + event.time,
      description: event.description || '',
      location: event.location || ''
    });

    if (result.success) {
      console.log("✅ Calendar event created successfully");
    } else {
      console.error("❌ Calendar event creation failed:", result.error);
    }

    return result;
  },

  syncToSheet: async (sheetName, data) => {
    console.log(`📊 Syncing to Sheet [${sheetName}]:`, data.length, 'records');

    const result = await callGAS({
      action: 'sync_to_sheet',
      sheetName,
      records: data
    });

    if (result.success) {
      console.log(`✅ Synced to Sheet [${sheetName}]`);
    } else {
      console.error(`❌ Sheet sync failed [${sheetName}]:`, result.error);
    }

    return result;
  },

  uploadToDrive: (file, folderName) => new Promise(resolve => {
    setTimeout(() => {
      console.log(`Uploaded ${file.name} to Drive/Projects/${folderName}/`);
      resolve({ success: true, url: `https://drive.google.com/file/d/mock-${Date.now()}` });
    }, 1500);
  }),

  createDriveFolder: async (folderName) => {
    console.log(`📁 Creating Drive folder: ${folderName}`);

    const result = await callGAS({
      action: 'create_drive_folder',
      folderName
    });

    if (result.success) {
      const folderUrl = result.data?.folderUrl || `https://drive.google.com/drive/folders/${result.data?.folderId || 'unknown'}`;
      console.log(`✅ Drive folder created: ${folderUrl}`);
      return { success: true, url: folderUrl, folderId: result.data?.folderId };
    } else {
      console.error(`❌ Drive folder creation failed:`, result.error);
      return { success: false, error: result.error };
    }
  }
};
