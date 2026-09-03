import { Icon } from './icons'

import Link from 'next/link'

import type React from 'react'

export interface Crumb {
  label: string
  href?: string
}

/** Home > Section > Page. The last crumb is the current page and never a link. */
export function Breadcrumb({ items }: { items: Crumb[] }): React.JSX.Element {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px]">
        <li className="flex items-center">
          <Link
            href="/dashboard"
            className="ndi-plainlink text-bhutanndi-muted inline-flex items-center gap-1.5"
          >
            <Icon name="home" size={14} strokeWidth={1.8} />
            Home
          </Link>
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              <Icon
                name="chevronRight"
                size={13}
                strokeWidth={2}
                className="text-bhutanndi-faint flex-none"
              />
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="text-bhutanndi-body"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="ndi-plainlink text-bhutanndi-muted"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
