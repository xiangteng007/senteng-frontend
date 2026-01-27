/**
 * useLocalPersist Hook
 * 自動將狀態持久化到 localStorage
 * 支援計算輸入值在頁面刷新後保留
 */
import { useState, useEffect, useCallback } from 'react';

const STORAGE_PREFIX = 'materialCalc_';

/**
 * @param {string} key - localStorage 鍵名
 * @param {any} initialValue - 初始值
 * @returns {[any, Function, Function]} - [value, setValue, clearValue]
 */
export const useLocalPersist = (key, initialValue) => {
    const storageKey = STORAGE_PREFIX + key;

    const [value, setValue] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(value));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    }, [storageKey, value]);

    const clearValue = useCallback(() => {
        localStorage.removeItem(storageKey);
        setValue(initialValue);
    }, [storageKey, initialValue]);

    return [value, setValue, clearValue];
};

/**
 * 獲取所有持久化的計算數據
 */
export const getAllPersistedData = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) {
            try {
                data[key.replace(STORAGE_PREFIX, '')] = JSON.parse(localStorage.getItem(key));
            } catch {
                // ignore
            }
        }
    }
    return data;
};

/**
 * 清除所有持久化的計算數據
 */
export const clearAllPersistedData = () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
};

export default useLocalPersist;
