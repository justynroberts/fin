/**
 * Shared frontmatter parsing utilities
 * Used by both main process and tests
 */

/**
 * Parse frontmatter from file content
 * Handles both correct format (--- on separate line) and buggy format (content on same line as ---)
 */
export function parseFrontmatter(content: string): { metadata: any; content: string } {
  // Trim any leading whitespace/BOM
  const trimmedContent = content.trim();

  if (!trimmedContent.startsWith('---')) {
    return { metadata: {}, content };
  }

  // Find the closing --- (on its own line OR at the start of a line)
  const lines = trimmedContent.split('\n');
  let endLine = -1;
  let hasContentOnClosingLine = false;

  // Start from line 1 (skip opening ---)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '---') {
      // Perfect: closing --- on its own line
      endLine = i;
      break;
    } else if (line.trim().startsWith('---')) {
      // Buggy format: content on same line as closing ---
      endLine = i;
      hasContentOnClosingLine = true;
      break;
    }
  }

  if (endLine === -1) {
    // No closing ---, return original content
    return { metadata: {}, content };
  }

  // Extract frontmatter lines (between the --- markers)
  const frontmatterLines = lines.slice(1, endLine);

  // Parse frontmatter (simple key: value format)
  const metadata: any = {};
  for (const line of frontmatterLines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      try {
        metadata[key] = JSON.parse(value);
      } catch {
        metadata[key] = value;
      }
    }
  }

  // Extract content after frontmatter
  let actualContent = '';

  if (hasContentOnClosingLine) {
    // Buggy format: content is on the same line as closing ---
    const closingLine = lines[endLine];
    const contentOnClosingLine = closingLine.substring(closingLine.indexOf('---') + 3).trim();
    const contentAfterClosingLine = lines.slice(endLine + 1).join('\n').trim();

    if (contentOnClosingLine && contentAfterClosingLine) {
      actualContent = contentOnClosingLine + '\n' + contentAfterClosingLine;
    } else if (contentOnClosingLine) {
      actualContent = contentOnClosingLine;
    } else {
      actualContent = contentAfterClosingLine;
    }
  } else {
    // Correct format: content is on lines after closing ---
    const contentLines = lines.slice(endLine + 1);
    actualContent = contentLines.join('\n').trim();
  }

  return { metadata, content: actualContent };
}
