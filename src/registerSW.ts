/**
 * registerSW.ts
 *
 * Service Worker 註冊與更新通知
 */

import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
    onNeedRefresh() {
        // 提示用戶有新版本可用
        if (confirm('SENTENG ERP 有新版本可用，是否立即更新？')) {
            updateSW(true);
        }
    },
    onOfflineReady() {
        console.log('[PWA] App ready for offline use');
    },
    onRegistered(registration) {
        console.log('[PWA] Service Worker registered:', registration);
    },
    onRegisterError(error) {
        console.error('[PWA] Service Worker registration failed:', error);
    },
});

export { updateSW };
