import {
  formatDistanceToNow,
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisYear,
} from "date-fns";

export function formatRelativeDate(timestamp: number): string {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  if (isThisWeek(date)) {
    return format(date, "EEEE"); // Day name
  }

  if (isThisYear(date)) {
    return format(date, "MMM d"); // Jan 5
  }

  return format(date, "MMM d, yyyy"); // Jan 5, 2024
}

export function formatFullDate(timestamp: number): string {
  return format(new Date(timestamp), "MMMM d, yyyy 'at' h:mm a");
}
