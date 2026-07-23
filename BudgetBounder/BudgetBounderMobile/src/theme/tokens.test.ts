import { formatIls } from './tokens';

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
