"use client";

import { useEffect, useState } from "react";

/**
 * Time left until something expires — a parked approval's TTL, a proof
 * request, a credential offer.
 *
 * Rendered as text, deliberately, rather than a depleting bar. "Expires in
 * 2 days" is a fact an approver can act on; a bar three-quarters full is a
 * feeling. Both would be honest, but only one tells you whether to deal with
 * this now or after lunch.
 *
 * It renders nothing on the server and nothing on the first client paint.
 * Time-until is not a value the server and the client can agree on — they
 * evaluate it milliseconds apart, and a mismatch here is a hydration error on
 * every screen that shows a queue. So the first paint is deliberately empty
 * and the value appears in an effect.
 *
 * The tick is a minute, not a second. Nothing here expires in seconds, and a
 * per-second re-render on a queue of parked operations spends real battery
 * animating a number that has not changed.
 */
function describe(target: Date, now: Date): { text: string; expired: boolean } {
  const ms = target.getTime() - now.getTime();
  if (Number.isNaN(ms)) return { text: "", expired: false };
  if (ms <= 0) return { text: "Expired", expired: true };

  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  /* One unit, not two. "Expires in 2 days, 7 hours" reads as a stopwatch;
     the decision it supports only ever needed the leading unit. */
  if (days >= 1) return { text: `${days} ${days === 1 ? "day" : "days"} left`, expired: false };
  if (hours >= 1) return { text: `${hours} ${hours === 1 ? "hour" : "hours"} left`, expired: false };
  if (minutes >= 1) {
    return { text: `${minutes} ${minutes === 1 ? "minute" : "minutes"} left`, expired: false };
  }
  return { text: "Less than a minute left", expired: false };
}

export function Countdown({
  /** ISO date or date-time. A date-only value means end of that day. */
  expiresAt,
  className = "",
}: {
  expiresAt: string;
  className?: string;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  /* A date with no time means the whole of that day is still available, so it
     expires at the end of it rather than at midnight as it begins. Treating
     "2026-09-11" as 00:00 would show an offer as expired for the entire last
     day it can still be accepted. */
  const target = /\d{4}-\d{2}-\d{2}$/.test(expiresAt)
    ? new Date(`${expiresAt}T23:59:59`)
    : new Date(expiresAt);

  if (!now) {
    /* A non-breaking space, not an empty element: an empty inline box has no
       line height, so a queue of parked operations would grow by a line each
       as the values appear. This reserves the line without asserting a width
       we cannot know. */
    return (
      <span aria-hidden="true" className={`inline-block text-[12.5px] ${className}`}>
        &nbsp;
      </span>
    );
  }

  const { text, expired } = describe(target, now);
  if (!text) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-medium ${className}`}
      style={{ color: expired ? "var(--ndi-danger)" : "var(--text-muted)" }}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 flex-none rounded-full"
        style={{ background: expired ? "var(--ndi-danger)" : "var(--text-faint)" }}
      />
      {text}
    </span>
  );
}
