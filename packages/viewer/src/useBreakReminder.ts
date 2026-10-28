import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { BreakTimer } from '@losh/core';

const TICK_MS = 1000;

/**
 * Tells when an eye break is due. Counts only while `reading` and the reader is on screen,
 * so time in the background or with the phone locked does not add up.
 */
export function useBreakReminder(enabled: boolean, intervalMinutes: number, reading: boolean) {
  const timer = useRef<BreakTimer | null>(null);
  timer.current ??= new BreakTimer(intervalMinutes);
  const [due, setDue] = useState(false);

  useEffect(() => {
    timer.current!.setInterval(intervalMinutes);
  }, [intervalMinutes]);

  useEffect(() => {
    if (!enabled || due) return;
    const t = timer.current!;
    const onVisibility = () => (document.hidden ? t.pause(Date.now()) : t.resume(Date.now()));
    document.addEventListener('visibilitychange', onVisibility);
    const id = setInterval(() => {
      if (t.tick(Date.now(), reading && !document.hidden)) setDue(true);
    }, TICK_MS);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
      t.tick(Date.now(), false);
    };
  }, [enabled, due, reading]);

  const rested = useCallback(() => {
    timer.current!.rested();
    setDue(false);
  }, []);

  const snooze = useCallback((minutes: number) => {
    timer.current!.snooze(minutes);
    setDue(false);
  }, []);

  return { due: enabled && due, rested, snooze };
}
