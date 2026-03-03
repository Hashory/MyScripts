#!/bin/bash

echo "Listing active git-autocommit timers:"
echo "--------------------------------------------------"

# List all user timers matching the pattern
systemctl --user list-timers "git-autocommit@*" --all --no-pager | grep -v "0 timers listed" || echo "No active auto-commit timers found."

echo ""
echo "Details:"
echo "--------------------------------------------------"

# Get more details for each unit
for unit in $(systemctl --user list-units "git-autocommit@*.timer" --no-legend --plain | awk '{print $1}'); do
    # Extract the escaped path from the unit name
    ESCAPED_PATH=$(echo "$unit" | sed -E 's/git-autocommit@(.*)\.timer/\1/')
    # Unescape the path
    TARGET_PATH=$(systemd-escape --unescape --path "$ESCAPED_PATH")
    STATUS=$(systemctl --user is-active "$unit")
    
    printf "%-10s | %s\n" "$STATUS" "$TARGET_PATH"
done
