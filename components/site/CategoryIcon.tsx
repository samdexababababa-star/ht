/**
 * Small inline icon set used in the category strip and category-tagged cards.
 *
 * Each icon is a single 24×24 SVG drawn with thin (1.5) round strokes — no
 * external icon library. They share the same visual weight as the rest of the
 * site (logo mark, navigation, buttons) so the design feels intentional.
 *
 * Stored on `Category.icon` as a slug, falls back to the literal string (so
 * legacy unicode glyphs still render).
 */

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const icons: Record<string, React.ReactNode> = {
  // Streaming — minimal play triangle inside a soft rounded square
  streaming: (
    <svg {...baseProps}>
      <rect x="3" y="4" width="18" height="16" rx="3.5" />
      <path d="M10 9.2v5.6L15 12 10 9.2z" fill="currentColor" stroke="none" />
    </svg>
  ),
  // AI tools — sparkle / 4-point star (different from brand mark, smaller)
  ai: (
    <svg {...baseProps}>
      <path d="M12 4l1.6 5.2L19 11l-5.4 1.8L12 18l-1.6-5.2L5 11l5.4-1.8L12 4z" />
      <path d="M19 5l.8 1.7L21.5 7l-1.7.8L19 9l-.8-1.7L16.5 7l1.7-.8L19 5z" />
    </svg>
  ),
  // Gaming — soft controller silhouette, single line
  gaming: (
    <svg {...baseProps}>
      <path d="M7 9h10a4 4 0 014 4v1a3 3 0 01-5.4 1.8l-1-1.3h-3.2l-1 1.3A3 3 0 013 14v-1a4 4 0 014-4z" />
      <path d="M8.5 12v2M7.5 13h2" />
      <circle cx="15.5" cy="13" r=".7" fill="currentColor" stroke="none" />
      <circle cx="17" cy="11.5" r=".7" fill="currentColor" stroke="none" />
    </svg>
  ),
  // Followers / growth — upward arrow with a small dot trail
  followers: (
    <svg {...baseProps}>
      <path d="M5 17l5-5 3 3 6-6" />
      <path d="M14 9h5v5" />
      <circle cx="5" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  // Music — single note with a soft beam
  music: (
    <svg {...baseProps}>
      <path d="M9 17V6l10-2v11" />
      <circle cx="7" cy="17" r="2.2" />
      <circle cx="17" cy="15" r="2.2" />
    </svg>
  ),
  // Generic / catch-all — small plus / asterisk
  generic: (
    <svg {...baseProps}>
      <path d="M12 5v14M5 12h14M7 7l10 10M17 7L7 17" />
    </svg>
  ),
};

export function CategoryIcon({
  hint,
  className = "h-5 w-5",
}: {
  hint?: string | null;
  className?: string;
}) {
  if (!hint) return <span className={className}>{icons.generic}</span>;
  const key = hint.trim().toLowerCase();
  // Direct slug match
  if (icons[key]) {
    return <span className={className}>{icons[key]}</span>;
  }
  // Heuristic fallbacks based on common category names
  if (/(stream|tv|video|movie)/i.test(key)) return <span className={className}>{icons.streaming}</span>;
  if (/(ai|gpt|claude|midjourney|llm|intel)/i.test(key)) return <span className={className}>{icons.ai}</span>;
  if (/(game|gaming|console|psn|xbox|steam|playstation)/i.test(key)) return <span className={className}>{icons.gaming}</span>;
  if (/(follow|growth|insta|tiktok|youtube|boost)/i.test(key)) return <span className={className}>{icons.followers}</span>;
  if (/(music|spotify|deezer|apple)/i.test(key)) return <span className={className}>{icons.music}</span>;
  // Otherwise render the raw character (legacy unicode emoji from old seeds)
  if (hint.length <= 4) return <span className={className + " text-base leading-none"}>{hint}</span>;
  return <span className={className}>{icons.generic}</span>;
}
