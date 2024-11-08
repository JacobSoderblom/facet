// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function debounce<T extends (...args: any[]) => any>(fn: T, wait = 500) {
  let timeout: NodeJS.Timer;

  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    const later = () => fn(...args);
    timeout = setTimeout(later, wait);
  };

  debounced.destroy = () => clearTimeout(timeout);
  return debounced;
}
