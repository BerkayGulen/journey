/**
 * Placeholder "portal" logo for the Classroom app bar — a circular mark that
 * acts as the home control (clicking returns to the Journey welcome). Drawn as
 * inline SVG tinted via `currentColor` so it sits cleanly on the light bar.
 *
 * NOTE: this is a PLACEHOLDER. When the real logo asset is supplied, swap this
 * SVG for an <img src="/icons/…"> (or the new mark) — the surrounding button in
 * ClassroomScreen keeps the navigation behavior, so only this file changes.
 */
export default function PortalLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      role="img"
      aria-label="Journey"
    >
      {/* Outer ring */}
      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="9" />
      {/* Inner swoosh — a stylized stand-in for the Journey mark */}
      <path
        d="M34 64 C34 44 44 34 60 34 C50 42 46 52 50 64 C53 54 58 50 66 50"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
