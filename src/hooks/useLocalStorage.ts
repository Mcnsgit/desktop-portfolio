import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initiaValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initiaValue;
    } catch (error) {
      console.error(error);
      return initiaValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToSTore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToSTore);
      window.localStorage.setItem(key, JSON.stringify(valueToSTore));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const item = window.localStorage.getItem(key);
    if (item) {
      setStoredValue(JSON.parse(item));
    }
  }, [key]);
  return [storedValue, setValue] as const;
}
