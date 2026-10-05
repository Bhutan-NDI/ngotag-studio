import type { ReactNode } from "react";

export interface DetailItem {
  label: string;
  value: ReactNode;
  /** DIDs, key material and schema ids — long, and worth reading exactly. */
  mono?: boolean;
}

/**
 * The label/value grid every detail page uses.
 *
 * A description list rather than a table: these are properties of one thing,
 * not rows of comparable things, and a dl keeps that distinction for anyone
 * reading the page with a screen reader. The label column is fixed when there
 * is room, so values line up down the page, and stacks when there is not.
 *
 * The split is a CONTAINER query, not a viewport one. This list is used both
 * across a full-width panel and inside a 380px rail, and keyed to the viewport
 * the rail version kept the two columns on a wide screen — which is how
 * "board-resolution-2026-05-18.pdf · PT/BR/2026/011" ended up broken over four
 * lines with the separator stranded on its own. What matters is the width of
 * the box the list is in, and that is exactly what a container query asks.
 */
export function DetailList({ items }: { items: DetailItem[] }) {
  return (
    <dl className="@container relative z-[4] m-0 flex flex-col">
      {items.map((item, i) => (
        <div
          key={item.label}
          /* min-w-0: the rows are flex children, so they default to
             min-width:auto and size to their widest word — which let a
             sha256 fingerprint push the row past the panel and get clipped
             instead of wrapping. */
          className={`grid min-w-0 gap-1 py-3.5 @min-[520px]:grid-cols-[minmax(0,200px)_1fr] @min-[520px]:gap-6 ${
            i > 0 ? "border-t border-subtle" : ""
          }`}
        >
          <dt className="text-[13px] leading-[1.5] text-faint">{item.label}</dt>
          <dd
            /* Mono values are hashes, DIDs and references: one long token
               with nowhere natural to break, so they break anywhere rather
               than run off the edge. */
            className={`m-0 min-w-0 break-words text-[14px] leading-[1.6] text-body ${
              item.mono ? "break-all font-mono text-[12.5px]" : ""
            }`}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
