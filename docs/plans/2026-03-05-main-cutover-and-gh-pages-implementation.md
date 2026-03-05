# Main Cutover And GitHub Pages Deploy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `main` the primary working branch and make `DEPLOY.BAT` publish GitHub Pages from committed `main` HEAD only.

**Architecture:** Keep `gh-pages` as the publish branch, but replace the loose deploy wrapper with an explicit Node-based deploy script that checks branch and working tree state before publishing `dist/`. Keep branch cleanup separate from deploy logic so cleanup mistakes cannot break deployment.

**Tech Stack:** Git, Node.js, existing `gh-pages` npm package, Vite, Windows batch wrapper, Node built-in test runner.

---

### Task 1: Add Deploy Guard Helpers

**Files:**
- Create: `scripts/lib/deploy_guard.mjs`
- Create: `tests/release/deploy_guard.test.mjs`

**Step 1: Write the failing test**

Add tests for:
- branch must be `main`
- dirty source files block deploy
- dirty `dist/` alone does not block deploy
- deploy message includes source SHA

**Step 2: Run test to verify it fails**

Run: `node --test tests/release/deploy_guard.test.mjs`

Expected: FAIL because helper module does not exist

**Step 3: Write minimal implementation**

Implement:
- `parsePorcelainStatus(lines)`
- `getDeployBlockingIssues({ branch, statusEntries })`
- `buildDeployCommitMessage(sha)`

**Step 4: Run test to verify it passes**

Run: `node --test tests/release/deploy_guard.test.mjs`

Expected: PASS

**Step 5: Commit**

```bash
git add scripts/lib/deploy_guard.mjs tests/release/deploy_guard.test.mjs
git commit -m "test: add deploy readiness guards"
```

---

### Task 2: Replace Loose Deploy Wrapper With Explicit Script

**Files:**
- Create: `scripts/deploy_gh_pages.mjs`
- Modify: `package.json`
- Modify: `DEPLOY.BAT`

**Step 1: Write the failing test**

Extend `tests/release/deploy_guard.test.mjs` with one integration-light test for message formatting or status handling needed by the script.

**Step 2: Run test to verify it fails**

Run: `node --test tests/release/deploy_guard.test.mjs`

Expected: FAIL for missing script dependency helpers

**Step 3: Write minimal implementation**

Implement `scripts/deploy_gh_pages.mjs` to:
- verify branch is `main`
- verify no blocking source changes
- run `npm run build`
- publish `dist` to `gh-pages`
- use deploy commit message `deploy: main@<sha>`

Update `package.json`:
- add `deploy:pages`
- make `deploy` point to the guarded script or alias it

Update `DEPLOY.BAT`:
- use portable Node if available
- call the guarded deploy script
- report the source SHA and Pages URL

**Step 4: Run test to verify it passes**

Run:
- `node --test tests/release/deploy_guard.test.mjs`
- `npm run build`

Expected: PASS

**Step 5: Commit**

```bash
git add scripts/deploy_gh_pages.mjs scripts/lib/deploy_guard.mjs package.json DEPLOY.BAT tests/release/deploy_guard.test.mjs
git commit -m "feat: guard github pages deploys from main"
```

---

### Task 3: Clean Branch And Remote State

**Files:**
- Modify: none required for source code

**Step 1: Verify current branch state**

Run:
- `git branch --show-current`
- `git branch -a`
- `git worktree list`

Expected:
- root checkout on `main`
- no active `assignment-rebuild` worktree

**Step 2: Delete obsolete remote branch**

Run:
- `git push origin --delete assignment-rebuild`

Expected: remote feature branch removed

**Step 3: Clean local leftovers**

Clean:
- generated `dist/` changes if not needed
- stale physical `.worktrees/assignment-rebuild` folder if removable

Do not drop preserved stashes unless explicitly requested.

**Step 4: Verify clean release state**

Run:
- `git status --short`

Expected:
- no source-code changes blocking deploy

**Step 5: Commit**

No commit needed unless cleanup changes tracked files.

---

### Task 4: Deploy And Verify

**Files:**
- Modify: none expected

**Step 1: Run guarded deploy**

Run:
- `DEPLOY.BAT`

Expected:
- build succeeds
- `gh-pages` publish succeeds
- output shows deployed `main` SHA

**Step 2: Verify branch movement**

Run:
- `git log --oneline gh-pages -1`

Expected:
- latest `gh-pages` commit message includes `main@<sha>`

**Step 3: Final status check**

Run:
- `git status --short`

Expected:
- no accidental source changes from deploy

**Step 4: Commit**

No commit expected unless a tracked file changed during deploy and must be normalized.
