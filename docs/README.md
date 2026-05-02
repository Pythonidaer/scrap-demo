# Scrap Demo

Family scrapbook editor: draggable, resizable, rotatable text and images on a fixed page, with PNG/PDF/HTML export.

## Conventions

- **Stack:** React + TypeScript (Vite), functional components only.
- **State:** React state in memory only (no `localStorage`; each full reload starts with the default text object).
- **Theme:** Forest green (`#1f4d3a` primary, `#2e7d5b` accent, `#0f2a20` chrome background).
- **Layout:** Full-width title bar, then a single horizontal toolbar (edit controls left, export right), then main row = centered canvas workspace + right properties panel (no left sidebar).
- **Page:** 816×1056 CSS pixels, white; objects may extend outside the page bounds.

## Object model

See `src/types/scrapbook.ts` for `CanvasObject`, `TextObject`, and `ImageObject`. Image placements keep the full bitmap in `originalSrc` (same data URL as `src` on upload); `cropZoom` and `flipHorizontal` only affect display inside the frame.

## Export

- **PNG / PDF:** Rasterize the `.page` with `html2canvas` at `scale: 2`, then composite onto **816×1056** with **uniform** scale and centering (no non-uniform stretch). Selection hidden; zoom wrapper forced to `scale(1)` before capture.
- **HTML:** Standalone file with `.page` and `.el` elements; loads the same Google fonts as the app, uses nested `.t` for text (matching editor padding/line-height), image markup matches `imageObjectRender`, body chrome `#c7d6cd`, flex-start alignment.
- **Upload:** New images are scaled to fit within **420×520** while preserving aspect ratio and showing the full bitmap (`object-fit: contain`).
