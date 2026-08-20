export function buildMedalLevelByTotal(totals: number[]) {
  const uniqueTotals = Array.from(
    new Set(totals.map((total) => total.toFixed(2)))
  ).slice(0, 3);

  return new Map(uniqueTotals.map((total, index) => [total, index + 1]));
}

export function getMedalLevel(total: number, medalLevelByTotal: Map<string, number>) {
  return medalLevelByTotal.get(total.toFixed(2)) ?? 0;
}
