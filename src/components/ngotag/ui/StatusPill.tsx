import type React from 'react'

type Tone = 'positive' | 'pending' | 'warning' | 'negative' | 'neutral'

/**
 * Status as a word with a dot, not a coloured word.
 *
 * Colour alone would put the whole meaning in a channel some readers do not
 * get, so the label always carries it and the dot only reinforces. Tones map
 * to the palette's status tokens rather than to raw colours, so they follow
 * the theme.
 */
const TONES: Record<Tone, { fg: string; bg: string; dot: string }> = {
  positive: {
    fg: 'var(--ngotag-accent)',
    bg: 'var(--ngotag-mint-08)',
    dot: 'var(--ngotag-success)',
  },
  pending: {
    fg: 'var(--ngotag-text-body)',
    bg: 'rgb(var(--ngotag-tint) / 0.05)',
    dot: 'var(--ngotag-info)',
  },
  warning: {
    fg: 'var(--ngotag-text-body)',
    bg: 'rgb(var(--ngotag-tint) / 0.05)',
    dot: 'var(--ngotag-warning)',
  },
  negative: {
    fg: 'var(--ngotag-text-body)',
    bg: 'rgb(var(--ngotag-tint) / 0.05)',
    dot: 'var(--ngotag-danger)',
  },
  neutral: {
    fg: 'var(--ngotag-text-muted)',
    bg: 'rgb(var(--ngotag-tint) / 0.04)',
    dot: 'var(--ngotag-text-faint)',
  },
}

/** The states the app shows, mapped once so tables stay consistent. */
const STATUS_TONE: Record<string, Tone> = {
  accepted: 'positive',
  active: 'positive',
  verified: 'positive',
  valid: 'positive',
  completed: 'positive',
  issued: 'positive',
  offered: 'pending',
  requested: 'pending',
  invited: 'pending',
  processing: 'pending',
  pending: 'pending',
  expiring: 'warning',
  partial: 'warning',
  declined: 'negative',
  revoked: 'negative',
  expired: 'negative',
  failed: 'negative',
}

export function StatusPill({ status }: { status: string }): React.JSX.Element {
  const tone = TONES[STATUS_TONE[status] ?? 'neutral']
  return (
    <span
      className="border-ngotag-grid inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium whitespace-nowrap capitalize"
      style={{ color: tone.fg, background: tone.bg }}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 flex-none rounded-full"
        style={{ background: tone.dot }}
      />
      {status}
    </span>
  )
}
