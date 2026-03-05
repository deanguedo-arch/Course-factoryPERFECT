const normalizePath = (value) => String(value || '').replace(/\\/g, '/').trim();

export const parsePorcelainStatus = (input = '') => String(input || '')
  .split(/\r?\n/)
  .map((line) => line.trimEnd())
  .filter(Boolean)
  .map((line) => ({
    code: line.slice(0, 2),
    path: normalizePath(line.slice(3)),
  }));

const isIgnoredDeployPath = (path) => normalizePath(path).startsWith('dist/');

export const getDeployBlockingIssues = ({ branch = '', statusEntries = [] } = {}) => {
  const issues = [];

  if (String(branch || '').trim() !== 'main') {
    issues.push('Deploys must run from the main branch.');
  }

  const blockingPaths = statusEntries
    .map((entry) => normalizePath(entry?.path))
    .filter(Boolean)
    .filter((path) => !isIgnoredDeployPath(path))
    .sort();

  if (blockingPaths.length > 0) {
    issues.push(`Working tree has changes outside dist/: ${blockingPaths.join(', ')}`);
  }

  return issues;
};

export const buildDeployCommitMessage = (sha = '') => `deploy: main@${String(sha || '').trim()}`;
