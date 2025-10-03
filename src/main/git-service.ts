/**
 * Git service - handles all Git operations in main process
 */

import simpleGit, { SimpleGit, SimpleGitOptions, StatusResult } from 'simple-git';
import * as path from 'path';
import * as fs from 'fs/promises';

export class GitService {
  private git: SimpleGit | null = null;
  private workspacePath: string | null = null;

  /**
   * Initialize Git for a workspace
   */
  async initWorkspace(workspacePath: string): Promise<void> {
    this.workspacePath = workspacePath;

    const options: Partial<SimpleGitOptions> = {
      baseDir: workspacePath,
      binary: 'git',
      maxConcurrentProcesses: 6,
    };

    this.git = simpleGit(options);

    // Check if it's already a Git repo
    const isRepo = await this.isGitRepo();

    if (!isRepo) {
      // Initialize new Git repository
      await this.git.init();

      // Set default git user for this repository
      await this.git.addConfig('user.name', 'FintonText User');
      await this.git.addConfig('user.email', 'fintontext@localhost');

      await this.createGitignore();
      await this.createInitialStructure();
      await this.git.add('.fintontext/*');
      await this.git.add('.gitignore');
      await this.git.commit('Initialize FintonText workspace');
    } else {
      // Ensure git user is configured for existing repos
      try {
        const config = await this.git.listConfig();
        if (!config.values['user.name']) {
          await this.git.addConfig('user.name', 'FintonText User');
        }
        if (!config.values['user.email']) {
          await this.git.addConfig('user.email', 'fintontext@localhost');
        }
      } catch (error) {
        console.warn('[Git] Could not configure user identity:', error);
      }
    }
  }

  /**
   * Check if directory is a Git repository
   */
  async isGitRepo(): Promise<boolean> {
    if (!this.git) return false;

    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current Git status
   */
  async getStatus(): Promise<StatusResult> {
    if (!this.git) {
      throw new Error('Git not initialized');
    }

    return await this.git.status();
  }

  /**
   * Stage files
   */
  async stage(files: string | string[]): Promise<void> {
    if (!this.git) {
      throw new Error('Git not initialized');
    }

    await this.git.add(files);
  }

  /**
   * Commit changes
   */
  async commit(message: string): Promise<void> {
    if (!this.git) {
      throw new Error('Git not initialized');
    }

    await this.git.commit(message);
  }

  /**
   * Push to remote
   */
  async push(remote = 'origin', branch = 'main'): Promise<void> {
    if (!this.git) {
      throw new Error('Git not initialized');
    }

    await this.git.push(remote, branch);
  }

  /**
   * Pull from remote
   */
  async pull(remote = 'origin', branch = 'main'): Promise<void> {
    if (!this.git) {
      throw new Error('Git not initialized');
    }

    await this.git.pull(remote, branch);
  }

  /**
   * Add remote repository
   */
  async addRemote(name: string, url: string): Promise<void> {
    if (!this.git) {
      throw new Error('Git not initialized');
    }

    await this.git.addRemote(name, url);
  }

  /**
   * Get list of remotes
   */
  async getRemotes(): Promise<Array<{ name: string; url: string }>> {
    if (!this.git) {
      throw new Error('Git not initialized');
    }

    const remotes = await this.git.getRemotes(true);
    return remotes.map((r) => ({
      name: r.name,
      url: r.refs.fetch,
    }));
  }

  /**
   * Get commit log
   */
  async getLog(
    file?: string,
    maxCount = 50
  ): Promise<
    Array<{
      hash: string;
      message: string;
      author: string;
      email: string;
      date: Date;
    }>
  > {
    if (!this.git) {
      throw new Error('Git not initialized');
    }

    const options: any = { maxCount };
    if (file) {
      options.file = file;
    }

    const log = await this.git.log(options);

    return log.all.map((commit) => ({
      hash: commit.hash,
      message: commit.message,
      author: commit.author_name,
      email: commit.author_email,
      date: new Date(commit.date),
    }));
  }

  /**
   * Get file content from specific commit
   */
  async getFileAtCommit(commitHash: string, filePath: string): Promise<string> {
    if (!this.git) {
      throw new Error('Git not initialized');
    }

    return await this.git.show([`${commitHash}:${filePath}`]);
  }

  /**
   * Clone repository
   */
  static async clone(url: string, targetPath: string): Promise<GitService> {
    const git = simpleGit();
    await git.clone(url, targetPath);

    const service = new GitService();
    await service.initWorkspace(targetPath);
    return service;
  }

  /**
   * Create .gitignore file
   */
  private async createGitignore(): Promise<void> {
    if (!this.workspacePath) return;

    const gitignorePath = path.join(this.workspacePath, '.gitignore');
    const content = `# FintonText local files
.fintontext/index.db
.fintontext/cache/
.DS_Store
Thumbs.db
`;

    await fs.writeFile(gitignorePath, content, 'utf-8');
  }

  /**
   * Create initial workspace structure
   */
  private async createInitialStructure(): Promise<void> {
    if (!this.workspacePath) return;

    // Create .fintontext directory
    const fintonDir = path.join(this.workspacePath, '.fintontext');
    await fs.mkdir(fintonDir, { recursive: true });

    // Create config.json
    const config = {
      version: '1.0',
      created: new Date().toISOString(),
      settings: {
        autoCommit: false,
        autoSync: false,
        syncInterval: 5,
      },
    };

    const configPath = path.join(fintonDir, 'config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');

    // Create metadata file
    const metadata = {
      version: '1.0',
      workspace: {
        name: path.basename(this.workspacePath),
        created: new Date().toISOString(),
        description: '',
      },
      documents: {},
    };

    const metadataPath = path.join(
      this.workspacePath,
      '.fintontext-metadata.json'
    );
    await fs.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );

    // Create documents directory
    const docsDir = path.join(this.workspacePath, 'documents');
    await fs.mkdir(docsDir, { recursive: true });

    // Create README
    const readme = `# ${path.basename(this.workspacePath)}

This is a FintonText workspace. Documents are stored in the \`documents/\` directory.

## Structure

- \`.fintontext/\` - Workspace configuration and local data
- \`.fintontext-metadata.json\` - Document metadata and tags
- \`documents/\` - Your documents

## Sync

This workspace is a Git repository. You can:
- Push to a remote repository for backup and sharing
- Pull changes from other devices
- View complete version history
`;

    const readmePath = path.join(this.workspacePath, 'README.md');
    await fs.writeFile(readmePath, readme, 'utf-8');
  }

  /**
   * Check if there are uncommitted changes
   */
  async hasUncommittedChanges(): Promise<boolean> {
    const status = await this.getStatus();
    return !status.isClean();
  }

  /**
   * Get current branch
   */
  async getCurrentBranch(): Promise<string> {
    if (!this.git) {
      throw new Error('Git not initialized');
    }

    const status = await this.git.status();
    return status.current || 'main';
  }

  /**
   * Fetch from remote (doesn't merge)
   */
  async fetch(remote = 'origin'): Promise<void> {
    if (!this.git) {
      throw new Error('Git not initialized');
    }

    await this.git.fetch(remote);
  }

  /**
   * Get commits ahead/behind remote
   */
  async getAheadBehind(
    remote = 'origin',
    branch?: string
  ): Promise<{ ahead: number; behind: number }> {
    if (!this.git) {
      throw new Error('Git not initialized');
    }

    const currentBranch = branch || (await this.getCurrentBranch());
    const remoteBranch = `${remote}/${currentBranch}`;

    try {
      const result = await this.git.raw([
        'rev-list',
        '--left-right',
        '--count',
        `${currentBranch}...${remoteBranch}`,
      ]);

      const [ahead, behind] = result.trim().split('\t').map(Number);
      return { ahead, behind };
    } catch {
      // Remote branch doesn't exist or not fetched
      return { ahead: 0, behind: 0 };
    }
  }

  /**
   * Set git user configuration
   */
  async setUserConfig(userName: string, userEmail: string): Promise<void> {
    if (!this.git) {
      throw new Error('Git not initialized');
    }

    await this.git.addConfig('user.name', userName);
    await this.git.addConfig('user.email', userEmail);
  }

  /**
   * Set remote URL
   */
  async setRemoteUrl(remoteName: string, url: string): Promise<void> {
    if (!this.git) {
      throw new Error('Git not initialized');
    }

    await this.git.remote(['set-url', remoteName, url]);
  }
}
