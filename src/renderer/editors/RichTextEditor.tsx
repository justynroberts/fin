/**
 * Rich Text Editor - ContentEditable-based rich text editor
 * (Simplified version - full Slate.js implementation will be added later)
 */

import React, { useRef, useEffect, useState } from 'react';
import './RichTextEditor.css';

interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Inter');
  const isUpdatingRef = useRef(false);

  // Sync content from store to editor (for AI updates, etc.)
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      const currentHTML = editorRef.current.innerHTML;
      const normalizedCurrent = currentHTML.replace(/\s+/g, ' ').trim();
      const normalizedContent = content.replace(/\s+/g, ' ').trim();

      // Only update if content is actually different (normalize whitespace for comparison)
      if (normalizedCurrent !== normalizedContent) {
        const selection = window.getSelection();
        const hadFocus = document.activeElement === editorRef.current;
        let savedRange: Range | null = null;

        // Save cursor position if editor is focused
        if (hadFocus && selection && selection.rangeCount > 0) {
          savedRange = selection.getRangeAt(0).cloneRange();
        }

        // Update content
        editorRef.current.innerHTML = content;

        // Restore cursor position if possible
        if (hadFocus && savedRange) {
          try {
            selection?.removeAllRanges();
            selection?.addRange(savedRange);
            editorRef.current.focus();
          } catch (e) {
            // Cursor restoration failed, just focus the editor
            editorRef.current.focus();
          }
        }
      }
    }
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      onChange(editorRef.current.innerHTML);
      // Reset flag after a short delay to allow the update to propagate
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  };

  const convertMarkdownTableToHTML = (text: string): string | null => {
    // Check if text contains markdown table syntax
    const lines = text.trim().split('\n');
    if (lines.length < 2) return null;

    // Check for table pattern (must have | characters)
    const hasTableMarkers = lines.every(line => line.includes('|'));
    if (!hasTableMarkers) return null;

    // Find separator line (contains dashes and pipes, like |-----|-----|)
    const separatorIndex = lines.findIndex(line => {
      const cleaned = line.trim();
      // Must start and optionally end with |, contain at least one dash between pipes
      return /^\|?[\s:-]+\|[\s|:-]*\|?$/.test(cleaned) && cleaned.includes('-');
    });

    if (separatorIndex === -1) return null;

    const headerRows = lines.slice(0, separatorIndex);
    const bodyRows = lines.slice(separatorIndex + 1);

    if (headerRows.length === 0) return null;

    // Parse rows
    const parseRow = (row: string) => {
      return row
        .split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);
    };

    const headers = parseRow(headerRows[0]);
    const rows = bodyRows.map(parseRow).filter(row => row.length > 0);

    if (headers.length === 0) return null;

    // Build HTML table
    let html = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';

    // Header
    html += '<thead><tr>';
    headers.forEach(header => {
      html += `<th style="padding: 8px; border: 1px solid #444; background: rgba(255,255,255,0.05); text-align: left; font-weight: 600;">${header}</th>`;
    });
    html += '</tr></thead>';

    // Body
    html += '<tbody>';
    rows.forEach(row => {
      html += '<tr>';
      row.forEach(cell => {
        html += `<td style="padding: 8px; border: 1px solid #444;">${cell}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';

    return html;
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');

    // Try to convert markdown table
    const tableHTML = convertMarkdownTableToHTML(text);
    if (tableHTML) {
      document.execCommand('insertHTML', false, tableHTML);
    } else {
      document.execCommand('insertText', false, text);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    if (editorRef.current) {
      editorRef.current.style.fontFamily = font;
    }
  };

  const fonts = [
    { name: 'Inter', label: 'Inter (Sans-serif)' },
    { name: 'Merriweather', label: 'Merriweather (Serif)' },
    { name: 'Lora', label: 'Lora (Serif)' },
    { name: 'Playfair Display', label: 'Playfair Display (Serif)' },
    { name: 'Source Serif Pro', label: 'Source Serif Pro (Serif)' },
    { name: 'Crimson Text', label: 'Crimson Text (Serif)' },
    { name: 'Libre Baskerville', label: 'Libre Baskerville (Serif)' },
    { name: 'Georgia', label: 'Georgia (System Serif)' },
  ];

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar">
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => execCommand('bold')}
            title="Bold (Cmd+B)"
          >
            <span className="material-symbols-rounded">format_bold</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('italic')}
            title="Italic (Cmd+I)"
          >
            <span className="material-symbols-rounded">format_italic</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('underline')}
            title="Underline (Cmd+U)"
          >
            <span className="material-symbols-rounded">format_underlined</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('strikeThrough')}
            title="Strikethrough"
          >
            <span className="material-symbols-rounded">strikethrough_s</span>
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => execCommand('formatBlock', '<h1>')}
            title="Heading 1"
          >
            <span className="material-symbols-rounded">title</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('formatBlock', '<h2>')}
            title="Heading 2"
          >
            <span className="material-symbols-rounded">format_h2</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('formatBlock', '<h3>')}
            title="Heading 3"
          >
            <span className="material-symbols-rounded">format_h3</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('formatBlock', '<p>')}
            title="Paragraph"
          >
            <span className="material-symbols-rounded">format_paragraph</span>
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => execCommand('insertUnorderedList')}
            title="Bullet List"
          >
            <span className="material-symbols-rounded">format_list_bulleted</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('insertOrderedList')}
            title="Numbered List"
          >
            <span className="material-symbols-rounded">format_list_numbered</span>
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => execCommand('justifyLeft')}
            title="Align Left"
          >
            <span className="material-symbols-rounded">format_align_left</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('justifyCenter')}
            title="Align Center"
          >
            <span className="material-symbols-rounded">format_align_center</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('justifyRight')}
            title="Align Right"
          >
            <span className="material-symbols-rounded">format_align_right</span>
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url) execCommand('createLink', url);
            }}
            title="Insert Link"
          >
            <span className="material-symbols-rounded">link</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => execCommand('unlink')}
            title="Remove Link"
          >
            <span className="material-symbols-rounded">link_off</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => {
              const rows = prompt('Number of rows:', '3');
              const cols = prompt('Number of columns:', '3');
              if (rows && cols) {
                const r = parseInt(rows);
                const c = parseInt(cols);
                let table = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;"><tbody>';
                for (let i = 0; i < r; i++) {
                  table += '<tr>';
                  for (let j = 0; j < c; j++) {
                    table += `<td style="padding: 8px; border: 1px solid var(--color-border); min-width: 100px;">${i === 0 ? 'Header' : 'Cell'}</td>`;
                  }
                  table += '</tr>';
                }
                table += '</tbody></table>';
                document.execCommand('insertHTML', false, table);
              }
            }}
            title="Insert Table"
          >
            <span className="material-symbols-rounded">table</span>
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <select
            className="font-selector"
            value={selectedFont}
            onChange={(e) => handleFontChange(e.target.value)}
            title="Select Font"
          >
            {fonts.map((font) => (
              <option key={font.name} value={font.name}>
                {font.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        ref={editorRef}
        className={`rich-text-content ${isFocused ? 'focused' : ''}`}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        suppressContentEditableWarning
        style={{ fontFamily: selectedFont }}
      />
    </div>
  );
};

export default RichTextEditor;
