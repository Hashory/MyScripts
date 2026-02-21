#!/usr/bin/env tsx
import { execSync } from 'node:child_process';

const TMUX_SESSION = 'opencode-web';
const PACKAGE_NAME = 'opencode-ai';
const PNPM_PATH = '/home/hayabusa/.local/share/pnpm/pnpm';
const TMUX_PATH = '/usr/bin/tmux';

function run(command: string) {
    try {
        console.log(`Executing: ${command}`);
        execSync(command, { stdio: 'inherit', env: { ...process.env, OPENCODE_EXPERIMENTAL: 'true' } });
    } catch (error) {
        console.error(`Error executing command: ${command}`);
        if (error instanceof Error) {
            console.error(error.message);
        }
    }
}

console.log('--- OpenCode Web Auto-Update Start ---');

// 1. Kill existing tmux session
console.log(`Stopping tmux session: ${TMUX_SESSION}`);
try {
    execSync(`${TMUX_PATH} kill-session -t ${TMUX_SESSION}`, { stdio: 'ignore' });
} catch {
    // Session might not exist, ignore error
}

// 2. Update package via pnpm
console.log(`Updating ${PACKAGE_NAME} via pnpm...`);
run(`${PNPM_PATH} add -g ${PACKAGE_NAME}`);

// 3. Restart tmux session
console.log(`Starting new tmux session: ${TMUX_SESSION}`);
const startCommand = `${TMUX_PATH} new-session -d -s ${TMUX_SESSION} 'export OPENCODE_EXPERIMENTAL=true; /home/hayabusa/.local/share/pnpm/opencode web --hostname 0.0.0.0'`;
run(startCommand);

console.log('--- OpenCode Web Auto-Update Complete ---');
