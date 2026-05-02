import { useRef, type CSSProperties, type MouseEvent } from 'react';
import {
  Type,
  Upload,
  Undo2,
  Redo2,
  Download,
  FileText,
  FileCode,
} from 'lucide-react';
import { theme } from '../constants';

const iconProps = { size: 16, strokeWidth: 2 };

/** Vertical rules ~55–65% of typical toolbar row height, centered */
const DIVIDER_HEIGHT = 30;

type Props = {
  zoom: number;
  onZoom: (z: number) => void;
  onAddText: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onPickImages: (files: FileList | null) => void;
  onPng: () => void;
  onPdf: () => void;
  onHtml: () => void;
};

const btnBase: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  height: 32,
  padding: '0 12px',
  borderRadius: 6,
  border: 0,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.1)',
  fontSize: 14,
  fontWeight: 500,
  lineHeight: '20px',
  fontFamily: 'Inter, system-ui, sans-serif',
  color: theme.text,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition:
    'color 0.15s, background-color 0.15s, border-color 0.15s, text-decoration-color 0.15s, fill 0.15s, stroke 0.15s',
};

const iconSquareBtnBase: CSSProperties = {
  ...btnBase,
  width: 32,
  minWidth: 32,
  height: 32,
  padding: 0,
  gap: 0,
  borderRadius: 6,
};

function ToolbarDivider() {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      style={{
        width: 1,
        height: DIVIDER_HEIGHT,
        flexShrink: 0,
        alignSelf: 'center',
        background: 'rgba(255,255,255,0.22)',
        margin: '0 4px',
      }}
    />
  );
}

function ZoomIcon() {
  return (
    <span
      style={{ display: 'inline-flex', color: theme.muted, flexShrink: 0 }}
      title="Zoom"
      aria-hidden
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="10" cy="10" r="6" />
        <path d="M14.5 14.5L21 21" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Toolbar({
  zoom,
  onZoom,
  onAddText,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onPickImages,
  onPng,
  onPdf,
  onHtml,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const enabledBg = theme.accent;
  const hoverBg = theme.hover;
  const disabledBg = '#1a3d2e';

  const setBg = (bg: string) => (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = bg;
  };

  const buttonStyle = (enabled: boolean): CSSProperties =>
    enabled
      ? { ...btnBase, backgroundColor: enabledBg, opacity: 1 }
      : {
          ...btnBase,
          backgroundColor: disabledBg,
          opacity: 0.55,
          cursor: 'not-allowed',
        };

  const iconButtonStyle = (enabled: boolean): CSSProperties =>
    enabled
      ? { ...iconSquareBtnBase, backgroundColor: enabledBg, opacity: 1 }
      : {
          ...iconSquareBtnBase,
          backgroundColor: disabledBg,
          opacity: 0.55,
          cursor: 'not-allowed',
        };

  return (
    <nav
      role="toolbar"
      aria-label="Editor tools"
      className="editor-toolbar"
      style={{
        background: theme.primary,
        borderBottom: `1px solid ${theme.accent}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          minWidth: 0,
        }}
      >
        <button
          type="button"
          style={buttonStyle(true)}
          onMouseEnter={setBg(hoverBg)}
          onMouseLeave={setBg(enabledBg)}
          onClick={onAddText}
          aria-label="Add text object"
        >
          <Type {...iconProps} aria-hidden />
          Add text
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            onPickImages(e.target.files);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          style={buttonStyle(true)}
          onMouseEnter={setBg(hoverBg)}
          onMouseLeave={setBg(enabledBg)}
          onClick={() => inputRef.current?.click()}
          aria-label="Upload images"
        >
          <Upload {...iconProps} aria-hidden />
          Upload
        </button>
        <ToolbarDivider />
        <button
          type="button"
          className="toolbar-icon-btn"
          style={iconButtonStyle(canUndo)}
          disabled={!canUndo}
          aria-label="Undo"
          title="Undo"
          onMouseEnter={canUndo ? setBg(hoverBg) : undefined}
          onMouseLeave={canUndo ? setBg(enabledBg) : undefined}
          onClick={onUndo}
        >
          <Undo2 {...iconProps} aria-hidden />
        </button>
        <button
          type="button"
          className="toolbar-icon-btn"
          style={iconButtonStyle(canRedo)}
          disabled={!canRedo}
          aria-label="Redo"
          title="Redo"
          onMouseEnter={canRedo ? setBg(hoverBg) : undefined}
          onMouseLeave={canRedo ? setBg(enabledBg) : undefined}
          onClick={onRedo}
        >
          <Redo2 {...iconProps} aria-hidden />
        </button>
        <ToolbarDivider />
        <div
          className="toolbar-zoom-wrap"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flex: '1 1 auto',
            minWidth: 0,
            maxWidth: 280,
          }}
        >
          <ZoomIcon />
          <input
            type="range"
            min={40}
            max={200}
            value={Math.round(zoom * 100)}
            onChange={(e) => onZoom(Number(e.target.value) / 100)}
            style={{
              flex: '1 1 auto',
              width: 120,
              minWidth: 80,
              maxWidth: 200,
              accentColor: theme.accent,
              verticalAlign: 'middle',
            }}
            aria-label="Canvas zoom"
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              lineHeight: '20px',
              fontFamily: 'Inter, system-ui, sans-serif',
              color: theme.text,
              minWidth: 40,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          type="button"
          style={buttonStyle(true)}
          onMouseEnter={setBg(hoverBg)}
          onMouseLeave={setBg(enabledBg)}
          onClick={onPng}
          aria-label="Export page as PNG"
        >
          <Download {...iconProps} aria-hidden />
          PNG
        </button>
        <button
          type="button"
          style={buttonStyle(true)}
          onMouseEnter={setBg(hoverBg)}
          onMouseLeave={setBg(enabledBg)}
          onClick={onPdf}
          aria-label="Export page as PDF"
        >
          <FileText {...iconProps} aria-hidden />
          PDF
        </button>
        <button
          type="button"
          style={buttonStyle(true)}
          onMouseEnter={setBg(hoverBg)}
          onMouseLeave={setBg(enabledBg)}
          onClick={onHtml}
          aria-label="Export page as HTML"
        >
          <FileCode {...iconProps} aria-hidden />
          HTML
        </button>
      </div>
    </nav>
  );
}
