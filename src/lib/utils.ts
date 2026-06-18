import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProxiedUrl(url: string) {
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}
