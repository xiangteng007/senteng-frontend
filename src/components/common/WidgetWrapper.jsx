import React from 'react';
import { Maximize2, Minimize2, GripHorizontal } from 'lucide-react';

export const WidgetWrapper = ({ widget, onResize, onDragStart, onDragEnter, onDragEnd, children }) => {
    const { id, size, title } = widget;

    const getGridSpan = (s) => {
        switch (s) {
            case 'S': return 'col-span-1 row-span-1';
            case 'M': return 'col-span-1 md:col-span-2 row-span-1';
            case 'L': return 'col-span-1 md:col-span-2 lg:col-span-4 row-span-2';
            default: return 'col-span-1';
        }
    };

    const nextSize = (current) => {
        if (current === 'S') return 'M';
        if (current === 'M') return 'L';
        return 'S';
    };

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragEnter={onDragEnter}
            onDragEnd={onDragEnd}
            className={`
        group relative bg-white rounded-3xl shadow-sm border border-gray-100 
        transition-all duration-300 hover:shadow-lg hover:-translate-y-1
        ${getGridSpan(size)} flex flex-col overflow-hidden animate-fade-in
      `}
        >
            <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700">
                    <GripHorizontal size={16} />
                    <h3 className="font-bold text-morandi-text-primary text-sm select-none">{title}</h3>
                </div>
                <button
                    onClick={() => onResize(id, nextSize(size))}
                    className="p-1.5 text-gray-400 hover:text-morandi-blue-600 hover:bg-morandi-blue-100 rounded-full transition-colors"
                >
                    {size === 'L' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
            </div>
            <div className="flex-1 p-4 overflow-hidden flex flex-col relative">
                {children}
            </div>
        </div>
    );
};
