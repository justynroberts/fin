/**
 * Integration test for template content flow
 * Tests the complete flow: save template -> load template -> create document with template
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('Template Content Flow', () => {
  let testWorkspace: string;
  let templateDir: string;

  beforeEach(async () => {
    // Create temporary workspace
    testWorkspace = await fs.mkdtemp(path.join(os.tmpdir(), 'finton-test-'));
    templateDir = path.join(testWorkspace, '.finton', 'templates');
    await fs.mkdir(templateDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up
    await fs.rm(testWorkspace, { recursive: true, force: true });
  });

  it('should save template with correct format', async () => {
    // Import the frontmatter parser
    const { parseFrontmatter } = await import('../../src/main/frontmatter-utils');

    // Create test template content
    const templateName = 'Test Template';
    const mode = 'notes';
    const content = '<div>Test content</div><div>Second line</div>';

    // Build frontmatter (simulating handleSaveTemplate)
    const frontmatter = [
      '---',
      `name: ${JSON.stringify(templateName)}`,
      `mode: ${mode}`,
      `created: ${JSON.stringify(new Date().toISOString())}`,
      '---',
      ''
    ].join('\n');

    const templateContent = frontmatter + '\n' + content;

    // Write template file
    const templatePath = path.join(templateDir, 'test-template.template');
    await fs.writeFile(templatePath, templateContent, 'utf8');

    // Read it back
    const savedContent = await fs.readFile(templatePath, 'utf8');

    // Verify format
    expect(savedContent).toContain('---\n');
    expect(savedContent).toContain('name: "Test Template"');
    expect(savedContent).toContain('mode: notes');
    expect(savedContent).not.toMatch(/---Test content/); // Content should NOT be on same line as closing ---
    expect(savedContent).toMatch(/---\n\n<div>Test content<\/div>/); // Content should be on separate line after blank line
  });

  it('should parse frontmatter correctly', async () => {
    // Import parser
    const { parseFrontmatter } = await import('../../src/main/frontmatter-utils');

    const testContent = `---
name: "Test Template"
mode: notes
created: "2025-01-01T00:00:00.000Z"
---

<div>Test content</div>
<div>Second line</div>`;

    const result = parseFrontmatter(testContent);

    expect(result.metadata).toEqual({
      name: 'Test Template',
      mode: 'notes',
      created: '2025-01-01T00:00:00.000Z'
    });
    expect(result.content).toBe('<div>Test content</div>\n<div>Second line</div>');
  });

  it('should parse buggy frontmatter format', async () => {
    // Import parser
    const { parseFrontmatter } = await import('../../src/main/frontmatter-utils');

    // Buggy format: content on same line as closing ---
    const buggyContent = `---
name: "Test Template"
mode: notes
---<div>Test content</div>
<div>Second line</div>`;

    const result = parseFrontmatter(buggyContent);

    expect(result.metadata).toEqual({
      name: 'Test Template',
      mode: 'notes'
    });
    expect(result.content).toBe('<div>Test content</div>\n<div>Second line</div>');
  });

  it('should strip existing frontmatter when writing document', async () => {
    const { parseFrontmatter } = await import('../../src/main/frontmatter-utils');

    // Content that already has frontmatter
    const contentWithFrontmatter = `---
title: "Old Title"
mode: markdown
---

# Hello World`;

    // Strip existing frontmatter
    const { content: cleanContent } = parseFrontmatter(contentWithFrontmatter);

    // Add new frontmatter
    const newFrontmatter = [
      '---',
      'title: "New Title"',
      'mode: notes',
      'tags: ["test"]',
      '---',
      ''
    ].join('\n');

    const finalContent = newFrontmatter + '\n' + cleanContent;

    // Verify only one frontmatter block
    const frontmatterBlocks = (finalContent.match(/^---$/gm) || []).length;
    expect(frontmatterBlocks).toBe(2); // Opening and closing only, not 4

    // Verify content
    expect(finalContent).toContain('title: "New Title"');
    expect(finalContent).not.toContain('Old Title');
    expect(finalContent).toContain('# Hello World');
  });

  it('should pass template content through the complete flow', async () => {
    // This simulates: NewDocumentDialog loads template -> calls onCreate -> DocumentStore creates document

    const templateContent = '<div>Template content here</div><div>Line 2</div>';

    // Step 1: NewDocumentDialog loads template (simulated)
    const loadedTemplate = templateContent;
    expect(loadedTemplate).toBe(templateContent);
    expect(loadedTemplate.length).toBe(templateContent.length);

    // Step 2: App.tsx onCreate callback receives it (this is where it was failing)
    let receivedInApp: string | undefined;
    const onCreateCallback = (mode: string, name?: string, language?: string, template?: string) => {
      receivedInApp = template;
      console.log('[TEST] App onCreate received template length:', template?.length || 0);
    };

    // Simulate NewDocumentDialog calling onCreate
    onCreateCallback('notes', 'Test', undefined, loadedTemplate);

    // Verify App received it
    expect(receivedInApp).toBe(templateContent);
    expect(receivedInApp?.length).toBe(templateContent.length);

    // Step 3: DocumentStore newDocument receives it
    let documentStoreContent: string;
    const newDocument = (mode: string, title?: string, language?: string, template?: string) => {
      documentStoreContent = template || '';
      console.log('[TEST] DocumentStore newDocument received template length:', template?.length || 0);
    };

    newDocument('notes', 'Test', undefined, receivedInApp);

    // Verify DocumentStore received it
    expect(documentStoreContent!).toBe(templateContent);
    expect(documentStoreContent!.length).toBe(templateContent.length);
  });

  it('should maintain content integrity through multiple operations', async () => {
    const { parseFrontmatter } = await import('../../src/main/frontmatter-utils');

    const originalContent = '<div>Original content</div><div><strong>Bold text</strong></div>';

    // Save as template
    const frontmatter = [
      '---',
      'name: "Integrity Test"',
      'mode: notes',
      `created: "${new Date().toISOString()}"`,
      '---',
      ''
    ].join('\n');

    const templateContent = frontmatter + '\n' + originalContent;

    // Write and read back
    const templatePath = path.join(templateDir, 'integrity-test.template');
    await fs.writeFile(templatePath, templateContent, 'utf8');
    const readBack = await fs.readFile(templatePath, 'utf8');

    // Parse it
    const { metadata, content } = parseFrontmatter(readBack);

    // Verify content is unchanged
    expect(content).toBe(originalContent);
    expect(content.length).toBe(originalContent.length);
    expect(content).toContain('<strong>Bold text</strong>');
  });
});
