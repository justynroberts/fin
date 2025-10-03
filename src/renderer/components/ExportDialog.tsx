/**
 * Export Dialog - Export documents to various formats
 */

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import './ExportDialog.css';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title: string;
  mode: 'notes' | 'markdown' | 'code';
}

type ExportFormat = 'md' | 'pdf' | 'docx' | 'txt' | 'html';

const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose, content, title, mode }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const filename = `${title || 'document'}.${selectedFormat}`;

      switch (selectedFormat) {
        case 'md':
          await exportMarkdown(content, filename);
          break;
        case 'pdf':
          await exportPDF(content, title, mode);
          break;
        case 'docx':
          await exportDOCX(content, filename, mode);
          break;
        case 'txt':
          await exportText(content, filename);
          break;
        case 'html':
          await exportHTML(content, filename, mode);
          break;
      }

      setTimeout(() => {
        onClose();
        setIsExporting(false);
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${(error as Error).message}`);
      setIsExporting(false);
    }
  };

  const exportMarkdown = async (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/markdown' });
    downloadBlob(blob, filename);
  };

  const exportText = async (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    downloadBlob(blob, filename);
  };

  const exportHTML = async (text: string, filename: string, docMode: string) => {
    let html = '';

    if (docMode === 'markdown') {
      html = marked.parse(text) as string;
    } else if (docMode === 'notes') {
      // Rich text is already HTML
      html = text;
    } else {
      // Code mode - wrap in pre/code tags
      html = `<pre><code>${text}</code></pre>`;
    }

    const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title || 'Document'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
    }
    pre { background: #f5f5f5; padding: 16px; border-radius: 4px; overflow-x: auto; }
    code { font-family: 'Courier New', monospace; }
  </style>
</head>
<body>
${html}
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html' });
    downloadBlob(blob, filename);
  };

  const exportPDF = async (text: string, docTitle: string, docMode: string) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);

    // Title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(docTitle || 'Document', margin, 20);

    // Content
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    let plainText = text;
    if (docMode === 'markdown') {
      // Convert markdown to plain text (strip formatting)
      plainText = text
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/`(.+?)`/g, '$1');
    } else if (docMode === 'notes') {
      // Strip HTML tags but preserve paragraph breaks
      plainText = text
        .replace(/<\/p>/g, '\n\n')  // Convert closing p tags to double newline
        .replace(/<br\s*\/?>/g, '\n')  // Convert br tags to single newline
        .replace(/<[^>]*>/g, '')  // Remove all other HTML tags
        .replace(/\n{3,}/g, '\n\n')  // Normalize multiple newlines to double
        .trim();
    }

    const lines = pdf.splitTextToSize(plainText, maxWidth);
    pdf.text(lines, margin, 35);

    pdf.save(`${docTitle || 'document'}.pdf`);
  };

  const exportDOCX = async (text: string, filename: string, docMode: string) => {
    let html = '';

    if (docMode === 'markdown') {
      html = marked.parse(text) as string;
    } else if (docMode === 'notes') {
      html = text;
    } else {
      html = `<pre>${text}</pre>`;
    }

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
${html}
</body>
</html>`;

    // Use html-docx-js
    const converted = (window as any).htmlDocx.asBlob(htmlContent);
    downloadBlob(converted, filename);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="export-overlay" onClick={onClose}>
      <div className="export-content" onClick={(e) => e.stopPropagation()}>
        <div className="export-header">
          <h2>
            <span className="material-symbols-rounded">download</span>
            Export Document
          </h2>
          <button className="export-close" onClick={onClose}>
            <span className="material-symbols-rounded">close</span>
          </button>
        </div>

        <div className="export-body">
          <p className="export-description">
            Choose a format to export your document
          </p>

          <div className="export-formats">
            <button
              className={`format-option ${selectedFormat === 'pdf' ? 'selected' : ''}`}
              onClick={() => setSelectedFormat('pdf')}
            >
              <span className="material-symbols-rounded">picture_as_pdf</span>
              <div className="format-info">
                <span className="format-name">PDF</span>
                <span className="format-desc">Portable Document Format</span>
              </div>
            </button>

            <button
              className={`format-option ${selectedFormat === 'docx' ? 'selected' : ''}`}
              onClick={() => setSelectedFormat('docx')}
            >
              <span className="material-symbols-rounded">description</span>
              <div className="format-info">
                <span className="format-name">Word Document</span>
                <span className="format-desc">Microsoft Word (.docx)</span>
              </div>
            </button>

            <button
              className={`format-option ${selectedFormat === 'md' ? 'selected' : ''}`}
              onClick={() => setSelectedFormat('md')}
            >
              <span className="material-symbols-rounded">article</span>
              <div className="format-info">
                <span className="format-name">Markdown</span>
                <span className="format-desc">Plain text with formatting (.md)</span>
              </div>
            </button>

            <button
              className={`format-option ${selectedFormat === 'html' ? 'selected' : ''}`}
              onClick={() => setSelectedFormat('html')}
            >
              <span className="material-symbols-rounded">code</span>
              <div className="format-info">
                <span className="format-name">HTML</span>
                <span className="format-desc">Web page format (.html)</span>
              </div>
            </button>

            <button
              className={`format-option ${selectedFormat === 'txt' ? 'selected' : ''}`}
              onClick={() => setSelectedFormat('txt')}
            >
              <span className="material-symbols-rounded">text_snippet</span>
              <div className="format-info">
                <span className="format-name">Plain Text</span>
                <span className="format-desc">Simple text file (.txt)</span>
              </div>
            </button>
          </div>
        </div>

        <div className="export-footer">
          <button className="export-btn secondary" onClick={onClose} disabled={isExporting}>
            Cancel
          </button>
          <button className="export-btn primary" onClick={handleExport} disabled={isExporting}>
            <span className="material-symbols-rounded">
              {isExporting ? 'progress_activity' : 'download'}
            </span>
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;
