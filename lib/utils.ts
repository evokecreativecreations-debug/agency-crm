import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines conditional class names and safely merges conflicting Tailwind
 * classes (e.g. "p-2" and "p-4" — the later one wins instead of both
 * being applied). Every UI component uses this so consumers can override
 * styles predictably via a `className` prop.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
