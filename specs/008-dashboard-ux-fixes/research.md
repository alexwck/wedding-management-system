# Research: Dashboard UX Redesign & Bug Fixes

**Branch**: `008-dashboard-ux-fixes` | **Date**: 2026-04-25

## R1: XLSX Export Bug Root Cause

**Decision**: Fix filename sanitization and verify buffer handling

**Findings**:
- The filename regex `replace(/[^a-zA-Z0-9]/g, "-")` converts "Alex & Sam" to "Alex---Sam" (multiple consecutive hyphens)
- The ExcelJS `writeBuffer()` returns a Promise that resolves to an ArrayBuffer
- The client-side handler creates a `Blob` from the buffer and triggers download via object URL
- Excel error "file format or file extension is not valid" typically indicates the buffer is corrupted or the Content-Type is wrong

**Root Cause Hypothesis**: The buffer returned from the server action may lose its binary integrity during serialization. Server actions serialize return values as JSON by default — an ArrayBuffer serialized as JSON and deserialized on the client would be corrupted. The `data` field containing the ExcelJS buffer needs to be converted to a transferable format (e.g., base64 string or Uint8Array) before returning from the server action.

**Fix Approach**:
1. Convert the ExcelJS buffer to a Uint8Array or base64 string in the server action
2. On the client, convert back to a Blob with proper MIME type (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)
3. Sanitize filename: replace `&` with "and", collapse multiple hyphens to single, trim leading/trailing hyphens

**Alternatives Considered**:
- Returning the buffer directly (current approach — fails due to serialization)
- Using a Next.js API route with streaming response (works but adds complexity)
- Using base64 encoding (adds ~33% size overhead but reliable)

## R2: Date Picker Component

**Decision**: Use native HTML `<input type="datetime-local">` wrapped in a shadcn/ui-styled component

**Findings**:
- shadcn/ui does not include a built-in datetime picker — it has a date picker (calendar + popover) but not datetime
- Adding a third-party datetime library (react-datepicker, @mui/x-date-pickers) introduces heavy dependencies
- Native `datetime-local` input is well-supported across all modern browsers and provides both date and time selection
- The native input can be styled with Tailwind to match the glassmorphism design system

**Rationale**: The wedding date only needs to be set once or twice. A full-featured datetime library is overkill for this use case. The native input provides the correct functionality with zero additional dependencies.

**Alternatives Considered**:
- shadcn/ui Calendar + manual time select (requires composing two inputs)
- react-datepicker (heavy dependency, not needed)
- Separate date input and time input (more complex UX)

## R3: Focal Point Implementation

**Decision**: Store focal point as percentage-based (x, y) coordinates and use CSS `object-position` for rendering

**Findings**:
- CSS `object-position` accepts percentage values that position the focal point within an `<img>` element using `object-fit: cover`
- `object-position: 50% 50%` is the default (center)
- `object-position: 30% 70%` positions the image so 30% from the left and 70% from the top are centered
- The template image on the landing page already uses an `<img>` tag — adding `object-position` is a one-line CSS change

**Rationale**: Percentage-based coordinates are resolution-independent and work at any container size. Storing as DECIMAL(5,2) in the database (e.g., 30.00, 70.00) is clean and precise. Using `object-position` avoids any image manipulation or cropping on the server.

**Alternatives Considered**:
- Server-side image cropping (adds processing complexity, storage for cropped version)
- CSS `background-position` (works but requires switching from `<img>` to background-image)
- Storing pixel coordinates (breaks at different container sizes)

## R4: Floor Plan Catalog Overflow

**Decision**: Add `max-h-screen` and `relative` positioning with `h-full` to constrain the catalog within viewport

**Findings**:
- Current catalog uses `overflow-y-auto` on a `flex flex-col` container without explicit height constraints
- The catalog expands indefinitely based on content, which can push it beyond the viewport
- On collapse/expand toggle, the transition animation may cause the height calculation to be incorrect

**Fix Approach**:
1. Set the catalog container to `h-screen` or use `max-h-[calc(100vh-...)]` to constrain to viewport
2. Ensure `overflow-y-auto` applies when content exceeds the max height
3. Test the collapse/expand toggle with all items visible

## R5: Chair Count Editing Fix

**Decision**: Investigate and fix the visibility of chair count editing controls

**Findings**:
- The `handleChairCountChange` function exists and appears correct (lines 506-526 of floor-plan-canvas.tsx)
- Chair count editing controls are rendered at lines 910-951 with conditional rendering based on `selectedItem?.type` being `round_table` or `long_table`
- The controls use `absolute bottom-2 left-2 z-20` positioning within a glass-panel

**Potential Issues**:
1. The `selectedItem` state might not be set correctly when a table is clicked
2. The absolute positioning might be hidden behind other elements (z-index conflict)
3. The condition `selectedItem?.type === "round_table" || selectedItem?.type === "long_table"` might not match the actual type values stored in state

**Fix Approach**: Debug by checking what `selectedItem` contains when a table is selected, verify the type string matches exactly, and ensure the overlay renders at the correct position with proper z-index.

## R6: Google Sheets Removal Scope

**Decision**: Remove all Google Sheets code + UI + OAuth flow + drop oauth_tokens table

**Files to modify**:
- `src/app/actions/export.ts`: Remove 5 functions (createOAuth2Client, getGoogleAuthUrl, handleGoogleCallback, getGoogleAuthStatus, exportToGoogleSheets), remove `googleapis` import
- `src/components/export-buttons.tsx`: Remove Google button, auth check, isGoogleExporting state
- `src/types/oauth.ts`: Delete entire file

**Migration**: New migration to `DROP TABLE public.oauth_tokens CASCADE`

**Package cleanup**: Remove `googleapis` from package.json if no other code references it

**Alternatives Considered**:
- Code-only removal, keep DB table (rejected per user's clarification)
- Gradual deprecation (rejected — pre-release, no backward compatibility needed)
