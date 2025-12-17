import React from 'react';

export const Card = ({ children, className = "", noPadding = false, onClick }) => (
    <div
        onClick={onClick}
        className={`
      bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-morandi-blue-100 
      transition-all duration-300 hover:shadow-glass hover:border-morandi-blue-200
      ${noPadding ? '' : 'p-6'} 
      ${className} 
      ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}
    `}
    >
        {children}
    </div>
);
