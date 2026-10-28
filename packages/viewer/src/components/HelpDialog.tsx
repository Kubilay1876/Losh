import { useEffect, useRef } from 'preact/hooks';
import type { MessageKey } from '@losh/core';
import { SHORTCUT_HELP } from '../shortcuts';

interface Props {
  t(key: MessageKey): string;
  onClose(): void;
}

export function HelpDialog({ t, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      class="losh-dialog"
      aria-labelledby="losh-help-title"
      onClose={onClose}
      onClick={(e) => {
        // Click on the backdrop (outside the content box) closes the dialog.
        if (e.target === ref.current) onClose();
      }}
    >
      <div class="losh-dialog-body">
        <h2 id="losh-help-title">{t('help.title')}</h2>
        <table class="losh-shortcuts">
          <tbody>
            {SHORTCUT_HELP.map((s) => (
              <tr key={s.label}>
                <td>
                  {s.keys.map((k) => (
                    <kbd key={k}>{k}</kbd>
                  ))}
                </td>
                <td>{t(s.label)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" class="losh-text-btn" onClick={onClose} autofocus>
          {t('help.close')}
        </button>
      </div>
    </dialog>
  );
}
