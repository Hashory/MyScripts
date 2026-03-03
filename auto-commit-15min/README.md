# Auto-Commit Suite (15min)

A system to automatically `commit` & `push` changes in Git repositories every 15 minutes.
It runs in the background using `systemd` user timers.

## Scripts

- `register-dir.sh <path>`: Register a directory for auto-committing.
- `list-dirs.sh`: List all currently registered directories and their status.
- `auto-commit.sh`: The core execution script (`git add` -> `commit` -> `push`).
- `git-autocommit@.service / .timer`: systemd templates.

## Usage

### 1. Register a directory
Provide the path to the Git repository you want to auto-commit.
```bash
./register-dir.sh /home/hayabusa/program/my-project
```

### 2. Check registration status
See which directories are currently being monitored.
```bash
./list-dirs.sh
```

### 3. Stop auto-committing
To stop the service, use `systemctl` directly with the unit name shown by `list-dirs.sh`.
```bash
systemctl --user stop git-autocommit@<escaped-path>.timer
systemctl --user disable git-autocommit@<escaped-path>.timer
```

## How It Works
- Uses `systemd` user timers, running as long as you are logged in (or if lingering is enabled).
- If no changes are detected (`git status --porcelain` is empty), no commit or push is performed.
- Directory paths are safely encoded into systemd unit names using `systemd-escape`.
