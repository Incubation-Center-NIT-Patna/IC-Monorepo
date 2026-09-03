'use client';

import React from 'react';

export default function Card({
  children,
  className = '',
  padding = 'p-5',
  border = 'border-[#E2E8F0]',
  bg = 'bg-white',
}) {
  return (
    <div
      className={`rounded-md border ${border} ${bg} ${padding} transition-all ${className}`}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-3 ${className}`}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, className = '', icon: Icon = null }) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-[#1E40AF]" />}
      <h3 className={`text-sm font-bold text-slate-900 ${className}`}>{children}</h3>
    </div>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={className}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-end gap-2 pt-3 mt-3 border-t border-[#E2E8F0] ${className}`}>
      {children}
    </div>
  );
};
