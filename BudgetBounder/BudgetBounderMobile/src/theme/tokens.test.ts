import { bb, formatIls } from './tokens';

describe('dark Y2K BudgetBounder theme', () => {
  it('uses a dark navy console palette with readable titles and signal-orange actions', () => {
    expect(bb.colors.canvas).toBe('#080D1A');
    expect(bb.colors.surface).toBe('#141C2E');
    expect(bb.colors.title).toBe('#F7F3E8');
    expect(bb.colors.text).toBe('#E8EDF7');
    expect(bb.colors.emerald).toBe('#F68D1F');
    expect(bb.colors.navGold).toBe('#FFD45A');
  });

  it('softens plate geometry without losing the compact console shape', () => {
    expect(bb.radius.sm).toBeGreaterThanOrEqual(8);
    expect(bb.radius.xl).toBeGreaterThanOrEqual(14);
    expect(bb.radius.xl).toBeLessThanOrEqual(18);
  });

  it('keeps ambient motion calm enough for financial content', () => {
    expect(bb).toHaveProperty('motion');
    expect(bb.motion.driftDistance).toBeLessThanOrEqual(14);
    expect(bb.motion.driftDurationMs).toBeGreaterThanOrEqual(5000);
    expect(bb.motion.entranceDurationMs).toBeLessThanOrEqual(500);
  });
});

describe('formatIls', () => {
  it('formats whole Israeli shekel amounts without decimal noise', () => {
    const value = formatIls(4280);
    expect(value).toContain('₪');
    expect(value).toMatch(/4[,.]280/);
    expect(value).not.toMatch(/[,.]00/);
  });

  it('keeps agorot when the amount has a fractional value', () => {
    const value = formatIls(86.4);
    expect(value).toContain('₪');
    expect(value).toMatch(/86[,.]40/);
  });
});
