import React from 'react';
import { cn } from '../../utils/cn';

export function Card({ className, children, ...props }) {
  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("px-6 py-4 border-b border-gray-50", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, as: Tag = 'h3', ...props }) {
  return (
    <Tag className={cn("text-lg font-semibold text-gray-900 leading-tight", className)} {...props}>
      {children}
    </Tag>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn("px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center", className)} {...props}>
      {children}
    </div>
  );
}
