#!/usr/bin/env node
// Execute a lot of pnpm global package updates at once
import { execSync } from 'child_process';

const packagesToUpdate = [
  'tsx',
  '@google/jules',
  '@angular/cli',
  '@google/gemini-cli'
];

for (const pkg of packagesToUpdate) {
  try {
    console.log(`Ensuring latest version of ${pkg}...`);
    execSync(`pnpm add -g ${pkg}`, { stdio: 'inherit' });
    console.log(`${pkg} processed successfully.`);
  } catch (error) {
    console.error(`Failed to update ${pkg}:`, error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    if (error.stderr) {
      console.error(`Error stderr: ${error.stderr.toString()}`);
    }
    if (error.stack) {
      console.error(`Stack trace: ${error.stack}`);
    }
  }
}

console.log('All updates attempted.');
