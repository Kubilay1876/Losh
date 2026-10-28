/** How long an eye break lasts (the "20 seconds" of the 20-20-20 rule). */
export const BREAK_SECONDS = 20;
/** "In 5 min" on the break screen. */
export const BREAK_SNOOZE_MINUTES = 5;
/** Choices for the reminder interval in Settings. */
export const BREAK_INTERVALS = [10, 15, 20, 30, 45, 60] as const;
/** Being away this long (app in the background, phone locked) already counts as a rest. */
export const AWAY_RESTS_MS = 5 * 60_000;

/**
 * Counts reading time toward the next eye break. Only time spent actually reading counts;
 * the caller feeds it the clock, so it is easy to test.
 */
export class BreakTimer {
  private readMs = 0;
  private dueMs: number;
  private last: number | null = null;
  private awaySince: number | null = null;

  constructor(private intervalMinutes: number) {
    this.dueMs = intervalMinutes * 60_000;
  }

  setInterval(minutes: number): void {
    // Keep the time already read; only the goal moves.
    this.dueMs += (minutes - this.intervalMinutes) * 60_000;
    this.intervalMinutes = minutes;
  }

  /** Called regularly; `reading` says whether the time since the last call counts. Returns true when a break is due. */
  tick(now: number, reading: boolean): boolean {
    if (this.last !== null) this.readMs += now - this.last;
    this.last = reading ? now : null;
    return this.readMs >= this.dueMs;
  }

  /** The reader went to the background. */
  pause(now: number): void {
    this.tick(now, false);
    this.awaySince ??= now;
  }

  /** The reader is back; a long absence was a rest of its own. */
  resume(now: number): void {
    if (this.awaySince !== null && now - this.awaySince >= AWAY_RESTS_MS) this.rested();
    this.awaySince = null;
  }

  /** A break was taken (or skipped): start counting again. */
  rested(): void {
    this.readMs = 0;
    this.dueMs = this.intervalMinutes * 60_000;
  }

  /** Remind again after `minutes` more reading. */
  snooze(minutes: number): void {
    this.dueMs = this.readMs + minutes * 60_000;
  }
}
