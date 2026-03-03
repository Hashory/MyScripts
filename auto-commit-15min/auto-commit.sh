#!/bin/bash

# Configuration
# The argument is an escaped path from systemd (%I)
RAW_PATH="$1"

if [ -z "$RAW_PATH" ]; then
    echo "Usage: $0 <target_directory_or_escaped_path>"
    exit 1
fi

# systemd-escape --unescape can be picky about the string format.
# When systemd passes %I, it's often already partially unescaped or in a format 
# that systemd-escape -u doesn't like if it has literal backslashes from the shell/systemd.
# We'll use a more robust way to unescape or just use the path if it's already correct.

if [[ "$RAW_PATH" == *"-"* ]] || [[ "$RAW_PATH" == *"\\x"* ]]; then
    # Try unescaping using systemd-escape. 
    # We use a subshell and redirection to avoid some "Invalid argument" issues with direct piping in some shells.
    TARGET_DIR=$(systemd-escape --unescape --path "$RAW_PATH" 2>/dev/null)
    if [ -z "$TARGET_DIR" ]; then
        # Fallback: if it fails, maybe it's not escaped or has a format we can't handle with systemd-escape -u
        TARGET_DIR="$RAW_PATH"
    fi
else
    TARGET_DIR="$RAW_PATH"
fi

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

# Check for changes
if [[ -n $(git status --porcelain) ]]; then
    echo "Changes detected in '$TARGET_DIR'. Committing and pushing..."
    git add .
    git commit -m "$COMMIT_MSG"
    git push origin
else
    echo "No changes detected in '$TARGET_DIR'. Skipping."
fi
