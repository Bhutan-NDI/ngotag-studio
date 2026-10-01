/**
 * The NDI Studio lockup.
 *
 * Two cuts ship: one drawn in ink for a light ground, one in white for a dark
 * one. Both are rendered and CSS shows the right one, so the swap happens
 * before first paint — picking in React would have to wait for hydration,
 * which is the one moment a logo must not flicker. The hidden cut is
 * `display: none`, so it stays out of the accessibility tree and the alt text
 * is announced once.
 *
 * A plain img, not next/image: these are static SVGs, which Next passes
 * through unoptimised anyway.
 */
export function Lockup({ className = "" }: { className?: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/media/logos/ndi-studio-on-dark.svg"
        alt="NDI Studio"
        width={1459}
        height={409}
        className={`on-dark-only ${className}`.trim()}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/media/logos/ndi-studio-on-light.svg"
        alt="NDI Studio"
        width={1456}
        height={409}
        className={`on-light-only ${className}`.trim()}
      />
    </>
  );
}
