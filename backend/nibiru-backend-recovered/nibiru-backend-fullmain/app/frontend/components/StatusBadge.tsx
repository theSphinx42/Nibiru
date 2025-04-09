import React from 'react';
import { KeyStatus } from '../types/invocation';

interface StatusBadgeProps {
  status: KeyStatus;
}

const statusColors = {
  [KeyStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [KeyStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [KeyStatus.EXPIRED]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  [KeyStatus.REVOKED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  [KeyStatus.SUSPENDED]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {status}
    </span>
  );
}; 