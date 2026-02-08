#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const checks = ['exports:verify', 'exports:parity', 'exports:fixtures'];

for (const script of checks) {
  console.log(`\n▶ Running ${script}`);
  const result = spawnSync(npmCmd, ['run', '-s', script], { stdio: 'inherit' });
  if (result.status !== 0) {
    console.error(`\n❌ Release gate failed at: ${script}`);
    process.exit(result.status || 1);
  }
}

console.log('\n✅ Release gate passed');
