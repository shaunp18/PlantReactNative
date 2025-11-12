export type CauldronStatus = 'UNDER' | 'IDEAL' | 'OVER';

export interface Thresholds {
  under: number;
  over: number;
}

export interface PlantInput {
  id: string;
  name: string;
  moisturePct: number | null;
}

export interface PlantScore {
  id: string;
  name: string;
  moisturePct: number | null;
  status: CauldronStatus | 'UNKNOWN';
  score: number;
}

export interface ScoreSummary {
  total: number;
  perPlant: PlantScore[];
  counts: { under: number; ideal: number; over: number; unknown: number };
}

export function mapRawToPercent(raw: number | null | undefined, min: number, max: number): number | null {
  if (raw === null || raw === undefined) return null;
  if (max === min) return null;
  const clamped = Math.max(min, Math.min(max, raw));
  const pct = ((clamped - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

export function evaluatePlant(moisturePct: number | null, thresholds: Thresholds): { status: CauldronStatus | 'UNKNOWN'; score: number } {
  if (moisturePct === null) return { status: 'UNKNOWN', score: 0 };
  if (moisturePct < thresholds.under) return { status: 'UNDER', score: -5 - Math.round((thresholds.under - moisturePct) / 10) };
  if (moisturePct > thresholds.over) return { status: 'OVER', score: -5 - Math.round((moisturePct - thresholds.over) / 10) };
  return { status: 'IDEAL', score: 10 };
}

export function computeScores(plants: PlantInput[], thresholds: Thresholds): ScoreSummary {
  const perPlant: PlantScore[] = plants.map((p) => {
    const { status, score } = evaluatePlant(p.moisturePct, thresholds);
    return { id: p.id, name: p.name, moisturePct: p.moisturePct, status, score };
  });
  const total = perPlant.reduce((sum, p) => sum + p.score, 0);
  const counts = perPlant.reduce(
    (acc, p) => {
      if (p.status === 'UNDER') acc.under += 1;
      else if (p.status === 'IDEAL') acc.ideal += 1;
      else if (p.status === 'OVER') acc.over += 1;
      else acc.unknown += 1;
      return acc;
    },
    { under: 0, ideal: 0, over: 0, unknown: 0 }
  );
  return { total, perPlant, counts };
}

export interface FriendEntry { id: string; name: string; score: number }

export function buildLeaderboard(self: FriendEntry, friends: FriendEntry[]): FriendEntry[] {
  return [self, ...friends].sort((a, b) => b.score - a.score);
}
