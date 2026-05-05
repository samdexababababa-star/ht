/**
 * Salma brand mark — twin peaks, asymmetric inner.
 *
 * Composition:
 *   1. Outer triangle (frame): an outlined equilateral triangle, apex up,
 *      drawn as one outer + one inner path with the even-odd fill rule
 *      so it reads as a clean stroke of uniform thickness around the
 *      perimeter. Symmetric, calm, the "container".
 *
 *   2. Inner triangle (peak): a smaller, solid filled triangle inside
 *      the frame. Its apex sits at x=28 — four units LEFT of its base
 *      midpoint at x=31. This subtle lean is the heart of the mark:
 *      it breaks every axis of symmetry the outer frame creates and
 *      injects motion into the otherwise still composition.
 *
 * Why this works (psychology):
 *   - Twin peaks: the outer + inner triangles together read as Atlas
 *     mountains / a horizon line — a culturally-grounded Algerian cue
 *     without any folkloric ornament. They also read as visual depth:
 *     a layered "outer calm contains inner life".
 *   - The leaning inner peak: a perfect-frame containing an off-axis
 *     core is the same composition you find in classical paintings
 *     where the formal frame holds a charged, slightly-displaced
 *     subject. The eye reads it as alive, intentional, human.
 *   - Right-to-left lean: the inner peak's apex pulls left, which
 *     mirrors the motion of an Arabic-reading eye moving right to
 *     left. A subliminal cultural cue, not a literal one.
 *   - Two stable triangles, one frame and one solid — strong
 *     hierarchy: the outer says "structure / institution / trust",
 *     the inner says "soul / heart / Salma". Premium without being
 *     cold.
 *   - Triangular geometry departs entirely from the dot-halo
 *     language of earlier versions: a deliberately new mark, not a
 *     refinement of the previous one.
 *
 * Stays legible from a 64×64 hero down to a 16×16 favicon, where the
 * "twin peaks" silhouette stays recognisable even when the lean of
 * the inner peak becomes a sub-pixel detail.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      {/* Outer triangle frame: outer minus inner, even-odd fill. */}
      <path
        fillRule="evenodd"
        d="M32 8 L56 50 L8 50 Z M32 17 L48 45 L16 45 Z"
      />
      {/* Inner solid peak — apex shifted left of base midpoint (asymmetric lean). */}
      <path d="M28 26 L42 42 L20 42 Z" />
    </svg>
  );
}
