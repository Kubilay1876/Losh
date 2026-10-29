import { MARK_COLORS, type MarkColor, type MessageKey } from '@losh/core';
import type { PenTool } from '../pdf/pen';
import { IconEraser, IconHighlighter, IconUndo } from './icons';

interface Props {
  t(key: MessageKey): string;
  tool: PenTool | null;
  color: MarkColor;
  canUndo: boolean;
  onTool(tool: PenTool | null): void;
  onColor(color: MarkColor): void;
  onUndo(): void;
}

/** The pen button in the bottom corner; when on, the colours, the eraser and undo open above it (after it for the keyboard). */
export function MarkTools({ t, tool, color, canUndo, onTool, onColor, onUndo }: Props) {
  return (
    <div class="losh-marktools">
      <button
        type="button"
        class="losh-fab"
        data-color={color}
        aria-pressed={!!tool}
        aria-label={t('mark.open')}
        title={`${tool ? t('mark.close') : t('mark.open')} (H)`}
        onClick={() => onTool(tool ? null : 'pen')}
      >
        <IconHighlighter />
      </button>
      {tool && (
        <div class="losh-marktools-palette" role="group" aria-label={t('mark.colors')}>
          {MARK_COLORS.map((c) => (
            <button
              type="button"
              key={c}
              class="losh-swatch"
              data-color={c}
              aria-pressed={tool === 'pen' && color === c}
              aria-label={t(`mark.color.${c}` as MessageKey)}
              title={t(`mark.color.${c}` as MessageKey)}
              onClick={() => {
                onColor(c);
                onTool('pen');
              }}
            />
          ))}
          <span class="losh-marktools-sep" />
          <button
            type="button"
            class="losh-icon-btn"
            aria-pressed={tool === 'eraser'}
            aria-label={t('mark.erase')}
            title={t('mark.erase')}
            onClick={() => onTool(tool === 'eraser' ? 'pen' : 'eraser')}
          >
            <IconEraser />
          </button>
          <button type="button" class="losh-icon-btn" aria-label={t('mark.undo')} title={`${t('mark.undo')} (Ctrl+Z)`} disabled={!canUndo} onClick={onUndo}>
            <IconUndo />
          </button>
        </div>
      )}
    </div>
  );
}
