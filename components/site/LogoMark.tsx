/**
 * Salma brand mark — a luminous 16-point halo.
 *
 * Sixteen dots arranged on a perfect circle with alternating radii (2 / 1.4)
 * create a subtle "breathing" rhythm: the eight cardinal + diagonal dots are
 * slightly larger, the eight in-between dots smaller. Reads as an aura / halo
 * — a literal nod to "Salma" (سلمى, peace / serenity) and to the soft glow
 * around a star or moon. Stays legible down to ~12px (favicons).
 *
 * Inspired by minimalist dot-halo logo languages (e.g. Serus) but
 * differentiated by the alternating-radius rhythm — unique to Salma.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      aria-hidden
    >
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
    </svg>
  );
}
