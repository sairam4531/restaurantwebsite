const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const rawApiBase = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL = rawApiBase
  ? trimTrailingSlash(rawApiBase)
  : 'http://localhost:5000/api';

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};