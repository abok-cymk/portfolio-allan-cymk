/**
 * RSS_Service
 *
 * Fetches the Medium RSS feed via rss2json.com (CORS proxy) and exposes
 * an RxJS Observable of ArticleData[]. Applies a 10-second timeout.
 *
 * Requirements: 5.1, 5.2, 5.6
 */

import { from, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, timeout } from 'rxjs/operators';

export interface ArticleData {
  title: string;
  pubDate: string;       // ISO date string
  readingTime?: string;  // e.g. "5 min read"
  coverImageUrl?: string;
  url: string;
}

const RSS2JSON_BASE = 'https://api.rss2json.com/v1/api.json?rss_url=';

/**
 * Extracts reading time from Medium's description HTML.
 * Medium embeds it as "X min read" somewhere in the HTML.
 */
function extractReadingTime(html: string): string | undefined {
  const match = html.match(/(\d+)\s+min\s+read/i);
  return match ? `${match[1]} min read` : undefined;
}

/**
 * Maps a rss2json response payload to ArticleData[].
 * Silently drops items that are missing required fields.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRssJson(response: any): ArticleData[] {
  if (!response || !Array.isArray(response.items)) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return response.items.reduce((acc: ArticleData[], item: any) => {
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    const url = typeof item.link === 'string' ? item.link.trim() : '';
    const pubDate = typeof item.pubDate === 'string' ? item.pubDate : '';

    if (!title || !url || !pubDate) return acc;

    const coverImageUrl =
      typeof item.thumbnail === 'string' && item.thumbnail
        ? item.thumbnail
        : undefined;

    const readingTime =
      typeof item.description === 'string'
        ? extractReadingTime(item.description)
        : undefined;

    acc.push({ title, pubDate, url, coverImageUrl, readingTime });
    return acc;
  }, []);
}

/**
 * Returns an Observable that emits ArticleData[] on success,
 * or errors after 10 000 ms if the request has not resolved.
 */
export function fetchArticles(username: string): Observable<ArticleData[]> {
  const feedUrl = `https://medium.com/feed/@${encodeURIComponent(username)}`;
  const proxyUrl = `${RSS2JSON_BASE}${encodeURIComponent(feedUrl)}`;

  return from(fetch(proxyUrl)).pipe(
    timeout(10000),
    switchMap((response) => from(response.json())),
    map(parseRssJson),
    catchError((err) => throwError(() => err)),
  );
}
