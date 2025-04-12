import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names and merges Tailwind classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Gets the text color based on credibility score
 */
export function getCredibilityColor(score) {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-blue-500";
  if (score >= 40) return "text-yellow-500";
  if (score >= 20) return "text-orange-500";
  return "text-red-500";
}

/**
 * Gets the background color based on credibility score
 */
export function getCredibilityBgColor(score) {
  if (score >= 80) return "bg-green-500/20";
  if (score >= 60) return "bg-blue-500/20";
  if (score >= 40) return "bg-yellow-500/20";
  if (score >= 20) return "bg-orange-500/20";
  return "bg-red-500/20";
}

/**
 * Format a date to a readable string
 */
export function formatDate(date) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Truncate a string to a specified length with ellipsis
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Get a human-readable elapsed time (e.g., "2 hours ago")
 */
export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)} years ago`;
  
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)} months ago`;
  
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)} days ago`;
  
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)} hours ago`;
  
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)} minutes ago`;
  
  return `${Math.floor(seconds)} seconds ago`;
}

export function getInitials(name) {
  if (!name) return "";
  const names = name.split(" ");
  return names.map(n => n[0]).join("").toUpperCase();
}

export function getCredibilityBorderColor(score) {
  if (score >= 80) return "border-green-500/30";
  if (score >= 60) return "border-yellow-500/30";
  if (score >= 40) return "border-orange-500/30";
  return "border-red-500/30";
} 