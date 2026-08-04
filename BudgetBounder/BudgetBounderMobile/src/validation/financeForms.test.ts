import { validateGoal, validatePositiveAmount } from './financeForms';

describe('finance form validation', () => {
  test('rejects empty and non-positive amounts', () => {
    expect(validatePositiveAmount('')).toBe('Enter an amount greater than zero.');
    expect(validatePositiveAmount('-5')).toBe('Enter an amount greater than zero.');
    expect(validatePositiveAmount('10')).toBeNull();
  });

  test('requires a named goal with a future deadline', () => {
    expect(validateGoal('', '500', '2026-09-01', new Date('2026-08-04'))).toBe('Give your goal a name.');
    expect(validateGoal('Laptop', '500', '2026-08-01', new Date('2026-08-04'))).toBe('Choose a future deadline.');
    expect(validateGoal('Laptop', '500', '2026-09-01', new Date('2026-08-04'))).toBeNull();
  });
});
