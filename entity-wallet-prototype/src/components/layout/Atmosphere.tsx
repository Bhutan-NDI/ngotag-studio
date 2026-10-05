/**
 * The page ground. Ported from the website's Atmosphere: the fixed
 * --grad-depth base plus the ambient mint/teal edge pools that alternate
 * down the viewport.
 */
export function Atmosphere() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: "var(--grad-depth)" }}
      />
      {/* The pools live in --atmos-pools rather than here, so the light theme
          can cool them to a fraction of their strength. Mint at dark-theme
          alpha over a near-white ground turns the page green. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{ backgroundImage: "var(--atmos-pools)" }}
      />
    </>
  );
}
