import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0621-\u064A\s-]/g, '') // Keep alphanumeric, Arabic, spaces and hyphens
    .replace(/[\s_-]+/g, '-')              // Replace spaces and underscores with -
    .replace(/^-+|-+$/g, '');              // Remove leading/trailing hyphens
}
