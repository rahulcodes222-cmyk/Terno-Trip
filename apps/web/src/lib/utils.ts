import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const d = new Date(date);
  if (format === 'long') {
    return d.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function truncateText(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    Confirmed: 'bg-green-100 text-green-800 border-green-200',
    Pending:   'bg-orange-100 text-orange-800 border-orange-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
    Refunded:  'bg-gray-100 text-gray-700 border-gray-200',
    Failed:    'bg-red-100 text-red-800 border-red-200',
    Paid:      'bg-green-100 text-green-800 border-green-200',
    Success:   'bg-green-100 text-green-800 border-green-200',
  };
  return map[status] ?? 'bg-gray-100 text-gray-700 border-gray-200';
}

export function getDifficultyColor(difficulty: string): string {
  const map: Record<string, string> = {
    Easy: 'bg-green-100 text-green-700',
    Moderate: 'bg-yellow-100 text-yellow-700',
    Challenging: 'bg-red-100 text-red-700',
  };
  return map[difficulty] ?? 'bg-gray-100 text-gray-700';
}

export function getCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    Adventure: '🏔️',
    Beach: '🏖️',
    Cultural: '🏛️',
    Wildlife: '🦁',
    City: '🏙️',
    Mountain: '⛰️',
    Budget: '💰',
  };
  return map[category] ?? '✈️';
}
