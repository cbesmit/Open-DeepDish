import React from 'react';
import { cn } from '../../utils/cn';

export default function Badge({ children, variant = 'default', className, ...props }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-brand-100 text-brand-800',
    success: 'bg-secondary-100 text-secondary-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    outline: 'bg-transparent border border-gray-200 text-gray-600'
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
