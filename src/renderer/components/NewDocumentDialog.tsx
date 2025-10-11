/**
 * New Document Dialog - Choose document type
 */

import React, { useState, useEffect, useRef } from 'react';
import type { EditorMode } from '../types';
import { useDocumentStore } from '../store';
import './NewDocumentDialog.css';

interface NewDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Template {
  name: string;
  mode: string;
  language?: string;
  created: string;
  filename: string;
}

const NewDocumentDialog: React.FC<NewDocumentDialogProps> = ({ isOpen, onClose }) => {
  const { newDocument } = useDocumentStore();
  const [selectedMode, setSelectedMode] = useState<EditorMode>('notes');
  const [documentName, setDocumentName] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus name input when dialog opens
      setTimeout(() => nameInputRef.current?.focus(), 100);

      // Reset form
      setDocumentName('');
      setLanguage('javascript');
      setSelectedTemplate(null);

      // Load templates
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      const allTemplates = await window.electronAPI.template.list();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('[NewDocumentDialog] Failed to load templates:', error);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Number keys 1, 2, 3 to select type
      if (e.key === '1') {
        setSelectedMode('notes');
        e.preventDefault();
      } else if (e.key === '2') {
        setSelectedMode('markdown');
        e.preventDefault();
      } else if (e.key === '3') {
        setSelectedMode('code');
        e.preventDefault();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        handleCreate();
        e.preventDefault();
      } else if (e.key === 'Escape') {
        onClose();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedMode, documentName, language, selectedTemplate]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    const name = documentName.trim() || undefined;
    const lang = selectedMode === 'code' ? language : undefined;

    let templateContent: string | undefined;
    if (selectedTemplate) {
      try {
        const result = await window.electronAPI.template.load(selectedTemplate);
        if (result.success) {
          templateContent = result.content;
        } else {
          console.error('[NewDocumentDialog] Failed to load template:', result.error);
        }
      } catch (error) {
        console.error('[NewDocumentDialog] Exception loading template:', error);
      }
    }

    newDocument(selectedMode, name, lang, templateContent);
    onClose();
  };

  const handleTypeClick = (mode: EditorMode) => {
    setSelectedMode(mode);
  };

  const handleTypeDoubleClick = async (mode: EditorMode) => {
    setSelectedMode(mode);
    // Small delay to show selection before creating
    setTimeout(async () => {
      const name = documentName.trim() || undefined;
      const lang = mode === 'code' ? language : undefined;

      // Load template content if template is selected
      let templateContent: string | undefined;
      if (selectedTemplate) {
        try {
          const result = await window.electronAPI.template.load(selectedTemplate);
          if (result.success) {
            templateContent = result.content;
          } else {
            console.error('[NewDocumentDialog] Failed to load template:', result.error);
          }
        } catch (error) {
          console.error('[NewDocumentDialog] Exception loading template:', error);
        }
      }

      newDocument(mode, name, lang, templateContent);
      onClose();
    }, 100);
  };

  return (
    <div className="new-doc-overlay" onClick={onClose}>
      <div className="new-doc-content" onClick={(e) => e.stopPropagation()}>
        <div className="new-doc-header">
          <h2>New Document</h2>
          <button className="new-doc-close" onClick={onClose}>
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <div className="new-doc-body">
          <div className="form-group">
            <label htmlFor="doc-name">Document Name (optional)</label>
            <input
              ref={nameInputRef}
              id="doc-name"
              type="text"
              className="form-input"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="untitled"
            />
          </div>

          <div className="form-group">
            <label>Document Type</label>
            <p className="new-doc-description">Choose type (Press 1, 2, or 3):</p>

            <div className="doc-type-options">
              <button
                className={`doc-type-option ${selectedMode === 'notes' ? 'selected' : ''}`}
                onClick={() => handleTypeClick('notes')}
                onDoubleClick={() => handleTypeDoubleClick('notes')}
              >
                <div className="doc-type-icon-wrapper">
                  <span className="material-symbols-rounded doc-type-icon">edit_note</span>
                </div>
                <div className="doc-type-info">
                  <span className="doc-type-name">Notes</span>
                  <span className="doc-type-desc">Formatted notes with styling</span>
                  <span className="doc-type-shortcut">Press 1</span>
                </div>
                {selectedMode === 'notes' && (
                  <span className="material-symbols-rounded check">check_circle</span>
                )}
              </button>

              <button
                className={`doc-type-option ${selectedMode === 'markdown' ? 'selected' : ''}`}
                onClick={() => handleTypeClick('markdown')}
                onDoubleClick={() => handleTypeDoubleClick('markdown')}
              >
                <div className="doc-type-icon-wrapper">
                  <span className="material-symbols-rounded doc-type-icon">article</span>
                </div>
                <div className="doc-type-info">
                  <span className="doc-type-name">Markdown</span>
                  <span className="doc-type-desc">Plain text with live preview</span>
                  <span className="doc-type-shortcut">Press 2</span>
                </div>
                {selectedMode === 'markdown' && (
                  <span className="material-symbols-rounded check">check_circle</span>
                )}
              </button>

              <button
                className={`doc-type-option ${selectedMode === 'code' ? 'selected' : ''}`}
                onClick={() => handleTypeClick('code')}
                onDoubleClick={() => handleTypeDoubleClick('code')}
              >
                <div className="doc-type-icon-wrapper">
                  <span className="material-symbols-rounded doc-type-icon">code</span>
                </div>
                <div className="doc-type-info">
                  <span className="doc-type-name">Code</span>
                  <span className="doc-type-desc">Syntax highlighting & execution</span>
                  <span className="doc-type-shortcut">Press 3</span>
                </div>
                {selectedMode === 'code' && (
                  <span className="material-symbols-rounded check">check_circle</span>
                )}
              </button>
            </div>
          </div>

          {selectedMode === 'code' && (
            <div className="form-group">
              <label htmlFor="language">Programming Language</label>
              <select
                id="language"
                className="form-input"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="php">PHP</option>
                <option value="ruby">Ruby</option>
                <option value="swift">Swift</option>
                <option value="kotlin">Kotlin</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
                <option value="xml">XML</option>
                <option value="sql">SQL</option>
                <option value="shell">Shell</option>
                <option value="markdown">Markdown</option>
                <option value="plaintext">Plain Text</option>
              </select>
            </div>
          )}

          {/* Template Section - Always visible */}
          <div className="form-group template-section">
            <label>
              <span className="material-symbols-rounded" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '6px' }}>bookmark</span>
              Templates {templates.length > 0 && `(${templates.filter(t => t.mode === selectedMode).length} for ${selectedMode})`}
            </label>
            {templates.filter(t => t.mode === selectedMode).length > 0 ? (
              <select
                id="template"
                className="form-input"
                value={selectedTemplate || ''}
                onChange={(e) => setSelectedTemplate(e.target.value || null)}
              >
                <option value="">Blank Document</option>
                {templates
                  .filter(t => t.mode === selectedMode)
                  .map(template => (
                    <option key={template.filename} value={template.filename}>
                      {template.name}
                    </option>
                  ))}
              </select>
            ) : (
              <div className="template-hint">
                <span className="material-symbols-rounded">info</span>
                <span>No templates saved yet. Create a document and click the Template button to save it as a template.</span>
              </div>
            )}
          </div>
        </div>

        <div className="new-doc-footer">
          <button className="new-doc-btn secondary" onClick={onClose}>
            <span className="material-symbols-rounded">close</span>
            Cancel
          </button>
          <button className="new-doc-btn primary" onClick={handleCreate}>
            <span className="material-symbols-rounded">add</span>
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewDocumentDialog;
