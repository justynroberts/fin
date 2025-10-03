/**
 * Code Execution Service
 * Handles safe execution of code with custom executors
 */

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

interface ExecutionResult {
  output: string;
  error: string | null;
  exitCode: number;
}

class CodeExecutionService {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'fintext-code-execution');
  }

  /**
   * Initialize the service (create temp directory)
   */
  async init(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('[CodeExecution] Failed to create temp directory:', error);
    }
  }

  /**
   * Execute code with specified executor
   */
  async execute(code: string, executor: string, language: string): Promise<ExecutionResult> {
    if (!code.trim()) {
      return {
        output: '',
        error: 'No code to execute',
        exitCode: 1,
      };
    }

    // Create temporary file for code
    const extension = this.getFileExtension(language);
    const tempFile = path.join(this.tempDir, `temp-${Date.now()}${extension}`);

    try {
      // Write code to temp file
      await fs.writeFile(tempFile, code, 'utf-8');

      // Build execution command
      const command = this.buildCommand(executor, tempFile, language);

      // Execute code
      const result = await this.executeCommand(command);

      // Clean up temp file
      try {
        await fs.unlink(tempFile);
      } catch (cleanupError) {
        console.error('[CodeExecution] Failed to clean up temp file:', cleanupError);
      }

      return result;
    } catch (error) {
      // Clean up temp file on error
      try {
        await fs.unlink(tempFile);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }

      return {
        output: '',
        error: (error as Error).message,
        exitCode: 1,
      };
    }
  }

  /**
   * Execute shell command and capture output
   */
  private executeCommand(command: string): Promise<ExecutionResult> {
    return new Promise((resolve) => {
      exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
          resolve({
            output: stdout,
            error: stderr || error.message,
            exitCode: error.code || 1,
          });
        } else {
          resolve({
            output: stdout,
            error: stderr || null,
            exitCode: 0,
          });
        }
      });
    });
  }

  /**
   * Build execution command based on executor and language
   */
  private buildCommand(executor: string, tempFile: string, language: string): string {
    // Handle special cases for compiled languages
    if (language === 'cpp') {
      const outputFile = tempFile.replace(/\.[^.]+$/, '');
      return `g++ "${tempFile}" -o "${outputFile}" && "${outputFile}"`;
    }

    if (language === 'java') {
      const className = this.extractJavaClassName(tempFile);
      const dir = path.dirname(tempFile);
      return `javac "${tempFile}" && cd "${dir}" && java ${className}`;
    }

    if (language === 'rust' && executor.includes('cargo')) {
      // For cargo, we'd need a proper project structure
      return `rustc "${tempFile}" && "${tempFile.replace(/\.[^.]+$/, '')}"`;
    }

    if (language === 'csharp' && executor.includes('dotnet')) {
      return `dotnet script "${tempFile}"`;
    }

    // For interpreted languages, just run with executor
    return `${executor} "${tempFile}"`;
  }

  /**
   * Get file extension for language
   */
  private getFileExtension(language: string): string {
    const extensions: Record<string, string> = {
      javascript: '.js',
      typescript: '.ts',
      python: '.py',
      ruby: '.rb',
      php: '.php',
      shell: '.sh',
      go: '.go',
      rust: '.rs',
      java: '.java',
      cpp: '.cpp',
      csharp: '.cs',
      html: '.html',
      css: '.css',
      json: '.json',
      yaml: '.yaml',
      xml: '.xml',
      sql: '.sql',
      plaintext: '.txt',
    };

    return extensions[language] || '.txt';
  }

  /**
   * Extract Java class name from temp file
   */
  private extractJavaClassName(tempFile: string): string {
    const baseName = path.basename(tempFile, '.java');
    return baseName;
  }

  /**
   * Install package for specified language
   */
  async installPackage(packageName: string, language: string): Promise<{ success: boolean; message: string }> {
    const commands: Record<string, string> = {
      javascript: `npm install ${packageName}`,
      typescript: `npm install ${packageName}`,
      python: `pip install ${packageName}`,
      ruby: `gem install ${packageName}`,
      php: `composer require ${packageName}`,
      go: `go get ${packageName}`,
      rust: `cargo add ${packageName}`,
    };

    const command = commands[language];

    if (!command) {
      return {
        success: false,
        message: `Package installation not supported for ${language}`,
      };
    }

    try {
      const result = await this.executeCommand(command);

      if (result.exitCode === 0) {
        return {
          success: true,
          message: `Successfully installed ${packageName}`,
        };
      } else {
        return {
          success: false,
          message: result.error || `Failed to install ${packageName}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
      };
    }
  }

  /**
   * Clean up temp directory
   */
  async cleanup(): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.tempDir, file)).catch(() => {}))
      );
    } catch (error) {
      console.error('[CodeExecution] Cleanup failed:', error);
    }
  }
}

export const codeExecutionService = new CodeExecutionService();
