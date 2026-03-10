import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function startOfDay(input: Date | string) {
  const date = new Date(input);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(input: Date | string, days: number) {
  const date = startOfDay(input);
  date.setDate(date.getDate() + days);
  return date;
}

export function differenceInDays(a: Date | string, b: Date | string) {
  const first = startOfDay(a).getTime();
  const second = startOfDay(b).getTime();
  return Math.round((first - second) / (1000 * 60 * 60 * 24));
}

export function isSameDay(a: Date | string, b: Date | string) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function dateKey(input: Date | string) {
  return startOfDay(input).toISOString().slice(0, 10);
}

export function formatDate(input: Date | string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...options
  }).format(new Date(input));
}

export function formatDateTime(input: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(input));
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatScore(value: number) {
  return Math.round(clamp(value, 0, 100));
}

export function unique<T>(values: T[]) {
  return [...new Set(values)];
}

export function sortByDate<T extends { date?: string; createdAt?: string; generatedAt?: string }>(
  items: T[],
  direction: "asc" | "desc" = "desc"
) {
  return [...items].sort((left, right) => {
    const leftValue = left.date ?? left.createdAt ?? left.generatedAt ?? "";
    const rightValue = right.date ?? right.createdAt ?? right.generatedAt ?? "";
    return direction === "asc"
      ? new Date(leftValue).getTime() - new Date(rightValue).getTime()
      : new Date(rightValue).getTime() - new Date(leftValue).getTime();
  });
}

export function seededValue(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(Math.sin(hash) * 10000) % 1;
}

export function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
