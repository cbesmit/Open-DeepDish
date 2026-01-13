import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Textarea = forwardRef(({ label, error, className, id, rows = 4, ...props }, ref) => {
  const inputId = id || props.name || Math.random().toString(36).substr(2, 9);
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        ref={ref}
        rows={rows}
        className={cn(
          "w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 py-3 text-base placeholder-gray-400 transition-colors resize-y",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
