/**
 * Base64 URL-safe encode/decode helpers for compact sharing via query params.
 * Works in browsers without Buffer.
 */

export function base64UrlEncode(plainText: string): string {
  const bytes = new TextEncoder().encode(plainText);

  // Convert bytes -> binary string for btoa.
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function base64UrlDecode(base64Url: string): string {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const paddingNeeded = (4 - (base64.length % 4)) % 4;
  const padded = base64 + '='.repeat(paddingNeeded);

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new TextDecoder().decode(bytes);
}

