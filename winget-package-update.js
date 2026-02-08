#!/usr/bin/env tsx
const { execSync } = require('child_process');

const packageToUpdate = [
  "7zip.7zip",
  "Docker.DockerDesktop",
  "Git.Git",
  "KDE.Krita",
  "VideoLAN.VLC",
  "GoLang.Go",
  "GitHub.cli",
  "BlenderFoundation.Blender",
  "Cloudflare.Warp",
  "Amazon.AWSCLI",
  "Kitware.CMake",
  "LLVM.LLVM",
  "Chocolatey.Chocolatey",
  "Python.Launcher",
  "Microsoft.PowerShell",
  "Gyan.FFmpeg",
  "LLVM.ClangFormat",
  "Ninja - build.Ninja",
  "Rustlang.Rustup",
  "pnpm.pnpm",
  "yt-dlp.yt-dlp"
]

for (const pkg of packageToUpdate) {
  try {
    console.log(`Updating ${pkg}...`);
    if (pkg === "pnpm.pnpm") {
      // pnpm.pnpm is a special case
      execSync(`winget install --id ${pkg} --accept-package-agreements --accept-source-agreements`, { stdio: 'inherit' });
    } else {
      // other packages
      execSync(`winget upgrade --id ${pkg} --accept-package-agreements --accept-source-agreements`, { stdio: 'inherit' });
    }
    console.log(`${pkg} updated successfully.`);
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
