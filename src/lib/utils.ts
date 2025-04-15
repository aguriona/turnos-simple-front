// Utility for merging class names (like clsx or tailwind-merge)
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
