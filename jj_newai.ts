#!/usr/bin/env tsx
import { argv, fs } from 'zx';
import { execSync, spawn } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';

// Parse arguments
const message = argv.m || argv.message;
const internalTask = argv['internal-task'];
const sessionName = argv.session;

// --- 1. Main Entry Point: Launch tmux Session ---
if (!internalTask) {
  // Ensure message exists
  let finalMessage = message;
  if (!finalMessage) {
    const tempFile = join(tmpdir(), `jj-ai-msg-${Date.now()}.txt`);
    const editor = process.env.EDITOR || 'vi';
    try {
      execSync(`${editor} ${tempFile}`, { stdio: 'inherit' });
      finalMessage = fs.readFileSync(tempFile, 'utf8').trim();
      fs.unlinkSync(tempFile);
    } catch (e) {
      console.error('Failed to open editor or read message');
      process.exit(1);
    }
  }

  if (!finalMessage) {
    console.error('Error: No message provided.');
    process.exit(1);
  }

  const id = Math.random().toString(36).substring(2, 8);
  const newSessionName = sessionName || `jj-ai-${id}`;
  const selfPath = fs.realpathSync(process.argv[1]);

  console.log(`Starting background task in tmux session: ${newSessionName}`);
  console.log(`To view progress, run: tmux attach -t ${newSessionName}`);

  // Construct the command to run INSIDE tmux
  // We use triple quotes or escaping for the message to handle complex strings
  const internalCmd = `${process.execPath} ${selfPath} --internal-task -m ${JSON.stringify(finalMessage)} --session ${newSessionName}`;

  // Launch tmux in detached mode (-d)
  try {
    spawn('tmux', ['new-session', '-d', '-s', newSessionName, internalCmd], {
      detached: true,
      stdio: 'ignore'
    }).unref();
  } catch (e: any) {
    console.error(`Failed to start tmux: ${e.message}`);
    process.exit(1);
  }

  process.exit(0);
}

// --- 2. Internal Task Logic (Running inside tmux) ---
const log = (msg: string) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
const errorLog = (msg: string) => console.error(`[${new Date().toLocaleTimeString()}] ERROR: ${msg}`);

(async () => {
  const workspaceId = Math.random().toString(36).substring(2, 8);
  const workspaceName = `tmp-${workspaceId}`;
  const workspacePath = join(process.cwd(), '.work', workspaceName);
  const originalCwd = process.cwd();

  log(`Task started: "${message}"`);
  log(`Workspace: ${workspacePath}`);

  try {
    const workDir = join(process.cwd(), '.work');
    if (!fs.existsSync(workDir)) fs.mkdirSync(workDir);

    log('Creating jj workspace...');
    execSync(`jj workspace add ${workspacePath}`, { stdio: 'ignore' });

    process.chdir(workspacePath);

    log('Running opencode...');
    const { spawnSync } = await import('child_process');
    const result = spawnSync('opencode', ['run', message, '.'], {
      stdio: 'inherit',
      shell: true,
      env: process.env
    });

    if (result.status !== 0) throw new Error(`Opencode failed with status ${result.status}`);

    log('Updating description...');
    execSync(`jj desc -m ${JSON.stringify(message)}`, { stdio: 'ignore' });

    log('Rebasing to default@...');
    execSync(`jj rebase -d 'default@'`, { stdio: 'ignore' });

    log('SUCCESS: Task completed and rebased.');
  } catch (error: any) {
    errorLog(error.message);
    log('FAILED: The task encountered an error.');
    process.exitCode = 1;
  } finally {
    // Only cleanup on SUCCESS.
    // If failed, we leave the workspace and tmux session for the user to inspect.
    if (process.exitCode !== 1) {
      try {
        if (process.cwd() !== originalCwd) process.chdir(originalCwd);
        log(`Cleaning up workspace...`);
        execSync(`jj workspace forget ${workspacePath}`, { stdio: 'ignore' });
        if (fs.existsSync(workspacePath)) fs.rmSync(workspacePath, { recursive: true, force: true });
        log('Cleanup done.');
      } catch (cleanupError: any) {
        errorLog(`Cleanup failed: ${cleanupError.message}`);
      }
    } else {
      log('SKIPPING CLEANUP: Workspace and tmux session are preserved for inspection.');
      log(`Workspace path: ${workspacePath}`);
      log(`To clean up manually later, run: jj ai-clean ${sessionName || 'THIS_SESSION_NAME'}`);
    }
  }

  if (process.exitCode === 1) {
    console.log('\n--- Task FAILED. Press Enter to close this tmux session ---');
    execSync('read dummy', { stdio: 'inherit', shell: '/bin/bash' });
  } else {
    log('Session will close automatically.');
  }
})();
