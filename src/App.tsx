import { useCallback, useEffect, useRef, useState } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { Toolbar } from './components/Toolbar';
import { RightPanel } from './components/RightPanel';
import { ScrapObject } from './components/ScrapObject';
import { useScrapbookState } from './hooks/useScrapbookState';
import { createImageObjectFromDataUrl, createNewText, DEFAULT_TEXT_OBJECT_ID, PAGE_HEIGHT, PAGE_WIDTH } from './constants';
import {
  buildStandaloneHtml,
  downloadPdfFromCanvas,
  downloadPngFromCanvas,
  rasterizePageElement,
} from './utils/export';
import type { ScrapObject as SO } from './types/scrapbook';
import { loadNaturalSizeFromDataUrl, readFileAsDataUrl } from './utils/imageLoad';

export function App() {
  const {
    objects,
    updateObjects,
    patchObject,
    patchObjectSilent,
    commitAfterSilentGesture,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useScrapbookState();

  const [selectedId, setSelectedId] = useState<string | null>(DEFAULT_TEXT_OBJECT_ID);
  const [zoom, setZoom] = useState(1);
  const [exportBusy, setExportBusy] = useState(false);

  const pageRef = useRef<HTMLDivElement | null>(null);
  const objectsRef = useRef(objects);
  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);

  const toPage = useCallback((cx: number, cy: number) => {
    const el = pageRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: ((cx - r.left) / r.width) * PAGE_WIDTH,
      y: ((cy - r.top) / r.height) * PAGE_HEIGHT,
    };
  }, []);

  const onGestureStart = useCallback(
    () => JSON.parse(JSON.stringify(objectsRef.current)) as SO[],
    [],
  );

  const selected = objects.find((o) => o.id === selectedId) ?? null;

  const runExport = useCallback(async (kind: 'png' | 'pdf') => {
    const el = pageRef.current;
    if (!el) return;
    setExportBusy(true);
    try {
      const canvas = await rasterizePageElement(el);
      if (kind === 'png') await downloadPngFromCanvas(canvas, 'scrap-demo.png');
      else await downloadPdfFromCanvas(canvas, 'scrap-demo.pdf');
    } finally {
      setExportBusy(false);
    }
  }, []);

  const onHtml = useCallback(() => {
    const blob = new Blob([buildStandaloneHtml(objects)], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scrap-demo.html';
    a.click();
    URL.revokeObjectURL(url);
  }, [objects]);

  const sorted = [...objects].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }} className="app-shell">
      <a href="#scrapbook-main" className="skip-link">
        Skip to editor canvas
      </a>
      <HeaderBar />
      <Toolbar
        zoom={zoom}
        onZoom={(z) => setZoom(Math.max(0.4, Math.min(2, z)))}
        onAddText={() => {
          const t = createNewText();
          updateObjects((prev) => [...prev, t]);
          setSelectedId(t.id);
        }}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onPickImages={(files) => {
          if (!files?.length) return;
          void (async () => {
            const items: SO[] = [];
            for (const file of [...files]) {
              const dataUrl = await readFileAsDataUrl(file);
              const { w, h } = await loadNaturalSizeFromDataUrl(dataUrl);
              items.push(createImageObjectFromDataUrl(dataUrl, w, h));
            }
            if (!items.length) return;
            updateObjects((prev) => [...prev, ...items]);
            setSelectedId(items[items.length - 1].id);
          })();
        }}
        onPng={() => void runExport('png')}
        onPdf={() => void runExport('pdf')}
        onHtml={onHtml}
      />
      <div className="app-workspace">
        <main
          id="scrapbook-main"
          className="app-main-area"
          aria-label="Scrapbook editor canvas"
          aria-busy={exportBusy}
        >
          <div
            className="app-canvas-scroll"
            role="presentation"
            onPointerDown={(e) => {
              if (e.target === e.currentTarget) setSelectedId(null);
            }}
          >
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
              <div
                ref={pageRef}
                className="page"
                data-page-root
                role="region"
                aria-label="Scrapbook page"
                style={{
                  position: 'relative',
                  width: PAGE_WIDTH,
                  height: PAGE_HEIGHT,
                  background: '#fff',
                  boxShadow: '0 12px 48px rgba(0,0,0,0.35)',
                }}
                onPointerDown={(e) => {
                  if (e.target === e.currentTarget) setSelectedId(null);
                }}
              >
                {sorted.map((o) => (
                  <ScrapObject
                    key={o.id}
                    object={o}
                    selected={selectedId === o.id}
                    toPage={toPage}
                    onSelect={setSelectedId}
                    onGestureStart={onGestureStart}
                    onGestureEnd={commitAfterSilentGesture}
                    patchSilent={patchObjectSilent}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
        <RightPanel selected={selected} patchObject={patchObject} />
      </div>
    </div>
  );
}
