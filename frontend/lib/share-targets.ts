/**
 * Single boundary for share-target URL construction. Components never build
 * share URLs inline — they go through this file.
 */

export function linkedInShareUrl(pageUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
}

export function whatsappShareUrl(text: string, pageUrl: string): string {
  const message = `${text}\n\n${pageUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
