/**
 * Salma brand mark — a refined 8-petal rosette built from a single path.
 *
 * The shape is an alternating-radius 16-vertex star: long rays at the four
 * cardinal + four diagonal directions, gentle "shoulder" points between them.
 * Reads as a star at glance and as a soft flower / Maghreb-style rosette on
 * closer look. Designed to stay legible down to ~12px (favicons).
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M32 8 L38 18 L49 15 L46 26 L56 32 L46 38 L49 49 L38 46 L32 56 L26 46 L15 49 L18 38 L8 32 L18 26 L15 15 L26 18 Z" />
    </svg>
  );
}
