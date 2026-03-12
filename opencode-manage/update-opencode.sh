#!/bin/bash
export PNPM_HOME="/home/hayabusa/.local/share/pnpm"
export PATH="$PNPM_HOME:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log "--- OpenCode Web Auto-Update Start ---"

# 1. Stop existing service
log "Stopping opencode-web service..."
systemctl --user stop opencode-web.service || true

# 2. Update package via pnpm
log "Updating opencode-ai globally via pnpm..."
pnpm config set global-bin-dir /home/hayabusa/.local/share/pnpm
pnpm add -g opencode-ai

# 3. Approve build scripts non-interactively
log "Approving builds..."
yes | pnpm approve-builds -g

# 4. Restart service
log "Starting opencode-web service..."
systemctl --user start opencode-web.service

log "--- OpenCode Web Auto-Update Complete ---"
