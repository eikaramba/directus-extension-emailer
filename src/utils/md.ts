import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';

/**
 * Render and sanitize a markdown string
 */
export function md(value: string): string {
  const html = marked.parse(value) as string; /* Would only be a promise if used with async extensions */

  return sanitizeHtml(html);
}