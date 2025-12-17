import React from 'react';

export const Badge = ({ children, color = "gray", className = "" }) => {
    const colors = {
        gray: "bg-morandi-base text-gray-700",
        blue: "bg-morandi-blue-100 text-morandi-blue-600",
        green: "bg-morandi-green-100 text-morandi-green-600",
        orange: "bg-morandi-orange-100 text-morandi-orange-600",
        purple: "bg-purple-50 text-purple-700",
        red: "bg-red-50 text-red-700"
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[color] || colors.gray} ${className}`}>{children}</span>;
};
