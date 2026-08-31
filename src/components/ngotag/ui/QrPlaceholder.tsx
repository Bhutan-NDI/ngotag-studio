import { Icon } from './icons'

import type React from 'react'

/**
 * A QR-shaped block for the demo.
 *
 * Deliberately not a real QR code: encoding one properly needs a library, and
 * a scannable code pointing at a URL that does not exist would be worse than
 * an obvious stand-in. The modules are derived from the value so each generated
 * code looks different, which is what sells the interaction — but the finder
 * squares are drawn correctly so it reads as a QR at a glance.
 */
function hash(value: string, i: number): number {
  let h = 0
  for (let c = 0; c < value.length; c += 1) {
    h = (h * 31 + value.charCodeAt(c) + i * 17) & 0xffff
  }
  return h
}

const GRID = 21
const FINDERS = [
  [0, 0],
  [GRID - 7, 0],
  [0, GRID - 7],
]

export function QrPlaceholder({
  value,
}: {
  value: string | null
}): React.JSX.Element {
  if (!value) {
    return (
      <div
        className="border-ngotag-grid flex aspect-square w-full max-w-[260px] items-center justify-center rounded-[14px] border"
        style={{ background: 'rgb(var(--ngotag-tint) / 0.03)' }}
      >
        <span className="text-ngotag-faint flex flex-col items-center gap-2.5">
          <Icon name="verify" size={34} strokeWidth={1.4} />
          <span className="text-[12.5px]">No code generated yet</span>
        </span>
      </div>
    )
  }

  const inFinder = (x: number, y: number): boolean =>
    FINDERS.some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7)

  const cells: { x: number; y: number }[] = []
  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      if (inFinder(x, y)) {
        continue
      }
      if (hash(value, y * GRID + x) % 100 < 46) {
        cells.push({ x, y })
      }
    }
  }

  return (
    <div
      className="border-ngotag-grid w-full max-w-[260px] rounded-[14px] border p-4"
      style={{ background: '#ffffff' }}
    >
      <svg
        viewBox={`0 0 ${GRID} ${GRID}`}
        className="block h-auto w-full"
        role="img"
        aria-label="Credential offer QR code"
        shapeRendering="crispEdges"
      >
        {cells.map((c) => (
          <rect
            key={`${c.x}-${c.y}`}
            x={c.x}
            y={c.y}
            width="1"
            height="1"
            fill="#0c111b"
          />
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
  )
}
