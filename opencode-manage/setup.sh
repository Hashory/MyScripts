#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SYSTEMD_USER_DIR="$HOME/.config/systemd/user"

mkdir -p "$SYSTEMD_USER_DIR"

echo "Creating symlinks for systemd units..."
ln -sf "$SCRIPT_DIR/opencode-manage.service" "$SYSTEMD_USER_DIR/opencode-manage.service"
ln -sf "$SCRIPT_DIR/opencode-manage.timer" "$SYSTEMD_USER_DIR/opencode-manage.timer"

echo "Reloading systemd daemon..."
systemctl --user daemon-reload

echo "Enabling and starting opencode-manage.timer..."
systemctl --user enable --now opencode-manage.timer

echo "Setup complete! Checking timer status..."
systemctl --user status opencode-manage.timer --no-pager
