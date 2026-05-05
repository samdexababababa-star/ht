export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M32 4l3.6 22.4 21.4-7L40 32l21.4 12.6-21.4-7L32 60l-3.6-22.4-21.4 7L24 32 2.6 19.4l21.4 7L32 4z" />
    </svg>
  );
}
