# Certificate System Exploration Report

## 1. Certificate Generation/Rendering Code

### Primary Certificate Page
- **File**: `projects/ciszukoantony/website/src/app/certificates/page.tsx`
- **Framework**: Next.js 15 App Router
- **Purpose**: Renders all certificates and supporting documents in a filterable/sortable grid
- **Key imports**:
  - `CERTIFICATES` and `OTHER_DOCS` from `../data/certificates`
  - `PREVIEWS_BY_FILE` from `../data/certificates.previews`
  - `CertificateCard` component for individual certificate display
  - `DetailModal` for certificate details view

### Certificate Data Structure
- **File**: `projects/ciszukoantony/website/src/data/certificates.ts`
- **Type**: `Certificate` interface with `holderName` field
- **Content**: 150+ certificate entries, each with:
  - `id`, `title`, `provider`, `category`, `date`, `files`, `holderName`
  - `holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA'` appears in ~150/150 entries

### PDF Thumbnail/Rasterization
- **Script**: `projects/ciszukoantony/website/scripts/sync-certificates.js`
- **Technology**: `pdfjs-dist` + `@napi-rs/canvas`
- **Process**:
  1. Scans `shared/docs/certificados/` for PDF files
  2. Renders page 1 of each PDF to PNG at 1.2x scale (800x600 max)
  3. Generates `certificates.previews.ts` manifest mapping filenames to preview filenames
  4. Cleans old previews before regenerating

### Fallback Thumbnail Component
- **File**: `projects/ciszukoantony/website/src/components/certificates/PdfThumbnail.tsx`
- **Purpose**: Renders when no real preview exists
- **Content**: Static SVG circle with "Preview unavailable" text
- **Note**: All certificates should have real previews after `pnpm sync:certificates`

## 2. Name "FRANCISCO ANTONIO GARCIA MENOLASCINA" Location

The name appears in the `holderName` field of certificate data:

**Location**: `projects/ciszukoantony/website/src/data/certificates.ts`

**Occurrences**: Present in virtually ALL certificate entries (over 150), for example:
- Line 103: `holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA'` (EF SET English Certificate)
- Line 119: `holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA'` (Penn ELP English Fundamentals)
- Line 135: `holderName: 'FRANCISCO ANTONIO GARCIA MENOLASCINA'` (Spoken English Course)
- Lines 152, 166, 180, 208, 222, 237, 250, 263, 276, 291, 304, 317, 330, 347, 405, 420, 435, 450, 465, 480, 491, 502, 513, 525, 537, 549, 561, 573, 585, 597, 609, 723, 735, 747, 760, 772, 783, 795

**Important**: The name is **stored as metadata**, NOT rendered dynamically from the PDF files. It's a field in the certificate data schema that gets displayed in the legal disclaimer section at the bottom of the certificates page.

## 3. Ciszukoantony Certificate System Structure

### Directory Layout
```
projects/ciszukoantony/website/
├── src/data/certificates.ts        # Certificate data definitions
├── src/data/certificates.previews.ts # Auto-generated preview manifest
├── src/components/certificates/    # UI components
│   └── PdfThumbnail.tsx           # Fallback thumbnail
├── src/app/certificates/           # Next.js page router
│   └── page.tsx                   # Main certificates page
├── scripts/
│   ├── sync-certificates.js       # PDF→PNG rasterization + manifest gen
│   └── create-certificate-thumbnails.ps1 # PowerShell setup script
└── docs/certificates-system.md    # Documentation
```

### Data Flow
1. `sync-certificates.js` scans `shared/docs/certificados/` for PDFs/images
2. Renders PDF page 1 to PNG using pdfjs + canvas
3. Writes `certificates.previews.ts` manifest
4. Web page reads manifest to display real previews
5. If no preview exists → falls back to `PdfThumbnail` static icon

### Preview Resolution Order (from `sync-certificates.js` lines 235-249)
```javascript
const candidates = [
  `${baseName}-preview.png`,
  `${baseName}-preview.jpg`,
  `${baseName}-preview-preview.jpg`,
  `${fullName}-preview.png`,
  `${fullName}-preview.jpg`,
];
```
Checks for existence in `shared/docs/certificados/previews/` and returns first match.

## 4. Fair Use Icons

### Current State
- **No dedicated "fair use icon" component** exists in the codebase
- **Fair use text** appears in a legal disclaimer section at the bottom of the certificates page

### Fair Use Text Reference
- **File**: `projects/ciszukoantony/website/src/app/certificates/page.tsx`
- **Lines**: 1052-1059
- **Content**:
  ```
  Fair use — honest portfolio display
  All documents on this page belong to their respective issuers and are shown for
  portfolio purposes only, under fair use and with full authority of the holder.
  They are never modified or falsified, and they never impersonate any institution.
  ```

### Holder Identification
- **Line 1062**: `Holder: <span className="font-bold text-white">FRANCISCO ANTONIO GARCIA MENOLASCINA</span>`

### Icon Usage
- The fair use section uses a "copyright" type SVG icon (rendered as `<svg>` path in the JSX at line 1045-1050)
- No special "fair use" icon - uses generic decorative SVG

## 5. External Links Icons

### EXTERNAL_LINKS Array
- **File**: `projects/ciszukoantony/website/src/app/certificates/page.tsx`
- **Lines**: 139-181
- **Purpose**: Provider logos with links to external platforms

### External Icon (from icon-registry)
- **File**: `packages/ui/src/generated/icon-registry.ts` line 59
- **Definition**:
  ```typescript
  external: { viewBox: "0 0 24 24", inner: "<path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/><polyline points=\"15 3 21 3 21 9\"/><line x1=\"10\" y1=\"14\" x2=\"21\" y2=\"3\"/>", stroke: true }
  ```
- **Visual**: Standard external/link arrow icon (similar to lucide/external)

### External Links Shown
The `EXTERNAL_LINKS` array includes icons + links for:
1. Cisco Networking Academy → skillsforall.com
2. Microsoft Learn → learn.microsoft.com
3. IBM SkillsBuild → skillsbuild.org
4. HP Life → hp.com
5. EF SET → efset.org
6. Penn ELP → elp.upenn.edu
7. 16Personalities → 16personalities.com
8. Simplilearn → simplilearn app link

### Usage in Certificate Cards
- Displayed in the certificate card header under the category badge
- Also shown in the Provider color band
- Used in the DetailModal for verification links

### Other External Link Icons in Codebase
- **`packages/ui/src/BehaviorGuards.tsx`**: Detects external links and shows warning guard
- **`packages/ui/src/LegalCiszuLink`**: Links to full policies page
- **`packages/ui/src/Ads.tsx`**: Distinguishes 'external' ad source with specific styling

## 6. Preview/Thumbnail Generation Code and Issues

### Generation Script: `sync-certificates.js`
```javascript
// Key functions:
- rasterizePdfPage1(): Uses pdfjs-dist + @napi-rs/canvas to render PDF page 1 to PNG
- resolvePreview(): Checks for preview files in shared/docs/certificados/previews/
- writePreviewManifest(): Generates certificates.previews.ts
- syncCertificates(): Main entry point - scans, rasterizes, writes manifest
```

### Current Preview Status
- **Many PDFs have real previews** (see `certificates.previews.ts` with 70+ entries)
- **Previews stored in**: `shared/docs/certificados/previews/`
- **Naming convention**: `<filename>-preview.png` or `<filename>-preview.jpg`

### Known Issues/Challenges

1. **Native dependency requirement**: 
   - Requires `@napi-rs/canvas` which needs build tools (Python, MSBuild)
   - Installation can fail on systems without proper build environment

2. **Preview cleanup is destructive** (lines 291-297):
   ```javascript
   // 0) Limpiar previews viejas para regenerarlas todas desde cero
   if (fs.existsSync(PREVIEWS_DIR)) {
     const oldPreviews = fs.readdirSync(PREVIEWS_DIR);
     for (const old of oldPreviews) {
       fs.unlinkSync(path.join(PREVIEWS_DIR, old));
     }
   ```
   - Deletes ALL existing previews before regenerating
   - Custom thumbnails could be lost

3. **PDF rasterization limitations**:
   - Only renders page 1 - later pages not visible
   - Text selection not possible in preview images
   - Complex PDF layouts may not render perfectly

4. **Performance**: 
   - Rasterizing 150+ PDFs can take significant time
   - Each PDF rendered at 1.2x scale to max 800x600

5. **Missing previews**: 
   - If no preview exists after sync, `PdfThumbnail` fallback shows
   - Fallback: Static SVG with "Preview unavailable" text

### Recommended Workflow
1. Run `pnpm sync:certificates` to generate all previews
2. Verify previews appear correctly in the web page
3. For specific certificates, add custom thumbnails named `<base>-preview.jpg` in `shared/docs/certificados/previews/`
4. Re-run sync to update manifest if adding new files

## Summary

| Aspect | Status |
|--------|--------|
| Certificate rendering | ✅ Working in `page.tsx` |
| Name "FRANCISCO ANTONIO GARCIA MENOLASCINA" | ✅ In `holderName` field of all certificates |
| Ciszukoantony certificate system | ✅ Complete: data → previews → UI |
| Fair use icons | ❌ None - only text disclaimer in UI |
| External links icons | ✅ In `EXTERNAL_LINKS` array, using `external` icon from registry |
| Preview/thumbnails | ✅ Generated by `sync-certificates.js`, fallback via `PdfThumbnail` |
| Thumbnail generation issues | ⚠️ Native deps required, destructive cleanup, PDF rendering limits |