import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function isLowStock(stock: number, minStock: number): boolean {
  return stock <= minStock;
}

export function getStockStatus(stock: number, minStock: number): 'low' | 'ok' | 'good' {
  if (stock <= minStock) return 'low';
  if (stock <= minStock * 1.5) return 'ok';
  return 'good';
}
