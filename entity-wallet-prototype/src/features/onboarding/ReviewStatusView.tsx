"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useScreenState } from "@/components/demo/screenState";
import { DetailList } from "@/components/ui/DetailList";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import type { ManualReview } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { OnboardingShell } from "./OnboardingShell";

type Face = "under_review" | "approved" | "refused" | "no_case";

/**
 * Flow 2, the manual-review branch — where the applicant waits, and learns
 * the outcome.
 *
 * WHAT THE WAIT HAS TO SAY
 *
 * The person has done everything asked of them and the answer is "a human
 * will look". The screen's job is to make that wait legible rather than
 * anxious: a reference they can quote, exactly what was sent, what the
 * register said (so they understand why this is not automatic), and — most
 * important — what the organisation can and cannot do meanwhile. It stays an
 * ordinary organisation and holds nothing; saying so now stops the
 * "why can't I accept this credential?" call later.
 *
 * THE DECISION IS SHOWN, NOT MADE HERE
 *
 * Approve and refuse are recorded by an NDI reviewer on their own screen
 * (/admin/reviews) with their name against it. This screen renders what came
 * back and nothing more (rule 9). A refusal carries the reviewer's reason,
 * because "refused" with no reason is a dead end that only generates a
 * support ticket — and the way out is to send it again with more, not to
 * start the whole flow over.
 */
export function ReviewStatusView() {
  const router = useRouter();
  const { orgOnboarding, manualReviews, personById } = useDemo();

  const forced = useScreenState("A3-review", ["live", "under_review", "approved", "refused", "no_case"]);

  /* The case this onboarding raised; in the switcher without one, the seeded
     case stands in so every face can be reviewed with real-looking content. */
  const own = manualReviews.find((m) => m.id === orgOnboarding?.reviewId) ?? null;
  const review: ManualReview | null = own ?? (forced !== "live" ? (manualReviews[0] ?? null) : null);

  const natural: Face = !review
    ? "no_case"
    : review.state === "APPROVED"
      ? "approved"
      : review.state === "REFUSED"
        ? "refused"
        : "under_review";
  const face: Face = forced === "live" ? natural : (forced as Face);

  if (face === "no_case" || !review) {
    return (
      <OnboardingShell current={2}>
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <p className="font-display text-[15px] font-semibold text-strong">No review has been asked for</p>
            <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
              A review is only needed when the register can&rsquo;t confirm your organisation. Start by
              saying what kind of organisation it is.
            </p>
            <div>
              <Link href="/onboarding">
                <GradientButton>Add an organisation</GradientButton>
              </Link>
            </div>
          </div>
        </Panel>
      </OnboardingShell>
    );
  }

  const reviewer = review.reviewerId ? personById(review.reviewerId).name : null;

  return (
    <OnboardingShell current={2}>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-strong">
          {face === "approved"
            ? `${review.legalName} has been approved`
            : face === "refused"
              ? `${review.legalName} wasn't approved`
              : "NDI is reviewing your organisation"}
        </h1>
        <p className="max-w-[64ch] text-[13.5px] leading-[1.65] text-muted">
          {face === "approved"
            ? "A reviewer at NDI checked what you sent and confirmed you represent it. You can now receive its registration."
            : face === "refused"
              ? "A reviewer at NDI couldn't confirm you represent it from what was sent. Their reason is below — you can send it again with more."
              : "A person at NDI checks what you sent. We'll email you when there's a decision; you don't need to keep this page open."}
        </p>
      </div>

      <Panel>
        <div className="relative z-[4] flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Your reference</p>
              <p className="font-mono text-[17px] font-semibold text-strong">{review.reference}</p>
            </div>
            <StatusPill
              status={face === "approved" ? "approved" : face === "refused" ? "refused" : "under_review"}
              label={face === "approved" ? "Approved" : face === "refused" ? "Not approved" : "Under review"}
            />
          </div>

          <DetailList
            items={[
              { label: "Organisation", value: review.legalName },
              { label: "Registration number", value: review.registrationNumber, mono: true },
              { label: "What the register said", value: review.registerAnswer },
              { label: "What you sent", value: review.evidence.join(", ") },
              { label: "Sent", value: formatDate(review.submittedAt) },
              ...(reviewer && review.decidedAt
                ? [{ label: "Decided by", value: `${reviewer}, NDI · ${formatDate(review.decidedAt)}` }]
                : []),
            ]}
          />
        </div>
      </Panel>

      {face === "under_review" ? (
        <Panel>
          <div className="relative z-[4] flex items-start gap-3">
            <Icon name="info" size={17} strokeWidth={2} className="mt-0.5 flex-none text-muted" />
            <div className="flex flex-col gap-1.5">
              <p className="font-display text-[14px] font-semibold text-strong">Until it&rsquo;s approved</p>
              <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                {review.legalName} stays an ordinary organisation. It can&rsquo;t hold its
                registration or any other credential, and nobody can be given authority to act for
                it. Nothing is lost by waiting — everything you sent is kept with the case.
              </p>
            </div>
          </div>
        </Panel>
      ) : null}

      {face === "refused" ? (
        <Panel>
          <div className="relative z-[4] flex items-start gap-3" role="status">
            <Icon name="close" size={17} strokeWidth={2.2} className="mt-0.5 flex-none" style={{ color: "var(--ndi-danger)" }} />
            <div className="flex flex-col gap-1.5">
              <p className="font-display text-[14px] font-semibold text-strong">The reviewer&rsquo;s reason</p>
              <p className="max-w-[62ch] text-[13px] leading-[1.6] text-body">
                {review.reason ?? "No reason was recorded."}
              </p>
            </div>
          </div>
        </Panel>
      ) : null}

      <div className="flex flex-wrap items-center gap-2.5">
        {face === "approved" ? (
          <GradientButton onClick={() => router.push("/onboarding/foundational")}>
            Receive its registration
            <Icon name="arrowRight" size={15} strokeWidth={2} />
          </GradientButton>
        ) : face === "refused" ? (
          <GradientButton onClick={() => router.push("/onboarding/choose")}>
            Send it again with more
          </GradientButton>
        ) : null}
        <HairlineButton onClick={() => router.push("/welcome")}>
          {face === "approved" ? "Later" : "Back to your account"}
        </HairlineButton>
      </div>
    </OnboardingShell>
  );
}
