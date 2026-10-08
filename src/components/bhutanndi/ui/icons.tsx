import React, { type CSSProperties, type ReactNode } from 'react'

/**
 * Icon registry, following the website's convention: one 24x24 viewBox,
 * currentColor stroke, round caps and joins, stroke width passed per call.
 * Drawn icons only — no emoji standing in for an icon.
 */
export type IconName =
  // auth
  | 'mail'
  | 'lock'
  | 'lockRounded'
  | 'fingerprint'
  | 'shieldCheck'
  | 'shieldAlert'
  | 'eye'
  | 'eyeOff'
  | 'userCheck'
  // navigation
  | 'dashboard'
  | 'building'
  | 'users'
  | 'connections'
  | 'credentials'
  | 'ecosystems'
  | 'github'
  | 'fileText'
  | 'helpCircle'
  | 'issue'
  | 'verify'
  | 'wallet'
  // chrome
  | 'bell'
  | 'moon'
  | 'sun'
  | 'info'
  | 'plus'
  | 'logOut'
  | 'home'
  | 'search'
  | 'refresh'
  // generic
  | 'check'
  | 'close'
  | 'user'
  | 'arrowRight'
  | 'arrowLeft'
  | 'chevronDown'
  | 'chevronRight'
  | 'send'
  // schemas, trust and settings
  | 'key'
  | 'creditCard'
  | 'certificate'
  | 'copy'
  | 'download'
  | 'trash'
  | 'settings'
  | 'edit'
  | 'layers'
  | 'link'

const ALL_ICONS: Record<IconName, ReactNode> = {
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  lockRounded: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="4" />
      <path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7" />
      <path d="M12 14.4v2.2" />
    </>
  ),
  fingerprint: (
    <>
      <path d="M12 4.5a7.5 7.5 0 0 0-7.5 7.5v2" />
      <path d="M12 4.5a7.5 7.5 0 0 1 7.5 7.5v2" />
      <path d="M12 8a4 4 0 0 0-4 4v4.5" />
      <path d="M12 8a4 4 0 0 1 4 4v4.5" />
      <path d="M12 11.5v8" />
    </>
  ),
  /* 14.8 wide by 18.1 tall. The outline was 10 by 16, narrow enough that at
     any size above about 20px it read as a squashed shield. */
  shieldCheck: (
    <>
      <path d="M12 2.9c-2.4 1.5-5.4 2.3-7.4 2.6V12c0 4.6 3.1 7.4 7.4 8.9 4.3-1.5 7.4-4.3 7.4-8.9V5.5c-2-.3-5-1.1-7.4-2.6Z" />
      <path d="M9 11.8l2.3 2.3 4.1-4.5" />
    </>
  ),
  shieldAlert: (
    <>
      <path d="M12 2.9c-2.4 1.5-5.4 2.3-7.4 2.6V12c0 4.6 3.1 7.4 7.4 8.9 4.3-1.5 7.4-4.3 7.4-8.9V5.5c-2-.3-5-1.1-7.4-2.6Z" />
      <path d="M12 8.4v4.2" />
      <path d="M12 16.1h.01" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M9.9 5.8A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.4 3.3" />
      <path d="M6.4 7.6A16.9 16.9 0 0 0 2.5 12S6 18.5 12 18.5c1.6 0 3-.35 4.2-.92" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M3 3l18 18" />
    </>
  ),
  userCheck: (
    <>
      <circle cx="9.5" cy="8" r="3.6" />
      <path d="M2.5 20a7 7 0 0 1 12 0" />
      <path d="M16.5 12.5l2 2 3.5-3.8" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" />
    </>
  ),
  building: (
    <>
      <path d="M3.5 21V4.2A1.2 1.2 0 0 1 4.7 3h8.1a1.2 1.2 0 0 1 1.2 1.2V21" />
      <path d="M14 9.5h5.3a1.2 1.2 0 0 1 1.2 1.2V21" />
      <path d="M2 21h20" />
      <path d="M6.6 7h1.2M10.2 7h1.2M6.6 11h1.2M10.2 11h1.2M6.6 15h1.2M10.2 15h1.2" />
      <path d="M17 13.5h1.2M17 17h1.2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.4" />
      <path d="M2.5 20a6.6 6.6 0 0 1 13 0" />
      <path d="M16 5.2a3.4 3.4 0 0 1 0 5.6" />
      <path d="M18.5 20a6.6 6.6 0 0 0-2.2-4.9" />
    </>
  ),
  connections: (
    <>
      <circle cx="18" cy="5.5" r="2.6" />
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="18.5" r="2.6" />
      <path d="M15.7 6.8 8.3 10.7M8.3 13.3l7.4 3.9" />
    </>
  ),
  credentials: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.2" />
      <circle cx="8.5" cy="11" r="2.1" />
      <path d="M5.4 16.2a3.6 3.6 0 0 1 6.2 0" />
      <path d="M15 10h4M15 13.5h2.5" />
    </>
  ),
  ecosystems: (
    <>
      <circle cx="12" cy="12" r="2.6" />
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5v2.4M12 18.1v2.4M3.5 12h2.4M18.1 12h2.4" />
      <path d="m6.4 6.4 1.7 1.7M15.9 15.9l1.7 1.7M17.6 6.4l-1.7 1.7M8.1 15.9l-1.7 1.7" />
    </>
  ),
  github: (
    <>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 2-2.64-.5-5.36-.5-8 0-2-2-3-2-3-2-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9.5c0 3.5 3 5.5 6 5.5-.6.6-.6 1.2-.5 2V22" />
      <path d="M9 18c-4.5 2-5-2-7-2" />
    </>
  ),
  fileText: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 16.5h4" />
    </>
  ),
  helpCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2-2.4 3.4" />
      <path d="M12 17h.01" />
    </>
  ),
  issue: (
    <>
      <rect x="2.5" y="6" width="14" height="10.5" rx="2" />
      <path d="M6 10h3M6 13h5" />
      <path d="M15 19.5h6.5M18.5 16.5l3 3-3 3" />
    </>
  ),
  verify: (
    <>
      <rect x="4.5" y="4" width="15" height="17" rx="2.2" />
      <path d="M9 4V2.8h6V4" />
      <path d="M9.2 12.4l2.2 2.2 4-4.4" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v1" />
      <rect x="3" y="8" width="18" height="11" rx="2.2" />
      <path d="M16.5 13.5h.01" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5Z" />
      <path d="M13.7 19.5a2 2 0 0 1-3.4 0" />
    </>
  ),
  home: (
    <>
      <path d="M3.5 10.2 12 3.5l8.5 6.7V20a1.2 1.2 0 0 1-1.2 1.2H4.7A1.2 1.2 0 0 1 3.5 20Z" />
      <path d="M9.5 21v-6.5h5V21" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m15.8 15.8 4.4 4.4" />
    </>
  ),
  refresh: (
    <>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
      <path d="M20.5 4.5V10H15" />
    </>
  ),
  moon: <path d="M20.5 15.2A8.5 8.5 0 1 1 9.3 3.7a6.8 6.8 0 0 0 11.2 11.5Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <path d="M12 7.8h.01" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  key: (
    <>
      <circle cx="7.5" cy="15.5" r="4" />
      <path d="M10.4 12.6 20 3l1.5 1.5-1.6 1.6 1.6 1.6-2.3 2.3-1.6-1.6-2.2 2.2" />
    </>
  ),
  creditCard: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19" />
      <path d="M6.5 15h3" />
    </>
  ),
  certificate: (
    <>
      <path d="M19 14V5.5A1.5 1.5 0 0 0 17.5 4h-11A1.5 1.5 0 0 0 5 5.5v13a1.5 1.5 0 0 0 1.5 1.5H11" />
      <path d="M8.5 8h7M8.5 11.5h5" />
      <circle cx="16.5" cy="17" r="3" />
      <path d="m14.6 19.4-.6 2.6 2.5-1.3 2.5 1.3-.6-2.6" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11.5" height="11.5" rx="2" />
      <path d="M5.5 15H5a1.5 1.5 0 0 1-1.5-1.5v-8A2 2 0 0 1 5.5 3.5h8A1.5 1.5 0 0 1 15 5v.5" />
    </>
  ),
  download: (
    <path d="M12 3.5v11m0 0 4-4m-4 4-4-4M4 17v1.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V17" />
  ),
  trash: (
    <>
      <path d="M4 6.5h16" />
      <path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" />
      <path d="M6.5 6.5 7.4 19a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9l.9-12.5" />
      <path d="M10.5 10.5v6M13.5 10.5v6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1h-.2a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5v-.2a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h8" />
      <path d="M16.5 3.9a2 2 0 0 1 2.8 2.8L8 18l-4 1 1-4Z" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z" />
      <path d="m3.5 12 8.5 4.5L20.5 12" />
      <path d="m3.5 16.5 8.5 4.5 8.5-4.5" />
    </>
  ),
  link: (
    <>
      <path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7l-1.4 1.4" />
      <path d="M13.5 10.5a4 4 0 0 0-5.7 0L5 13.3a4 4 0 0 0 5.7 5.7l1.4-1.4" />
    </>
  ),
  logOut: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  arrowRight: <path d="M5 12h14M12 5l7 7-7 7" />,
  arrowLeft: <path d="M19 12H5M12 19l-7-7 7-7" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  send: <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />,
}

interface IconProps {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
  style?: CSSProperties
}

export function Icon({
  name,
  size = 24,
  strokeWidth = 1.8,
  className,
  style,
}: IconProps): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {ALL_ICONS[name]}
    </svg>
  )
}
