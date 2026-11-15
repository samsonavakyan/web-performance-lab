import { useEffect, useState } from 'react';
import { fetchJson } from './data';

// Loads JSON when the component mounts or the URL changes. Returns null until the data arrives.
export function useFetch<T>(url: string): T | null {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    fetchJson<T>(url, controller.signal)
      .then(setData)
      .catch(() => {});
    return () => controller.abort();
  }, [url]);
  return data;
}
