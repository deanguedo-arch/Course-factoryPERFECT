# Main Cutover And GitHub Pages Deploy Design

**Problem**

The repository has been using `master` as the effective primary branch, while active development and the latest assignment rebuild work were merged and pushed separately. The deployment wrapper (`DEPLOY.BAT`) also relies on a loose `npm run deploy` path that does not enforce branch policy or a clean, committed source state.

**Goal**

Make `main` the working source-of-truth branch and make GitHub Pages deploy from committed `main` HEAD only, publishing the built `dist/` output to `gh-pages`.

## Approach Options

### Option 1: Keep `master` primary and only patch deploy

This is the lowest-effort path, but it preserves the branch confusion that caused the current drift. It solves deployment, not workflow.

### Option 2: Switch to `main` and keep the current deploy wrapper

This improves branch naming, but `DEPLOY.BAT` would still depend on `gh-pages` defaults and would not guard against deploying from the wrong branch or from uncommitted source changes.

### Option 3: Switch to `main` and add an explicit guarded deploy path

This is the recommended option. `main` becomes canonical, `gh-pages` remains the publish target, and deployment becomes a controlled release action instead of a generic wrapper around `npm run deploy`.

## Recommended Design

### Branch Model

- `main` is the canonical development and release branch.
- `master` remains temporarily as a safety branch until the GitHub default branch is flipped and Pages deployment is verified.
- `assignment-rebuild` is removed after merge because the work is already on `main`.
- `gh-pages` remains the static-site branch.

### Deploy Model

- `DEPLOY.BAT` is kept as the Windows entrypoint.
- Real deploy logic moves into a Node script so branch checks and Git status parsing are not implemented in fragile batch syntax.
- The deploy script fails unless:
  - current branch is `main`
  - source files are clean
  - `dist/` can be regenerated from the current committed tree
- The script allows dirty `dist/` because deployment rebuilds it anyway.
- Deploy output is published explicitly to `gh-pages` with a commit message containing the source `main` SHA.

### Working Tree Rules

- Untracked or modified source files outside `dist/` block deployment.
- Generated `dist/` changes are ignored by deploy readiness checks.
- Existing local stashes are preserved unless explicitly removed.

### Verification

After implementation:

1. Run targeted tests for deploy readiness helpers.
2. Run `npm run build`.
3. Run `DEPLOY.BAT` from `main`.
4. Verify the `gh-pages` branch moves and the site still resolves under:
   `https://deanguedo-arch.github.io/Course-factoryPERFECT/`

### Known Limitation

The local machine does not have GitHub CLI configured, so switching the GitHub repository default branch from `master` to `main` must be done in GitHub settings.
