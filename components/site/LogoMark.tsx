/**
 * Salma brand mark — a luminous halo crossed by a calligraphic stroke.
 *
 * Composition:
 *   1. Outer halo (16 dots): a perfect circle of dots with alternating radii
 *      (2 / 1.4). The eight cardinal + diagonal dots are slightly larger,
 *      the eight in-between dots smaller — a subtle "breathing" rhythm.
 *      Reads as an aura / halo, a literal nod to "Salma" (سلمى,
 *      peace / serenity) and to the soft glow around a star or moon.
 *
 *   2. Inner calligraphic stroke (5 dots): an off-center diagonal trace
 *      from the upper-right to the lower-left, with radii fading
 *      monotonically (2.0, 1.5, 1.0, 0.6, 0.3). The stroke does NOT
 *      pass through the geometric centre — it brushes past it on the
 *      upper-right side, exactly the way a right-handed calligrapher
 *      lays down ink: heavy pressure at the start, lifting away into
 *      a fade. Reads simultaneously as a meteor entering the atmosphere
 *      (brightest at impact, burning out as it descends), a calligraphic
 *      brushstroke captured mid-gesture, and a stroke whose direction
 *      mirrors right-to-left Arabic reading flow.
 *
 * Why this works (psychology):
 *   - Asymmetric tension: a perfect circle (calm, infinite, feminine) is
 *     crossed by a directional diagonal (active, momentary, gestural).
 *     The unresolved tension is what makes the mark feel alive rather
 *     than ornamental.
 *   - Right-to-left diagonal: the stroke flows in the natural reading
 *     direction of Arabic — a subliminal cue that the brand belongs to
 *     and "speaks" the user's culture, without resorting to literal
 *     calligraphy or folkloric ornament.
 *   - The heavy head pulls visual weight to the upper-right quadrant,
 *     anchoring the composition off-axis. This is the asymmetry that
 *     breaks the diagonal mirror symmetry of v3 and gives the mark a
 *     true sense of momentum and one-of-a-kindness.
 *   - Gestalt closure: the halo dot ring resolves into a continuous
 *     circle, evoking completeness and safety. The off-centre stroke
 *     resolves into a continuous gesture — two complete forms in one
 *     mark, but with no shared axis of symmetry between them.
 *   - The monotonic fade (heavy → light, head → tail) is read by the
 *     eye as captured motion: a meteor or signature stroke caught
 *     mid-gesture. This is what conveys "alive" / "unique" / "ours".
 *
 * Inspired by minimalist dot-halo languages (e.g. Serus) but uniquely
 * Salma's by the asymmetric calligraphic stroke. Stays legible down to
 * ~12px favicons (where the stroke's center dominates and the halo
 * provides ambient framing).
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
      {/* Calligraphic stroke — off-centre diagonal, heavy head → fading tail. */}
      <circle cx="42" cy="20" r="2.0" />
      <circle cx="38" cy="25" r="1.5" />
      <circle cx="34" cy="30" r="1.0" />
      <circle cx="30" cy="35" r="0.6" />
      <circle cx="26" cy="40" r="0.3" />
    </svg>
  );
}
