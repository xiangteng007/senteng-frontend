/**
 * 合約編輯器組件 (ContractEditor.jsx)
 * 編輯合約基本資訊、付款條件、保固設定
 */

import React, { useState, useEffect } from 'react';
import {
    Save, X, FileSignature, Calendar, DollarSign,
    Shield, Percent, Clock, Building2
} from 'lucide-react';
import { InputField } from '../common/InputField';
import ContractService, {
    CONTRACT_TYPES,
    CONTRACT_TYPE_LABELS,
    PAYMENT_TERM_TEMPLATES,
} from '../../services/ContractService';

// ============================================
// 主組件
// ============================================
const ContractEditor = ({ contract, onSave, onCancel, addToast }) => {
    const [formData, setFormData] = useState({
        contractNo: '',
        type: CONTRACT_TYPES.LUMP_SUM,
        retentionRate: 5,
        warrantyMonths: 12,
        startDate: '',
        endDate: '',
        notes: '',
        paymentTemplateId: 'standard-3',
    });
    const [saving, setSaving] = useState(false);

    // 初始化表單
    useEffect(() => {
        if (contract) {
            setFormData({
                contractNo: contract.contractNo || '',
                type: contract.type || CONTRACT_TYPES.LUMP_SUM,
                retentionRate: contract.retentionRate || 5,
                warrantyMonths: contract.warrantyMonths || 12,
                startDate: contract.startDate?.split('T')[0] || '',
                endDate: contract.endDate?.split('T')[0] || '',
                notes: contract.notes || '',
                paymentTemplateId: 'standard-3',
            });
        }
    }, [contract]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.contractNo.trim()) {
            addToast?.('請輸入合約編號', 'error');
            return;
        }

        setSaving(true);
        try {
            const updateData = {
                contractNo: formData.contractNo,
                contractType: formData.type,
                retentionRate: parseFloat(formData.retentionRate) || 5,
                warrantyMonths: parseInt(formData.warrantyMonths) || 12,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
                notes: formData.notes,
            };

            await ContractService.updateContract(contract.id, updateData);
            addToast?.('合約已更新', 'success');
            onSave?.();
        } catch (error) {
            console.error('Save failed:', error);
            addToast?.('更新失敗: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* 標題 */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <FileSignature size={20} className="text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">編輯合約</h2>
                        <p className="text-sm text-gray-500">{contract?.projectName}</p>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                >
                    <X size={20} />
                </button>
            </div>

            {/* 表單 */}
            <div className="p-6 space-y-6">
                {/* 基本資訊 */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Building2 size={16} />
                        基本資訊
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="合約編號"
                            value={formData.contractNo}
                            onChange={(e) => handleChange('contractNo', e.target.value)}
                            placeholder="CTR2026-0001"
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                合約類型
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                {Object.entries(CONTRACT_TYPE_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 日期設定 */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Calendar size={16} />
                        工期設定
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="預計開工日"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleChange('startDate', e.target.value)}
                        />
                        <InputField
                            label="預計完工日"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => handleChange('endDate', e.target.value)}
                        />
                    </div>
                </div>

                {/* 財務設定 */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <DollarSign size={16} />
                        財務設定
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                保留款比例 (%)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.retentionRate}
                                    onChange={(e) => handleChange('retentionRate', e.target.value)}
                                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    min="0"
                                    max="20"
                                />
                                <Percent size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                付款條件
                            </label>
                            <select
                                value={formData.paymentTemplateId}
                                onChange={(e) => handleChange('paymentTemplateId', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                {PAYMENT_TERM_TEMPLATES.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 保固設定 */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Shield size={16} />
                        保固設定
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                保固期 (月)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.warrantyMonths}
                                    onChange={(e) => handleChange('warrantyMonths', e.target.value)}
                                    className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    min="0"
                                    max="60"
                                />
                                <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 備註 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        備註
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="合約相關備註..."
                    />
                </div>
            </div>

            {/* 按鈕 */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button
                    onClick={onCancel}
                    className="px-4 py-2.5 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                >
                    取消
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                    <Save size={18} />
                    {saving ? '儲存中...' : '儲存變更'}
                </button>
            </div>
        </div>
    );
};

export default ContractEditor;
