import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function generateRandomKey(game: string): string {
  let prefix = "";
  
  if (game === "PUBG MOBILE") {
    prefix = "PBGM";
  } else if (game === "LAST ISLAND OF SURVIVAL") {
    prefix = "LIOS";
  } else if (game === "STANDOFF2") {
    prefix = "STDF";
  }
  
  // Generate random alphanumeric strings
  const segment1 = Math.random().toString(36).substring(2, 7).toUpperCase();
  const segment2 = Math.random().toString(36).substring(2, 7).toUpperCase();
  const segment3 = Math.random().toString(36).substring(2, 7).toUpperCase();
  
  return `${prefix}-${segment1}-${segment2}-${segment3}`;
}

export function getKeyStatus(key: any): string {
  if (key.isRevoked) return "REVOKED";
  
  const now = new Date();
  const expiryDate = new Date(key.expiryDate);
  
  return expiryDate <= now ? "EXPIRED" : "ACTIVE";
}

export function getStatusColor(status: string): { bg: string, text: string } {
  switch (status) {
    case "ACTIVE":
      return { bg: "bg-green-100", text: "text-green-800" };
    case "EXPIRED":
      return { bg: "bg-red-100", text: "text-red-800" };
    case "REVOKED":
      return { bg: "bg-gray-100", text: "text-gray-800" };
    default:
      return { bg: "bg-blue-100", text: "text-blue-800" };
  }
}
