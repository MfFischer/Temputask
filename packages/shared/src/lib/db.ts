/**
 * Utility function to filter objects by user ID (used in both frontend and backend)
 * @param items - Array of objects with user_id property
 * @param userId - User ID to filter by
 * @returns Filtered array of items
 */
export function filterByUserId<T extends { user_id: string }>(items: T[], userId: string): T[] {
  return items.filter(item => item.user_id === userId);
}

/**
 * Transform database column names to camelCase (for frontend use)
 * @param dbObject - Database object with snake_case keys
 * @returns Object with camelCase keys
 */
export function toCamelCase<T = Record<string, any>>(dbObject: Record<string, any>): T {
  if (!dbObject || typeof dbObject !== 'object') return dbObject as unknown as T;
  
  const result: Record<string, any> = {};
  
  Object.keys(dbObject).forEach(key => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = dbObject[key];
  });
  
  return result as T;
}

/**
 * Transform camelCase keys to snake_case (for database use)
 * @param jsObject - JavaScript object with camelCase keys
 * @returns Object with snake_case keys for database
 */
export function toSnakeCase<T = Record<string, any>>(jsObject: Record<string, any>): T {
  if (!jsObject || typeof jsObject !== 'object') return jsObject as unknown as T;
  
  const result: Record<string, any> = {};
  
  Object.keys(jsObject).forEach(key => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = jsObject[key];
  });
  
  return result as T;
}

/**
 * Check if a value is null or undefined
 * @param value - Value to check
 * @returns True if the value is null or undefined
 */
export function isNullOrUndefined(value: any): boolean {
  return value === null || value === undefined;
}

/**
 * Safely get a nested property from an object
 * @param obj - Object to get property from
 * @param path - Path to property (e.g., 'user.profile.name')
 * @param defaultValue - Default value if property doesn't exist
 * @returns Property value or default value
 */
export function getNestedProperty<T>(obj: Record<string, any>, path: string, defaultValue: T): T {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (isNullOrUndefined(current) || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  
  return isNullOrUndefined(current) ? defaultValue : current as T;
}