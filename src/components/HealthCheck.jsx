import React, { useMemo, useState } from "react";
import GoogleService from "../services/googleService";

function pretty(obj) {
  try { return JSON.stringify(obj, null, 2); } catch { return String(obj); }
}

export default function HealthCheck() {
  const env = useMemo(() => ({
    spreadsheetId: import.meta.env.VITE_GOOGLE_SPREADSHEET_ID,
    driveRootFolderId: import.meta.env.VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID,
  }), []);

  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState("");
  const [sheetName, setSheetName] = useState("clients");
  const [allowWrite, setAllowWrite] = useState(false);

  const appendLog = (line) => setLog((p) => (p ? `${p}\n${line}` : line));

  async function sheetsRead() {
    if (!env.spreadsheetId) throw new Error("Missing env: VITE_GOOGLE_SPREADSHEET_ID");
    appendLog("== Sheets: READ START ==");

    const range = `${sheetName}!A1:C5`;
    const res = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: env.spreadsheetId,
      range,
    });

    appendLog(`Sheets READ OK: ${range}`);
    appendLog(pretty(res?.result));
    appendLog("== Sheets: READ DONE ==");
  }

  async function sheetsAppendTestRow() {
    if (!env.spreadsheetId) throw new Error("Missing env: VITE_GOOGLE_SPREADSHEET_ID");
    if (!allowWrite) throw new Error("Write is disabled. 勾選「允許寫入」後再執行。");

    appendLog("== Sheets: APPEND START ==");
    const row = ["HealthCheck", "OK", new Date().toISOString()];

    const res = await window.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: env.spreadsheetId,
      range: `${sheetName}!A:A`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      resource: { values: [row] },
    });

    appendLog("Sheets APPEND OK (1 row inserted)");
    appendLog(pretty(res?.result));
    appendLog("== Sheets: APPEND DONE ==");
  }

  async function driveCreateFolder() {
    appendLog("== Drive: CREATE FOLDER START ==");
    const name = `HealthCheck_${new Date().toISOString().replace(/[:.]/g, "-")}`;
    const res = await GoogleService.createDriveFolder(name);
    appendLog(`Drive folder created: ${res?.name || name}`);
    appendLog(pretty(res));
    appendLog("== Drive: CREATE FOLDER DONE ==");
  }

  async function calendarListAndInsert() {
    appendLog("== Calendar: LIST START ==");
    const events = await GoogleService.fetchCalendarEvents();
    appendLog(`Calendar list OK (count=${events.length})`);
    appendLog(pretty(events.slice(0, 5)));
    appendLog("== Calendar: LIST DONE ==");

    if (!allowWrite) {
      appendLog("Calendar INSERT skipped (Write disabled).");
      return;
    }

    appendLog("== Calendar: INSERT START ==");
    const start = new Date(Date.now() + 5 * 60 * 1000);
    const end = new Date(Date.now() + 35 * 60 * 1000);

    const created = await GoogleService.addToCalendar({
      summary: "Senteng HealthCheck",
      description: "Auto-created by Senteng Design System health check.",
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
    });

    appendLog("Calendar INSERT OK");
    appendLog(pretty(created));
    appendLog("== Calendar: INSERT DONE ==");
  }

  async function runAll() {
    setBusy(true);
    setLog("");
    try {
      appendLog(`Origin: ${window.location.origin}`);
      appendLog(`SpreadsheetId: ${env.spreadsheetId ? "SET" : "MISSING"}`);
      appendLog(`DriveRootFolderId: ${env.driveRootFolderId ? "SET" : "MISSING"}`);
      appendLog("");

      await sheetsRead();
      appendLog("");
      if (allowWrite) {
        await sheetsAppendTestRow();
        appendLog("");
      } else {
        appendLog("Sheets APPEND skipped (Write disabled).");
        appendLog("");
      }

      await driveCreateFolder();
      appendLog("");
      await calendarListAndInsert();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6 border border-gray-200 rounded-xl bg-white shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold text-gray-800">HealthCheck</div>
          <div className="text-xs text-gray-500">驗證 Sheets / Drive / Calendar 讀寫閉環（寫入需手動勾選）</div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <span>Sheet</span>
            <input
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-40"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="clients / projects / vendors…"
            />
          </label>

          <label className="flex items-center gap-2 text-xs text-gray-700 select-none">
            <input type="checkbox" checked={allowWrite} onChange={(e) => setAllowWrite(e.target.checked)} />
            允許寫入（會新增資料列/事件）
          </label>

          <button
            className="text-xs px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-60"
            disabled={busy}
            onClick={runAll}
          >
            {busy ? "執行中…" : "一鍵執行"}
          </button>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex gap-2 flex-wrap mb-3">
          <button className="text-xs px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-60" disabled={busy}
            onClick={async () => { setBusy(true); try { await sheetsRead(); } finally { setBusy(false); } }}>
            Sheets 讀取
          </button>

          <button className="text-xs px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-60" disabled={busy}
            onClick={async () => { setBusy(true); try { await sheetsAppendTestRow(); } finally { setBusy(false); } }}>
            Sheets 寫入（Append）
          </button>

          <button className="text-xs px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-60" disabled={busy}
            onClick={async () => { setBusy(true); try { await driveCreateFolder(); } finally { setBusy(false); } }}>
            Drive 建資料夾
          </button>

          <button className="text-xs px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-60" disabled={busy}
            onClick={async () => { setBusy(true); try { await calendarListAndInsert(); } finally { setBusy(false); } }}>
            Calendar 讀取/寫入
          </button>
        </div>

        <pre className="text-xs whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[120px]">
          {log || "（尚未執行）"}
        </pre>
      </div>
    </section>
  );
}
