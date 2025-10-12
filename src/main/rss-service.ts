/**
 * RSS Service - Fetch and parse RSS feeds
 */

import { settingsService, RSSFeed } from './settings-service';

export interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author?: string;
  source: string; // Feed name
}

class RSSService {
  /**
   * Fetch and parse an RSS feed
   */
  async fetchFeed(feed: RSSFeed): Promise<RSSItem[]> {
    try {
      const response = await fetch(feed.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${feed.name}: ${response.status}`);
      }

      const xml = await response.text();
      return this.parseRSS(xml, feed.name);
    } catch (error) {
      console.error(`Error fetching RSS feed ${feed.name}:`, error);
      return [];
    }
  }

  /**
   * Parse RSS/Atom XML into RSSItem array
   */
  private parseRSS(xml: string, sourceName: string): RSSItem[] {
    // Check if it's an Atom feed
    if (xml.includes('<feed') && xml.includes('xmlns="http://www.w3.org/2005/Atom"')) {
      return this.parseAtom(xml, sourceName);
    }

    // Parse RSS feed
    return this.parseRSSItems(xml, sourceName);
  }

  /**
   * Extract content from XML tag
   */
  private extractTag(xml: string, tagName: string): string {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract attribute from XML tag
   */
  private extractAttribute(xml: string, tagName: string, attrName: string): string {
    const regex = new RegExp(`<${tagName}[^>]*${attrName}="([^"]*)"`, 'i');
    const match = xml.match(regex);
    return match ? match[1] : '';
  }

  /**
   * Parse RSS format
   */
  private parseRSSItems(xml: string, sourceName: string): RSSItem[] {
    const result: RSSItem[] = [];
    const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi);

    for (const match of itemMatches) {
      const itemXml = match[1];
      let title = this.extractTag(itemXml, 'title');
      let link = this.extractTag(itemXml, 'link');

      // Clean up link - remove CDATA and trim
      link = link.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();

      // Clean up title - remove CDATA and decode HTML entities
      title = title.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
      title = this.stripHTML(title);

      const descriptionRaw = this.extractTag(itemXml, 'description') || this.extractTag(itemXml, 'summary');
      const description = this.stripHTML(descriptionRaw);
      const pubDate = this.extractTag(itemXml, 'pubDate') || this.extractTag(itemXml, 'published') || new Date().toISOString();
      const author = this.extractTag(itemXml, 'author') || this.extractTag(itemXml, 'dc:creator') || undefined;

      if (title && link) {
        result.push({
          title,
          link,
          description: description.substring(0, 200),
          pubDate,
          author,
          source: sourceName,
        });
      }
    }

    return result;
  }

  /**
   * Parse Atom format
   */
  private parseAtom(xml: string, sourceName: string): RSSItem[] {
    const result: RSSItem[] = [];
    const entryMatches = xml.matchAll(/<entry[^>]*>([\s\S]*?)<\/entry>/gi);

    for (const match of entryMatches) {
      const entryXml = match[1];
      const title = this.extractTag(entryXml, 'title');
      const link = this.extractAttribute(entryXml, 'link', 'href');
      const descriptionRaw = this.extractTag(entryXml, 'summary') || this.extractTag(entryXml, 'content');
      const description = this.stripHTML(descriptionRaw);
      const pubDate = this.extractTag(entryXml, 'published') || this.extractTag(entryXml, 'updated') || new Date().toISOString();
      const authorName = this.extractTag(entryXml, 'name');

      if (title && link) {
        result.push({
          title: this.stripHTML(title),
          link,
          description: description.substring(0, 200),
          pubDate,
          author: authorName || undefined,
          source: sourceName,
        });
      }
    }

    return result;
  }

  /**
   * Strip HTML tags from text
   */
  private stripHTML(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Fetch all enabled RSS feeds
   */
  async fetchAllFeeds(): Promise<RSSItem[]> {
    const config = await settingsService.getRSSConfig();
    const enabledFeeds = config.feeds.filter(f => f.enabled);

    const allItems: RSSItem[] = [];

    for (const feed of enabledFeeds) {
      const items = await this.fetchFeed(feed);
      allItems.push(...items);
    }

    // Sort by publication date (newest first)
    allItems.sort((a, b) => {
      const dateA = new Date(a.pubDate).getTime();
      const dateB = new Date(b.pubDate).getTime();
      return dateB - dateA;
    });

    return allItems;
  }
}

export const rssService = new RSSService();
