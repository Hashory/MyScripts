#!/usr/bin/env tsx
import { execSync } from 'child_process';
import { fs } from 'zx';
import { join } from 'path';
import { argv } from 'zx';

const sessionName = argv._[0];

if (!sessionName) {
  console.error('Usage: jj-ai-clean <session_name>');
  process.exit(1);
}

// Extract ID from session name (e.g., jj-ai-abcdef -> abcdef)
const id = sessionName.startsWith('jj-ai-') ? sessionName.replace('jj-ai-', '') : sessionName;
const workspacePath = join(process.cwd(), '.work', `tmp-${id}`);

console.log(`Cleaning up AI Session: ${sessionName}`);
console.log(`Potential workspace: ${workspacePath}`);

// 1. Kill tmux session
try {
  console.log('Killing tmux session...');
  execSync(`tmux kill-session -t ${sessionName}`, { stdio: 'ignore' });
} catch (e) { }

// 2. JJ workspace forget
try {
  console.log('Forgetting jj workspace...');
  execSync(`jj workspace forget ${workspacePath}`, { stdio: 'ignore' });
} catch (e) { }

// 3. Remove directory
try {
  if (fs.existsSync(workspacePath)) {
    console.log('Removing workspace directory...');
    fs.rmSync(workspacePath, { recursive: true, force: true });
  }
} catch (e) {
  const message = e instanceof Error ? e.message : String(e);
  console.error(`Failed to remove directory: ${message}`);
}

console.log('Cleanup complete.');
