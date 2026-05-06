/**
 * Salma brand mark — calligraphic S monogram.
 *
 * Two stacked half-circles drawn as a single thick stroke form a
 * confident, bold "S". Round line caps soften the terminals so the
 * mark reads as a calligraphic gesture rather than a geometric letter,
 * while the consistent stroke weight keeps it legible from a 96px
 * hero down to a 16px favicon.
 *
 * Why this composition for Salma:
 *   - The "S" is a soft, unmistakable visual cue to the name without
 *     ever spelling it out — the connection clicks once.
 *   - Round caps + slight overshoot at the terminals give a hand-drawn
 *     warmth: calm but alive.
 *   - No triangles, pyramids, eyes, crescents, stars, crosses or any
 *     other shape with religious or esoteric connotations: deliberately
 *     safe in MENA / North African markets.
 *   - The form reads as classical typography, not as symbolism. The
 *     eye sees craft, not ideology.
 *   - A single stroke path → renders cleanly on any background and
 *     stays legible at every size we use.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={9}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path
        pathLength={100}
        d="M 46 17 A 11 11 0 1 0 32 32 A 11 11 0 1 1 18 47"
      />
    </svg>
  );
}
