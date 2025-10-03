/**
 * Code Editor - Simple textarea-based code editor with execution
 */

import React, { useState } from 'react';
import { useThemeStore } from '../store';
import type { CodeLanguage } from '../types';
import './CodeEditor.css';

interface CodeEditorProps {
  content: string;
  language: CodeLanguage;
  onChange: (value: string) => void;
  onCursorChange?: (line: number, column: number) => void;
}

interface ExecutionResult {
  output: string;
  error: string | null;
  exitCode: number;
  executionTime: number;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  content,
  language,
  onChange,
  onCursorChange,
}) => {
  const { currentTheme } = useThemeStore();
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [showOutput, setShowOutput] = useState(false);
  const [executor, setExecutor] = useState('');
  const [showExecutorSettings, setShowExecutorSettings] = useState(false);
  const [showPackageManager, setShowPackageManager] = useState(false);
  const [packageName, setPackageName] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installResult, setInstallResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const getDefaultExecutor = (lang: CodeLanguage): string => {
    const executors: Record<string, string> = {
      javascript: 'node',
      typescript: 'ts-node',
      python: 'python3',
      ruby: 'ruby',
      php: 'php',
      shell: 'bash',
      go: 'go run',
      rust: 'cargo run',
      java: 'java',
      cpp: 'g++ -o output && ./output',
      csharp: 'dotnet run',
    };
    return executors[lang] || 'node';
  };

  const getPackageManager = (lang: CodeLanguage): string => {
    const managers: Record<string, string> = {
      javascript: 'npm',
      typescript: 'npm',
      python: 'pip',
      ruby: 'gem',
      php: 'composer',
      go: 'go get',
      rust: 'cargo',
      java: 'maven/gradle',
    };
    return managers[lang] || 'package manager';
  };

  const handleInstallPackage = async () => {
    if (!packageName.trim()) return;

    setIsInstalling(true);
    setInstallResult(null);

    try {
      const response = await window.electronAPI.code.installPackage(packageName, language);
      setInstallResult(response);
      if (response.success) {
        setPackageName('');
        setTimeout(() => setInstallResult(null), 3000);
      }
    } catch (error) {
      setInstallResult({
        success: false,
        message: (error as Error).message,
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const handleExecute = async () => {
    if (!content.trim()) {
      setResult({
        output: '',
        error: 'No code to execute',
        exitCode: 1,
        executionTime: 0,
      });
      setShowOutput(true);
      return;
    }

    setIsExecuting(true);
    setShowOutput(true);
    const startTime = Date.now();

    try {
      const execCommand = executor || getDefaultExecutor(language);
      const response = await window.electronAPI.code.execute(content, execCommand, language);

      setResult({
        ...response,
        executionTime: Date.now() - startTime,
      });
    } catch (error) {
      setResult({
        output: '',
        error: (error as Error).message,
        exitCode: 1,
        executionTime: Date.now() - startTime,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="code-editor">
      <div className="code-editor-toolbar">
        <div className="toolbar-left">
          <span className="language-badge">{language}</span>
          {executor && <span className="executor-badge">{executor}</span>}
        </div>
        <div className="toolbar-right">
          <button
            className="toolbar-btn-code"
            onClick={() => setShowPackageManager(!showPackageManager)}
            title="Install Packages"
          >
            <span className="material-symbols-rounded">package_2</span>
          </button>
          <button
            className="toolbar-btn-code"
            onClick={() => setShowExecutorSettings(!showExecutorSettings)}
            title="Configure Executor"
          >
            <span className="material-symbols-rounded">settings</span>
          </button>
          <button
            className="toolbar-btn-code primary"
            onClick={handleExecute}
            disabled={isExecuting}
            title="Run Code (Cmd/Ctrl+Enter)"
          >
            <span className="material-symbols-rounded">{isExecuting ? 'progress_activity' : 'play_arrow'}</span>
            {isExecuting ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {showPackageManager && (
        <div className="package-manager">
          <div className="package-header">
            <span className="material-symbols-rounded">package_2</span>
            <span>Install Package via {getPackageManager(language)}</span>
          </div>
          <div className="package-input-group">
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder={`e.g., ${language === 'javascript' || language === 'typescript' ? 'axios' : language === 'python' ? 'requests' : 'package-name'}`}
              className="package-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isInstalling) {
                  handleInstallPackage();
                }
              }}
            />
            <button
              className="package-install-btn"
              onClick={handleInstallPackage}
              disabled={isInstalling || !packageName.trim()}
            >
              <span className="material-symbols-rounded">
                {isInstalling ? 'progress_activity' : 'download'}
              </span>
              {isInstalling ? 'Installing...' : 'Install'}
            </button>
          </div>
          {installResult && (
            <div className={`install-result ${installResult.success ? 'success' : 'error'}`}>
              <span className="material-symbols-rounded">
                {installResult.success ? 'check_circle' : 'error'}
              </span>
              {installResult.message}
            </div>
          )}
        </div>
      )}

      {showExecutorSettings && (
        <div className="executor-settings">
          <label>
            Executor Command:
            <input
              type="text"
              value={executor}
              onChange={(e) => setExecutor(e.target.value)}
              placeholder={getDefaultExecutor(language)}
              className="executor-input"
            />
          </label>
          <span className="executor-hint">
            Leave empty to use default: {getDefaultExecutor(language)}
          </span>
        </div>
      )}

      <div className="code-editor-content">
        <textarea
          className="code-editor-textarea"
          value={content}
          onChange={handleChange}
          placeholder={`Start coding in ${language}...`}
          spellCheck={false}
          autoFocus
          style={{
            fontFamily: currentTheme.fonts.editor,
            backgroundColor: currentTheme.type === 'dark' ? '#1e1e1e' : '#ffffff',
            color: currentTheme.type === 'dark' ? '#d4d4d4' : '#24292f',
          }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              handleExecute();
            }
          }}
        />

        {showOutput && result && (
          <div className="code-output-panel">
            <div className="output-header">
              <div className="output-title">
                <span className="material-symbols-rounded">terminal</span>
                Output
                {result.executionTime > 0 && (
                  <span className="execution-time">({result.executionTime}ms)</span>
                )}
              </div>
              <button
                className="close-output"
                onClick={() => setShowOutput(false)}
                title="Close Output"
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            {result.error ? (
              <div className="output-error">
                <div className="error-label">Error:</div>
                <pre>{result.error}</pre>
              </div>
            ) : (
              <div className="output-success">
                <pre>{result.output || '(No output)'}</pre>
              </div>
            )}

            <div className="output-footer">
              <span className={`exit-code ${result.exitCode === 0 ? 'success' : 'error'}`}>
                Exit code: {result.exitCode}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
