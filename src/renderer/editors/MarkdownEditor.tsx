/**
 * Markdown Editor - Simple textarea-based markdown editor with preview
 */

import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import mermaid from 'mermaid';
import { useThemeStore } from '../store';
import './MarkdownEditor.css';

interface MarkdownEditorProps {
  content: string;
  onChange: (value: string) => void;
  showPreview?: boolean;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content,
  onChange,
  showPreview = false,
}) => {
  const { currentTheme } = useThemeStore();
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('split');
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: currentTheme.type === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
    });
  }, [currentTheme.type]);

  // Render mermaid diagrams after preview updates
  useEffect(() => {
    if (previewRef.current && (viewMode === 'preview' || viewMode === 'split')) {
      // Convert mermaid code blocks to mermaid divs
      const codeBlocks = previewRef.current.querySelectorAll('pre code.language-mermaid');
      codeBlocks.forEach((block) => {
        const pre = block.parentElement;
        if (pre && !pre.classList.contains('mermaid-processed')) {
          const mermaidCode = block.textContent || '';
          const mermaidDiv = document.createElement('div');
          mermaidDiv.className = 'mermaid';
          mermaidDiv.textContent = mermaidCode;
          pre.replaceWith(mermaidDiv);
          pre.classList.add('mermaid-processed');
        }
      });

      // Render all mermaid diagrams
      mermaid.run({
        querySelector: '.mermaid',
      }).catch((err) => {
        console.error('Mermaid rendering error:', err);
      });
    }
  }, [content, viewMode]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Insert markdown at cursor
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    onChange(newText);

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Markdown to HTML using marked
  const renderMarkdown = (markdown: string): string => {
    try {
      const html = marked.parse(markdown, {
        breaks: true,
        gfm: true,
      });
      // marked.parse returns a Promise in some versions, handle both cases
      if (typeof html === 'string') {
        return html;
      }
      return String(html);
    } catch (error) {
      console.error('Markdown rendering error:', error);
      return '<p>Error rendering markdown</p>';
    }
  };

  return (
    <div className="markdown-editor">
      <div className="markdown-toolbar">
        {/* View mode buttons */}
        <div className="toolbar-group">
          <button
            className={`toolbar-btn ${viewMode === 'edit' ? 'active' : ''}`}
            onClick={() => setViewMode('edit')}
            title="Edit only"
          >
            <span className="material-symbols-rounded">edit</span>
            Edit
          </button>
          <button
            className={`toolbar-btn ${viewMode === 'split' ? 'active' : ''}`}
            onClick={() => setViewMode('split')}
            title="Split view"
          >
            <span className="material-symbols-rounded">vertical_split</span>
            Split
          </button>
          <button
            className={`toolbar-btn ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setViewMode('preview')}
            title="Preview only"
          >
            <span className="material-symbols-rounded">visibility</span>
            Preview
          </button>
        </div>

        <div className="toolbar-divider"></div>

        {/* Formatting buttons */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn icon-only"
            onClick={() => insertMarkdown('**', '**')}
            title="Bold (Ctrl/Cmd+B)"
          >
            <span className="material-symbols-rounded">format_bold</span>
          </button>
          <button
            className="toolbar-btn icon-only"
            onClick={() => insertMarkdown('*', '*')}
            title="Italic (Ctrl/Cmd+I)"
          >
            <span className="material-symbols-rounded">format_italic</span>
          </button>
          <button
            className="toolbar-btn icon-only"
            onClick={() => insertMarkdown('~~', '~~')}
            title="Strikethrough"
          >
            <span className="material-symbols-rounded">strikethrough_s</span>
          </button>
          <button
            className="toolbar-btn icon-only"
            onClick={() => insertMarkdown('`', '`')}
            title="Inline Code"
          >
            <span className="material-symbols-rounded">code</span>
          </button>
        </div>

        <div className="toolbar-divider"></div>

        {/* Structure buttons */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn icon-only"
            onClick={() => insertMarkdown('# ', '')}
            title="Heading 1"
          >
            <span className="material-symbols-rounded">title</span>
          </button>
          <button
            className="toolbar-btn icon-only"
            onClick={() => insertMarkdown('- ', '')}
            title="Bullet List"
          >
            <span className="material-symbols-rounded">format_list_bulleted</span>
          </button>
          <button
            className="toolbar-btn icon-only"
            onClick={() => insertMarkdown('1. ', '')}
            title="Numbered List"
          >
            <span className="material-symbols-rounded">format_list_numbered</span>
          </button>
          <button
            className="toolbar-btn icon-only"
            onClick={() => insertMarkdown('- [ ] ', '')}
            title="Task List"
          >
            <span className="material-symbols-rounded">checklist</span>
          </button>
          <button
            className="toolbar-btn icon-only"
            onClick={() => insertMarkdown('> ', '')}
            title="Quote"
          >
            <span className="material-symbols-rounded">format_quote</span>
          </button>
        </div>

        <div className="toolbar-divider"></div>

        {/* Insert buttons */}
        <div className="toolbar-group">
          <button
            className="toolbar-btn icon-only"
            onClick={() => insertMarkdown('[', '](url)')}
            title="Insert Link"
          >
            <span className="material-symbols-rounded">link</span>
          </button>
          <button
            className="toolbar-btn icon-only"
            onClick={() => insertMarkdown('![alt text](', ')')}
            title="Insert Image"
          >
            <span className="material-symbols-rounded">image</span>
          </button>
          <button
            className="toolbar-btn icon-only"
            onClick={() => insertMarkdown('```\n', '\n```')}
            title="Code Block"
          >
            <span className="material-symbols-rounded">code_blocks</span>
          </button>
          <button
            className="toolbar-btn icon-only"
            onClick={() => insertMarkdown('| Column 1 | Column 2 |\n| -------- | -------- |\n| ', ' |')}
            title="Insert Table"
          >
            <span className="material-symbols-rounded">table</span>
          </button>
          <button
            className="toolbar-btn icon-only"
            onClick={() => insertMarkdown('```mermaid\ngraph TD\n  A[Start] --> B[End]\n', '\n```')}
            title="Mermaid Diagram"
          >
            <span className="material-symbols-rounded">account_tree</span>
          </button>
        </div>
      </div>

      <div className={`markdown-content ${viewMode}`}>
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="markdown-editor-pane">
            <textarea
              ref={textareaRef}
              className="markdown-editor-textarea"
              value={content}
              onChange={handleChange}
              placeholder="Start writing in markdown..."
              spellCheck={true}
              autoFocus
              style={{
                fontFamily: currentTheme.fonts.editor,
                backgroundColor: currentTheme.type === 'dark' ? '#1e1e1e' : '#ffffff',
                color: currentTheme.type === 'dark' ? '#d4d4d4' : '#24292f',
              }}
            />
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="markdown-preview-pane">
            <div
              ref={previewRef}
              className="markdown-preview"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content || '# Start writing...') }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
