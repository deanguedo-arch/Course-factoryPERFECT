# PROJECT LOG: Course Factor

## Project Mission
**Course Factor** - A specialized engine for creating, managing, and compiling sports psychology courses optimized for university students and embedded delivery via Google Sites.

## Tech Stack
- **Frontend:** React 19, Lucide React, Tailwind CSS 4
- **Backend:** Firebase (Auth & Firestore)
- **Build Tool:** Vite
- **Platform:** Google Workspace / Google Sites (via Embed Code)

## Deep Feature Inventory
### Phase 0: Master Shell (The UI Engine)
- **Layout Control:** Real-time toggles for Sidebar, Footer, and Navigation position (Side vs Top).
- **Theming:** Centralized control for fonts, test colors, and material colors.
- **Master Shell Scripting:** Logic to ensure modules work in sandboxed environments (window-scope attachment).

### Phase 1: Harvest (The Content Ingestor)
- **AI Studio Creator:** Optimized prompt generator for Google AI Studio (JSON schema extraction).
- **V7 Gap-Parser:** Custom line-by-line algorithm for extracting code blocks from large "Monolith" HTML files without breaking logic.
- **Assessment Center:** 
  - Multiple Question Types (Multiple Choice, Long Answer).
  - Master Assessment management & Smart Import.
  - Question migration tool.
- **Material Card Generator:** Dedicated tool for PDF embeds and Google Drive link management.
- **Feature Creator:** System for building reusable "Toolkit" components.

### Phase 2: Preview & Test (The Sandbox)
- **Unified Previewer:** Iframe-based sandbox for testing Modules, Assessments, Materials, and Toolkit features.
- **Bulk Operations:** Multi-select tools for hiding/showing modules in mass.
- **Search & Filter:** Instant search across title, ID, and category.

### Phase 3: Manage & Reset (State Control)
- **Local History/Rollback:** `history` array per module for version control.
- **Backup/Restore:** Full project state export/import via JSON.
- **Safety Valves:** Project reset functionality with mandatory backup verification.

### Phase 4: Compile & Export (The Publisher)
- **Legacy Compiler:** Generates a single-file "Monolith" HTML for easy sharing.
- **Beta Multi-File Publisher:** 
  - ZIP export with proper file structure (`index.html`, `manifest.json`, `modules/` folder).
  - Delta Publish (exporting only specific updated modules).
  - Single-Page App (SPA) vs Multi-file structure options.

## Project History (Archaeology)
### Recent Milestones (Jan 2026)
- [x] **Vault Architecture:** Adopted "Smart Vault" strategy (Hybrid Repo/External) to solve link rot.
- [x] **Vault Infrastructure:** Created `scan-vault.js` and `SCAN_VAULT.bat` for local asset indexing.
- [x] **Vault UI Component:** Built `VaultBrowser.jsx` for browsing local assets.
- [x] **Safety Protocol:** Implemented "Confidence Check" rule (Rule 000 & Universal) to prevent AI from making risky changes without a safe test.
- [x] **Cursor Rule System v2.0:** Upgraded from a single `.cursorrules` file to a 7-rule specialized `.cursor/rules/` system (Architect Mode, Token Economy, Parser Protection).
- [x] **Beta ZIP Export:** Completed the multi-file static publish system with ZIP generation.
- [x] **Phase 1 Parser Refinement:** Updated AI Studio prompt generation for better JSON accuracy.
- [x] **Assessment Edit Logic:** Fixed deep-editing bugs in the Assessment Center.
- [x] **Master Shell Visuals:** Added centralized control for fonts and material colors.
- [x] **Validation Suite:** Implemented "Broken Thing" detection and link testers for materials.

### Earlier Development (2025)
- [x] **Auto-Save Monolith:** Implemented persistent state saving to prevent data loss.
- [x] **Hamburger Nav Fix:** Resolved tablet/mobile overlap issues in the navigation.
- [x] **Toast System:** Built a custom React-based notification system from scratch.
- [x] **Initial Extraction Engine:** First versions of the regex-based HTML extractor.

## Lessons Learned & Guardrails
- **Encoding:** Special character encoding is a persistent challenge; refer to `ENCODING_FIX_GUIDE.md`.
- **Sandbox Rules:** Google Sites iframes *require* event delegation and window-global functions.
- **Scaling:** `App.jsx` at 12k lines is approaching the limit of efficient AI processing; modularization is now a priority.
- **Vault Rules:** Videos stay external (YouTube/Vimeo); Docs/PDFs go to Repo (Vault).

## Active Goal
- **Smart Vault Implementation:** Building the "Asset Vault" system for offline/repository-based file management to eliminate link rot.

## Next Step
- Integrate `VaultBrowser` into `App.jsx` Material Manager and test the full flow.
