#!/bin/bash

# Configuration
TARGET_DIR=$(realpath "$1")
SCRIPT_DIR=$(dirname "$(realpath "$0")")

if [ -z "$1" ]; then
    echo "Usage: $0 <directory_path>"
    exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: Directory $TARGET_DIR does not exist."
    exit 1
fi

# Check if it's a git repo
if ! git -C "$TARGET_DIR" rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "Error: $TARGET_DIR is not a git repository."
    exit 1
fi

# Escape the directory path for systemd
ESCAPED_PATH=$(systemd-escape --path "$TARGET_DIR")
UNIT_NAME="git-autocommit@${ESCAPED_PATH}"

# Create the user systemd directory if it doesn't exist
SYSTEMD_USER_DIR="$HOME/.config/systemd/user"
mkdir -p "$SYSTEMD_USER_DIR"

# Copy the template files
cp "$SCRIPT_DIR/git-autocommit@.service" "$SYSTEMD_USER_DIR/"
cp "$SCRIPT_DIR/git-autocommit@.timer" "$SYSTEMD_USER_DIR/"

# Reload systemd user daemon
systemctl --user daemon-reload

# Enable and start the timer
systemctl --user enable "$UNIT_NAME.timer"
systemctl --user start "$UNIT_NAME.timer"

echo "Successfully registered $TARGET_DIR"
echo "You can check status with: systemctl --user status $UNIT_NAME.timer"
