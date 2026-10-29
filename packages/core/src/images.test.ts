import { describe, expect, it } from 'vitest';
import { classifyImage, pixelStats } from './images';

const rgba = (pixels: [number, number, number, number?][]) => pixels.flatMap(([r, g, b, a = 255]) => [r, g, b, a]);

describe('classifyImage', () => {
  it('keeps colourful photos natural', () => {
    expect(classifyImage({ areaRatio: 0.2, meanChroma: 70, colorfulRatio: 0.8, paperShare: 0.8 })).toBe('natural');
  });

  it('inverts grey diagrams', () => {
    expect(classifyImage({ areaRatio: 0.2, meanChroma: 3, colorfulRatio: 0, paperShare: 0.8 })).toBe('invert');
  });

  it('inverts a mostly white chart with a few coloured lines', () => {
    expect(classifyImage({ areaRatio: 0.3, meanChroma: 8, colorfulRatio: 0.05, paperShare: 0.8 })).toBe('invert');
  });

  it('keeps photos natural even when grey, and even when they fill the page (a book cover)', () => {
    expect(classifyImage({ areaRatio: 0.3, meanChroma: 4, colorfulRatio: 0, paperShare: 0.1 })).toBe('natural');
    expect(classifyImage({ areaRatio: 0.999, meanChroma: 30, colorfulRatio: 0.3, paperShare: 0.05 })).toBe('natural');
  });

  it('inverts scanned pages even when they are colourful (yellowed paper, colour scans)', () => {
    expect(classifyImage({ areaRatio: 0.95, meanChroma: 40, colorfulRatio: 0.6, paperShare: 0.8 })).toBe('invert');
  });
});

describe('pixelStats', () => {
  it('measures zero colour for greys', () => {
    expect(pixelStats(rgba([[0, 0, 0], [128, 128, 128], [255, 255, 255]]))).toMatchObject({ meanChroma: 0, colorfulRatio: 0 });
  });

  it('measures colour for saturated pixels', () => {
    const s = pixelStats(rgba([[255, 0, 0], [0, 0, 255]]));
    expect(s.meanChroma).toBe(255);
    expect(s.colorfulRatio).toBe(1);
  });

  it('ignores fully transparent pixels', () => {
    expect(pixelStats(rgba([[255, 0, 0, 0], [10, 10, 10]])).colorfulRatio).toBe(0);
  });

  it('handles empty input', () => {
    expect(pixelStats([])).toEqual({ meanChroma: 0, colorfulRatio: 0, paperShare: 1 });
  });

  it('tells a page of text (mostly paper) from a photo (soft tones everywhere)', () => {
    const text = rgba([...Array(80).fill([245, 240, 225]), ...Array(20).fill([30, 30, 30])]);
    const photo = rgba(Array.from({ length: 100 }, (_, i) => [i * 2.5, i * 2, i * 1.5] as [number, number, number]));
    expect(pixelStats(text).paperShare).toBeCloseTo(0.8);
    expect(pixelStats(photo).paperShare).toBeLessThan(0.25);
  });
});
