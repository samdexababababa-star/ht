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
 *   2. Inner calligraphic stroke (5 dots): a diagonal trace running from
 *      the upper-right to the lower-left, radii sized in an arc
 *      (0.6, 1.2, 1.8, 1.2, 0.6). The middle dot sits exactly at the
 *      geometric center of the halo. Reads simultaneously as a meteor
 *      streaking through its aura, a calligraphic brushstroke, the spine
 *      of a stylised "S", and — significantly — a stroke whose direction
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
 *   - The bright center dot acts as an iris/pupil — universally
 *     attention-grabbing without aggression (a known fixation cue).
 *   - Gestalt closure: the halo dot ring resolves into a continuous
 *     circle, evoking completeness and safety. The diagonal stroke
 *     resolves into a continuous gesture — two complete forms in one mark.
 *   - The fading-tips gradient (small → big → small) gives the stroke
 *     velocity: the eye reads it as motion, like a comet or signature
 *     stroke captured mid-gesture. This is what conveys "alive" / "ours".
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
      {/* Calligraphic stroke — diagonal upper-right → lower-left, fading tips. */}
      <circle cx="38" cy="22" r="0.6" />
      <circle cx="35" cy="27" r="1.2" />
      <circle cx="32" cy="32" r="1.8" />
      <circle cx="29" cy="37" r="1.2" />
      <circle cx="26" cy="42" r="0.6" />
    </svg>
  );
}
