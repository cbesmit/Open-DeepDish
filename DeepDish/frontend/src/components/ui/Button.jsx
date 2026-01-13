import React from 'react';
import { cn } from '../../utils/cn';
import Spinner from './Spinner';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  icon: Icon, 
  className, 
  disabled,
  ...props 
}) {
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm border border-transparent',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800 shadow-sm border border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm border border-transparent',
    outline: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 active:bg-gray-100 shadow-sm border',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    link: 'text-brand-600 hover:underline p-0 h-auto'
  };

  const sizes = {
    sm: 'text-sm px-3 py-2 min-h-[32px]',
    md: 'text-base px-4 py-3 min-h-[44px]', // Mobile friendly min-height
    lg: 'text-lg px-6 py-4 min-h-[56px]',
    icon: 'p-3 min-h-[44px] min-w-[44px]' // For icon-only buttons
  };

  return (
    <button
      className={cn(
        'rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="mr-1" />}
      {!isLoading && Icon && <Icon className={cn("h-5 w-5", children ? "mr-1" : "")} />}
      {children}
    </button>
  );
}
