import React from 'react';
import { cn } from '../../utils/cn';

export default function SegmentedControl({ options, value, onChange, label, className }) {
    return (
        <div className={cn("space-y-1.5", className)}>
            {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
            <div className="flex bg-gray-100 p-1 rounded-xl">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50",
                            value === opt.value
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
