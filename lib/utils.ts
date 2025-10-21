import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const parseStartTime = (startTime: Date | string | null | undefined): Date | null => {
  if (!startTime) {
    return null
  }

  if (startTime instanceof Date) {
    return startTime
  }

  try {
    // Handle the array format [year, month, day, hour, minute, second, nanosecond]
    if (Array.isArray(startTime) && startTime.length >= 6) {
      const [year, month, day, hour, minute, second, nanosecond = 0] = startTime
      // Month is 0-indexed in JavaScript Date, so subtract 1
      return new Date(year, month - 1, day, hour, minute, second, Math.floor(nanosecond / 1000000))
    }
    return new Date(startTime)
  } catch (error) {
    console.error("Failed to parse start time:", error)
    return null
  }
}

