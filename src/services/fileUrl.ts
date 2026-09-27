// Helper to resolve uploaded file paths into full backend URLs
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getBackendOrigin = (): string => {
  try {
    return new URL(API_BASE_URL).origin; // e.g. http://localhost:5000
  } catch {
    return 'http://localhost:5000';
  }
};

/**
 * Convert a stored file path (e.g. "uploads/STU001/2026-09/foo.pdf" or "/uploads/...")
 * into a fetchable absolute URL served by the backend static middleware.
 */
export const getFileUrl = (filePath?: string): string | undefined => {
  if (!filePath) return undefined;
  if (filePath.startsWith('http')) return filePath;
  const normalized = filePath.replace(/^\/+/, '');
  return `${getBackendOrigin()}/${normalized}`;
};
