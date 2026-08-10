const STORAGE_KEY = "safar-up-passenger-count";
export const PASSENGER_MIN = 80;
export const PASSENGER_MAX = 180;

/**
 * Simulated, per-visit passenger count for the bus experience. The number is
 * fictional — it is generated once per session, persisted in sessionStorage
 * for consistency during the visit, and wobbles slightly while riding.
 */
export function getPassengerCount(): number {
  if (typeof window === "undefined") return 127;
  const stored = window.sessionStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    const parsed = Number(stored);
    if (Number.isInteger(parsed) && parsed >= PASSENGER_MIN && parsed <= PASSENGER_MAX) {
      return parsed;
    }
  }
  const fresh = PASSENGER_MIN + Math.floor(Math.random() * (PASSENGER_MAX - PASSENGER_MIN + 1));
  try {
    window.sessionStorage.setItem(STORAGE_KEY, String(fresh));
  } catch {
    // Private mode: the in-memory value still works for this visit.
  }
  return fresh;
}

/** Small, believable fluctuation: +1 / -1 / +2 / -2, clamped to the range. */
export function stepPassengerCount(current: number): number {
  const delta = [1, -1, 2, -2][Math.floor(Math.random() * 4)]!;
  const next = Math.min(PASSENGER_MAX, Math.max(PASSENGER_MIN, current + delta));
  if (next !== current) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Ignore private-mode writes.
    }
  }
  return next;
}
