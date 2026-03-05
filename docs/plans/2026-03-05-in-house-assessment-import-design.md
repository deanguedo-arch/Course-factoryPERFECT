# In-House Assessment Import Design

**Date:** 2026-03-05

**Goal:** Add a zero-cost, in-house file import path for assessment source documents so users can upload `docx` files and text-based `pdf` files directly into Phase 1, inspect extracted text, and continue through the existing `Review -> Compose -> Publish` workflow without relying on external AI for the normal path.

## Scope

This design adds local document extraction on top of the existing in-house assessment parser and flow gating work already in the `assignment-rebuild` branch.

Included:
- Direct upload from the local machine
- Temporary extraction only; uploaded files are not saved into project data
- `docx` extraction
- Text-based `pdf` extraction
- Intermediate extracted-text screen before parsing
- Reuse of the existing in-house parser and review pipeline
- Scanned/image-PDF detection with a clear fallback message

Excluded:
- OCR for scanned PDFs
- Vault-based file selection
- Automatic storage of source documents in materials or project data
- Replacing the `Migrate` fallback path

## Product Flow

The Assessment Center import path becomes:

1. User opens `Import`
2. User chooses `Paste` or `Upload File`
3. If `Upload File`, user selects a `.docx` or `.pdf`
4. App extracts raw text locally in the browser
5. App shows an intermediate extraction screen with editable text
6. User reviews or cleans the extracted text
7. User clicks `Parse Into Review`
8. Existing in-house parser converts text into structured questions
9. User continues through `Review -> Compose -> Publish`

`Migrate` remains available as a legacy fallback inside Import, but it is no longer the primary path.

## Architecture

The implementation should extend the current assessment domain rather than adding a one-off parser inside `Phase1.jsx`.

New extraction helpers:
- `src/assessment/import/extractDocxText.js`
- `src/assessment/import/extractPdfText.js`
- `src/assessment/import/detectScannedPdf.js`

Existing parser reused:
- `src/assessment/import/index.js`
- `src/assessment/import/parseJsonImport.js`
- `src/assessment/import/parseTextImport.js`

UI integration:
- `src/components/Phase1.jsx` remains the orchestration layer for the short term
- Add temporary upload/extraction state in Phase 1
- Reuse current import preview, review, compose, and publish stages

The extraction layer should output plain text only. It should not attempt to interpret question structure. Structural parsing remains the responsibility of `parseAssessmentImport`.

## Data Flow

### DOCX

1. Browser reads selected file into an `ArrayBuffer`
2. `extractDocxText` uses a browser-safe library to pull raw text
3. Extracted text populates the intermediate text editor
4. Edited text is passed to `parseAssessmentImport({ kind: 'auto', content })`

### PDF

1. Browser reads selected file into an `ArrayBuffer`
2. `extractPdfText` uses a browser-safe PDF text extractor
3. Text is collected page-by-page into a normalized string
4. `detectScannedPdf` evaluates extraction quality
5. If extraction is weak, show a warning that the PDF may be scanned
6. User can still inspect/edit the text if any was extracted
7. Edited text is passed to `parseAssessmentImport({ kind: 'auto', content })`

## State Model

Phase 1 should add temporary import state for:
- selected file metadata
- extraction status: `idle | extracting | ready | error`
- extracted text
- extraction warning
- extraction error
- import source mode: `paste | upload`

This state is session-only and should be cleared when:
- import is reset
- parse is committed into Review
- a new file is selected

No file blobs or array buffers should be stored in project data.

## Error Handling

### DOCX errors

If text extraction fails:
- keep the user in Import
- show a clear error banner
- do not mutate review state

### PDF errors

If no meaningful text is extracted:
- show a warning that the file may be scanned or image-based
- keep `Migrate` as fallback guidance
- do not silently create empty questions

### Parse errors

If extraction succeeds but parsing is weak:
- show parser issues exactly as the current smart import path does
- allow the user to edit extracted text and parse again

## UX Notes

The intermediate extracted-text screen is required because PDF/DOCX extraction is inherently noisy. The user needs a checkpoint to fix line breaks, answer key formatting, and mixed question formatting before parser interpretation.

The upload UI should feel like an extension of the current Smart Import screen, not a separate product surface. Keep the existing visual language and tab structure, but make the normal path clearer:
- `Paste`
- `Upload File`
- `Migrate` fallback

## Testing Strategy

Unit tests:
- `extractDocxText` returns text from a representative docx fixture
- `extractPdfText` returns text from a representative text PDF fixture
- `detectScannedPdf` flags low-text extraction
- extracted text can be parsed into canonical questions with the existing parser

UI behavior verification:
- upload docx -> text shown -> parse -> review populated
- upload text PDF -> text shown -> parse -> review populated
- upload weak/scanned PDF -> warning shown, no silent success
- parse can be retried after editing extracted text

## Dependencies

The design assumes browser-safe extraction libraries:
- DOCX text extraction library
- PDF text extraction library

These libraries must run in the Vite browser build and avoid introducing a backend requirement.

## Rollout

Phase 1:
- Add upload/extraction flow for `docx` and text PDFs
- Keep paste path and Migrate fallback intact

Phase 2:
- Refactor import UI into dedicated subcomponents if needed
- Improve PDF heuristics

Phase 3:
- Consider OCR only if scanned PDFs become a major requirement
