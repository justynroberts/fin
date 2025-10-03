/**
 * Dashboard - Quick links and workspace overview
 */

import React from 'react';
import { useWorkspaceStore, useDocumentStore } from '../store';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { documents, tags, workspace } = useWorkspaceStore();
  const { newDocument } = useDocumentStore();

  const recentDocs = documents.slice(0, 5);
  const topTags = tags.slice(0, 5);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">FinText</h1>
        <p className="dashboard-subtitle">{workspace?.name || 'A powerful text editor'}</p>
      </div>

      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="dashboard-card actions">
          <div className="card-header">
            <span className="material-symbols-rounded">bolt</span>
            <h2>Create New Document</h2>
          </div>
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => newDocument('markdown')}>
              <span className="material-symbols-rounded">article</span>
              <div className="action-title">Markdown</div>
              <div className="action-desc">Plain text with formatting</div>
            </button>
            <button className="quick-action-btn" onClick={() => newDocument('notes')}>
              <span className="material-symbols-rounded">format_text_wrap</span>
              <div className="action-title">Notes</div>
              <div className="action-desc">WYSIWYG formatted notes</div>
            </button>
            <button className="quick-action-btn" onClick={() => newDocument('code')}>
              <span className="material-symbols-rounded">code</span>
              <div className="action-title">Code</div>
              <div className="action-desc">Source code with syntax</div>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="dashboard-card small">
          <div className="card-header">
            <span className="material-symbols-rounded">insights</span>
            <h2>Stats</h2>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{documents.length}</div>
              <div className="stat-label">Documents</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{tags.length}</div>
              <div className="stat-label">Tags</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{documents.filter(d => d.mode === 'markdown').length}</div>
              <div className="stat-label">Markdown</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{documents.filter(d => d.mode === 'code').length}</div>
              <div className="stat-label">Code</div>
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="dashboard-card wide">
          <div className="card-header">
            <span className="material-symbols-rounded">history</span>
            <h2>Recent Documents</h2>
          </div>
          <div className="recent-docs">
            {recentDocs.length === 0 ? (
              <div className="empty-state-small">
                No documents yet. Create one to get started!
              </div>
            ) : (
              recentDocs.map((doc) => (
                <div key={doc.path} className="recent-doc-item">
                  <span className={`doc-icon ${doc.mode}`}>
                    {doc.mode === 'markdown' && <span className="material-symbols-rounded">article</span>}
                    {doc.mode === 'rich-text' && <span className="material-symbols-rounded">format_text_wrap</span>}
                    {doc.mode === 'code' && <span className="material-symbols-rounded">code</span>}
                  </span>
                  <div className="doc-info">
                    <div className="doc-title">{doc.title}</div>
                    <div className="doc-date">{new Date(doc.modified).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Popular Tags */}
        <div className="dashboard-card">
          <div className="card-header">
            <span className="material-symbols-rounded">local_offer</span>
            <h2>Popular Tags</h2>
          </div>
          <div className="popular-tags">
            {topTags.length === 0 ? (
              <div className="empty-state-small">
                No tags yet. Add tags to your documents!
              </div>
            ) : (
              topTags.map((tag) => (
                <div key={tag.name} className="tag-item-dash">
                  <span className="tag-name">#{tag.name}</span>
                  <span className="tag-count">{tag.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
