/**
 * RSS Feed Display Component
 */

import React, { useState, useEffect } from 'react';
import './RSSFeed.css';

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author?: string;
  source: string;
}

export const RSSFeed: React.FC = () => {
  const [items, setItems] = useState<RSSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      setError(null);
      const feedItems = await window.electronAPI.rss.fetchFeeds();
      setItems(feedItems);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();

    // Refresh feeds every 1 minute
    const interval = setInterval(fetchFeeds, 1 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenLink = (url: string) => {
    window.electronAPI.rss.openLink(url);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));

      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="rss-feed">
        <div className="rss-feed-header">
          <div className="rss-feed-title">
            <span className="material-symbols-rounded rss-feed-header-icon">public</span>
            <h2>News Feed</h2>
          </div>
          <span className="rss-feed-loading">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rss-feed">
        <div className="rss-feed-header">
          <div className="rss-feed-title">
            <span className="material-symbols-rounded rss-feed-header-icon">public</span>
            <h2>News Feed</h2>
          </div>
        </div>
        <div className="rss-feed-error">
          <p>Failed to load feeds: {error}</p>
          <button onClick={fetchFeeds}>Retry</button>
        </div>
      </div>
    );
  }

  // Group items by source
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.source]) {
      acc[item.source] = [];
    }
    acc[item.source].push(item);
    return acc;
  }, {} as Record<string, RSSItem[]>);

  return (
    <div className="rss-feed">
      <div className="rss-feed-header">
        <div className="rss-feed-title">
          <span className="material-symbols-rounded rss-feed-header-icon">public</span>
          <h2>News Feed</h2>
        </div>
        <button onClick={fetchFeeds} className="rss-feed-refresh" title="Refresh">
          <span className="material-symbols-rounded">refresh</span>
        </button>
      </div>

      <div className="rss-feed-items">
        {items.length === 0 ? (
          <div className="rss-feed-empty">
            <p>No feed items available</p>
            <p className="rss-feed-empty-hint">Configure RSS feeds in Settings</p>
          </div>
        ) : (
          Object.entries(groupedItems).map(([source, sourceItems]) => (
            <div key={source} className="rss-feed-group">
              <div className="rss-feed-group-header">
                <span className="rss-feed-source-badge">{source}</span>
                <span className="rss-feed-source-count">{sourceItems.length} articles</span>
              </div>
              <div className="rss-feed-group-items">
                {sourceItems.map((item, index) => (
                  <div
                    key={index}
                    className="rss-feed-item-compact"
                    onClick={() => handleOpenLink(item.link)}
                  >
                    <span className="material-symbols-rounded rss-feed-item-icon">language</span>
                    <h4 className="rss-feed-item-title-compact">{item.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
