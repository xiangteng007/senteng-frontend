import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingButton = ({
    children,
    loading = false,
    disabled = false,
    onClick,
    className = '',
    variant = 'primary',
    type = 'button',
    ...props
}) => {
    const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: 'bg-morandi-green-500 text-white hover:bg-morandi-green-600 active:scale-95',
        secondary: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95',
        danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-95',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 active:scale-95'
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            {...props}
        >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {children}
        </button>
    );
};
