import { Icon } from "./icons";

export interface Step {
  label: string;
}

/**
 * The progress rail above a multi-step flow — choose a schema, choose a
 * definition, fill the attributes, send.
 *
 * Steps already passed get a tick rather than their number: the number tells
 * you where you are, and once you are past it the only thing worth saying is
 * that it is done. Below 641px the labels drop and the rail becomes dots, since
 * four labels across a phone either wrap into nonsense or truncate to nothing.
 */
export function Stepper({ steps, current }: { steps: Step[]; current: number }) {
  return (
    <ol
      className="relative z-[4] m-0 flex list-none items-center gap-2 p-0 min-[641px]:gap-3"
      aria-label="Progress"
    >
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step.label} className="flex min-w-0 items-center gap-2 min-[641px]:gap-3">
            <span
              aria-current={active ? "step" : undefined}
              className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border font-mono text-[11px]"
              style={{
                borderColor: done || active ? "var(--border-strong)" : "var(--border-grid)",
                background: done || active ? "var(--ndi-mint-12)" : "rgb(var(--tint) / 0.03)",
                color: done || active ? "var(--accent)" : "var(--text-faint)",
              }}
            >
              {done ? <Icon name="check" size={13} strokeWidth={2.4} /> : i + 1}
            </span>

            <span
              className={`hidden truncate text-[13px] min-[641px]:inline ${
                active ? "font-medium text-strong" : "text-muted"
              }`}
            >
              {step.label}
            </span>

            {i < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className="h-px w-4 flex-none min-[641px]:w-8"
                style={{ background: "var(--border-subtle)" }}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
