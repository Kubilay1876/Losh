import { describe, expect, it } from 'vitest';
import { AWAY_RESTS_MS, BreakTimer } from './breaks';

const MIN = 60_000;

/** Reads for `minutes`, ticking every second like the reader does. */
function read(timer: BreakTimer, from: number, minutes: number): { now: number; due: boolean } {
  let now = from;
  let due = false;
  for (let s = 0; s < minutes * 60; s++) {
    now += 1000;
    due = timer.tick(now, true);
  }
  return { now, due };
}

describe('BreakTimer', () => {
  it('is due after the interval of reading, not before', () => {
    const timer = new BreakTimer(20);
    timer.tick(0, true);
    expect(read(timer, 0, 19).due).toBe(false);
    expect(read(timer, 19 * MIN, 1).due).toBe(true);
  });

  it('does not count time when not reading', () => {
    const timer = new BreakTimer(20);
    timer.tick(0, true);
    timer.tick(10 * MIN, false); // 10 minutes read
    expect(timer.tick(40 * MIN, true)).toBe(false); // 30 idle minutes don't count
    expect(read(timer, 40 * MIN, 10).due).toBe(true);
  });

  it('a long time away counts as a rest, a short one does not', () => {
    const timer = new BreakTimer(20);
    timer.tick(0, true);
    timer.pause(15 * MIN);
    timer.resume(15 * MIN + 60_000);
    timer.tick(15 * MIN + 60_000, true);
    expect(read(timer, 15 * MIN + 60_000, 5).due).toBe(true);

    const rested = new BreakTimer(20);
    rested.tick(0, true);
    rested.pause(15 * MIN);
    rested.resume(15 * MIN + AWAY_RESTS_MS);
    rested.tick(15 * MIN + AWAY_RESTS_MS, true);
    expect(read(rested, 15 * MIN + AWAY_RESTS_MS, 5).due).toBe(false);
  });

  it('starts over after a break and comes back after a snooze', () => {
    const timer = new BreakTimer(20);
    timer.tick(0, true);
    let { now } = read(timer, 0, 20);
    timer.snooze(5);
    expect(read(timer, now, 4).due).toBe(false);
    ({ now } = read(timer, now + 4 * MIN, 1));
    expect(timer.tick(now, true)).toBe(true);
    timer.rested();
    expect(read(timer, now, 19).due).toBe(false);
  });

  it('a new interval keeps the time already read', () => {
    const timer = new BreakTimer(30);
    timer.tick(0, true);
    const { now } = read(timer, 0, 12);
    timer.setInterval(15);
    expect(read(timer, now, 2).due).toBe(false);
    expect(read(timer, now + 2 * MIN, 1).due).toBe(true);
  });
});
