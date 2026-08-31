import React from 'react'

/**
 * Drawn line scenes for the auth rail, ported from BhutanNDI_Studio's
 * src/components/ui/scenes.tsx. One mint hue, 1.7px strokes, geometric, no
 * raster clipart. Purely decorative — hidden below 901px alongside the rest
 * of the left rail (see NgotagAuthShell) — so there is nothing here to wire
 * to real data.
 */
const STROKE = 'var(--ngotag-accent)'
const STROKE_DIM = 'var(--ngotag-mint-40)'
const FILL_GLASS = 'var(--ngotag-mint-08)'

function ScanlineDef(): React.JSX.Element {
  return (
    <defs>
      <linearGradient id="ngotagScanline" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="var(--ngotag-mint)" stopOpacity="0" />
        <stop
          offset="50%"
          stopColor="var(--ngotag-mint-bright)"
          stopOpacity="0.9"
        />
        <stop offset="100%" stopColor="var(--ngotag-mint)" stopOpacity="0" />
      </linearGradient>
    </defs>
  )
}

/** Sign-in: a credential panel with an identity field and a verified seal. */
export function SecureSignInScene(): React.JSX.Element {
  return (
    <svg
      viewBox="34 30 354 242"
      fill="none"
      className="ndi-scene block h-auto w-full"
      role="img"
      aria-label="A credential panel with an identity record and a verified seal"
    >
      <ScanlineDef />

      <rect
        x="86"
        y="42"
        width="266"
        height="176"
        rx="14"
        stroke={STROKE_DIM}
        strokeWidth="1.7"
      />

      <rect
        x="52"
        y="74"
        width="266"
        height="176"
        rx="14"
        fill={FILL_GLASS}
        stroke={STROKE}
        strokeWidth="1.7"
      />
      <path d="M52 108h266" stroke={STROKE} strokeWidth="1.7" />
      <circle cx="72" cy="91" r="3.4" stroke={STROKE} strokeWidth="1.4" />
      <circle cx="86" cy="91" r="3.4" stroke={STROKE} strokeWidth="1.4" />
      <circle cx="100" cy="91" r="3.4" stroke={STROKE} strokeWidth="1.4" />

      <rect
        x="76"
        y="130"
        width="56"
        height="66"
        rx="8"
        stroke={STROKE}
        strokeWidth="1.7"
      />
      <circle cx="104" cy="152" r="11" stroke={STROKE} strokeWidth="1.7" />
      <path
        d="M85 190a19 19 0 0 1 38 0"
        stroke={STROKE}
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M150 138h140"
        stroke={STROKE_DIM}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M150 158h104"
        stroke={STROKE_DIM}
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <rect
        x="150"
        y="176"
        width="140"
        height="26"
        rx="7"
        stroke={STROKE}
        strokeWidth="1.7"
      />
      <rect
        className="ndi-scene__scan"
        x="156"
        y="188"
        width="60"
        height="2"
        rx="1"
        fill="url(#ngotagScanline)"
      />

      <rect
        x="76"
        y="212"
        width="82"
        height="24"
        rx="7"
        fill="var(--ngotag-mint-12)"
        stroke={STROKE}
        strokeWidth="1.7"
      />
      <path
        d="M104 224h26M124 219l5 5-5 5"
        stroke={STROKE}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <g className="ndi-scene__seal">
        <circle
          cx="322"
          cy="228"
          r="34"
          fill="var(--ngotag-scene-knockout)"
          stroke={STROKE}
          strokeWidth="1.7"
        />
        <path
          d="M322 211.5c-4 2.5-9 3.9-12.5 4.3v11.2c0 8 5 13 12.5 15.8 7.5-2.8 12.5-7.8 12.5-15.8v-11.2c-3.5-.4-8.5-1.8-12.5-4.3Z"
          stroke={STROKE}
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M315.9 225.4l4.2 4.2 8.4-9"
          stroke="var(--ngotag-mint-bright)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <circle cx="46" cy="60" r="4" stroke={STROKE_DIM} strokeWidth="1.7" />
      <circle cx="376" cy="96" r="4" stroke={STROKE_DIM} strokeWidth="1.7" />
      <path
        d="M46 60h34M376 96h-30"
        stroke={STROKE_DIM}
        strokeWidth="1.7"
        strokeDasharray="3 5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Sign-up step two: a password prompt guarding a stack of records. */
export function PasswordScene(): React.JSX.Element {
  return (
    <svg
      viewBox="26 30 366 250"
      fill="none"
      className="ndi-scene block h-auto w-full"
      role="img"
      aria-label="A password prompt guarding a stack of records"
    >
      <ScanlineDef />

      {/* Records behind */}
      <rect
        x="46"
        y="44"
        width="150"
        height="106"
        rx="10"
        stroke={STROKE_DIM}
        strokeWidth="1.7"
      />
      <path
        d="M64 70h58M64 88h44M64 106h52"
        stroke={STROKE_DIM}
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <rect
        x="228"
        y="60"
        width="150"
        height="106"
        rx="10"
        stroke={STROKE_DIM}
        strokeWidth="1.7"
      />
      <path
        d="M246 86h58M246 104h44M246 122h52"
        stroke={STROKE_DIM}
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      {/* The prompt */}
      <rect
        x="104"
        y="112"
        width="216"
        height="140"
        rx="14"
        fill={FILL_GLASS}
        stroke={STROKE}
        strokeWidth="1.7"
      />

      <g className="ndi-scene__seal">
        <circle
          cx="212"
          cy="146"
          r="26"
          fill="var(--ngotag-scene-knockout)"
          stroke={STROKE}
          strokeWidth="1.7"
        />
        <rect
          x="202"
          y="143"
          width="20"
          height="14"
          rx="5"
          stroke={STROKE}
          strokeWidth="1.7"
        />
        <path
          d="M206 143v-3.6a6 6 0 0 1 12 0v3.6"
          stroke={STROKE}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M212 149v3"
          stroke="var(--ngotag-mint-bright)"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </g>

      {/* Masked entry */}
      <rect
        x="132"
        y="192"
        width="160"
        height="30"
        rx="8"
        stroke={STROKE}
        strokeWidth="1.7"
      />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          cx={150 + i * 18}
          cy={207}
          r="3.4"
          fill="var(--ngotag-mint)"
          fillOpacity={i < 4 ? 0.85 : 0.2}
        />
      ))}
      <rect
        className="ndi-scene__scan"
        x="138"
        y="228"
        width="60"
        height="2"
        rx="1"
        fill="url(#ngotagScanline)"
      />

      {/* Trace nodes */}
      <circle cx="40" cy="188" r="4" stroke={STROKE_DIM} strokeWidth="1.7" />
      <circle cx="384" cy="204" r="4" stroke={STROKE_DIM} strokeWidth="1.7" />
      <path
        d="M40 188h60M384 204h-58"
        stroke={STROKE_DIM}
        strokeWidth="1.7"
        strokeDasharray="3 5"
        strokeLinecap="round"
      />
    </svg>
  )
}
