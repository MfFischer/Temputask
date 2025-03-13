// Export all types and utilities
export * from './types/user';
export * from './types/project';
export * from './types/timeEntry';
export * from './lib/time';
export * from './lib/db';

// App constants
export const APP_NAME = 'Tempu Task';
export const APP_VERSION = '0.1.0';

// Common validation functions
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};