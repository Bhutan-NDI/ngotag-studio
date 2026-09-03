import React from 'react'

interface AvatarBadgeProps {
  /** Real display name (or email as a fallback) the initial is derived from. Never hardcode a placeholder letter. */
  name?: string | null
  /** Uploaded profile photo, if any — takes priority over the initial. */
  src?: string | null
  size?: number
  className?: string
}

/**
 * The mint-gradient circular initial badge used for the signed-in user
 * across the bhutanndi reskin: filled with `--bhutanndi-grad-cta` (the same ramp
 * as GradientButton), a bold white initial, and a hairline ring in the
 * surrounding surface color so the circle reads as cut out of its
 * background rather than pasted on it — matches on both the dark app shell
 * and any lighter panel it's dropped onto.
 */
export function AvatarBadge({
  name,
  src,
  size = 40,
  className = '',
}: AvatarBadgeProps): React.JSX.Element {
  const initial = name?.trim()?.[0]?.toUpperCase() || '?'

  if (src) {
    return (
      <img
        src={src}
        alt={name?.trim() || 'Profile'}
        className={`flex-none rounded-full object-cover ${className}`.trim()}
        style={{
          width: size,
          height: size,
          boxShadow: '0 0 0 2px var(--background)',
        }}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={name?.trim() || 'Profile'}
      className={`font-display inline-flex flex-none items-center justify-center rounded-full font-bold text-white ${className}`.trim()}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        background: 'var(--bhutanndi-grad-cta)',
        boxShadow: '0 0 0 2px var(--background)',
      }}
    >
      {initial}
    </div>
  )
}
