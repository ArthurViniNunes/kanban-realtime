const DEFAULT_API_BASE_URL = 'http://localhost:3333';

function parseApiBaseUrl(value: string | undefined) {
  const candidate = value?.trim() || DEFAULT_API_BASE_URL;

  try {
    return new URL(candidate).toString().replace(/\/$/, '');
  } catch {
    throw new Error('Invalid VITE_API_BASE_URL');
  }
}

export const env = Object.freeze({
  apiBaseUrl: parseApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
});
