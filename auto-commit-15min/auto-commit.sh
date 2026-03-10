#!/bin/bash

# Configuration
# The argument is an escaped path from systemd (%I)
RAW_PATH="$1"

if [ -z "$RAW_PATH" ]; then
    echo "Usage: $0 <target_directory_or_escaped_path>"
    exit 1
fi

TARGET_DIR="$RAW_PATH"

COMMIT_MSG="Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"

if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: Directory '$TARGET_DIR' does not exist."
    exit 1
fi

cd "$TARGET_DIR" || exit 1

# Check if it's a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "Error: '$TARGET_DIR' is not a git repository."
    exit 1
fi

set -e

# Check for changes
if [[ -n $(git status --porcelain) ]]; then
    echo "Changes detected in '$TARGET_DIR'. Committing and pushing..."
    git add .
    git commit -m "$COMMIT_MSG"
    git push origin
else
    echo "No changes detected in '$TARGET_DIR'. Skipping."
fi
