import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes conditionally and safely.
 * It uses `clsx` for conditional class joining and `tailwind-merge` to 
 * intelligently resolve any Tailwind class conflicts (e.g., px-4 vs px-6).
 * * @param inputs - Array of class values (strings, objects, arrays, etc.)
 * @returns A strictly merged string of Tailwind classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}