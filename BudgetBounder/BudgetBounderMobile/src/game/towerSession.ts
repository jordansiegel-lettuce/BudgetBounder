export type TowerSessionPayload = {
  clientResultId: string;
  score: number;
  durationSeconds: number;
  coins: number;
  savingsStars: number;
};

export type TowerSessionResult = {
  awardedXp: number;
  validationState: string;
};

export type TowerSubmissionOutcome =
  | { status: 'submitted'; result: TowerSessionResult; profileRefreshed: boolean }
  | { status: 'uploadFailed'; payload: TowerSessionPayload };

export async function submitTowerSession(
  payload: TowerSessionPayload,
  post: (payload: TowerSessionPayload) => Promise<TowerSessionResult>,
  refreshProfile: () => Promise<void>,
): Promise<TowerSubmissionOutcome> {
  let result: TowerSessionResult;
  try {
    result = await post(payload);
  } catch {
    return { status: 'uploadFailed', payload };
  }

  try {
    await refreshProfile();
    return { status: 'submitted', result, profileRefreshed: true };
  } catch {
    return { status: 'submitted', result, profileRefreshed: false };
  }
}
