#!/bin/bash
export PATH="/home/hayabusa/.local/share/pnpm:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log "--- OpenCode Web Auto-Update Start ---"

# 1. Kill existing tmux session
log "Stopping opencode-web tmux session..."
tmux kill-session -t opencode-web 2>/dev/null || true

# 2. Update package via pnpm
log "Updating opencode-ai globally via pnpm..."
pnpm add -g opencode-ai

# 3. Approve build scripts non-interactively
log "Approving builds..."
yes | pnpm approve-builds -g

# 4. Restart tmux session
log "Starting opencode-web tmux session..."
tmux new-session -d -s opencode-web 'export OPENCODE_EXPERIMENTAL=true; opencode web --hostname 0.0.0.0'

log "--- OpenCode Web Auto-Update Complete ---"
