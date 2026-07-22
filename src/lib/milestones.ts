export const NET_WORTH_MILESTONES = [
  1_000, 5_000, 10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000,
]

/** El hito más alto de la lista que ya se alcanzó, o 0 si ninguno. */
export function highestMilestone(netWorth: number): number {
  let highest = 0
  for (const m of NET_WORTH_MILESTONES) {
    if (netWorth >= m) highest = m
  }
  return highest
}
