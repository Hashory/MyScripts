#!/bin/bash
export PATH="/home/hayabusa/.local/share/pnpm:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

echo "Stopping opencode-web tmux session..."
tmux kill-session -t opencode-web 2>/dev/null || true

echo "Updating opencode-ai globally via pnpm..."
pnpm add -g opencode-ai

echo "Starting opencode-web tmux session..."
tmux new-session -d -s opencode-web 'export OPENCODE_EXPERIMENTAL=true; opencode web --hostname 0.0.0.0'

echo "Update and restart complete."
