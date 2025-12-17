
import React from 'react';
import { CheckCircle2, AlertCircle, Info, X, ExternalLink } from 'lucide-react';

export const ToastContainer = ({ toasts, removeToast }) => (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-3 max-w-md">
        {toasts.map(toast => (
            <div
                key={toast.id}
                className="bg-white/95 backdrop-blur-lg border border-gray-200 px-4 py-3 rounded-2xl shadow-xl flex items-start gap-3 animate-slide-up min-w-[320px] transition-all hover:shadow-2xl"
            >
                <div className={`p-1.5 rounded-full flex-shrink-0 mt-0.5 ${toast.type === 'success' ? 'bg-green-100 text-green-600' :
                        toast.type === 'error' ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                    }`}>
                    {toast.type === 'success' ? <CheckCircle2 size={18} /> :
                        toast.type === 'error' ? <AlertCircle size={18} /> :
                            <Info size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 break-words">{toast.message}</div>
                    {toast.action && (
                        <button
                            onClick={() => {
                                toast.action.onClick();
                                removeToast(toast.id);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1.5 flex items-center gap-1 hover:underline"
                        >
                            {toast.action.label}
                            <ExternalLink size={12} />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => removeToast(toast.id)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 flex-shrink-0 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        ))}
    </div>
);
