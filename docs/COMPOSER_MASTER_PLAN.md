# Composer Master Plan

Date: 2026-03-01

Related:
- [COMPOSER_WORLD_CLASS_AUDIT.md](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/docs/COMPOSER_WORLD_CLASS_AUDIT.md)

## Goal

Turn the module composer from a feature-rich custom editor into a world-class authoring system that is:
- faster to use
- easier to trust
- easier to maintain
- visually stronger
- more reusable
- more responsive
- harder to break

This plan goes past audit-only.
It is the build backlog I would actually use.

## Build Principles

1. Fix authoring architecture before adding lots of new blocks.
2. Unify create and edit workflows before polishing edge-case UX.
3. Prefer preview-first editing over proxy-card editing.
4. Reduce controls where better defaults are possible.
5. Every new power feature must improve speed or safety, not just add options.

## Program Structure

### Track A: Foundation
- unify engines
- reduce duplication
- stabilize preview/history/layout behavior

### Track B: Authoring UX
- direct manipulation
- shortcuts
- outline/tree
- inspector

### Track C: Responsive Page Builder
- breakpoints
- device preview
- responsive visibility/order/spacing

### Track D: Reuse And Design System
- symbols/components
- starter sections
- project-level style tokens

### Track E: QA And Trust
- validation
- preflight
- recovery
- preview/export confidence

### Track F: Differentiators
- AI-assisted structure
- course-aware bindings
- smart defaults specific to Course Factory

## Phase 0: Immediate Stabilization

Objective:
remove the highest-friction issues before the deeper refactor

### Changes

1. Add EditModal undo/redo parity.
2. Port create-flow canvas interaction batching into EditModal.
3. Normalize preview follow behavior into one shared helper.
4. Reduce redundant reset/remount paths for preview.
5. Tighten default workspace presets so authors do less panel sizing.
6. Add visible dirty-state and save-state indicator to both flows.

### Surgical Targets

- Extract shared preview sync helper from:
  - [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:2095)
  - [EditModal.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/modals/EditModal.jsx:642)

- Extract shared canvas interaction/history behavior from:
  - [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:3376)
  - [EditModal.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/modals/EditModal.jsx:993)

### Acceptance Criteria

- same drag/resize result in create and edit
- same undo/redo behavior in create and edit
- preview selection-follow feels stable
- fewer manual preview resets

## Phase 1: Shared Composer Engine

Objective:
replace duplicated composer behavior with one internal system

### Changes

1. Create `useComposerWorkspaceState`
   owns selection, activities, layout mode, canvas state, active inspector section

2. Create `useComposerHistory`
   owns snapshots, undo, redo, batching, named checkpoints later

3. Create `useComposerPreviewBridge`
   owns preview doc generation, selection follow, active tab sync, preview commands

4. Create `useComposerPersistence`
   owns autosave, saved drafts, draft import/export

5. Create shared presentational components:
   - `ComposerShell`
   - `ComposerToolbar`
   - `ComposerBuilderPane`
   - `ComposerPreviewPane`
   - `ComposerInspector`
   - `ComposerOutline`

6. Rebuild Phase1 and EditModal as wrappers around the shared composer engine.

### Surgical Targets

- split logic out of [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:317)
- split logic out of [EditModal.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/modals/EditModal.jsx:368)
- keep [layout.js](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/composer/layout.js:1) as domain logic, not UI logic

### Acceptance Criteria

- create/edit share the same core hook set
- file sizes materially shrink
- bug fixes land once, not twice

## Phase 2: Preview-First Editing

Objective:
make the real page the main editing surface

### Changes

1. Add block overlays on top of the live preview iframe.
2. Click block in preview to select it in the inspector.
3. Hover block to reveal block label, type, dimensions, and actions.
4. Add spacing/grid guide overlays.
5. Add block insertion affordances between rendered blocks.
6. Add optional builder proxy mode instead of making it primary.

### New Behavior

- preview becomes the primary canvas
- left pane becomes outline/library
- right pane becomes inspector

### Acceptance Criteria

- author can build without needing the proxy grid most of the time
- selection is obvious
- layout edits feel closer to true WYSIWYG

## Phase 3: Layout Model 2.0

Objective:
move from a flat block list to a page-builder structure

### Changes

1. Add layout primitives:
   - section
   - container
   - row
   - stack
   - columns
   - spacer

2. Support nested children in layout containers.
3. Build an outline tree instead of a flat block list.
4. Add drag into / drag out of containers.
5. Add lock, hide, duplicate group, move section.
6. Add align/distribute and equal-height tools for grouped items.

### Data Model Work

- evolve activity schema to support child nodes for layout blocks
- keep migration compatibility for existing flat modules

### Acceptance Criteria

- authors can structure pages hierarchically
- sections move as units
- real page composition gets easier, not harder

## Phase 4: Responsive Composer

Objective:
make the composer behave like a real web builder

### Changes

1. Add breakpoints:
   - desktop
   - tablet
   - mobile

2. Add device preview toggle in toolbar.
3. Add per-breakpoint layout overrides.
4. Add per-breakpoint visibility and ordering.
5. Add per-breakpoint spacing and sizing.
6. Add responsive typography scale overrides.

### Rendering Work

- extend [layout.js](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/composer/layout.js:132) to store layout by breakpoint
- extend [compileModuleHtml.js](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/composer/compileModuleHtml.js:2033) to emit responsive layout CSS/classes

### Acceptance Criteria

- author can independently tune desktop/tablet/mobile
- output behaves like a premium responsive page

## Phase 5: Components And Symbols

Objective:
make reuse first-class

### Changes

1. Replace browser-local templates with project-level component library.
2. Add symbols:
   - create from selection
   - insert instance
   - update source
   - detach instance

3. Add starter sections:
   - hero
   - CTA
   - feature grid
   - timeline
   - assessment intro
   - resource hub

4. Add global block packs shared across modules.
5. Add import/export for component packs.

### Data Model Work

- store project-level component definitions in course data, not local browser only

### Acceptance Criteria

- authors can reuse patterns across modules
- updating a design system block is not manual repetition

## Phase 6: Design System Layer

Objective:
move from themes to a real design system

### Changes

1. Add project-level tokens:
   - typography scale
   - font pairings
   - spacing scale
   - radius scale
   - shadow scale
   - section width
   - motion presets

2. Add component variants:
   - default
   - compact
   - feature
   - hero
   - minimal

3. Add semantic block states:
   - default
   - active
   - completed
   - warning
   - error
   - locked

4. Reduce ad hoc style overrides where tokens can do the job.

### Acceptance Criteria

- module visuals are coherent by default
- styling is faster and less manual
- designers can set system behavior without touching each block

## Phase 7: Inspector And Power Tools

Objective:
make authors fast

### Changes

1. Add command palette `Cmd/Ctrl+K`.
2. Add slash menu insert.
3. Add keyboard shortcuts for:
   - duplicate
   - delete
   - move
   - nudge
   - group
   - toggle visibility
   - toggle lock

4. Add multi-select.
5. Add bulk edit of spacing/theme/variant/visibility.
6. Add copy/paste blocks across modules.
7. Add copy/paste block style only.
8. Add lock block and protect from accidental changes.

### Acceptance Criteria

- advanced authors stop depending on pointer-only workflows
- repeated editing becomes fast

## Phase 8: Validation, Preflight, And Recovery

Objective:
make authors trust the tool

### Changes

1. Expand validation rules in [activityRegistry.js](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/composer/activityRegistry.js:2111).
2. Add issue categories:
   - accessibility
   - responsiveness
   - empty content
   - broken links
   - duplicate IDs
   - hidden orphaned content
   - contrast risk
   - missing alt text
   - invalid interaction states

3. Add preflight report before save/publish.
4. Add "jump to issue" and "fix suggestion" actions.
5. Add named snapshots and restore points.
6. Add safe-mode preview when a module fails compile/runtime validation.

### Acceptance Criteria

- fewer broken modules reach export
- recovery is obvious
- issue remediation is guided

## Phase 9: Preview And Export Confidence

Objective:
make preview and output match more closely and more reliably

### Changes

1. Strengthen parity tests for preview/export composer output.
2. Add fixture suites for:
   - simple layouts
   - canvas layouts
   - nested sections
   - breakpoint cases
   - symbol instances
   - FinLit tab-local content

3. Add visual regression checks for core templates.
4. Add runtime smoke tests for interactions.

### Acceptance Criteria

- preview is trusted as production-like
- refactors stop causing silent breakage

## Phase 10: Course Factory Differentiators

Objective:
add features generic builders do not have

### Changes

1. Course-aware content bindings:
   - course title
   - module title
   - material bank items
   - assessment bank items
   - learner state
   - saved responses

2. AI-assisted block generation from learning goal or module intent.
3. AI-assisted section suggestions based on module type.
4. Smart starter patterns by course style:
   - finance
   - workplace training
   - toolkit dashboard
   - workbook

5. Quality scoring:
   - visual cohesion
   - instructional completeness
   - accessibility readiness
   - responsive readiness

### Acceptance Criteria

- composer becomes more valuable than generic no-code page builders for this domain

## Phase 11: Performance And Maintainability

Objective:
keep the tool fast as complexity grows

### Changes

1. Memoize preview generation boundaries.
2. Split large editor subtrees with lazy loading.
3. Add state selectors instead of full-form rerenders.
4. Profile iframe regeneration paths.
5. Add explicit domain modules for:
   - history
   - layout
   - preview bridge
   - persistence
   - selection
   - validation

### Acceptance Criteria

- editing remains responsive
- codebase remains evolvable

## Feature Backlog

These are worth doing, but only after foundation work begins.

### Authoring UX

1. Sticky action bar
2. breadcrumb path for nested blocks
3. mini-map for large pages
4. search blocks by content
5. focus mode for selected section
6. snap lines and spacing indicators
7. collapse/expand all in outline
8. hover quick actions

### Layout

1. equal-height rows
2. baseline alignment
3. max-width containers
4. sticky section option
5. scroll section anchors
6. section backgrounds and dividers
7. overlap/layer controls
8. z-index ordering tools

### Content

1. richer text editor cleanup
2. block-level data bindings
3. markdown import
4. section duplication with relink options
5. content placeholders and tokens
6. generated TOC blocks

### Collaboration

1. change summary before save
2. compare current draft vs saved version
3. named branch drafts
4. editor notes/comments
5. approval states

### QA

1. tab order preview
2. focus ring preview
3. mobile overflow overlay
4. empty-state overlay
5. click-target sizing checks

## What I Would Personally Do First

If I were executing this now, my sequence would be:

1. shared composer engine
2. EditModal parity with create flow
3. preview bridge extraction
4. direct preview selection overlays
5. breakpoint model
6. symbols/components
7. preflight validation

That is the shortest route to making the composer feel substantially better while also reducing future maintenance pain.

## Practical Delivery Plan

### Milestone 1: Stabilize

Ship:
- shared preview bridge
- shared history
- EditModal parity

Result:
- the tool stops feeling inconsistent

### Milestone 2: Unify

Ship:
- shared composer workspace engine
- shared shell components

Result:
- one composer product instead of two

### Milestone 3: Make It Feel Premium

Ship:
- preview-first editing
- selection overlays
- better shortcuts

Result:
- daily work becomes easier

### Milestone 4: Make It Feel Modern

Ship:
- responsive breakpoints
- device preview

Result:
- page-builder credibility

### Milestone 5: Make It Scalable

Ship:
- symbols/components
- design system tokens

Result:
- real reuse and consistency

### Milestone 6: Make It Trusted

Ship:
- preflight QA
- recovery improvements
- parity coverage

Result:
- authors trust preview and output

## If We Want One Aggressive Target State

The target composer should look like this:

- center: real preview stage
- left: outline, insert, components
- right: inspector, responsive controls, issues
- top: mode, device, undo/redo, command palette, preview options
- bottom or side drawer: version history, snapshots, AI assists, publish checks

And it should support:

- click-to-edit on the page
- slash insert
- responsive layouts
- symbols
- project style system
- multi-select
- block tree
- preflight checks
- trusted preview/export parity

## Recommended Next Artifact

After this master plan, the next document should be:

`COMPOSER_IMPLEMENTATION_BACKLOG.md`

That should break the plan into:
- epics
- tickets
- file targets
- dependencies
- acceptance criteria
- rough effort

That is the document I would use to actually execute the rebuild.
