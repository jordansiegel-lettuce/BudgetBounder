export function validatePositiveAmount(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? null : 'Enter an amount greater than zero.';
}

export function validateGoal(title: string, target: string, deadline: string, now = new Date()) {
  if (!title.trim()) return 'Give your goal a name.';
  const amountError = validatePositiveAmount(target);
  if (amountError) return amountError;
  const date = new Date(`${deadline}T23:59:59`);
  if (!deadline || Number.isNaN(date.getTime()) || date <= now) return 'Choose a future deadline.';
  return null;
}
