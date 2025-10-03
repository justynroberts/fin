# FintonText - Testing Strategy

## Testing Philosophy

Quality over speed means:
1. Test-driven development where appropriate
2. Tests written alongside features, not after
3. Real-world scenario testing, not just happy paths
4. Performance testing from day one
5. Accessibility testing integrated into workflow

## Testing Pyramid

```
           /\
          /E2E\         10% - Critical user flows
         /------\
        /  Inte- \      30% - Feature integration
       /  gration \
      /------------\
     /    Unit      \   60% - Business logic, utilities
    /________________\
```

## Unit Testing

### Scope
- Pure functions and utilities
- State management (stores)
- Conversion logic
- Parsers and serializers
- Theme engine
- Macro engine core logic

### Tools
- **Framework**: Vitest
- **Assertions**: Vitest built-in + custom matchers
- **Mocking**: Vitest mocks
- **Coverage**: c8/V8 coverage

### Standards
- **Coverage Target**: >85% for utilities
- **Test Naming**: `describe('functionName', () => { it('should behavior when condition', ...) })`
- **Isolation**: Each test independent
- **Speed**: <5ms average per test

### Example Test Structure
```typescript
describe('convertRichTextToMarkdown', () => {
  it('should convert bold text to markdown syntax', () => {
    const richText = createBoldNode('Hello');
    const markdown = convertRichTextToMarkdown(richText);
    expect(markdown).toBe('**Hello**');
  });

  it('should handle nested formatting correctly', () => {
    // Test nested bold + italic
  });

  it('should preserve whitespace', () => {
    // Test whitespace handling
  });

  it('should handle empty input', () => {
    // Edge case
  });

  it('should handle malformed input gracefully', () => {
    // Error case
  });
});
```

## Component Testing

### Scope
- React components in isolation
- User interactions
- Component state
- Accessibility features
- Visual rendering

### Tools
- **Framework**: React Testing Library
- **User Simulation**: @testing-library/user-event
- **Accessibility**: jest-axe / vitest-axe
- **Snapshot Testing**: For UI regression

### Standards
- **Coverage Target**: >80% for components
- **User-Centric**: Test from user perspective, not implementation
- **Accessibility**: Every component tested with axe
- **No Implementation Details**: Test behavior, not internal state

### Example Test Structure
```typescript
describe('RichTextToolbar', () => {
  it('should render all formatting buttons', () => {
    render(<RichTextToolbar />);
    expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /italic/i })).toBeInTheDocument();
  });

  it('should toggle bold formatting on click', async () => {
    const user = userEvent.setup();
    const onFormat = vi.fn();
    render(<RichTextToolbar onFormat={onFormat} />);

    await user.click(screen.getByRole('button', { name: /bold/i }));
    expect(onFormat).toHaveBeenCalledWith('bold', true);
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<RichTextToolbar />);

    await user.tab();
    expect(screen.getByRole('button', { name: /bold/i })).toHaveFocus();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<RichTextToolbar />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Integration Testing

### Scope
- Feature workflows (e.g., create → edit → save)
- Mode switching with data preservation
- Theme application across components
- Macro recording and playback
- Export pipeline
- IPC communication (main ↔ renderer)

### Tools
- **Framework**: Vitest + React Testing Library
- **Electron**: @electron/testing
- **Mocking**: MSW for API mocks (if any)

### Standards
- **Coverage Target**: >70% of integration paths
- **Realistic Data**: Use real document samples
- **State Verification**: Check state consistency after operations
- **Error Scenarios**: Test failure modes

### Example Test Structure
```typescript
describe('Document Mode Switching', () => {
  it('should preserve content when switching from rich text to markdown', async () => {
    const { store } = renderWithStore(<App />);

    // Create rich text document
    await createDocument('rich-text');
    await typeText('**Bold** and *italic*');

    // Switch to markdown mode
    await switchMode('markdown');

    // Verify conversion
    const content = store.getState().document.content;
    expect(content).toContain('**Bold**');
    expect(content).toContain('*italic*');
  });

  it('should handle conversion errors gracefully', async () => {
    // Test error handling in conversion
  });
});
```

## End-to-End Testing

### Scope
- Critical user journeys
- Multi-window scenarios
- File system operations
- Cross-platform behavior
- Performance benchmarks

### Tools
- **Framework**: Playwright
- **Electron**: Playwright + Electron support
- **Visual Regression**: Percy or Playwright screenshots
- **Performance**: Lighthouse CI

### Critical Paths
1. **New User Flow**: Launch → Create document → Type → Format → Save → Export
2. **Macro Creation**: Record → Edit → Save → Execute
3. **Theme Change**: Select theme → Verify UI update → Verify editor update
4. **Mode Switching**: Rich text → Markdown → Code → Back to rich text
5. **File Operations**: New → Save → Close → Open → Edit → Save As
6. **Multi-Document**: Open multiple files → Switch tabs → Edit each → Save all

### Standards
- **Coverage**: All critical paths tested
- **Real Environment**: Test on actual Electron builds
- **Performance Budgets**: Verify against targets
- **Cross-Platform**: Run on macOS, Windows, Linux

### Example Test Structure
```typescript
test('complete document workflow', async ({ electronApp }) => {
  const window = await electronApp.firstWindow();

  // Create new document
  await window.click('[data-testid="new-document"]');

  // Switch to rich text mode
  await window.click('[data-testid="mode-richtext"]');

  // Type and format
  await window.fill('[data-testid="editor"]', 'Hello World');
  await window.selectText('Hello');
  await window.click('[data-testid="bold-button"]');

  // Verify formatting
  const content = await window.textContent('[data-testid="editor"]');
  expect(content).toContain('Hello World');

  // Save document
  await window.click('[data-testid="save"]');
  await window.fill('[data-testid="filename"]', 'test-doc.html');
  await window.click('[data-testid="save-confirm"]');

  // Verify save success
  await expect(window.locator('[data-testid="status"]')).toHaveText('Saved');
});
```

## Performance Testing

### Metrics to Track
1. **Startup Time**: App launch to ready state
2. **Editor Responsiveness**: Input latency, typing jank
3. **Mode Switching**: Time to switch and render
4. **File Operations**: Load, save, export times
5. **Memory Usage**: Baseline and after operations
6. **CPU Usage**: During typing, mode switch, export

### Tools
- **Profiling**: Chrome DevTools, React Profiler
- **Benchmarking**: Vitest bench, Benchmark.js
- **Monitoring**: Electron performance APIs
- **CI Integration**: Performance regression detection

### Performance Tests
```typescript
bench('Rich text to markdown conversion (1000 nodes)', () => {
  const richText = generateLargeRichTextDocument(1000);
  convertRichTextToMarkdown(richText);
});

bench('Type 100 characters in code mode', async () => {
  const editor = createCodeEditor();
  for (let i = 0; i < 100; i++) {
    await editor.type('a');
  }
});

bench('Switch mode with large document', async () => {
  const document = loadLargeDocument();
  await switchMode('markdown');
});
```

### Performance Budgets
- Startup: <3s (cold), <1s (warm)
- Typing latency: <16ms (p95)
- Mode switch: <100ms (p95)
- File save: <200ms for 1MB
- Export PDF: <5s for 10-page document
- Memory: <300MB for typical usage

## Visual Regression Testing

### Scope
- UI component rendering
- Theme application
- Cross-platform consistency
- Responsive behavior (if applicable)

### Tools
- **Framework**: Playwright screenshots
- **Comparison**: pixelmatch or Percy
- **Baseline**: Golden images stored in repo

### Test Cases
- All toolbar states (default, hover, active, disabled)
- Editor modes (rich text, markdown, code)
- All themes applied to sample document
- Dialogs and modals
- Error states and alerts

## Accessibility Testing

### Automated Testing
- **Tool**: axe-core via vitest-axe
- **Frequency**: Every component test
- **Standards**: WCAG 2.1 AA

### Manual Testing
- **Keyboard Navigation**: Tab through all UI, verify focus order
- **Screen Reader**: Test with VoiceOver (macOS), NVDA (Windows)
- **Contrast**: Verify all themes meet 4.5:1 ratio
- **Magnification**: Test at 200% zoom

### Accessibility Checklist
- [ ] All interactive elements keyboard accessible
- [ ] Proper ARIA labels on all controls
- [ ] Focus indicators visible
- [ ] Screen reader announces state changes
- [ ] Color not sole indicator of state
- [ ] Text resizable without breaking layout
- [ ] No keyboard traps
- [ ] Logical tab order

## Security Testing

### Scope
- IPC message validation
- File path traversal prevention
- Content Security Policy
- Macro sandboxing
- Input sanitization

### Tools
- **Static Analysis**: ESLint security plugins
- **Dependency Scanning**: npm audit, Snyk
- **Manual Review**: Code review with security checklist

### Test Cases
- Attempt path traversal in file operations
- Send malformed IPC messages
- Execute macro with excessive resource usage
- Inject scripts via rich text mode
- Load malicious themes

## Testing Workflow

### Development Phase
1. Write failing test
2. Implement feature
3. Make test pass
4. Refactor
5. Run full test suite
6. Check coverage

### Pre-Commit
- Run unit tests for changed files
- Run linter
- Run type checker
- Format code

### CI Pipeline
1. Lint and type check
2. Unit tests (all platforms)
3. Component tests
4. Integration tests
5. E2E tests (critical paths)
6. Performance benchmarks
7. Accessibility audit
8. Security scan
9. Build for all platforms
10. Visual regression tests

### Release Testing
- Full E2E suite on all platforms
- Performance regression check
- Manual smoke test
- Accessibility audit
- Security review
- Installation test on clean systems

## Test Data Management

### Sample Documents
Create representative test documents:
- Small: <100 lines
- Medium: 100-1,000 lines
- Large: 1,000-10,000 lines
- Very Large: 10,000+ lines

### Test Content
- Plain text
- Rich formatting
- Code samples (various languages)
- Markdown with all features
- Tables
- Images
- Special characters, Unicode, Emoji
- Malformed content

### Fixtures
```
tests/
└── fixtures/
    ├── documents/
    │   ├── simple.json
    │   ├── complex-rich-text.json
    │   ├── large-markdown.md
    │   └── code-sample.js
    ├── themes/
    │   ├── valid-theme.json
    │   └── invalid-theme.json
    └── macros/
        ├── simple-macro.json
        └── complex-macro.json
```

## Quality Gates

### Minimum Requirements for Merge
- [ ] All new code has tests
- [ ] All tests passing
- [ ] Coverage >80% for new code
- [ ] No accessibility violations
- [ ] No security warnings
- [ ] Performance within budgets
- [ ] Documentation updated

### Release Criteria
- [ ] All tests passing on all platforms
- [ ] E2E tests pass
- [ ] No critical or high-severity bugs
- [ ] Performance regression <5%
- [ ] Accessibility audit passed
- [ ] Security review completed
- [ ] Documentation complete
- [ ] Installation tested on clean systems

## Continuous Improvement

### Metrics to Track
- Test execution time (optimize if >5 minutes)
- Flaky test rate (target <1%)
- Coverage trends
- Bug escape rate (bugs found after tests pass)
- Performance regression frequency

### Quarterly Review
- Analyze test effectiveness
- Remove redundant tests
- Add tests for bug-prone areas
- Update testing tools
- Review and update test strategy
