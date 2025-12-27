import { useEffect, useState } from 'react';

/**
 * Hook to debounce a value with a specified delay
 * Useful for search inputs and other real-time filters
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns The debounced value
 * 
 * @example
 * const [searchInput, setSearchInput] = useState('');
 * const debouncedSearch = useDebounce(searchInput, 500);
 * 
 * useEffect(() => {
 *   // This effect runs after the user stops typing for 500ms
 *   performSearch(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
