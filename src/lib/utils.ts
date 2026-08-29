import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatYear(year?: number | null): string {
  if (!year) return "Unknown";
  return year.toString();
}
