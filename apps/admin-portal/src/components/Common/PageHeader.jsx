'use client';

import React from 'react';
import Button from '@/components/ui/Button';

export default function PageHeader({
  icon: Icon = null,
  title,
  description,
  actionText,
  actionIcon: ActionIcon = null,
  onAction,
  actions,
  children,
  className = '',
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3.5 ${className}`}>
      <div>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-[#1E40AF]" />}
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        </div>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>

      <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end shrink-0">
        {actions}
        {actionText && onAction && (
          <Button
            variant="primary"
            size="sm"
            icon={ActionIcon}
            onClick={onAction}
            className="w-full sm:w-auto"
          >
            {actionText}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
