"use client";

import Link from "next/link";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

import { formatDate, hasApprovalGate, legalBasisLabel, summariseScope } from "./scopeModel";

/**
 * C1 — the controllership register: everyone who may act for the entity, and
 * on what footing.
 *
 * At stub depth, per the plan, and the columns are the whole design decision.
 * A register of this kind is read for one of two reasons — "who can do X?" and
 * "is anybody still able to do things they should not be?" — so the columns
 * are scope summary, legal basis, and lifecycle state, in that order. Sorting
 * by name would serve neither question.
 *
 * Terminated and expired relations are kept and shown rather than filtered
 * away. A register that quietly hides the officer who left is exactly the
 * register nobody can use to answer the second question.
 */
export function RelationsView() {
  const { relations, personById } = useDemo();

  const variant = useScreenState("C1", ["populated", "empty"]);
  const rows = variant === "empty" ? [] : relations;

  const pending = rows.filter((r) => r.state === "PENDING_ACCEPTANCE");

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Controllership" }, { label: "Relations" }]}
          title="Who may act for us"
          actions={
            <Link href="/controllership/relations/new">
              <GradientButton>
                <Icon name="plus" size={15} strokeWidth={2} />
                New controllership
              </GradientButton>
            </Link>
          }
        />

        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          Every person who may act for Pelden Trading, what they may do, and
          the legal basis it rests on. People whose authority has ended stay on
          the register — a list that hid them could not answer the question it
          exists for.
        </p>

        {pending.length > 0 ? (
          <p
            className="flex items-start gap-2 rounded-xl border border-grid px-3.5 py-3 text-[13px] leading-[1.5]"
            style={{ background: "rgb(var(--tint) / 0.05)", color: "var(--text-body)" }}
          >
            <Icon
              name="info"
              size={14}
              strokeWidth={2}
              className="mt-px flex-none"
              style={{ color: "var(--ndi-warning)" }}
            />
            <span>
              {pending.length === 1
                ? `${personById(pending[0].personId).name} has not accepted their authority yet, so it is not in force.`
                : `${pending.length} people have not accepted their authority yet, so none of it is in force.`}
            </span>
          </p>
        ) : null}

        <Panel padded={false}>
          <DataTable
            columns={["Person", "What they may do", "Legal basis", "In force", "State", ""]}
            empty={{
              icon: "link",
              title: "Nobody may act for the entity yet",
              message:
                "A controllership lets a person act for the organisation within a scope you set. Until one exists and has been accepted, only you can act.",
              action: (
                <Link href="/controllership/relations/new">
                  <GradientButton>New controllership</GradientButton>
                </Link>
              ),
            }}
          >
            {rows.map((relation) => {
              const person = personById(relation.personId);
              return (
                <tr key={relation.id}>
                  <td>
                    <span className="flex flex-col">
                      <span className="text-body">
                        {person.name}
                        {relation.isRootAuthority ? (
                          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                            root
                          </span>
                        ) : null}
                      </span>
                      <span className="text-[12px] text-faint">{person.title}</span>
                    </span>
                  </td>
                  <td>
                    <span className="flex flex-col">
                      <span className="text-body">
                        {summariseScope(relation.scope, relation.isRootAuthority)}
                      </span>
                      {hasApprovalGate(relation.scope) ? (
                        <span className="text-[12px] text-faint">Some of it needs approval</span>
                      ) : null}
                    </span>
                  </td>
                  <td>{legalBasisLabel(relation.legalBasis)}</td>
                  <td>
                    {relation.scope.validUntil
                      ? `Until ${formatDate(relation.scope.validUntil)}`
                      : "No end date"}
                  </td>
                  <td>
                    <StatusPill status={relation.state} />
                  </td>
                  <td>
                    <span className="flex flex-wrap gap-3">
                      {relation.state === "DRAFT" || relation.state === "PENDING_ACCEPTANCE" ? (
                        <Link
                          href={`/controllership/relations/${relation.id}/scope`}
                          className="ndi-plainlink whitespace-nowrap text-[12.5px] font-medium text-muted"
                        >
                          Scope
                        </Link>
                      ) : null}
                      <Link
                        href={`/controllership/relations/${relation.id}/accept`}
                        className="ndi-plainlink whitespace-nowrap text-[12.5px] font-medium text-faint"
                      >
                        Open
                      </Link>
                    </span>
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </Panel>
      </div>
    </AppShell>
  );
}
