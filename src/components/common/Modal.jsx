
import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, onConfirm, confirmText = "確認", confirmDisabled = false }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up border border-white/50">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-morandi-text-primary">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-full p-1"><X size={20} /></button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {children}
                </div>
                <div className="px-6 py-4 bg-gray-50/50 flex justify-end gap-3 backdrop-blur-sm">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-200 transition-colors font-medium">取消</button>
                    <button
                        onClick={onConfirm}
                        disabled={confirmDisabled}
                        className="px-4 py-2 rounded-xl text-sm bg-morandi-text-accent text-white hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-morandi-text-accent"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
