#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const checks = ['exports:verify', 'exports:parity', 'exports:fixtures'];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

const DIRECT_CHECK_COMMANDS = {
  'exports:verify': ['scripts/verify_exports.mjs', 'verify'],
  'exports:parity': ['scripts/exports_parity.mjs'],
  'exports:fixtures': ['scripts/verify_composer_fixtures.mjs'],
};

function runNpm(script) {
  const npmExecPath = process.env.npm_execpath || '';
  if (npmExecPath) {
    return spawnSync(process.execPath, [npmExecPath, 'run', '-s', script], {
      stdio: 'inherit',
      cwd: REPO_ROOT,
    });
  }
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  return spawnSync(npmCmd, ['run', '-s', script], {
    stdio: 'inherit',
    cwd: REPO_ROOT,
  });
}

function runDirect(script) {
  const command = DIRECT_CHECK_COMMANDS[script];
  if (!command) return null;
  const [relativeScriptPath, ...args] = command;
  const absoluteScriptPath = path.join(REPO_ROOT, relativeScriptPath);
  return spawnSync(process.execPath, [absoluteScriptPath, ...args], {
    stdio: 'inherit',
    cwd: REPO_ROOT,
  });
}

for (const script of checks) {
  console.log(`\n> Running ${script}`);
  const directResult = runDirect(script);
  const result = directResult || runNpm(script);
  if (result.status !== 0) {
    console.error(`\nX Release gate failed at: ${script}`);
    process.exit(result.status || 1);
  }
}

console.log('\nOK Release gate passed');
