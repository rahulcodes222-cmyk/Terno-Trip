import React from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 text-5xl text-gray-300">{icon}</div>}
      <h3 className="mb-2 text-lg font-semibold text-gray-700">{title}</h3>
      {message && <p className="mb-6 max-w-sm text-sm text-gray-500">{message}</p>}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
