#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import {
  buildDeployCommitMessage,
  getDeployBlockingIssues,
  parsePorcelainStatus,
} from './lib/deploy_guard.mjs';

const SITE_URL = 'https://deanguedo-arch.github.io/Course-factoryPERFECT/';
const require = createRequire(import.meta.url);
const ghPages = require('gh-pages');

function runCommand(command, args, { capture = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    const error = new Error(`Command failed: ${command} ${args.join(' ')}`);
    error.result = result;
    throw error;
  }

  return result;
}

function runGit(args) {
  return runCommand('git', args, { capture: true }).stdout.trim();
}

function runNpm(args) {
  const npmExecPath = process.env.npm_execpath || '';

  if (npmExecPath) {
    runCommand(process.execPath, [npmExecPath, ...args]);
    return;
  }

  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  runCommand(npmCommand, args);
}

function removeGhPagesLocks(rootDir) {
  if (!existsSync(rootDir)) {
    return;
  }

  for (const entry of readdirSync(rootDir, { withFileTypes: true })) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      removeGhPagesLocks(fullPath);
      continue;
    }

    if (entry.isFile() && entry.name === 'index.lock') {
      rmSync(fullPath, { force: true });
    }
  }
}

function publishDist(message) {
  return new Promise((resolve, reject) => {
    ghPages.publish('dist', {
      branch: 'gh-pages',
      message,
    }, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

async function main() {
  const branch = runGit(['branch', '--show-current']);
  const statusEntries = parsePorcelainStatus(runGit(['status', '--porcelain']));
  const issues = getDeployBlockingIssues({ branch, statusEntries });

  if (issues.length > 0) {
    console.error('\nDeploy blocked:');
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  const sha = runGit(['rev-parse', '--short', 'HEAD']);
  const message = buildDeployCommitMessage(sha);

  console.log(`\nDeploying ${branch}@${sha} to gh-pages`);
  removeGhPagesLocks(path.join(process.cwd(), 'node_modules', '.cache', 'gh-pages'));
  runNpm(['run', 'build']);
  await publishDist(message);

  console.log(`\nDeploy complete: ${SITE_URL}`);
  console.log(`Source commit: ${sha}`);
}

main().catch((error) => {
  console.error('\nDeploy failed.');
  if (error?.message) {
    console.error(error.message);
  }
  const stderr = error?.result?.stderr?.trim();
  if (stderr) {
    console.error(stderr);
  }
  process.exit(error?.result?.status || 1);
});
