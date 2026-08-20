/** Зеркало REFERRAL_MILESTONES из app/services/referral_service.py — держать в
 * синхроне вручную (список короткий и меняется редко). Нужно для прогресс-бара:
 * бэкенд отдаёт только БЛИЖАЙШИЙ непройденный порог (next_milestone_at), а для
 * бара "сколько уже прошли с прошлого порога" нужен ещё и предыдущий. */
const REFERRAL_MILESTONES: Record<number, number> = { 3: 3, 5: 5, 10: 10, 25: 25, 50: 50 };

export function previousMilestone(invitedCount: number): number {
  let prev = 0;
  for (const threshold of Object.keys(REFERRAL_MILESTONES).map(Number).sort((a, b) => a - b)) {
    if (threshold <= invitedCount) prev = threshold;
  }
  return prev;
}
