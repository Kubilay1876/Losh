import { describe, expect, it } from 'vitest';
import { cutRects, eraseMarks, groupLines, inkLines, padBoxes, sanitizeMarks, snapToText, type Box, type Mark, type MarkRect } from './marks';

/** Words of a page in reading order: `rows` lines of `perLine` words, 10 px high, every 20 px. */
function page(rows: number, perLine: number, left = 0): Box[] {
  const words: Box[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < perLine; c++) words.push({ x0: left + c * 50, y0: r * 20, x1: left + c * 50 + 40, y1: r * 20 + 10 });
  return words;
}

describe('groupLines', () => {
  it('puts words at the same height on one line, in order', () => {
    const lines = groupLines(page(3, 4));
    expect(lines).toHaveLength(3);
    expect(lines[1].words).toHaveLength(4);
    expect(lines[1]).toMatchObject({ x0: 0, x1: 190, y0: 20, y1: 30 });
  });

  it('keeps two columns apart even when their lines share a height', () => {
    // Text ordered line by line across both columns, with a wide gutter between them.
    const words = [...page(1, 2), ...page(1, 2, 300)];
    expect(groupLines(words)).toHaveLength(2);
  });

  it('glues letters drawn one by one back into words', () => {
    const letters = [0, 6, 12, 18].map((x) => ({ x0: x, y0: 0, x1: x + 5.5, y1: 10 }));
    const lines = groupLines([...letters, { x0: 40, y0: 0, x1: 60, y1: 10 }]);
    expect(lines[0].words.map((w) => [w.x0, w.x1])).toEqual([[0, 23.5], [40, 60]]);
  });
});

describe('snapToText', () => {
  const lines = groupLines(page(4, 4));

  it('paints whole words of one line, even when the hand drifts down a little', () => {
    const boxes = snapToText(lines, [55, 24], [143, 29], 6);
    expect(boxes).toEqual([{ x0: 50, y0: 20, x1: 140, y1: 30 }]);
  });

  it('follows the text across lines like a selection, never past it', () => {
    const boxes = snapToText(lines, [110, 5], [60, 45], 40)!;
    expect(boxes).toEqual([
      { x0: 100, y0: 0, x1: 190, y1: 10 },
      { x0: 0, y0: 20, x1: 190, y1: 30 },
      { x0: 0, y0: 40, x1: 90, y1: 50 },
    ]);
  });

  it('works the same when drawn backwards', () => {
    expect(snapToText(lines, [60, 45], [110, 5], 40)).toEqual(snapToText(lines, [110, 5], [60, 45], 40));
  });

  it('does nothing when the stroke starts away from the text', () => {
    expect(snapToText(lines, [100, 300], [150, 300], 0)).toBeNull();
  });

  it('pads boxes by a share of their height', () => {
    expect(padBoxes([{ x0: 10, y0: 10, x1: 50, y1: 20 }], 0.5, 0.1)).toEqual([{ x0: 5, y0: 9, x1: 55, y1: 21 }]);
  });
});

describe('inkLines', () => {
  /** A white page with black blocks ("words") drawn in. */
  function picture(w: number, h: number, blocks: Box[]): Uint8Array {
    const lum = new Uint8Array(w * h).fill(250);
    for (const b of blocks) for (let y = b.y0; y < b.y1; y++) for (let x = b.x0; x < b.x1; x++) lum[y * w + x] = 20;
    return lum;
  }

  it('finds the lines and words of a scanned page', () => {
    const blocks: Box[] = [];
    // Word gaps move from line to line, as in real text.
    for (let r = 0; r < 5; r++) {
      const y0 = 20 + r * 20;
      const s = r * 5;
      blocks.push({ x0: 20, y0, x1: 45 + s, y1: y0 + 10 }, { x0: 55 + s, y0, x1: 80 + s, y1: y0 + 10 }, { x0: 90 + s, y0, x1: 130, y1: y0 + 10 });
    }
    const lines = inkLines(picture(200, 140, blocks), 200, 140);
    expect(lines).toHaveLength(5);
    expect(lines[2]).toMatchObject({ x0: 20, x1: 130, y0: 60, y1: 70 });
    expect(lines[2].words).toHaveLength(3);
  });

  it('keeps columns apart and reads the left one first', () => {
    const blocks: Box[] = [];
    for (let r = 0; r < 6; r++) {
      blocks.push({ x0: 10, y0: 10 + r * 20, x1: 90, y1: 20 + r * 20 });
      blocks.push({ x0: 130, y0: 15 + r * 20, x1: 190, y1: 25 + r * 20 }); // not lined up with the left column
    }
    const lines = inkLines(picture(200, 140, blocks), 200, 140);
    expect(lines).toHaveLength(12);
    expect(lines.slice(0, 6).every((l) => l.x1 <= 90)).toBe(true);
    expect(lines[6].x0).toBe(130);
  });

  it('leaves pictures out', () => {
    const blocks: Box[] = [{ x0: 20, y0: 10, x1: 180, y1: 20 }, { x0: 20, y0: 30, x1: 180, y1: 40 }, { x0: 20, y0: 50, x1: 180, y1: 120 }];
    const lines = inkLines(picture(200, 140, blocks), 200, 140);
    expect(lines.map((l) => l.y0)).toEqual([10, 30]);
  });
});

describe('sanitizeMarks', () => {
  it('keeps good marks and drops broken ones', () => {
    const good = { id: 'a', page: 2, color: 'pink', rects: [[0.1, 0.2, 0.3, 0.02]] };
    expect(sanitizeMarks([good, { ...good, color: 'red' }, { ...good, page: 0 }, { ...good, rects: [[1, 2]] }, null])).toEqual([good]);
    expect(sanitizeMarks('nope')).toEqual([]);
  });
});

describe('erasing', () => {
  const line = (t: number): MarkRect => [0.1, t, 0.6, 0.02];

  it('cuts only the stretch the eraser went over, splitting a band in two', () => {
    expect(cutRects([line(0.5)], [[0.3, 0.5, 0.1, 0.02]])).toEqual([[0.1, 0.5, 0.2, 0.02], [0.4, 0.5, 0.3, 0.02]].map((r) => r.map((n) => expect.closeTo(n, 9))));
  });

  it('leaves other lines of the same mark alone', () => {
    const mark: Mark = { id: 'a', page: 1, color: 'yellow', rects: [line(0.5), line(0.52), line(0.54)] };
    const after = eraseMarks([mark], 1, [[0, 0.52, 1, 0.02]]);
    expect(after[0].rects).toEqual([line(0.5), line(0.54)]);
  });

  it('does not touch a line it only grazes, or other pages', () => {
    const mark: Mark = { id: 'a', page: 1, color: 'yellow', rects: [line(0.5)] };
    const marks = [mark];
    expect(eraseMarks(marks, 1, [[0, 0.515, 1, 0.02]])).toBe(marks);
    expect(eraseMarks(marks, 2, [[0, 0.5, 1, 0.02]])).toBe(marks);
  });

  it('removes a mark once nothing of it is left, and drops slivers', () => {
    const mark: Mark = { id: 'a', page: 1, color: 'yellow', rects: [line(0.5)] };
    expect(eraseMarks([mark], 1, [[0.098, 0.5, 0.605, 0.02]])).toEqual([]);
  });
});
