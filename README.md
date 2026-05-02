# Scrap Demo

A **family scrapbook–style design editor** in the browser: place text and photos on a fixed page, style them, and export your layout as PNG, PDF, or standalone HTML.

**Live site:** [https://pythonidaer.github.io/scrap-demo/](https://pythonidaer.github.io/scrap-demo/)

---

## Features

### Canvas & layout

- **Fixed page** at **816×1056** pixels (white “paper” on a forest-green workspace).
- **Pan/zoom** via toolbar control so you can work comfortably on any screen size.
- **Responsive shell:** on narrow viewports the editor stacks with a full-width properties panel; touch-friendly control sizes where it helps.
- **Accessible defaults:** skip link to the canvas, semantic landmarks, labeled form controls, focus-visible styles, reduced-motion support, and screen-reader-friendly object labels.

### Text objects

- **Move, resize, and rotate** with pointer or touch; **double-click** (or focus + **Enter** / **Space** when selected) to edit.
- **Font family** picker (Google Fonts wired in the app and in HTML export).
- **Font size** slider.
- **Bold, italic, underline** toggles.
- **Text and highlight color** via picker and CSS color text field.

### Image objects

- **Upload** PNG, JPEG, WebP, or GIF (multiple files supported).
- **Move, resize, rotate** like text.
- **Flip horizontal** toggle.
- **Crop zoom** slider: **non-destructive**—the full image stays in `originalSrc`; zoom only changes how it is framed in the box.

### Editing workflow

- **Undo / redo** for edit operations.
- **Selection** clears when you click empty canvas or page background.
- **Fresh load:** state lives in memory only (no `localStorage`)—each reload starts from the default text object.

### Export

- **PNG** — raster snapshot of the page (high-DPI capture, then normalized to 816×1056 without non-uniform stretch).
- **PDF** — same raster pipeline exported as a PDF.
- **HTML** — self-contained file with inlined layout and fonts link so it resembles the editor when opened offline.

---

## Tech stack

| Area        | Choice |
|------------|--------|
| UI         | React 18, TypeScript |
| Build      | Vite 5 |
| Capture    | html2canvas |
| PDF        | jsPDF |
| Icons      | lucide-react |

---

## Local development

```bash
npm install
npm run dev
```

Other scripts:

- `npm run build` — typecheck + production build to `dist/`
- `npm run preview` — serve the production build locally

---

## Deployment & automation (GitHub Actions)

This repo uses **[GitHub Actions](https://docs.github.com/en/actions)** to **build and deploy** the static site to **GitHub Pages**. In practice that is a small **CI/CD pipeline**:

- **Continuous integration (CI):** on every push to `main` or `master` (and on manual **workflow_dispatch**), the workflow checks out the code, installs dependencies with `npm ci`, and runs `npm run build` so broken commits surface as failed checks.
- **Continuous deployment (CD):** if the build succeeds, the `dist/` folder is uploaded as a Pages artifact and **`actions/deploy-pages`** publishes it to your GitHub Pages URL.

**DevOps** is the wider idea (collaboration, automation, and reliable delivery). This workflow is one concrete **automation** piece—people often say they “use CI/CD with GitHub Actions” or run a “Pages deploy pipeline,” which fits under that umbrella without being the whole of DevOps.

Configuration notes:

- **Repository → Settings → Pages → Source** must be **GitHub Actions** (not “Deploy from a branch”) or deployment will fail (for example with a **404** when creating the deployment).
- Production builds set `BASE_PATH` to `/<repository-name>/` so asset URLs work for a project site; a repository named `*.github.io` uses `/` instead. See `vite.config.ts` and `.github/workflows/deploy-github-pages.yml`.

Workflow file: [`.github/workflows/deploy-github-pages.yml`](.github/workflows/deploy-github-pages.yml).

---

## Project layout (high level)

| Path | Purpose |
|------|---------|
| `src/App.tsx` | Shell, canvas, zoom, export orchestration |
| `src/components/` | Header, toolbar, right panel, scrap objects |
| `src/hooks/useScrapbookState.ts` | Objects + undo/redo |
| `src/constants.ts` | Theme, page size, helpers |
| `src/types/scrapbook.ts` | `TextObject`, `ImageObject`, etc. |
| `src/utils/export.ts` | PNG/PDF/HTML export |
| `src/utils/imageObjectRender.ts` | Shared image box styles (editor + HTML) |

Additional implementation notes live in [`docs/README.md`](docs/README.md).

---

## License

This project is private per `package.json`; add a `LICENSE` file if you publish it publicly.
