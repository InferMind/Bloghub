"use client"

/**
 * Get an item from local storage with expiration check
 * @param key The key to get from local storage
 * @returns The value or null if not found or expired
 */
export function getFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    const { value, expiry } = JSON.parse(item);
    
    // Check if the item has expired
    if (expiry && new Date().getTime() > expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    return value;
  } catch (error) {
    console.error('Error getting from local storage:', error);
    return null;
  }
}

/**
 * Set an item in local storage with optional expiration
 * @param key The key to set in local storage
 * @param value The value to store
 * @param ttl Time to live in milliseconds (optional)
 */
export function setInStorage<T>(key: string, value: T, ttl?: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const item = {
      value,
      expiry: ttl ? new Date().getTime() + ttl : null,
    };
    
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error('Error setting in local storage:', error);
  }
}

/**
 * Remove an item from local storage
 * @param key The key to remove from local storage
 */
export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from local storage:', error);
  }
}