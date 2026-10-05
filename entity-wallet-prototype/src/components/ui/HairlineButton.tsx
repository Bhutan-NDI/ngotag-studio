"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface HairlineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  block?: boolean;
}

/**
 * Secondary control. The website has no outline button, so this applies its
 * existing hairline vocabulary — the chip's checked state and the mobile
 * sheet's social tiles: 1px mint border over a near-transparent fill, hover to
 * mint 8% with the small glow.
 */
export function HairlineButton({
  children,
  className = "",
  block = false,
  type = "button",
  ...props
}: HairlineButtonProps) {
  return (
    <button
      type={type}
      className={`ndi-hairline-btn inline-flex h-12 cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-grid bg-[rgb(var(--tint)/0.03)] px-6 font-display text-[14.5px] font-semibold text-body ${
        block ? "w-full" : ""
      } ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
