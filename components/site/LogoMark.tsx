/**
 * Salma brand mark — a luminous halo with an inner pulse.
 *
 * Composition:
 *   1. Outer halo: sixteen dots arranged on a perfect circle with alternating
 *      radii (2 / 1.4). The eight cardinal + diagonal dots are slightly
 *      larger, the eight in-between dots smaller — creating a subtle
 *      "breathing" rhythm. Reads as an aura / halo, a literal nod to "Salma"
 *      (سلمى, peace / serenity) and to the soft glow around a star or moon.
 *
 *   2. Inner pulse: a five-dot vertical column through the center, radii
 *      sized in an arc (0.7, 1.3, 1.9, 1.3, 0.7). The composition reads
 *      simultaneously as: a candle flame, an axis / pillar of light, a
 *      heartbeat, a stylised lunar phase progression — and at small sizes
 *      collapses gracefully to a single bright center dot.
 *
 * Why this works (psychology):
 *   - Two opposing geometries in harmony — circular (continuous, feminine,
 *     infinite) and vertical (focal, ascensional, axis-mundi). The tension
 *     between them is what makes the mark feel "alive" rather than static.
 *   - The bright center dot acts as an iris/pupil — universally attention-
 *     grabbing without aggression (a known fixation cue).
 *   - The Gestalt closure principle resolves the dot ring as a continuous
 *     halo, evoking completeness and safety.
 *   - Lunar / candle-flame readings carry an algerian / north-african
 *     undertone (subtle, not folkloric) while remaining internationally
 *     legible — moonlight and flames are universal symbols of guidance.
 *
 * Inspired by minimalist dot-halo languages (e.g. Serus) but differentiated
 * by the alternating-radius rhythm + the inner vertical pulse — together
 * unique to Salma. Stays legible down to ~12px favicons.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      {/* Outer halo — 16 dots on a circle of radius 22, alternating sizes. */}
      <circle cx="32" cy="10" r="2" />
      <circle cx="40.4" cy="11.7" r="1.4" />
      <circle cx="47.6" cy="16.4" r="2" />
      <circle cx="52.3" cy="23.6" r="1.4" />
      <circle cx="54" cy="32" r="2" />
      <circle cx="52.3" cy="40.4" r="1.4" />
      <circle cx="47.6" cy="47.6" r="2" />
      <circle cx="40.4" cy="52.3" r="1.4" />
      <circle cx="32" cy="54" r="2" />
      <circle cx="23.6" cy="52.3" r="1.4" />
      <circle cx="16.4" cy="47.6" r="2" />
      <circle cx="11.7" cy="40.4" r="1.4" />
      <circle cx="10" cy="32" r="2" />
      <circle cx="11.7" cy="23.6" r="1.4" />
      <circle cx="16.4" cy="16.4" r="2" />
      <circle cx="23.6" cy="11.7" r="1.4" />
      {/* Inner pulse — 5 dots, vertical through center, radii arc 0.7 → 1.9 → 0.7. */}
      <circle cx="32" cy="22" r="0.7" />
      <circle cx="32" cy="27" r="1.3" />
      <circle cx="32" cy="32" r="1.9" />
      <circle cx="32" cy="37" r="1.3" />
      <circle cx="32" cy="42" r="0.7" />
    </svg>
  );
}
