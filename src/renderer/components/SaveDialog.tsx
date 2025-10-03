/**
 * Save Dialog - Document metadata and categorization
 */

import React, { useState } from 'react';
import './SaveDialog.css';
import { useDocumentStore } from '../store';

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (metadata: SaveMetadata) => void;
  currentTitle: string;
  currentTags: string[];
}

export interface SaveMetadata {
  title: string;
  tags: string[];
  commitMessage?: string;
}

const SaveDialog: React.FC<SaveDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  currentTitle,
  currentTags,
}) => {
  const [title, setTitle] = useState(currentTitle || '');
  const [tags, setTags] = useState<string[]>(currentTags || []);
  const [tagInput, setTagInput] = useState('');
  const [commitMessage, setCommitMessage] = useState('');

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a document title');
      return;
    }

    // Get current document mode from the store
    const { mode } = useDocumentStore.getState();

    // Add immutable tags (without prefixes)
    const typeTag = mode; // Just the mode name
    let allTags = [...tags];

    // Add type tag if not present
    if (!allTags.includes(typeTag)) {
      allTags.push(typeTag);
    }

    // Add author tag if available (without "author:" prefix)
    try {
      const gitConfig = await window.electronAPI.settings.getGitConfig();
      if (gitConfig && gitConfig.userName) {
        const authorTag = gitConfig.userName; // Just the username
        if (!allTags.includes(authorTag)) {
          allTags.push(authorTag);
        }
      }
    } catch (error) {
      console.error('[SaveDialog] Failed to load git config:', error);
    }

    onSave({
      title: title.trim(),
      tags: allTags,
      commitMessage: commitMessage.trim() || `Update ${title.trim()}`,
    });
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Save Document</h2>
          <button className="dialog-close" onClick={onClose}>
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <div className="dialog-body">
          <div className="form-group">
            <label>Document Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tag-input-container">
              <input
                type="text"
                className="form-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tags (press Enter)"
              />
              <button className="add-tag-btn" onClick={handleAddTag}>
                <span className="material-symbols-rounded">add</span>
              </button>
            </div>
            {tags.length > 0 && (
              <div className="tags-list">
                {tags.map((tag) => (
                  <div key={tag} className="tag-chip">
                    <span>{tag}</span>
                    <button onClick={() => handleRemoveTag(tag)}>
                      <span className="material-symbols-rounded">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Git Commit Message (Optional)</label>
            <input
              type="text"
              className="form-input"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Describe your changes"
            />
            <div className="form-hint">
              <span className="material-symbols-rounded">info</span>
              Changes will be automatically committed to local git
            </div>
          </div>
        </div>

        <div className="dialog-footer">
          <button className="dialog-btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="dialog-btn primary" onClick={handleSave}>
            <span className="material-symbols-rounded">save</span>
            Save & Commit
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveDialog;
