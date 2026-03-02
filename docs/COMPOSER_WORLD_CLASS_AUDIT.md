# Composer World-Class Audit

Date: 2026-03-01

Scope:
- `src/components/Phase1.jsx`
- `src/components/modals/EditModal.jsx`
- `src/composer/layout.js`
- `src/composer/activityRegistry.js`
- `src/composer/compileModuleHtml.js`
- `src/utils/generators.js`

## Executive Summary

The composer is already feature-rich, but it does not feel world-class because the workflow is carrying too much complexity in the UI layer and the authoring model is split across two different implementations.

The current tool is good at "supporting many controls."
It is not yet good at "making the correct action feel obvious, fast, and safe."

The main blockers are:
- Two divergent composer implementations: create flow vs edit flow.
- Giant stateful UI components owning layout, authoring, preview, persistence, and interaction logic.
- A proxy builder model instead of direct manipulation of the real rendered page.
- No breakpoint-aware authoring model.
- No reusable project-level component system.

If these are not fixed first, adding more blocks and more controls will continue to make the composer feel harder instead of stronger.

## Findings

### 1. Split-Brain Composer Architecture

Severity: Critical

The composer exists in two separate authoring surfaces:
- create flow in [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:317)
- edit flow in [EditModal.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/modals/EditModal.jsx:368)

They both own their own:
- layout mutation logic
- preview follow logic
- FinLit sync logic
- template change logic
- selection handling
- canvas behavior

Examples:
- create flow advanced workspace: [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:8021)
- edit flow simpler workspace: [EditModal.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/modals/EditModal.jsx:3809)
- create flow undo/redo exists: [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:2362)
- edit flow has no equivalent undo/redo system

Impact:
- behavior drifts over time
- fixes must be implemented twice
- create and edit do not feel like the same product
- users lose power when switching from draft creation to editing an existing module

World-class requirement:
- one shared `ComposerWorkspace` engine
- thin wrappers for create/edit context only

### 2. UI Components Are Carrying Too Much Authoring Logic

Severity: Critical

Current sizes:
- [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:1) is 9,374 lines
- [EditModal.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/modals/EditModal.jsx:1) is 4,541 lines

Composer state in Phase1 alone spans:
- authoring state
- workspace layout state
- preview state
- draft persistence
- history stacks
- vault integrations
- FinLit authoring
- block editing

Representative state cluster:
- [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:317)

Impact:
- changes are risky because almost every concern is coupled
- interaction bugs feel random because selection, layout, preview, and persistence all co-mutate
- it is too hard to reason about why a preview, resize, or selection update occurred

World-class requirement:
- move composer state into a dedicated controller/store
- split view components from authoring operations
- treat preview, selection, history, and layout as explicit subsystems

### 3. Builder And Preview Are Two Different Worlds

Severity: Critical

The builder canvas uses proxy cards and grid metadata, while the preview is a separate compiled iframe.

Builder proxy:
- [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:8285)
- [EditModal.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/modals/EditModal.jsx:3959)

Rendered preview iframe:
- [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:8946)
- [EditModal.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/modals/EditModal.jsx:4330)

Impact:
- resizing the builder does not feel like resizing the page
- block positions are manipulated in an abstract grid, not on the actual rendered module
- authors must mentally translate between "builder units" and "real page output"
- WYSIWYG trust is weak

This is the biggest workflow reason the tool feels "hard" even when it technically works.

World-class requirement:
- one authoritative rendered stage
- selectable overlays on top of the real preview
- direct-manipulation editing where possible
- builder geometry derived from the render surface, not a separate proxy system

### 4. Preview Synchronization Is Timer-Driven Instead Of Deterministic

Severity: High

Preview updates rely on `srcDoc`, iframe remounting, refs, and `setTimeout` follow behavior.

Examples:
- preview document creation: [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:2095)
- follow-scroll timer: [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:2204)
- edit modal equivalent: [EditModal.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/modals/EditModal.jsx:642)
- edit modal follow-scroll timer: [EditModal.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/modals/EditModal.jsx:746)

Impact:
- preview can feel delayed or inconsistent
- selection-follow logic is hard to trust
- remount/reset becomes a user-facing escape hatch
- small UI edits can trigger expensive preview work

World-class requirement:
- event-driven preview sync
- stable preview session with patchable updates
- explicit selection bridge between editor and preview
- eliminate timer-based follow where possible

### 5. Create Flow Has Better Interaction Rules Than Edit Flow

Severity: High

The create flow has batched canvas interaction handling and history-aware drag/resize behavior:
- [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:3376)
- [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:3386)

The edit flow uses a simpler `onLayoutChange` path:
- [EditModal.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/modals/EditModal.jsx:3961)

Impact:
- same action can behave differently depending on where the user is editing
- canvas tuning done in create flow does not fully carry into edit flow
- users learn one surface and are surprised by the other

World-class requirement:
- one shared interaction engine for drag/resize/reflow/history

### 6. Resizing Model Is Powerful But Conceptually Confusing

Severity: High

There are multiple resize domains:
- preview width
- preview height
- builder height
- builder block width
- builder scale lock
- canvas row height
- canvas gap x/y
- canvas padding x/y
- block width/height

Examples:
- workspace preset controls: [workspaceCatalog.js](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/composer/workspaceCatalog.js:8)
- workspace sizing controls: [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:8175)
- block width math and canvas width: [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:8238)
- canvas layout controls: [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:8321)

Impact:
- there is too much resizing before the user ever edits content
- users are adjusting the tool chrome and the page layout at the same time
- "builder size" and "module size" are easy to confuse

World-class requirement:
- separate workspace layout controls from page layout controls
- default workspace should rarely need manual tuning
- page resizing should map to real device or breakpoint behavior, not a custom authoring canvas scale

### 7. No Responsive Authoring Model

Severity: High

The layout model supports:
- `simple`
- `canvas`
- `maxColumns` 1..4

References:
- [layout.js](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/composer/layout.js:132)
- [compileModuleHtml.js](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/composer/compileModuleHtml.js:2033)

What it does not support:
- desktop/tablet/mobile layouts
- per-breakpoint visibility
- per-breakpoint order
- per-breakpoint spacing

Impact:
- authors cannot tune modules for real-world screens
- the preview cannot behave like a premium page builder
- layout choices are global compromises

World-class requirement:
- breakpoint-aware layout data
- device preview toggle
- responsive visibility and spacing controls

### 8. Reuse Stops At Local Browser Templates

Severity: High

Current reusable templates are stored in browser localStorage:
- [ComposerSidebarTools.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/composer/ComposerSidebarTools.jsx:7)

Impact:
- no shared team/system reuse
- no project-level components
- no symbol/instance update model
- no design consistency enforcement across modules

World-class requirement:
- project-level component library
- symbols/instances
- update-all semantics
- curated starter sections

### 9. Validation Exists But Is Not Yet Preflight-Grade

Severity: Medium

Validation today catches useful authoring issues:
- missing URLs
- empty alt text
- empty worksheet structures
- tab/resource configuration gaps

Reference:
- [activityRegistry.js](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/composer/activityRegistry.js:2111)

Missing classes of checks:
- contrast/accessibility
- duplicate IDs/anchors
- broken internal references
- mobile overflow risk
- hidden empty content
- unreachable interaction states
- copy/design quality linting

World-class requirement:
- preflight checks before save/publish
- issue severity and suggested fixes
- "fix it" actions where possible

### 10. History Model Is Fragmented

Severity: Medium

Current history is split across:
- draft undo/redo in create flow: [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:2362)
- local autosave/saved drafts in create flow: [Phase1.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/Phase1.jsx:1698)
- module version history in edit flow after save: [EditModal.jsx](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/components/modals/EditModal.jsx:4421)

Impact:
- no single mental model for recovery
- users do not know whether an action is draft-local, saved-to-module, or only in browser
- edit flow feels weaker than create flow

World-class requirement:
- unified timeline: local draft history + saved versions + named checkpoints

### 11. Layout Model Is Still Flat

Severity: Medium

Activities are powerful, but the authoring model is still mostly a flat list placed into a grid.

References:
- [layout.js](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/composer/layout.js:382)
- [activityRegistry.js](/Users/deanguedo/Documents/GitHub/Course-factoryPERFECT/src/composer/activityRegistry.js:2048)

Impact:
- difficult to build section-based page structure
- hard to move a whole region as one unit
- limits hierarchy, reuse, and responsive behavior

World-class requirement:
- sections
- containers
- rows/stacks
- nested groups
- explicit page outline tree

## Why It Feels Hard In Practice

These are the direct reasons authors feel friction today:

1. They are editing the workspace and the page at the same time.
2. They are manipulating proxy block cards, not the actual page.
3. The create flow teaches interactions that the edit flow does not fully preserve.
4. Preview behavior is helpful but not authoritative.
5. The tool offers many powers before it offers clear hierarchy.

In short:
The composer has many knobs, but not enough strong defaults and not enough structural clarity.

## What World-Class Looks Like

### Authoring Model
- one composer engine used everywhere
- one shared interaction model
- one authoritative document state
- one preview surface treated as the page

### UX
- insert block with slash menu or command palette
- click block in preview to select it
- drag real blocks with visible drop zones
- use left panel as outline/components/inspector, not as a separate universe
- breakpoint toggle is always visible

### Recovery
- local autosave
- undo/redo everywhere
- named snapshots
- diff before publish
- safe recovery after failed compile/runtime change

### Reuse
- shared symbols/components
- starter sections
- theme-aware variants
- project-wide sync

### Quality
- accessibility and design linting
- device preview modes
- issue overlays
- high-confidence preview/export parity

## Recommended Build Order

### Phase A: Structural Refactor

Goal:
remove the architecture that is making the workflow brittle

Do first:
1. Extract a shared `ComposerWorkspace` shell used by Phase1 and EditModal.
2. Move mutation logic into a dedicated controller hook or store.
3. Move preview sync into a dedicated bridge.
4. Move history into a shared subsystem.

Success criteria:
- create and edit use the same composer internals
- undo/redo works in both surfaces
- canvas behavior matches in both surfaces

### Phase B: Direct-Manipulation Authoring

Goal:
make editing feel like editing the page, not editing metadata

Do next:
1. Add selectable overlays inside the live preview.
2. Click preview block to select it in inspector.
3. Show spacing/layout guides on demand.
4. Keep left panel as outline/tree + inspector.

Success criteria:
- author can primarily work on the preview stage
- builder proxy becomes secondary or optional

### Phase C: Responsive Composer

Goal:
make the output behave like a real modern builder

Do next:
1. Add desktop/tablet/mobile breakpoints.
2. Add device preview toggle.
3. Add per-breakpoint layout/visibility/order.
4. Add responsive spacing and typography overrides.

Success criteria:
- same module can be tuned across device classes
- authors stop using one compromised global layout

### Phase D: Reuse And Design System

Goal:
make quality scalable

Do next:
1. Add project-level components/symbols.
2. Add global design tokens for type, spacing, radius, elevation, motion.
3. Add component variants and state presets.
4. Add starter sections and patterns.

Success criteria:
- authors build faster
- modules look consistent without repetitive manual styling

### Phase E: Preflight And QA

Goal:
make authors trust the composer

Do next:
1. Expand validation into preflight QA.
2. Add a11y and contrast checks.
3. Add broken-link and empty-state checks.
4. Add mobile overflow and hidden-content checks.
5. Add publish-readiness score or checklist.

Success criteria:
- fewer broken modules escape into preview/export
- quality problems are visible before publishing

## First Three Implementation Targets

If only three things are funded immediately, do these:

1. Shared composer engine across create/edit
2. Direct-manipulation preview selection and editing
3. Responsive breakpoint model

That is the shortest path from "capable but hard" to "best-in-class and trusted."

## Things To Avoid

1. Do not add many more block types before fixing the authoring model.
2. Do not deepen Phase1/EditModal duplication.
3. Do not keep adding workspace tuning controls as a substitute for better defaults.
4. Do not make preview quality depend on iframe resets and timers.
5. Do not treat browser-local templates as the long-term reuse system.

## Recommended Immediate Next Sprint

Sprint theme:
Composer foundation cleanup

Scope:
1. Extract shared composer workspace state and mutation hook.
2. Port EditModal to the same engine used by Phase1.
3. Add undo/redo parity in EditModal.
4. Move preview synchronization into a shared helper.
5. Reduce workspace controls to sane defaults and advanced-only overflow.

Expected result:
- same behavior in create and edit
- lower cognitive load
- less "why did that move/update/remount?" confusion
- stronger foundation for responsive and symbols work
