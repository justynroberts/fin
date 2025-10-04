/**
 * AI Prompt Dialog - Send prompts to AI with document context
 */

import React, { useState, useEffect } from 'react';
import { useDocumentStore } from '../store';
import './AIPromptDialog.css';

interface AIPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
  onReplace: (text: string) => void;
  onReplaceSelection?: (text: string) => void;
  onOpenSettings?: () => void;
}

const PROMPT_HISTORY_KEY = 'ai-prompt-history';
const MAX_HISTORY_ITEMS = 10;

const AIPromptDialog: React.FC<AIPromptDialogProps> = ({ isOpen, onClose, onInsert, onReplace, onReplaceSelection, onOpenSettings }) => {
  const { path: documentPath, content, selection, mode, language } = useDocumentStore();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsSettings, setNeedsSettings] = useState(false);
  const [modifyMode, setModifyMode] = useState<'insert' | 'replace'>('replace');
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(true);

  // Load prompt history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROMPT_HISTORY_KEY);
      if (stored) {
        setPromptHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load prompt history:', err);
    }
  }, []);

  // Save prompt to history
  const saveToHistory = (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed) return;

    const newHistory = [
      trimmed,
      ...promptHistory.filter(p => p !== trimmed)
    ].slice(0, MAX_HISTORY_ITEMS);

    setPromptHistory(newHistory);
    try {
      localStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (err) {
      console.error('Failed to save prompt history:', err);
    }
  };

  // Select a prompt from history
  const selectFromHistory = (historicalPrompt: string) => {
    setPrompt(historicalPrompt);
    setShowHistory(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    if (!documentPath) {
      setError('No document open');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      // Add mode instruction to the prompt based on document type
      let modeInstruction = '';

      if (mode === 'code') {
        // For code mode, AI service already handles this
        modeInstruction = modifyMode === 'replace'
          ? 'IMPORTANT: Return ONLY the complete rewritten code. Do not add explanations or additional text.'
          : 'IMPORTANT: Return ONLY the new code to add. Do not repeat the existing code.';
      } else if (mode === 'markdown') {
        modeInstruction = modifyMode === 'replace'
          ? 'IMPORTANT: Return ONLY the complete rewritten Markdown content. Do not add explanations or additional text.'
          : 'IMPORTANT: Return ONLY the new Markdown content to add. Do not repeat the existing content.';
      } else {
        // Notes mode
        modeInstruction = modifyMode === 'replace'
          ? 'IMPORTANT: Return ONLY the complete rewritten document content. Do not add explanations or additional text. Format with proper paragraphs - separate each paragraph with TWO newlines (\\n\\n). Use <p> tags for HTML if needed.'
          : 'IMPORTANT: Return ONLY the new content to add. Do not repeat the existing document. Format with proper paragraphs - separate each paragraph with TWO newlines (\\n\\n). Use <p> tags for HTML if needed.';
      }

      const fullPrompt = `${modeInstruction}\n\n${prompt.trim()}`;

      let result = await window.electronAPI.ai.sendPrompt(
        documentPath,
        content,
        fullPrompt,
        mode,
        language
      );

      result = result.trim();

      // Clean up code mode - remove excessive spacing
      if (mode === 'code') {
        // Normalize multiple blank lines to single blank lines (max 2 newlines)
        result = result.replace(/\n{3,}/g, '\n\n');
      }

      // Only convert to HTML paragraphs for notes mode
      if (mode === 'notes' && !result.includes('<p>') && !result.includes('<div>')) {
        // Split by double newlines and wrap each paragraph in <p> tags
        const paragraphs = result.split(/\n\n+/).filter(p => p.trim());
        result = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
      }

      // Save prompt to history
      saveToHistory(prompt);

      // Automatically apply the result based on mode
      if (modifyMode === 'replace') {
        onReplace(result);
      } else {
        onInsert(result);
      }

      // Close dialog after applying
      setTimeout(() => {
        onClose();
        setPrompt('');
        setResponse('');
        setError(null);
        setModifyMode('insert');
      }, 200);
    } catch (err) {
      const errorMessage = (err as Error).message;

      // Friendlier error messages
      if (errorMessage.includes('API key not configured')) {
        setError('No API key configured. Click "Open Settings" below to add your API key.');
        setNeedsSettings(true);
      } else if (errorMessage.includes('401') || errorMessage.includes('authentication')) {
        setError('Your API key is invalid. Click "Open Settings" to update it.');
        setNeedsSettings(true);
      } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        setError('Rate limit exceeded. Please try again in a moment.');
        setNeedsSettings(false);
      } else if (errorMessage.includes('500') || errorMessage.includes('503')) {
        setError('AI service is temporarily unavailable. Please try again later.');
        setNeedsSettings(false);
      } else {
        setError(errorMessage);
        setNeedsSettings(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearMemory = async () => {
    if (!documentPath) return;

    if (confirm('Are you sure you want to clear the conversation memory for this document?')) {
      try {
        await window.electronAPI.ai.clearMemory(documentPath);
        alert('Memory cleared successfully');
      } catch (err) {
        alert('Failed to clear memory: ' + (err as Error).message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-prompt-overlay" onClick={onClose}>
      <div className="ai-prompt-content" onClick={(e) => e.stopPropagation()}>
        <div className="ai-prompt-header">
          <h2>
            <span className="material-symbols-rounded">psychology</span>
            AI Assistant
          </h2>
          <button className="ai-prompt-close" onClick={onClose}>
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <div className="ai-prompt-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Mode</label>
              <div className="mode-selector">
                <button
                  type="button"
                  className={`mode-btn ${modifyMode === 'insert' ? 'active' : ''}`}
                  onClick={() => setModifyMode('insert')}
                >
                  <span className="material-symbols-rounded">add</span>
                  Insert - Add AI content to end of document
                </button>
                <button
                  type="button"
                  className={`mode-btn ${modifyMode === 'replace' ? 'active' : ''}`}
                  onClick={() => setModifyMode('replace')}
                >
                  <span className="material-symbols-rounded">edit</span>
                  Replace - Rewrite entire document with AI
                </button>
              </div>
            </div>

            <div className="form-group">
              <div className="prompt-label-row">
                <label>Your Prompt</label>
                {promptHistory.length > 0 && (
                  <button
                    type="button"
                    className="history-toggle"
                    onClick={() => setShowHistory(!showHistory)}
                    title="Show prompt history"
                  >
                    <span className="material-symbols-rounded">history</span>
                    Recent Prompts
                  </button>
                )}
              </div>

              {showHistory && promptHistory.length > 0 && (
                <div className="prompt-history-dropdown">
                  {promptHistory.map((historyItem, index) => (
                    <button
                      key={index}
                      type="button"
                      className="history-item"
                      onClick={() => selectFromHistory(historyItem)}
                    >
                      <span className="material-symbols-rounded">history</span>
                      <span className="history-text">{historyItem}</span>
                    </button>
                  ))}
                </div>
              )}

              <textarea
                className="ai-prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  modifyMode === 'replace'
                    ? 'e.g., "Make this more professional", "Fix all grammar and spelling", "Simplify the language"'
                    : 'e.g., "Add a conclusion", "Expand on the main points", "Add 3 examples"'
                }
                rows={4}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="ai-error">
                <span className="material-symbols-rounded">error</span>
                <div className="ai-error-content">
                  <div>{error}</div>
                  {needsSettings && onOpenSettings && (
                    <button
                      type="button"
                      className="ai-btn primary"
                      onClick={() => {
                        onClose();
                        onOpenSettings();
                      }}
                      style={{ marginTop: '12px' }}
                    >
                      <span className="material-symbols-rounded">settings</span>
                      Open Settings
                    </button>
                  )}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="ai-loading">
                <span className="material-symbols-rounded rotating">progress_activity</span>
                Processing and applying changes...
              </div>
            )}

            <div className="ai-prompt-actions">
              <button
                type="button"
                className="ai-btn secondary"
                onClick={handleClearMemory}
                disabled={isLoading}
              >
                <span className="material-symbols-rounded">delete</span>
                Clear Memory
              </button>
              <div className="ai-actions-right">
                <button
                  type="button"
                  className="ai-btn secondary"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ai-btn primary"
                  disabled={isLoading || !prompt.trim()}
                >
                  <span className={`material-symbols-rounded ${isLoading ? 'rotating' : ''}`}>
                    {isLoading ? 'progress_activity' : modifyMode === 'replace' ? 'edit' : 'add'}
                  </span>
                  {isLoading ? 'Processing...' : modifyMode === 'replace' ? 'Replace Document' : 'Add Content'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIPromptDialog;
