import { Icon } from "./icons";

/**
 * A QR-shaped block for the demo.
 *
 * Deliberately not a real QR code: encoding one properly needs a library, and
 * a scannable code pointing at a URL that does not exist would be worse than
 * an obvious stand-in. The modules are derived from the value so each generated
 * code looks different, which is what sells the interaction — but the finder
 * squares are drawn correctly so it reads as a QR at a glance.
 */
function hash(value: string, i: number) {
  let h = 0;
  for (let c = 0; c < value.length; c += 1) {
    h = (h * 31 + value.charCodeAt(c) + i * 17) & 0xffff;
  }
  return h;
}

const GRID = 21;
const FINDERS = [
  [0, 0],
  [GRID - 7, 0],
  [0, GRID - 7],
];

/**
 * `bare` draws only the code, for a frame that supplies its own paper — the
 * wallet scan card — and leaves the centre clear for the NDI mark, the way the
 * real integration's codes do (error correction is what lets a real code lose
 * its middle and still scan).
 */
export function QrPlaceholder({ value, bare = false }: { value: string | null; bare?: boolean }) {
  if (!value) {
    return (
      <div
        className="flex aspect-square w-full max-w-[260px] items-center justify-center rounded-[14px] border border-grid"
        style={{ background: "rgb(var(--tint) / 0.03)" }}
      >
        <span className="flex flex-col items-center gap-2.5 text-faint">
          <Icon name="verify" size={34} strokeWidth={1.4} />
          <span className="text-[12.5px]">No code generated yet</span>
        </span>
      </div>
    );
  }

  const inFinder = (x: number, y: number) =>
    FINDERS.some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);

  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      if (inFinder(x, y)) continue;
      if (bare && x >= 7 && x < GRID - 7 && y >= 7 && y < GRID - 7) continue;
      if (hash(value, y * GRID + x) % 100 < 46) cells.push({ x, y });
    }
  }

  if (bare) {
    return (
      <svg
        viewBox={`0 0 ${GRID} ${GRID}`}
        className="block h-auto w-full"
        role="img"
        aria-label="Bhutan NDI Wallet QR code"
        shapeRendering="crispEdges"
      >
        {cells.map((c) => (
          <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width="1" height="1" style={{ fill: "var(--qr-ink)" }} />
        ))}
        {FINDERS.map(([fx, fy]) => (
          <g key={`${fx}-${fy}`}>
            <rect x={fx} y={fy} width="7" height="7" style={{ fill: "var(--qr-ink)" }} />
            <rect x={fx + 1} y={fy + 1} width="5" height="5" style={{ fill: "var(--qr-paper)" }} />
            <rect x={fx + 2} y={fy + 2} width="3" height="3" style={{ fill: "var(--qr-ink)" }} />
          </g>
        ))}
      </svg>
    );
  }

  return (
    <div
      className="w-full max-w-[260px] rounded-[14px] border border-grid p-4"
      style={{ background: "#ffffff" }}
    >
      <svg
        viewBox={`0 0 ${GRID} ${GRID}`}
        className="block h-auto w-full"
        role="img"
        aria-label="Credential offer QR code"
        shapeRendering="crispEdges"
      >
        {cells.map((c) => (
          <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width="1" height="1" fill="#0c111b" />
        ))}
        {FINDERS.map(([fx, fy]) => (
          <g key={`${fx}-${fy}`} fill="#0c111b">
            <rect x={fx} y={fy} width="7" height="7" />
            <rect x={fx + 1} y={fy + 1} width="5" height="5" fill="#ffffff" />
            <rect x={fx + 2} y={fy + 2} width="3" height="3" />
          </g>
        ))}
      </svg>
    </div>
  );
}
