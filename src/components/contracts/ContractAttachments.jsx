/**
 * 合約附件管理組件 (ContractAttachments.jsx)
 * 支援 PDF 上傳、預覽、下載、刪除
 */

import React, { useState, useRef, useCallback } from 'react';
import {
    Upload, FileText, Download, Trash2, Eye, X, Plus,
    File, AlertCircle, CheckCircle, Loader2
} from 'lucide-react';
import { storageApi } from '../../services/api';

// ============================================
// 檔案大小格式化
// ============================================
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ============================================
// PDF 預覽 Modal
// ============================================
const PdfPreviewModal = ({ isOpen, onClose, pdfUrl, fileName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <FileText size={20} className="text-red-500" />
                        <span className="font-medium">{fileName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={pdfUrl}
                            download={fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                            title="下載"
                        >
                            <Download size={18} />
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-4 bg-gray-100">
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full rounded-lg border-0"
                        title={fileName}
                    />
                </div>
            </div>
        </div>
    );
};

// ============================================
// 上傳區域
// ============================================
const UploadDropzone = ({ onFilesSelected, uploading, disabled }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;

        const files = Array.from(e.dataTransfer.files).filter(
            file => file.type === 'application/pdf'
        );
        if (files.length > 0) {
            onFilesSelected(files);
        }
    }, [disabled, onFilesSelected]);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            onFilesSelected(files);
        }
        e.target.value = '';
    };

    return (
        <div
            onClick={() => !disabled && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                ${isDragging
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled}
            />
            {uploading ? (
                <div className="flex flex-col items-center gap-2">
                    <Loader2 size={32} className="text-orange-500 animate-spin" />
                    <p className="text-sm text-gray-600">上傳中...</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-orange-100 rounded-full">
                        <Upload size={24} className="text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-600">
                        拖放 PDF 檔案到這裡，或 <span className="text-orange-600 font-medium">點擊上傳</span>
                    </p>
                    <p className="text-xs text-gray-400">支援 PDF 格式，最大 10MB</p>
                </div>
            )}
        </div>
    );
};

// ============================================
// 附件列表項目
// ============================================
const AttachmentItem = ({ attachment, onPreview, onDelete, deleting }) => {
    const isDeleting = deleting === attachment.id;

    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
            <div className="p-2 bg-red-100 rounded-lg">
                <FileText size={20} className="text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800 truncate">
                    {attachment.fileName}
                </p>
                <p className="text-xs text-gray-400">
                    {formatFileSize(attachment.size)} · {new Date(attachment.uploadedAt).toLocaleDateString('zh-TW')}
                </p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onPreview(attachment)}
                    className="p-1.5 hover:bg-white rounded-lg text-gray-500 hover:text-blue-600"
                    title="預覽"
                >
                    <Eye size={16} />
                </button>
                <a
                    href={attachment.url}
                    download={attachment.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-white rounded-lg text-gray-500 hover:text-green-600"
                    title="下載"
                >
                    <Download size={16} />
                </a>
                <button
                    onClick={() => onDelete(attachment.id)}
                    disabled={isDeleting}
                    className="p-1.5 hover:bg-white rounded-lg text-gray-500 hover:text-red-600 disabled:opacity-50"
                    title="刪除"
                >
                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
            </div>
        </div>
    );
};

// ============================================
// 主組件
// ============================================
const ContractAttachments = ({ contractId, addToast }) => {
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [previewPdf, setPreviewPdf] = useState(null);

    // 載入附件（從 localStorage 暫存）
    React.useEffect(() => {
        const stored = localStorage.getItem(`contract_attachments_${contractId}`);
        if (stored) {
            try {
                setAttachments(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse attachments:', e);
            }
        }
    }, [contractId]);

    // 儲存附件到 localStorage
    const saveAttachments = (newAttachments) => {
        setAttachments(newAttachments);
        localStorage.setItem(
            `contract_attachments_${contractId}`,
            JSON.stringify(newAttachments)
        );
    };

    // 上傳檔案
    const handleUpload = async (files) => {
        setUploading(true);

        for (const file of files) {
            // 驗證檔案
            if (file.type !== 'application/pdf') {
                addToast?.('只能上傳 PDF 檔案', 'error');
                continue;
            }
            if (file.size > 10 * 1024 * 1024) {
                addToast?.('檔案大小不能超過 10MB', 'error');
                continue;
            }

            try {
                // 上傳到 Cloud Storage
                const destination = `contracts/${contractId}`;
                const result = await storageApi.upload(file, destination);

                // 新增到附件列表
                const newAttachment = {
                    id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    fileName: file.name,
                    size: file.size,
                    url: result.publicUrl || result.url,
                    storagePath: result.path || result.fileName,
                    uploadedAt: new Date().toISOString(),
                };

                saveAttachments([...attachments, newAttachment]);
                addToast?.(`${file.name} 上傳成功`, 'success');
            } catch (error) {
                console.error('Upload failed:', error);
                addToast?.(`${file.name} 上傳失敗: ${error.message}`, 'error');
            }
        }

        setUploading(false);
    };

    // 刪除附件
    const handleDelete = async (attachmentId) => {
        const attachment = attachments.find(a => a.id === attachmentId);
        if (!attachment) return;

        if (!window.confirm(`確定要刪除「${attachment.fileName}」嗎？`)) return;

        setDeleting(attachmentId);

        try {
            // 從 Cloud Storage 刪除
            if (attachment.storagePath) {
                await storageApi.delete(attachment.storagePath);
            }

            // 從列表移除
            const newAttachments = attachments.filter(a => a.id !== attachmentId);
            saveAttachments(newAttachments);
            addToast?.('附件已刪除', 'success');
        } catch (error) {
            console.error('Delete failed:', error);
            addToast?.('刪除失敗: ' + error.message, 'error');
        } finally {
            setDeleting(null);
        }
    };

    // 預覽 PDF
    const handlePreview = (attachment) => {
        setPreviewPdf(attachment);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FileText size={18} className="text-orange-600" />
                    合約附件
                </h3>
                <span className="text-sm text-gray-400">
                    {attachments.length} 個檔案
                </span>
            </div>

            {/* 上傳區域 */}
            <UploadDropzone
                onFilesSelected={handleUpload}
                uploading={uploading}
                disabled={uploading}
            />

            {/* 附件列表 */}
            {attachments.length > 0 && (
                <div className="space-y-2">
                    {attachments.map(attachment => (
                        <AttachmentItem
                            key={attachment.id}
                            attachment={attachment}
                            onPreview={handlePreview}
                            onDelete={handleDelete}
                            deleting={deleting}
                        />
                    ))}
                </div>
            )}

            {attachments.length === 0 && !uploading && (
                <div className="text-center py-6 text-gray-400">
                    <File size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">尚無附件</p>
                </div>
            )}

            {/* PDF 預覽 Modal */}
            <PdfPreviewModal
                isOpen={!!previewPdf}
                onClose={() => setPreviewPdf(null)}
                pdfUrl={previewPdf?.url}
                fileName={previewPdf?.fileName}
            />
        </div>
    );
};

export default ContractAttachments;
