import type { ReactNode } from "react";

/**
 * The dashboard's masthead. The original was a purely decorative band of
 * flowing lines; this keeps the motif — redrawn as mint traces over the
 * wireframe grid — but puts the eyebrow/headline/lead on it, so the widest
 * element on an empty dashboard is doing some work.
 */
export function WaveBanner({
  eyebrow,
  title,
  lead,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  lead: string;
  action?: ReactNode;
}) {
  return (
    <section
      data-cta-form="1"
      className="relative overflow-hidden rounded-[16px] border border-grid px-5 py-7 min-[641px]:px-7 min-[641px]:py-8"
    >
      {/* Wireframe grid, faded out toward the text. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          backgroundImage: "var(--grid-bg)",
          backgroundSize: "var(--grid-size)",
          maskImage: "linear-gradient(100deg, transparent 30%, black 100%)",
          WebkitMaskImage: "linear-gradient(100deg, transparent 30%, black 100%)",
        }}
      />

      {/* The traces. Anchored right so they never run under the copy. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 720 200"
        preserveAspectRatio="xMaxYMid slice"
        className="pointer-events-none absolute inset-y-0 right-0 z-[2] h-full w-[62%]"
        fill="none"
        /* The traces are sliced out of a wider drawing, so without this their
           left edge lands as a hard vertical seam mid-banner — a row of lines
           that start from nothing. The mask dissolves them into the panel
           instead. */
        style={{
          maskImage: "linear-gradient(90deg, transparent 0%, black 26%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 26%)",
        }}
      >
        {Array.from({ length: 9 }, (_, i) => {
          const offset = i * 11;
          return (
            <path
              key={i}
              d={`M-40 ${58 + offset} C 150 ${8 + offset}, 300 ${150 + offset}, 480 ${92 + offset} S 660 ${18 + offset}, 780 ${64 + offset}`}
              stroke="var(--ndi-mint)"
              strokeOpacity={0.05 + i * 0.022}
              strokeWidth="1.2"
            />
          );
        })}
        <circle cx="480" cy="92" r="3.2" stroke="var(--ndi-mint)" strokeOpacity="0.5" strokeWidth="1.4" />
        <circle cx="655" cy="46" r="3.2" stroke="var(--ndi-mint)" strokeOpacity="0.4" strokeWidth="1.4" />
      </svg>

      <div className="relative z-[4] max-w-[52ch]">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{eyebrow}</div>
        <h1 className="mt-3 font-display text-[clamp(24px,3vw,30px)] font-semibold leading-[1.12] tracking-[-0.025em] text-strong [text-wrap:balance]">
          {title}
        </h1>
        <p className="mt-3 text-[15px] leading-[1.6] text-muted [text-wrap:pretty]">{lead}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </section>
  );
}
