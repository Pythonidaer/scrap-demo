import type { CSSProperties } from 'react';
import { theme, FONT_OPTIONS, clamp, normalizeRotation } from '../constants';
import type { ImageObject, ScrapObject, TextObject } from '../types/scrapbook';

type Props = {
  selected: ScrapObject | null;
  patchObject: (id: string, patch: Partial<ScrapObject>) => void;
};

const panel = {
  bg: '#131615',
  line: 'rgba(255,255,255,0.08)',
  label: '#8f9b95',
  section: '#6d7872',
  inputBg: '#0a0c0b',
  inputBorder: '#2a302e',
  title: '#ffffff',
  mutedSmall: '#6a756f',
};

/** More space between major sections (above uppercase headers) */
const SECTION_MARGIN_TOP = 20;
const FIELD_GRID_GAP = 6;

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  borderRadius: 4,
  border: `1px solid ${panel.inputBorder}`,
  background: panel.inputBg,
  color: panel.title,
  fontSize: 13,
};

const selectStyle: CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};

function SectionTitle({ children }: { children: string }) {
  return <h3 className="panel-section-title">{children}</h3>;
}

function FieldLabel({ children, htmlFor }: { children: string; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="panel-field-label">
      {children}
    </label>
  );
}

function PanelHeader({ kind }: { kind: 'Text' | 'Image' }) {
  return (
    <header style={{ paddingBottom: 12, borderBottom: `1px solid ${panel.line}`, marginBottom: 14 }}>
      <h2
        id="properties-panel-heading"
        style={{ margin: 0, fontSize: 16, fontWeight: 700, color: panel.title }}
      >
        Properties
      </h2>
      <p style={{ margin: 0, fontSize: 12, color: panel.mutedSmall, marginTop: 4 }}>{kind} object</p>
    </header>
  );
}

function CommonShapeSections({
  o,
  patchObject: patch,
}: {
  o: ScrapObject;
  patchObject: Props['patchObject'];
}) {
  return (
    <>
      <section>
        <SectionTitle>Position</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: FIELD_GRID_GAP }}>
          <div>
            <FieldLabel htmlFor={`${o.id}-pos-x`}>X</FieldLabel>
            <input
              id={`${o.id}-pos-x`}
              type="number"
              style={inputStyle}
              value={Math.round(o.x)}
              onChange={(e) => patch(o.id, { x: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <FieldLabel htmlFor={`${o.id}-pos-y`}>Y</FieldLabel>
            <input
              id={`${o.id}-pos-y`}
              type="number"
              style={inputStyle}
              value={Math.round(o.y)}
              onChange={(e) => patch(o.id, { y: Number(e.target.value) || 0 })}
            />
          </div>
        </div>
      </section>

      <section style={{ marginTop: SECTION_MARGIN_TOP }}>
        <SectionTitle>Size</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: FIELD_GRID_GAP }}>
          <div>
            <FieldLabel htmlFor={`${o.id}-size-w`}>W</FieldLabel>
            <input
              id={`${o.id}-size-w`}
              type="number"
              style={inputStyle}
              min={20}
              value={Math.round(o.width)}
              onChange={(e) =>
                patch(o.id, { width: Math.max(20, Number(e.target.value) || 20) })
              }
            />
          </div>
          <div>
            <FieldLabel htmlFor={`${o.id}-size-h`}>H</FieldLabel>
            <input
              id={`${o.id}-size-h`}
              type="number"
              style={inputStyle}
              min={20}
              value={Math.round(o.height)}
              onChange={(e) =>
                patch(o.id, { height: Math.max(20, Number(e.target.value) || 20) })
              }
            />
          </div>
        </div>
      </section>

      <section style={{ marginTop: SECTION_MARGIN_TOP }}>
        <SectionTitle>Rotation</SectionTitle>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ flex: '0 0 76px' }}>
            <FieldLabel htmlFor={`${o.id}-rot-num`}>Rotation (degrees)</FieldLabel>
            <input
              id={`${o.id}-rot-num`}
              type="number"
              style={inputStyle}
              min={-180}
              max={180}
              value={Math.round(o.rotation)}
              onChange={(e) =>
                patch(o.id, { rotation: normalizeRotation(Number(e.target.value) || 0) })
              }
            />
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingTop: 18 }}>
            <input
              type="range"
              min={-180}
              max={180}
              value={o.rotation}
              aria-label="Adjust rotation angle"
              onChange={(e) =>
                patch(o.id, { rotation: normalizeRotation(Number(e.target.value)) })
              }
              style={{
                width: '100%',
                accentColor: theme.accent,
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
}

export function RightPanel({ selected, patchObject }: Props) {
  if (!selected) {
    return (
      <aside
        className="properties-panel"
        aria-label="Properties"
        style={{ fontSize: 13, color: panel.label, lineHeight: 1.5 }}
      >
        <p style={{ margin: 0 }}>Select an object on the page to edit its properties.</p>
      </aside>
    );
  }

  if (selected.type === 'text') {
    const o = selected as TextObject;
    const hexDisplay =
      o.color.startsWith('#') && o.color.length >= 7 ? o.color.slice(0, 7) : '#0a0a0a';

    const fmtBtn = (active: boolean): CSSProperties => ({
      padding: '8px 0',
      borderRadius: 4,
      border: `1px solid ${panel.inputBorder}`,
      cursor: 'pointer',
      fontSize: 15,
      background: active ? theme.accent : panel.inputBg,
      color: panel.title,
    });

    return (
      <aside
        className="properties-panel"
        aria-labelledby="properties-panel-heading"
        style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
      >
        <PanelHeader kind="Text" />
        <CommonShapeSections o={o} patchObject={patchObject} />

        <section style={{ marginTop: SECTION_MARGIN_TOP }}>
          <SectionTitle>Font</SectionTitle>
          <FieldLabel htmlFor={`${o.id}-font-family`}>Font family</FieldLabel>
          <select
            id={`${o.id}-font-family`}
            style={selectStyle}
            value={o.fontFamily}
            onChange={(e) => patchObject(o.id, { fontFamily: e.target.value })}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <div style={{ marginTop: 8 }}>
            <FieldLabel htmlFor={`${o.id}-font-size`}>{`Size (${o.fontSize}px)`}</FieldLabel>
            <input
              id={`${o.id}-font-size`}
              type="range"
              min={8}
              max={124}
              value={o.fontSize}
              onChange={(e) =>
                patchObject(o.id, { fontSize: clamp(Number(e.target.value), 8, 124) })
              }
              style={{ width: '100%', accentColor: theme.accent }}
            />
          </div>
        </section>

        <section style={{ marginTop: SECTION_MARGIN_TOP }}>
          <SectionTitle>Formatting</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }} role="group" aria-label="Text formatting">
            <button
              type="button"
              onClick={() => patchObject(o.id, { bold: !o.bold })}
              aria-pressed={o.bold}
              aria-label="Bold"
              style={{
                ...fmtBtn(o.bold),
                fontWeight: 700,
                fontStyle: 'normal',
                textDecoration: 'none',
              }}
            >
              B
            </button>
            <button
              type="button"
              onClick={() => patchObject(o.id, { italic: !o.italic })}
              aria-pressed={o.italic}
              aria-label="Italic"
              style={{
                ...fmtBtn(o.italic),
                fontWeight: 400,
                fontStyle: 'italic',
                textDecoration: 'none',
              }}
            >
              I
            </button>
            <button
              type="button"
              onClick={() => patchObject(o.id, { underline: !o.underline })}
              aria-pressed={o.underline}
              aria-label="Underline"
              style={{
                ...fmtBtn(o.underline),
                fontWeight: 400,
                fontStyle: 'normal',
                textDecoration: 'underline',
              }}
            >
              U
            </button>
          </div>
        </section>

        <section style={{ marginTop: SECTION_MARGIN_TOP }}>
          <SectionTitle>Color</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 8 }}>
            <input
              id={`${o.id}-color-picker`}
              type="color"
              value={hexDisplay}
              onChange={(e) => patchObject(o.id, { color: e.target.value })}
              aria-label="Pick text color"
              style={{
                width: 40,
                height: 34,
                padding: 0,
                border: `1px solid ${panel.inputBorder}`,
                borderRadius: 4,
                cursor: 'pointer',
                flexShrink: 0,
                background: panel.inputBg,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <FieldLabel htmlFor={`${o.id}-color-value`}>CSS color value</FieldLabel>
              <input
                id={`${o.id}-color-value`}
                type="text"
                style={{ ...inputStyle, width: '100%' }}
                value={o.color}
                onChange={(e) => patchObject(o.id, { color: e.target.value })}
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>
        </section>
      </aside>
    );
  }

  const img = selected as ImageObject;
  const flipOn = img.flipHorizontal;
  return (
    <aside
      className="properties-panel"
      aria-labelledby="properties-panel-heading"
      style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
    >
      <PanelHeader kind="Image" />
      <CommonShapeSections o={img} patchObject={patchObject} />

      <section style={{ marginTop: SECTION_MARGIN_TOP }}>
        <SectionTitle>Formatting</SectionTitle>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span id={`${img.id}-flip-label`} style={{ fontSize: 12, color: panel.label, lineHeight: 1.3 }}>
            Flip horizontal
          </span>
          <button
            type="button"
            role="switch"
            className="flip-switch"
            aria-checked={flipOn}
            aria-labelledby={`${img.id}-flip-label`}
            title={flipOn ? 'On' : 'Off'}
            onClick={() => patchObject(img.id, { flipHorizontal: !flipOn })}
          >
            <span
              className="flip-switch-visual"
              aria-hidden
              style={{
                border: `1px solid ${flipOn ? theme.accent : panel.inputBorder}`,
                background: flipOn ? theme.primary : panel.inputBg,
              }}
            />
          </button>
        </div>
      </section>

      <section style={{ marginTop: SECTION_MARGIN_TOP }} aria-labelledby={`${img.id}-crop-label`}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 4,
          }}
        >
          <span id={`${img.id}-crop-label`} style={{ fontSize: 12, color: panel.label }}>
            Crop zoom
          </span>
          <span
            style={{
              fontSize: 12,
              color: panel.label,
              fontVariantNumeric: 'tabular-nums',
            }}
            aria-live="polite"
          >
            {img.cropZoom.toFixed(2)}x
          </span>
        </div>
        <input
          id={`${img.id}-crop-zoom`}
          type="range"
          min={0.5}
          max={5}
          step={0.01}
          value={clamp(img.cropZoom, 0.5, 5)}
          aria-labelledby={`${img.id}-crop-label`}
          aria-describedby={`${img.id}-crop-help`}
          onChange={(e) =>
            patchObject(img.id, { cropZoom: clamp(Number(e.target.value), 0.5, 5) })
          }
          style={{ width: '100%', accentColor: theme.accent, display: 'block' }}
        />
        <div
          id={`${img.id}-crop-help`}
          style={{ fontSize: 11, color: panel.mutedSmall, marginTop: 4, lineHeight: 1.45 }}
        >
          Non-destructive crop. Original is stored.
        </div>
      </section>
    </aside>
  );
}
