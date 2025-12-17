
import React from 'react';

export const LoadingSkeleton = ({ rows = 3 }) => (
    <div className="animate-pulse space-y-4">
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex gap-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        ))}
    </div>
);

export const ProgressBar = ({ value }) => (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className="bg-morandi-text-accent h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${value}%` }} />
    </div>
);

export const SectionTitle = ({ title, action }) => (
    <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-morandi-text-primary flex items-center gap-2">
            <span className="w-1.5 h-6 bg-morandi-text-accent rounded-full inline-block"></span>
            {title}
        </h2>
        {action}
    </div>
);
