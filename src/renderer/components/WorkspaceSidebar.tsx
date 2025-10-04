/**
 * Workspace Sidebar - Document list, search, and tags
 */

import React, { useState } from 'react';
import { useWorkspaceStore, useDocumentStore } from '../store';
import NewDocumentDialog from './NewDocumentDialog';
import type { EditorMode } from '../types';
import './WorkspaceSidebar.css';

const WorkspaceSidebar: React.FC = () => {
  const {
    workspace,
    documents,
    tags,
    searchResults,
    search,
    searchByTag,
    gitStatus,
    pushToRemote,
    pullFromRemote,
    syncing,
  } = useWorkspaceStore();

  const { openDocument, newDocument, saveDocument } = useDocumentStore();
  const [activeTab, setActiveTab] = useState<'documents' | 'search' | 'tags'>('documents');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showNewDocDialog, setShowNewDocDialog] = useState(false);

  const handleNewDocumentClick = () => {
    setShowNewDocDialog(true);
  };

  const handleCreateDocument = async (mode: EditorMode, name?: string, language?: string) => {
    // Create new document in store with selected mode, name, and language
    newDocument(mode, name, language as any);

    // Immediately save it to create the file
    await saveDocument();

    // Reload workspace documents to show the new file
    await useWorkspaceStore.getState().loadDocuments();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      search(localSearchQuery);
      setActiveTab('search');
    }
  };

  const handleTagClick = (tag: string) => {
    searchByTag(tag);
    setActiveTab('search');
  };

  const handleDocumentClick = async (path: string) => {
    await openDocument(path);
  };

  const handleDeleteDocument = async (path: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the document

    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      await window.electronAPI.document.delete(path);
      // Reload documents list
      await useWorkspaceStore.getState().loadDocuments();
      await useWorkspaceStore.getState().loadTags();
    } catch (error) {
      console.error('[WorkspaceSidebar] Failed to delete document:', error);
      alert('Failed to delete document: ' + (error as Error).message);
    }
  };

  return (
    <div className="workspace-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="workspace-name">{workspace?.name || 'No Workspace'}</div>
        <button className="new-doc-btn" onClick={handleNewDocumentClick} title="New Document">
          <span className="material-symbols-rounded">add</span>
        </button>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search documents..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Tabs */}
      <div className="sidebar-tabs">
        <button
          className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <span className="material-symbols-rounded">description</span>
          All
        </button>
        <button
          className={`tab-btn ${activeTab === 'tags' ? 'active' : ''}`}
          onClick={() => setActiveTab('tags')}
        >
          <span className="material-symbols-rounded">local_offer</span>
          Tags
        </button>
      </div>

      {/* Content */}
      <div className="sidebar-content">
        {activeTab === 'documents' && (
          <div className="documents-list">
            {documents.length === 0 ? (
              <div className="empty-state">
                <p>No documents yet</p>
                <p className="empty-hint">Create a new document to get started</p>
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.path}
                  className="document-item"
                  onClick={() => handleDocumentClick(doc.path)}
                >
                  <div className="document-header-row">
                    <div className="document-title">{doc.title}</div>
                    <div className="document-actions">
                      <span className={`document-type-badge ${doc.mode}`}>
                        {doc.mode === 'notes' && <span className="material-symbols-rounded">format_text_wrap</span>}
                        {doc.mode === 'markdown' && <span className="material-symbols-rounded">article</span>}
                        {doc.mode === 'code' && <span className="material-symbols-rounded">code</span>}
                      </span>
                      <button
                        className="document-delete-btn"
                        onClick={(e) => handleDeleteDocument(doc.path, e)}
                        title="Delete document"
                      >
                        <span className="material-symbols-rounded">delete</span>
                      </button>
                    </div>
                  </div>
                  <div className="document-date">
                    {new Date(doc.modified).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="search-results">
            {searchResults.length === 0 ? (
              <div className="empty-state">
                <p>No results found</p>
                <p className="empty-hint">Try different search terms</p>
              </div>
            ) : (
              searchResults.map((doc) => (
                <div
                  key={doc.id || doc.path}
                  className="document-item"
                  onClick={() => handleDocumentClick(doc.path)}
                >
                  <div className="document-header-row">
                    <div className="document-title">{doc.title}</div>
                    <span className={`document-type-badge ${doc.mode}`}>
                      {doc.mode === 'notes' && <span className="material-symbols-rounded">format_text_wrap</span>}
                      {doc.mode === 'markdown' && <span className="material-symbols-rounded">article</span>}
                      {doc.mode === 'code' && <span className="material-symbols-rounded">code</span>}
                    </span>
                  </div>
                  {(doc as any).snippet && (
                    <div
                      className="search-snippet"
                      dangerouslySetInnerHTML={{ __html: (doc as any).snippet }}
                    />
                  )}
                  {doc.tags.length > 0 && (
                    <div className="document-tags">
                      {doc.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag-badge">
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="tag-badge more">+{doc.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="tags-list">
            {tags.length === 0 ? (
              <div className="empty-state">
                <p>No tags yet</p>
                <p className="empty-hint">Add tags to your documents</p>
              </div>
            ) : (
              tags.map((tag) => (
                <div
                  key={tag.name}
                  className="tag-item"
                  onClick={() => handleTagClick(tag.name)}
                >
                  <span className="tag-name">#{tag.name}</span>
                  <span className="tag-count">{tag.count}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Git Status */}
      {gitStatus && (
        <div className="sidebar-footer">
          <div className="git-status">
            <div className="git-branch">
              <span className="material-symbols-rounded">source_environment</span>
              {gitStatus.branch}
              {!gitStatus.clean && <span className="git-dirty">●</span>}
            </div>
            {(gitStatus.ahead > 0 || gitStatus.behind > 0) && (
              <div className="git-sync">
                {gitStatus.ahead > 0 && <span><span className="material-symbols-rounded">arrow_upward</span> {gitStatus.ahead}</span>}
                {gitStatus.behind > 0 && <span><span className="material-symbols-rounded">arrow_downward</span> {gitStatus.behind}</span>}
              </div>
            )}
            <div className="git-actions">
              <button
                className="git-btn"
                onClick={() => pullFromRemote()}
                disabled={syncing}
                title="Pull from remote"
              >
                <span className="material-symbols-rounded">download</span>
              </button>
              <button
                className="git-btn"
                onClick={() => pushToRemote()}
                disabled={syncing || gitStatus.clean}
                title="Push to remote"
              >
                <span className="material-symbols-rounded">upload</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Document Dialog */}
      <NewDocumentDialog
        isOpen={showNewDocDialog}
        onClose={() => setShowNewDocDialog(false)}
        onCreate={handleCreateDocument}
      />
    </div>
  );
};

export default WorkspaceSidebar;
