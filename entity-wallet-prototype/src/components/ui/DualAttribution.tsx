"use client";

import { useDemo } from "@/lib/demoStore";

/**
 * "Pelden Trading Pvt. Ltd. · acted by Rinzin Dema"
 *
 * The display convention the whole product turns on, and the reason it is a
 * component rather than a string built at each call site: it appears on audit
 * rows, approval records, activity feeds and decisions, and the one thing it
 * must never do is drift into showing only one of the two names. A component
 * cannot forget the entity; a template string in eight files eventually will.
 *
 * The entity leads and the person follows, in that order, always. A Controller
 * acted *for* the entity — they are not the entity, and they did not act for
 * themselves. Reversing the order, or dropping the entity on a narrow screen,
 * quietly reintroduces impersonation as the mental model.
 *
 * `approvedById` is a separate line rather than a third name on the same one.
 * "Who did this" and "who authorised it" answer different questions, and
 * running them together produces a sentence nobody can parse under pressure.
 */
export function DualAttribution({
  entity,
  actorId,
  approvedById = null,
  size = "default",
}: {
  entity: string;
  actorId: string;
  approvedById?: string | null;
  size?: "default" | "compact";
}) {
  const { personById } = useDemo();
  const actor = personById(actorId);
  const approver = approvedById ? personById(approvedById) : null;

  const entitySize = size === "compact" ? "text-[12.5px]" : "text-[13.5px]";
  const personSize = size === "compact" ? "text-[12px]" : "text-[12.5px]";

  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className={`font-display font-medium leading-[1.4] text-body ${entitySize}`}>
        {entity}
      </span>
      <span className={`leading-[1.45] text-faint ${personSize}`}>
        acted by <span className="text-muted">{actor.name}</span>
        {approver ? (
          <>
            <br />
            approved by <span className="text-muted">{approver.name}</span>
          </>
        ) : null}
      </span>
    </span>
  );
}
