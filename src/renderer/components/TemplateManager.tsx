/**
 * Template Manager - View and manage saved templates
 */

import React, { useState, useEffect } from 'react';
import './TemplateManager.css';

interface Template {
  name: string;
  mode: string;
  language?: string;
  created: string;
  filename: string;
}

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ isOpen, onClose }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateContent, setTemplateContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      const allTemplates = await window.electronAPI.template.list();
      setTemplates(allTemplates);
      console.log('[TemplateManager] Loaded templates:', allTemplates);
    } catch (error) {
      console.error('[TemplateManager] Failed to load templates:', error);
    }
  };

  const viewTemplate = async (filename: string) => {
    setSelectedTemplate(filename);
    setLoading(true);
    try {
      const result = await window.electronAPI.template.load(filename);
      if (result.success) {
        setTemplateContent(result.content || '');
        console.log('[TemplateManager] Loaded template content:', result.content?.length || 0, 'chars');
      } else {
        console.error('[TemplateManager] Failed to load template:', result.error);
        setTemplateContent('');
      }
    } catch (error) {
      console.error('[TemplateManager] Exception loading template:', error);
      setTemplateContent('');
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (filename: string) => {
    try {
      const result = await window.electronAPI.template.delete(filename);
      if (result.success) {
        console.log('[TemplateManager] Deleted template:', filename);
        // Reload templates
        await loadTemplates();
        // Clear selection if deleted template was selected
        if (selectedTemplate === filename) {
          setSelectedTemplate(null);
          setTemplateContent('');
        }
        setDeleteConfirm(null);
      } else {
        console.error('[TemplateManager] Failed to delete template:', result.error);
      }
    } catch (error) {
      console.error('[TemplateManager] Exception deleting template:', error);
    }
  };

  if (!isOpen) return null;

  const selectedTemplateData = templates.find(t => t.filename === selectedTemplate);

  return (
    <div className="template-manager-overlay" onClick={onClose}>
      <div className="template-manager-content" onClick={(e) => e.stopPropagation()}>
        <div className="template-manager-header">
          <h2>
            <span className="material-symbols-rounded">bookmark</span>
            Template Manager
          </h2>
          <button className="template-manager-close" onClick={onClose}>
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <div className="template-manager-body">
          <div className="template-list-panel">
            <div className="template-list-header">
              <h3>Templates ({templates.length})</h3>
            </div>

            {templates.length === 0 ? (
              <div className="template-empty-state">
                <span className="material-symbols-rounded">bookmark_border</span>
                <p>No templates saved yet</p>
                <small>Create a document and save it as a template</small>
              </div>
            ) : (
              <div className="template-list">
                {templates.map(template => (
                  <div
                    key={template.filename}
                    className={`template-item ${selectedTemplate === template.filename ? 'selected' : ''}`}
                    onClick={() => viewTemplate(template.filename)}
                  >
                    <div className="template-item-header">
                      <span className="material-symbols-rounded template-item-icon">
                        {template.mode === 'notes' ? 'edit_note' :
                         template.mode === 'markdown' ? 'article' : 'code'}
                      </span>
                      <div className="template-item-info">
                        <span className="template-item-name">{template.name}</span>
                        <span className="template-item-meta">
                          {template.mode}
                          {template.language && ` • ${template.language}`}
                        </span>
                      </div>
                    </div>
                    <div className="template-item-date">
                      {new Date(template.created).toLocaleDateString()}
                    </div>
                    <button
                      className="template-item-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(template.filename);
                      }}
                      title="Delete template"
                    >
                      <span className="material-symbols-rounded">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="template-preview-panel">
            {selectedTemplate ? (
              <>
                <div className="template-preview-header">
                  <h3>Preview: {selectedTemplateData?.name}</h3>
                  {templateContent.length === 0 && !loading && (
                    <span className="template-warning">
                      <span className="material-symbols-rounded">warning</span>
                      Empty template
                    </span>
                  )}
                </div>
                <div className="template-preview-content">
                  {loading ? (
                    <div className="template-preview-loading">Loading...</div>
                  ) : templateContent ? (
                    <pre>{templateContent}</pre>
                  ) : (
                    <div className="template-preview-empty">
                      <span className="material-symbols-rounded">note</span>
                      <p>This template has no content</p>
                      <small>It may have been saved from an empty document</small>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="template-preview-empty">
                <span className="material-symbols-rounded">visibility</span>
                <p>Select a template to preview</p>
              </div>
            )}
          </div>
        </div>

        {deleteConfirm && (
          <div className="template-delete-confirm-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="template-delete-confirm" onClick={(e) => e.stopPropagation()}>
              <h3>Delete Template?</h3>
              <p>
                Are you sure you want to delete <strong>{templates.find(t => t.filename === deleteConfirm)?.name}</strong>?
              </p>
              <p className="template-delete-warning">This action cannot be undone.</p>
              <div className="template-delete-actions">
                <button
                  className="template-delete-btn cancel"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="template-delete-btn confirm"
                  onClick={() => deleteTemplate(deleteConfirm)}
                >
                  <span className="material-symbols-rounded">delete</span>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateManager;
