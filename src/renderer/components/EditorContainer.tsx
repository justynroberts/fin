/**
 * Editor Container - Manages editor mode switching
 */

import React, { useEffect } from 'react';
import { useDocumentStore, useWorkspaceStore } from '../store';
import CodeEditor from '../editors/CodeEditor';
import MarkdownEditor from '../editors/MarkdownEditor';
import RichTextEditor from '../editors/RichTextEditor';
import SaveDialog, { SaveMetadata } from './SaveDialog';
import AIPromptDialog from './AIPromptDialog';
import ExportDialog from './ExportDialog';
import Settings from './Settings';
import './EditorContainer.css';

interface EditorContainerProps {
  zenMode?: boolean;
  onExitZen?: () => void;
}

const EditorContainer: React.FC<EditorContainerProps> = ({ zenMode = false, onExitZen }) => {
  const {
    content,
    mode,
    language,
    isDirty,
    isSaving,
    title,
    tags,
    autoSaveEnabled,
    autoSaveInterval,
    setContent,
    setMode,
    setTitle,
    setTags,
    setCursorPosition,
    saveDocument,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useDocumentStore();

  const { loadDocuments } = useWorkspaceStore();

  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [showAIPrompt, setShowAIPrompt] = React.useState(false);
  const [showExportDialog, setShowExportDialog] = React.useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = React.useState(false);
  const [templateName, setTemplateName] = React.useState('');
  const [showSettings, setShowSettings] = React.useState(false);
  const [tagInput, setTagInput] = React.useState('');
  const [authorTag, setAuthorTag] = React.useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const recognitionRef = React.useRef<any>(null);

  // Load author tag from git config
  useEffect(() => {
    const loadAuthor = async () => {
      try {
        const gitConfig = await window.electronAPI.settings.getGitConfig();
        if (gitConfig && gitConfig.userName) {
          const author = `author:${gitConfig.userName}`;
          setAuthorTag(author);
          // Add author tag if not already present
          if (!tags.includes(author)) {
            setTags([...tags, author]);
          }
        }
      } catch (error) {
        console.error('[EditorContainer] Failed to load author:', error);
      }
    };
    loadAuthor();
  }, []); // Only run once on mount

  // Ensure immutable tags are always present
  useEffect(() => {
    const typeTag = mode; // Just use the mode name without "type:" prefix
    const updatedTags = [...tags];

    // Add type tag if not present
    if (!updatedTags.includes(typeTag)) {
      updatedTags.push(typeTag);
    }

    // Add author tag if not present and we have one (strip "author:" prefix)
    if (authorTag) {
      const simpleAuthor = authorTag.replace('author:', '');
      if (!updatedTags.includes(simpleAuthor)) {
        updatedTags.push(simpleAuthor);
      }
    }

    // Remove old type tags
    const modes = ['notes', 'markdown', 'code'];
    const cleanedTags = updatedTags.filter(tag => {
      if (modes.includes(tag)) {
        return tag === typeTag;
      }
      return true;
    });

    // Update tags if changed
    if (JSON.stringify(cleanedTags.sort()) !== JSON.stringify(tags.sort())) {
      setTags(cleanedTags);
    }
  }, [mode, authorTag]);

  // Auto-save setup
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const autoSaveTimer = setInterval(async () => {
      if (isDirty && !isSaving) {
        try {
          await saveDocument();
          // Reload documents after save
          await loadDocuments();
          await useWorkspaceStore.getState().loadTags();
          console.log('[AutoSave] Document auto-saved');
        } catch (error) {
          console.error('[AutoSave] Failed:', error);
        }
      }
    }, autoSaveInterval);

    return () => clearInterval(autoSaveTimer);
  }, [isDirty, isSaving, autoSaveEnabled, autoSaveInterval, saveDocument, loadDocuments]);

  // Manual save event
  useEffect(() => {
    const handleSave = async () => {
      if (isDirty && !isSaving) {
        await saveDocument();
        // Reload documents after save
        await loadDocuments();
        await useWorkspaceStore.getState().loadTags();
      }
    };

    window.addEventListener('editor:save', handleSave);
    return () => window.removeEventListener('editor:save', handleSave);
  }, [isDirty, isSaving, saveDocument, loadDocuments]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty) {
          setShowSaveDialog(true);
        }
      }

      // Cmd/Ctrl + Z to undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
      }

      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y to redo
      if (((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') ||
          ((e.metaKey || e.ctrlKey) && e.key === 'y')) {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, canUndo, canRedo, undo, redo]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleCursorChange = (line: number, column: number) => {
    setCursorPosition({ line, column });
  };

  const renderEditor = () => {
    switch (mode) {
      case 'code':
        return (
          <CodeEditor
            content={content}
            language={language}
            onChange={handleContentChange}
            onCursorChange={handleCursorChange}
          />
        );

      case 'markdown':
        return (
          <MarkdownEditor
            content={content}
            onChange={handleContentChange}
            showPreview={true}
          />
        );

      case 'notes':
        return (
          <RichTextEditor content={content} onChange={handleContentChange} />
        );

      default:
        return <div className="editor-placeholder">Select an editor mode</div>;
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'notes':
        return 'Notes';
      case 'markdown':
        return 'Markdown';
      case 'code':
        return 'Code';
      default:
        return 'Select Type';
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'notes':
        return 'format_text_wrap';
      case 'markdown':
        return 'article';
      case 'code':
        return 'code';
      default:
        return 'description';
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    // Prevent removing immutable tags (mode names and author)
    const modes = ['notes', 'markdown', 'code'];
    const simpleAuthor = authorTag?.replace('author:', '');
    if (modes.includes(tagToRemove) || tagToRemove === simpleAuthor) {
      return;
    }
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const isImmutableTag = (tag: string) => {
    const modes = ['notes', 'markdown', 'code'];
    const simpleAuthor = authorTag?.replace('author:', '');
    return modes.includes(tag) || tag === simpleAuthor;
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async (metadata: SaveMetadata) => {
    try {
      // Update document metadata
      setTitle(metadata.title);
      setTags(metadata.tags);

      // Save document with metadata
      await saveDocument();

      // Commit to git with custom message
      try {
        await window.electronAPI.git.commit(metadata.commitMessage || `Update ${metadata.title}`);
        console.log('[Git] Committed changes:', metadata.commitMessage);
      } catch (error) {
        console.error('[Git] Commit failed:', error);
        // Continue even if git commit fails - document is still saved
      }

      // Reload documents AND tags to reflect changes immediately
      await loadDocuments();
      await useWorkspaceStore.getState().loadTags();

      // Close dialog
      setShowSaveDialog(false);
    } catch (error) {
      console.error('[Save] Save failed:', error);
      alert('Failed to save document: ' + (error as Error).message);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    console.log('[Template] Saving template:', templateName.trim());
    console.log('[Template] Mode:', mode);
    console.log('[Template] Language:', language);
    console.log('[Template] Content length:', content.length);
    console.log('[Template] Content preview (first 200 chars):', content.substring(0, 200));

    try {
      const result = await window.electronAPI.template.save(
        templateName.trim(),
        mode,
        language,
        content
      );

      console.log('[Template] Save result:', JSON.stringify(result, null, 2));

      if (result.success) {
        setShowTemplateDialog(false);
        setTemplateName('');
        console.log('[Template] Template saved successfully!');
        alert(`✓ Template "${templateName}" saved successfully!`);
      } else {
        console.error('[Template] Save failed:', result.error);
        alert(`Failed to save template: ${result.error}`);
      }
    } catch (error) {
      console.error('[Template] Exception during save:', error);
      alert('Failed to save template: ' + (error as Error).message);
    }
  };

  const handleAIInsert = (text: string) => {
    // Insert AI response at the end of the document
    let processedText = text;

    // For notes mode, convert newlines to HTML
    if (mode === 'notes') {
      // Convert markdown-style formatting to HTML if needed
      processedText = text
        .split('\n')
        .map(line => {
          if (!line.trim()) return '<br>';
          // Check if line starts with heading markers
          if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
          if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
          if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
          if (line.startsWith('**') && line.endsWith('**')) return `<strong>${line.substring(2, line.length - 2)}</strong><br>`;
          if (line.startsWith('- ')) return `<li>${line.substring(2)}</li>`;
          return `<p>${line}</p>`;
        })
        .join('');
    }

    const newContent = content + '\n\n' + processedText;
    setContent(newContent);
  };

  const handleAIReplace = (text: string) => {
    // Replace entire document with AI response
    let processedText = text;

    // For notes mode, convert newlines to HTML
    if (mode === 'notes') {
      processedText = text
        .split('\n')
        .map(line => {
          if (!line.trim()) return '<br>';
          if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
          if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
          if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
          if (line.startsWith('**') && line.endsWith('**')) return `<strong>${line.substring(2, line.length - 2)}</strong><br>`;
          if (line.startsWith('- ')) return `<li>${line.substring(2)}</li>`;
          return `<p>${line}</p>`;
        })
        .join('');
    }

    setContent(processedText);
  };

  const handleAIReplaceSelection = (text: string) => {
    // For selection mode, we need to replace the selected text in the content
    // Since we can't reliably manipulate DOM selection across different editors,
    // we'll use a simpler approach: insert the AI response at the end with context
    handleAIInsert(text);
  };

  // Calculate document statistics
  const getWordCount = () => {
    if (!content) return 0;
    const text = content.replace(/<[^>]*>/g, '').trim(); // Strip HTML tags
    if (!text) return 0;
    return text.split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharCount = () => {
    if (!content) return 0;
    const text = content.replace(/<[^>]*>/g, ''); // Strip HTML tags
    return text.length;
  };

  const getReadingTime = () => {
    const words = getWordCount();
    const minutes = Math.ceil(words / 200); // Average reading speed: 200 words/min
    return minutes;
  };

  const handleTranscribe = () => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isTranscribing) {
      // Stop transcription
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsTranscribing(false);
      return;
    }

    // Start transcription
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsTranscribing(true);
      console.log('[Speech] Started listening...');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        // Append final transcript to content
        const newContent = content + (content ? ' ' : '') + finalTranscript;
        setContent(newContent);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('[Speech] Error:', event.error);
      if (event.error === 'no-speech') {
        // Don't alert for no-speech, just restart
        if (recognitionRef.current && isTranscribing) {
          recognitionRef.current.start();
        }
        return;
      } else if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please enable microphone permissions in your browser settings.');
        setIsTranscribing(false);
      } else if (event.error === 'network') {
        alert('Network error: Speech recognition requires an internet connection. Please check your connection and try again.');
        setIsTranscribing(false);
      } else if (event.error === 'aborted') {
        // User stopped it, don't show error
        setIsTranscribing(false);
      } else {
        alert(`Speech recognition error: ${event.error}. Please try again.`);
        setIsTranscribing(false);
      }
    };

    recognition.onend = () => {
      setIsTranscribing(false);
      console.log('[Speech] Stopped listening.');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className={`editor-container ${zenMode ? 'zen-mode' : ''}`}>
      {zenMode && onExitZen && (
        <button className="zen-exit-button" onClick={onExitZen} title="Exit Zen Mode (Cmd/Ctrl+\)">
          <span className="material-symbols-rounded">close_fullscreen</span>
        </button>
      )}

      {!zenMode && (
        <div className="editor-header">
          <div className="header-main">
            <input
              type="text"
              className="document-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
            />

          <div className="tag-section">
            <div className="tag-input-container">
              <span className="material-symbols-rounded tag-icon">local_offer</span>
              <input
                type="text"
                className="tag-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add tags..."
              />
              {tagInput && (
                <button className="add-tag-button" onClick={handleAddTag}>
                  <span className="material-symbols-rounded">add</span>
                </button>
              )}
            </div>
            {tags.length > 0 && (
              <div className="tags-display">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`tag-chip ${isImmutableTag(tag) ? 'immutable' : ''}`}
                    title={isImmutableTag(tag) ? 'System tag (cannot be removed)' : ''}
                  >
                    {isImmutableTag(tag) && (
                      <span className="material-symbols-rounded tag-icon">lock</span>
                    )}
                    {tag}
                    {!isImmutableTag(tag) && (
                      <button className="tag-remove" onClick={() => handleRemoveTag(tag)}>
                        <span className="material-symbols-rounded">close</span>
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="header-actions">
          <div className="editor-actions-group">
            <button
              className="editor-action-btn"
              onClick={() => document.execCommand('cut')}
              title="Cut"
            >
              <span className="material-symbols-rounded">content_cut</span>
            </button>
            <button
              className="editor-action-btn"
              onClick={() => document.execCommand('copy')}
              title="Copy"
            >
              <span className="material-symbols-rounded">content_copy</span>
            </button>
            <button
              className="editor-action-btn"
              onClick={() => document.execCommand('paste')}
              title="Paste"
            >
              <span className="material-symbols-rounded">content_paste</span>
            </button>
          </div>

          <div className="header-divider"></div>

          <button
            className={`transcribe-button ${isTranscribing ? 'active' : ''}`}
            onClick={handleTranscribe}
            title={isTranscribing ? 'Stop Transcribing' : 'Start Speech-to-Text'}
          >
            <span className="material-symbols-rounded">
              {isTranscribing ? 'stop_circle' : 'mic'}
            </span>
            {isTranscribing && <span className="transcribe-text">Listening...</span>}
          </button>

          <div className="header-divider"></div>

          <button
            className="ai-button"
            onClick={() => setShowAIPrompt(true)}
            title="AI Assistant"
          >
            <span className="material-symbols-rounded">psychology</span>
            <span>AI</span>
          </button>

          <button
            className="ai-button"
            onClick={() => setShowExportDialog(true)}
            title="Export Document"
          >
            <span className="material-symbols-rounded">download</span>
            <span>Export</span>
          </button>

          <button
            className="template-button"
            onClick={() => setShowTemplateDialog(true)}
            title="Save as Template"
          >
            <span className="material-symbols-rounded">bookmark_add</span>
            <span>Template</span>
          </button>

          <div className="header-divider"></div>

          <div className="document-type-selector">
            <div className="type-display">
              <span className="material-symbols-rounded">{getModeIcon()}</span>
              <span>{getModeLabel()}</span>
            </div>
          </div>

          <div className="header-divider"></div>

          {isDirty && !isSaving && (
            <span className="save-status" title={autoSaveEnabled ? `Auto-save every ${autoSaveInterval / 1000}s` : 'Auto-save disabled'}>
              {autoSaveEnabled ? '●' : 'Unsaved'}
            </span>
          )}
          {isSaving && (
            <span className="save-status saving">Saving...</span>
          )}
          {!isDirty && !isSaving && (
            <span className="save-status saved" title="All changes saved">
              ✓ Saved
            </span>
          )}
        </div>
      </div>
      )}

      <div className="editor-content">{renderEditor()}</div>

      {/* Status Bar */}
      {!zenMode && (
        <div className="editor-status-bar">
        <div className="status-section">
          <span className="material-symbols-rounded status-icon">text_fields</span>
          <span className="status-label">{getWordCount().toLocaleString()} words</span>
        </div>
        <div className="status-divider"></div>
        <div className="status-section">
          <span className="material-symbols-rounded status-icon">notes</span>
          <span className="status-label">{getCharCount().toLocaleString()} characters</span>
        </div>
        <div className="status-divider"></div>
        <div className="status-section">
          <span className="material-symbols-rounded status-icon">schedule</span>
          <span className="status-label">{getReadingTime()} min read</span>
        </div>
        <div className="status-divider"></div>
        <div className="status-section">
          <span className="material-symbols-rounded status-icon">article</span>
          <span className="status-label">{getModeLabel()}</span>
        </div>
        {language !== 'plaintext' && mode === 'code' && (
          <>
            <div className="status-divider"></div>
            <div className="status-section">
              <span className="material-symbols-rounded status-icon">code</span>
              <span className="status-label">{language}</span>
            </div>
          </>
        )}
        </div>
      )}

      <SaveDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSave}
        currentTitle={title}
        currentTags={tags}
      />

      <AIPromptDialog
        isOpen={showAIPrompt}
        onClose={() => setShowAIPrompt(false)}
        onInsert={handleAIInsert}
        onReplace={handleAIReplace}
        onReplaceSelection={handleAIReplaceSelection}
        onOpenSettings={() => setShowSettings(true)}
      />

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        content={content}
        title={title}
        mode={mode}
      />

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Template Dialog */}
      {showTemplateDialog && (
        <div className="dialog-overlay" onClick={() => setShowTemplateDialog(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Save as Template</h2>
              <button className="dialog-close" onClick={() => setShowTemplateDialog(false)}>
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div className="dialog-body">
              <p>Save this {mode} document as a reusable template.</p>
              <div className="form-group">
                <label htmlFor="template-name">Template Name</label>
                <input
                  id="template-name"
                  type="text"
                  className="form-input"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="My Template"
                  autoFocus
                />
              </div>
            </div>
            <div className="dialog-footer">
              <button className="dialog-btn secondary" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </button>
              <button className="dialog-btn primary" onClick={handleSaveAsTemplate}>
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorContainer;
