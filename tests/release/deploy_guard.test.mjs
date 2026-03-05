import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDeployCommitMessage,
  getDeployBlockingIssues,
  parsePorcelainStatus,
} from '../../scripts/lib/deploy_guard.mjs';

test('blocks deploy when branch is not main', () => {
  const issues = getDeployBlockingIssues({
    branch: 'master',
    statusEntries: [],
  });

  assert.deepEqual(issues, ['Deploys must run from the main branch.']);
});

test('allows deploy when only dist output is dirty', () => {
  const statusEntries = parsePorcelainStatus(' M dist/index.html');
  const issues = getDeployBlockingIssues({
    branch: 'main',
    statusEntries,
  });

  assert.deepEqual(issues, []);
});

test('blocks deploy when source files are dirty', () => {
  const statusEntries = parsePorcelainStatus([
    ' M src/App.jsx',
    '?? docs/plans/temp.md',
  ].join('\n'));
  const issues = getDeployBlockingIssues({
    branch: 'main',
    statusEntries,
  });

  assert.deepEqual(issues, [
    'Working tree has changes outside dist/: docs/plans/temp.md, src/App.jsx',
  ]);
});

test('buildDeployCommitMessage includes main sha', () => {
  assert.equal(
    buildDeployCommitMessage('6316fb6'),
    'deploy: main@6316fb6',
  );
});
