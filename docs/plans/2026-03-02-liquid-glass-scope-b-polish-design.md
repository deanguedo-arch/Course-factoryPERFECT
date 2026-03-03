# Liquid Glass Scope B Polish (Design Spec)

**Date:** 2026-03-02

## Goal

Refine the current Liquid Glass B styling so the UI feels cleaner and less clunky while preserving the existing workflow and component structure.

## Context

Scope B is already implemented across shell surfaces. Current feedback is visual heaviness (too much blur/noise/intensity).

## Approaches Considered

1. **Token-only polish (recommended)**
- Adjust existing glass CSS tokens: blur, saturation, border alpha, highlight opacity, shadows, background noise.
- Pros: fast, low risk, global consistency.
- Cons: cannot fix deep per-component contrast edge cases.

2. **Per-surface tuning**
- Tune each phase/sidebar section individually.
- Pros: precise local control.
- Cons: inconsistent language and larger maintenance cost.

3. **Hybrid (token + selective per-surface)**
- Global token tuning plus targeted overrides for a few panels.
- Pros: balanced.
- Cons: extra complexity for limited immediate value.

## Selected Design

Use **Approach 1 (token-only polish)** for this pass.

### Visual changes

- Reduce blur and saturation to improve clarity.
- Lower noise overlay and gradient intensity in the page atmosphere.
- Soften specular highlights and border contrast.
- Keep depth cues but reduce shadow heaviness.

### Non-goals

- No input/control restyling (scope C deferred).
- No JSX structure churn beyond what already exists.

## Acceptance Criteria

- Surfaces feel cleaner and more focused.
- Sidebar and phase panels remain visually cohesive.
- Text and controls retain readability.
- `npm run build` passes.
