import { LogoMark } from "@/components/site/LogoMark";

/**
 * Public-site Suspense fallback — the calligraphic S spins on its own
 * axis while its stroke flows along the path, like an infinity tube
 * the line is drawn through. Doubles as a brand cue and a "we're
 * working on it" signal.
 */
export default function Loading() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="text-primary">
        <LogoMark className="salma-loop w-14 h-14" />
      </div>
    </div>
  );
}
