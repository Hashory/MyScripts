#!/usr/bin/env tsx
import { execSync } from 'child_process';

execSync("uv tool install git+https://github.com/hashory/git-before-delete.git", { stdio: 'inherit' });
