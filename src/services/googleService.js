// src/services/googleService.js

/**
 * GoogleService - 實作版（與 App.jsx 介面相容）
 *
 * 介面（提供給 App.jsx 使用）：
 *   GoogleService.initClient(): Promise<boolean>
 *   GoogleService.login(): Promise<{name,email,photo}>
 *   GoogleService.logout(): Promise<void>
 *   GoogleService.getUser(): {name,email,photo} | null
 *
 *   GoogleService.syncToSheet(sheetName, dataArray): Promise<any>
 *   GoogleService.fetchSheetData(sheetName): Promise<string[][]>
 *
 *   GoogleService.addToCalendar(event): Promise<any>
 *   GoogleService.fetchCalendarEvents(): Promise<any[]>
 *
 *   GoogleService.createDriveFolder(clientName): Promise<string>        // 回傳 webViewLink
 *   GoogleService.uploadToDrive(fileOrMock, folderName): Promise<any>   // 回傳檔案資訊
 */

// 從 Vite 環境變數讀取設定
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID;
const DRIVE_ROOT_FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID;

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/calendar",
].join(" ");

const DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4",
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];

let gapiInited = false;

/* ---------------- 共用：載入 & 初始化 gapi ---------------- */

function loadGapiScript() {
  return new Promise((resolve, reject) => {
    if (window.gapi) return resolve();

    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => {
      console.error("[GoogleService] 無法載入 gapi script:", err);
      reject(err);
    };
    document.body.appendChild(script);
  });
}

async function ensureGapiClient() {
  if (gapiInited) return;

  if (!CLIENT_ID || !API_KEY) {
    console.error("[GoogleService] 缺少 CLIENT_ID 或 API_KEY，請確認 .env / Vercel 環境變數");
    throw new Error("Missing CLIENT_ID or API_KEY");
  }

  console.log("[GoogleService] init with:", {
    CLIENT_ID,
    API_KEY: API_KEY ? API_KEY.slice(0, 8) + "...(hidden)" : null,
    SPREADSHEET_ID,
    DRIVE_ROOT_FOLDER_ID,
  });

  await loadGapiScript();

  // 先載入 client:auth2 模組
  await new Promise((resolve, reject) => {
    window.gapi.load("client:auth2", {
      callback: resolve,
      onerror: (err) => {
        console.error("[GoogleService] gapi.load(client:auth2) 失敗:", err);
        reject(err);
      },
    });
  });

  try {
    await window.gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    });
    gapiInited = true;
    console.log("[GoogleService] gapi.client.init OK");
  } catch (err) {
    console.error("[GoogleService] gapi.client.init 發生錯誤:", err);
    if (err && err.error) {
      console.error("[GoogleService] error.details =", err.error);
    }
    throw err;
  }
}

/* ---------------- Auth: initClient / login / logout / getUser ---------------- */

async function initClient() {
  try {
    await ensureGapiClient();
    const auth = window.gapi.auth2.getAuthInstance();
    const signedIn = auth.isSignedIn.get();
    console.log("[GoogleService] initClient, signedIn =", signedIn);
    return signedIn;
  } catch (err) {
    console.warn("[GoogleService] initClient 失敗，將以 demo/mock 模式運作:", err);
    return false;
  }
}

async function login() {
  await ensureGapiClient();
  const auth = window.gapi.auth2.getAuthInstance();
  const user = await auth.signIn();
  const profile = user.getBasicProfile();
  return {
    name: profile.getName(),
    email: profile.getEmail(),
    photo: profile.getImageUrl(),
  };
}

async function logout() {
  if (!window.gapi?.auth2) return;
  const auth = window.gapi.auth2.getAuthInstance();
  if (auth) {
    await auth.signOut();
  }
}

function getUser() {
  const auth = window.gapi?.auth2?.getAuthInstance?.();
  if (!auth || !auth.isSignedIn.get()) return null;
  const profile = auth.currentUser.get().getBasicProfile();
  return {
    name: profile.getName(),
    email: profile.getEmail(),
    photo: profile.getImageUrl(),
  };
}

/* ---------------- Sheets：syncToSheet / fetchSheetData ---------------- */

async function syncToSheet(sheetName, dataArray) {
  await ensureGapiClient();

  const values = Array.isArray(dataArray) ? dataArray : [];
  if (values.length === 0) {
    await window.gapi.client.sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
    });
    return { success: true };
  }

  const allKeys = Array.from(
    new Set(values.flatMap((item) => Object.keys(item || {})))
  );

  const rows = [
    allKeys,
    ...values.map((item) =>
      allKeys.map((key) => {
        const v = item?.[key];
        if (v === null || v === undefined) return "";
        if (Array.isArray(v) || typeof v === "object") {
          try {
            return JSON.stringify(v);
          } catch {
            return String(v);
          }
        }
        return String(v);
      })
    ),
  ];

  await window.gapi.client.sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
  });

  const res = await window.gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    resource: { values: rows },
  });

  return res.result;
}

async function fetchSheetData(sheetName) {
  await ensureGapiClient();
  const res = await window.gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:Z`,
  });
  return res.result.values || [];
}

/* ---------------- Calendar：addToCalendar / fetchCalendarEvents ---------------- */

async function addToCalendar(event) {
  await ensureGapiClient();

  const { title, date, time } = event;
  if (!title || !date) {
    throw new Error("Event title 和 date 為必填");
  }

  const startDate = new Date(`${date} ${time || "10:00"}`);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const resource = {
    summary: title,
    description: event.type
      ? `類型：${event.type}${event.relatedId ? `\n關聯ID：${event.relatedId}` : ""}`
      : "",
    start: {
      dateTime: startDate.toISOString(),
      timeZone: "Asia/Taipei",
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: "Asia/Taipei",
    },
  };

  const res = await window.gapi.client.calendar.events.insert({
    calendarId: "primary",
    resource,
  });

  return res.result;
}

async function fetchCalendarEvents() {
  await ensureGapiClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  const res = await window.gapi.client.calendar.events.list({
    calendarId: "primary",
    timeMin: startOfMonth.toISOString(),
    timeMax: endOfMonth.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 2500,
  });

  return res.result.items || [];
}

/* ---------------- Drive：createDriveFolder / uploadToDrive ---------------- */

async function createDriveFolder(clientName) {
  await ensureGapiClient();

  const folderName = clientName || "未命名客戶";

  const metadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
    parents: DRIVE_ROOT_FOLDER_ID ? [DRIVE_ROOT_FOLDER_ID] : [],
  };

  const res = await window.gapi.client.drive.files.create({
    resource: metadata,
    fields: "id, name, webViewLink",
  });

  return res.result.webViewLink;
}

async function uploadToDrive(file, folderName) {
  await ensureGapiClient();

  // 如果目前前端傳的不是 File 物件，先當 mock 處理
  if (!file || typeof file.arrayBuffer !== "function") {
    console.log(
      "[GoogleService.uploadToDrive] Mock upload:",
      file,
      "folder:",
      folderName
    );
    return {
      success: true,
      url: `https://drive.google.com/file/d/mock-${Date.now()}`,
    };
  }

  let folderId = null;

  if (DRIVE_ROOT_FOLDER_ID) {
    const q = [
      "mimeType='application/vnd.google-apps.folder'",
      `'${DRIVE_ROOT_FOLDER_ID}' in parents`,
      `name='${folderName}'`,
      "trashed=false",
    ].join(" and ");

    const searchRes = await window.gapi.client.drive.files.list({
      q,
      fields: "files(id, name)",
      spaces: "drive",
    });

    if (searchRes.result.files && searchRes.result.files.length > 0) {
      folderId = searchRes.result.files[0].id;
    } else {
      const folderMeta = {
        name: folderName || "未命名專案",
        mimeType: "application/vnd.google-apps.folder",
        parents: [DRIVE_ROOT_FOLDER_ID],
      };
      const newFolderRes = await window.gapi.client.drive.files.create({
        resource: folderMeta,
        fields: "id, name",
      });
      folderId = newFolderRes.result.id;
    }
  }

  const metadata = {
    name: file.name,
    parents: folderId
      ? [folderId]
      : DRIVE_ROOT_FOLDER_ID
      ? [DRIVE_ROOT_FOLDER_ID]
      : [],
  };

  const boundary = "-------314159265358979323846";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const data = await file.arrayBuffer();
  const base64Data = btoa(
    new Uint8Array(data).reduce((str, b) => str + String.fromCharCode(b), "")
  );

  const multipartBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${file.type || "application/octet-stream"}\r\n` +
    "Content-Transfer-Encoding: base64\r\n\r\n" +
    base64Data +
    closeDelimiter;

  const res = await window.gapi.client.request({
    path: "/upload/drive/v3/files",
    method: "POST",
    params: { uploadType: "multipart" },
    headers: {
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });

  return res.result;
}

/* ---------------- 對外匯出物件（給 App.jsx 使用） ---------------- */

export const GoogleService = {
  initClient,
  login,
  logout,
  getUser,

  fetchSheetData,
  syncToSheet,

  fetchCalendarEvents,
  addToCalendar,

  uploadToDrive,
  createDriveFolder,
};
