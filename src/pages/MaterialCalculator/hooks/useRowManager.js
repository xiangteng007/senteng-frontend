/**
 * useRowManager Hook
 * 統一管理多列資料的 CRUD 操作
 * 消除 StructureCalculator 中 10+ 組重複的 add/remove/update/clear 函數
 */
import { useState, useCallback } from 'react';

/**
 * @param {Object} initialRow - 新增列時的初始值
 * @returns {Object} - { rows, addRow, removeRow, updateRow, clearRows, setRows }
 */
export const useRowManager = (initialRow = {}) => {
  const [rows, setRows] = useState([{ id: 1, ...initialRow }]);

  const addRow = useCallback(() => {
    setRows(prev => [...prev, { id: Date.now(), ...initialRow }]);
  }, [initialRow]);

  const removeRow = useCallback(id => {
    setRows(prev => {
      if (prev.length === 1) return prev; // 至少保留一列
      return prev.filter(r => r.id !== id);
    });
  }, []);

  const updateRow = useCallback((id, field, value) => {
    setRows(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  const clearRows = useCallback(() => {
    setRows([{ id: 1, ...initialRow }]);
  }, [initialRow]);

  return { rows, addRow, removeRow, updateRow, clearRows, setRows };
};

export default useRowManager;
