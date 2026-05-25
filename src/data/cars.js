export const fmt      = (p) => p >= 1_000_000 ? `PKR ${(p / 1_000_000).toFixed(1)}M` : `PKR ${p.toLocaleString()}`;
export const fmtMiles = (m) => `${m.toLocaleString()} km`;
