# Entity Wallet — demo build plan

*Frontend only. No backend. The deliverable is a clickable demo that makes someone understand what the Entity Wallet is and why it exists.*

---

## Part 0 · What this reframing changes

A demo is a **story**, not a screen inventory. That single distinction reorganises everything below.

Three consequences:

**1. Stop counting screens.** The brief lists ~26. A demo that shows all 26 is worse than one that shows 16, because the audience loses the thread. Build the screens that carry the argument; stub the registers that merely prove completeness. See Part 2.

**2. Your repo is now exactly the right tool.** `demoData.ts` + `demoStore.tsx` with zero API dependencies isn't a limitation — it's the correct architecture for this job. Several worries from the production plan drop away entirely: no auth wiring, no socket.io, no react-hook-form/zod debate, no `DataTable` filtering question, and **§14 of the brief (backend alignment) is now irrelevant to you.** Don't read it, don't hand it over.

**3. "Which repo ships" gets less urgent.** It still matters eventually. It no longer blocks you. Build here.

**One new risk to manage.** A frontend-only demo will show a government register confirming a representative in 1.5 seconds, and revocation propagating instantly across a verifier. Someone in the room *will* believe those are built. Put a persistent, quiet "prototype · data simulated" marker in the shell and keep a one-page "what's real vs simulated" note next to the demo. This costs you twenty minutes and saves a misunderstanding with a stakeholder who controls budget.

---

## Part 1 · The story spine

One entity, one grant, one delegation, one failure. Six acts. Everything in `demoData.ts` serves this and nothing else.

**Cast:** Norling Logistics Pvt. Ltd. (CRA-registered) · **Rinzin Dema** — Owner / Root Authority · **Dorji Wangchuk** — Controller · **Pema Choden** — clearing agent / Delegate · counterparties: Bank of Bhutan, BNSW (Bhutan National Single Window).

| Act | What the audience learns | Screens |
|---|---|---|
| **1 · The entity becomes real** | An organisation can hold credentials, and the platform never self-asserts its identity — a government register does | A1 claim → A2 prove identity via wallet → *verifying against the register* → A3 foundational credential accepted, "your entity is now verified" |
| **2 · Authority is granted, narrowly** | *The conceptual core.* Authority is a scoped, legally-grounded, accepted relation — not a role dropdown | C2 create relation (legal basis: board resolution) → **C3 scope builder + live preview** → sent for acceptance → **C4 Dorji accepts fiduciary duties** → ACTIVE · then B2, Dorji's own view of what he may do |
| **3 · The Controller works, under approval** | Pattern A in operation: least disclosure, an approval gate, dual attribution in the audit trail | B1 dashboard has tasks → B4 incoming offer, in scope, accepted → B5 Bank of Bhutan requests a presentation, minimum attributes preselected, policy requires approval → **parked** → B6/B7 Rinzin reviews and approves-as-signature from her wallet → presented → C6 audit row: "Norling Logistics · acted by Dorji Wangchuk" |
| **4 · Authority is delegated to a person's wallet** | Pattern B: the entity issues authority *into someone's own wallet*, with public constraints a verifier can read | D2 issue a Capability to Pema — cap Nu. 500,000 per declaration, task = customs declaration, counterparty = BNSW, 90 days → offer sent → awaiting acceptance → accepted |
| **5 · Authority is checked at the point of use** | **The money shot.** Why the whole system exists | Pema submits a declaration at BNSW → proof request bound to the declaration hash → **D5 PASS**, constraints listed · then Rinzin revokes Pema's parent Role (D4, with blast-radius preview) → Pema retries → **D5 FAIL: revoked ancestor in the authority chain** |
| **6 · There is recourse** | Revocation isn't arbitrary power — it carries a reason and an appeal | D6 appeal intake with the reason + appeal reference → status |

Act 5 is the one to build best. A PASS next to a FAIL-with-a-real-reason, on the same screen, using the same authority chain, explains delegated authority better than any diagram you could draw. If you only get half of this demo built, get Acts 2 and 5.

---

## Part 2 · Build depth, per screen

| Depth | Screens | What that means |
|---|---|---|
| **Full** — every state, real interaction | C3 · C4 · B2 · B4 · B5 · B7 · D2 · D5 · A2 | These carry the argument. Interactive, all listed states reachable |
| **Story-complete** — works in the flow, one or two states | A1 · A3 · B1 · B6 · C2 · D4 · D6 · C6 | Clickable along the spine; don't chase every edge |
| **Stub** — renders, plausible, not built out | B3 held credentials · C1 relations register · D1 issued register · C7 entity profile | Registers demo poorly and cost real time. A populated table with correct columns is enough |
| **Skip** | D3 multi-sig tracker · notifications · ecosystem surfaces | Fold dual control into B7 as a variant instead. Propose the notifications model on paper, don't build it |

That's roughly 21 screens of real work down to **9 built properly, 8 story-complete, 4 stubs** — and the demo is better for it.

---

## Part 3 · Two decisions to make on paper first

### 3.1 The scope grammar

§8.2 asks for "a canonical way to render *what this person can do*." That's a **language** problem before it's a UI problem, and in a comprehension demo it *is* the product.

One model, two renderings:

- **Read mode** — a sentence someone can check in five seconds:

  > Dorji Wangchuk may **present proofs** using **Business Registration** credentials to **BNSW** and **Bank of Bhutan**, until **31 Dec 2026**.
  > Every presentation needs **one approver**.

- **Edit mode** — one row per operation, each carrying its own filters and approval policy, since the five dimensions (operation · credential type · relying party · validity · approval policy) don't edit as prose.

Read mode appears in C4, B2, the C3 preview panel and audit rows. Edit mode only in C3.

Write six of these by hand before designing. If a sentence reads awkwardly, the model is wrong, and you've learned that for free.

Lands as `src/features/controllership/scopeModel.ts` (types + a **pure** plain-language formatter) and `ScopeSummary.tsx` (the two modes). Keep the formatter separate from the component — it's the thing you'll iterate twenty times.

### 3.2 Authored latency

With no backend, every wait is a design choice you author. Two temptations to resist:

- **Making everything instant.** This destroys the demo. The Entity Wallet's whole trust argument lives in waiting, denial and failure — the register check, the parked approval, the AVS decision. If it all resolves in 0ms, you've demoed a CRUD app.
- **Making it realistic.** Nobody sits through 10 seconds in a room with stakeholders.

Land on ~1.5–2s for round-trips, with a visible skip. Then pick **one** screen — A2's register confirmation — and give it the honest long-wait treatment so the pattern gets seen at least once. Put the timings in one constants file so you can retune the whole demo in a single edit.

---

## Part 4 · Demo mechanics (build these before any screen)

These are what make it demoable **by someone who isn't you** — which is the difference between a prototype and a demo.

1. **Persona switcher** — Rinzin / Dorji / Pema. Drives which nav items are **absent**, not merely disabled. Hangs off `demoStore`.
2. **Story runner** — a thin overlay: *"Act 3 of 6 · Dorji accepts a credential offer"* with next/back, setting persona + route + fixture state in one click. This is the highest-value thing in the whole build. Without it, every demo needs you narrating and clicking.
3. **State switcher** — separate from the story runner, for *your* review: flip any screen through its listed states plus the §9 globals (loading, empty, permission-limited, denied, suspended, expired, service unreachable). **You cannot review a state you can't see.** The repo already has a `Toolbar` to hang it off.
4. **Reset demo** — one button back to act 1. You will run this demo more than once.
5. **Prototype marker** — quiet, persistent, honest (Part 0).

---

## Part 5 · Primitives to build first

The kit is good but was built for issuer/verifier screens. Present: `Panel` · `DataTable` · `DetailList` · `EmptyState` · `StatusPill` · `Stepper` · `Tabs` · `Toolbar` · `SearchField` · `Select` · `OptionCards` · `PageHeader` · `Breadcrumb` · `StatCard` · `QrPlaceholder` · `WaveBanner` · three buttons · `formStyles`.

Missing, and needed by the spine:

| Primitive | Needed by |
|---|---|
| `Dialog` / confirm modal | D4 revoke, relation termination — no dialog of any kind exists today |
| `Checkbox`, `Switch`, segmented control | C3 operation checklist and per-operation policy; D2 per-transaction toggle |
| `Countdown` | B6/B7 parked-op TTL, A2 proof-request expiry |
| `DateRangeField` | C3 validity, D2 expiry — no date input exists |
| `ScopeSummary` | C3, C4, B2, C6 — §3.1, the most important component in the product |
| `DualAttribution` | audit rows, approval records — "Norling Logistics Pvt. Ltd. · acted by Dorji Wangchuk" (§8.3) |
| `AuthorityChain` | D5 — visualising the chain and *which link failed*. New, and worth the effort for Act 5 |

Plus one extension: **`StatusPill`** has a fixed `STATUS_TONE` map. Add `draft` · `pending_acceptance` · `pending_registration` · `active` · `suspended` · `terminated` · `parked` · `awaiting_signature` · `approved` · `rejected` · `denied` · `out_of_scope`. It already handles the §9 accessibility rule correctly — the label carries the meaning, the dot only reinforces — so extend the map rather than letting anything bypass it.

`Toast` and `Tooltip` you can skip; the README's preference for inline `role="status"` is the better call for a demo anyway.

---

## Part 6 · Slices

**Slice 0 · Orientation** *(~1 hour, mostly writing)*
Rewrite the stale `README.md` — it still describes only the four auth steps, with no mention of the Studio reskin or the demo data layer, and Claude Code reads it to orient itself. Add `CLAUDE.md` with the Part 7 rules. Cut a stable base branch off `claude/upbeat-franklin-u7ybcs` (it's the only branch; there's no `main`). Extend the `PRIMARY` nav array in `src/components/layout/Sidebar.tsx` — it's hard-coded there, not in `constants/data.ts` — with disclosure groups for **Wallet** (Held credentials · Offers · Verification requests), **Approvals**, **Controllership** (Relations · Audit), **Delegated authority**, **Appeals**.

**Slice 1 · Demo harness + fixtures** — Part 4 mechanics, and all six acts' data in `demoData.ts`, including the revoked-parent-Role failure case. Fixtures first: the story has to exist as data before it exists as screens.

**Slice 2 · Primitives** — Part 5. Exit test: a `/kitchen-sink` page renders every primitive in both themes.

**Slice 3 · Act 2, the conceptual core** — C3 · C4 · B2. *Exit test: show C4 to someone unfamiliar with the product; they can tell you what Dorji can and cannot do without your help. If not, fix the grammar, not the layout.*

**Slice 4 · Act 5, the money shot** — D2 · D4 · D5 with the PASS/FAIL pair and `AuthorityChain`. Out of story order deliberately: it's the highest-value screen and you want it built while you still have runway.

**Slice 5 · Act 3, the daily loop** — B1 · B4 · B5 · B6 · B7 · C6.

**Slice 6 · Acts 1 and 6, plus the stubs** — A1–A3 with the shared wallet hand-off component (one component, reused; `QrPlaceholder` is fine, just don't let it read as functional), D6, and the four registers.

**Slice 7 · Demo polish** — run the whole story end to end, three times, out loud. Fix what breaks the thread. Retune the latency constants. Write the "real vs simulated" page.

---

## Part 7 · Standing rules for `CLAUDE.md`

1. **No new dependencies.** The repo runs on `next`, `react`, `react-dom` and nothing else. Do not install shadcn/ui, Radix, TanStack Table, react-hook-form, zod, Redux, a date picker or a QR library. Build the primitive in `src/components/ui/` in the existing style.
2. **Ignore brief §13 and §14.** §13 describes a different repo (shadcn/Radix-based); §14 is backend alignment and out of scope. Following §13 would install a second design system into this app.
3. **Tokens only.** No hard-coded colour in any component — restyle by editing `globals.css`. Utilities come from the `@theme` blocks (`bg-raised`, `text-muted`, `border-grid`, `font-display`). Tailwind v4 is CSS-first; there is deliberately no `tailwind.config`.
4. **Both themes, checked as you go.**
5. **Status is never colour-only.** Route every status through `StatusPill`, extending its map rather than bypassing it. WCAG, full keyboard paths.
6. **No fetching, ever.** All data from `demoData.ts` through `demoStore`. No API calls, no auth, no network.
7. **File conventions.** Route stubs in `src/app/<path>/page.tsx`; real UI in `src/features/<area>/<Name>View.tsx`; shared primitives in `src/components/ui/`; fixtures in `src/lib/demoData.ts`.
8. **Every state reachable via the state switcher.** A state that can't be reached does not count as built.
9. **Render server decisions, don't invent them.** Allow / deny / park are things that came back from the server — in the demo, fixture values. Never client-side gating logic, even though it would be easy here.
10. **No statute numbers in primary copy.** Legal moments should read as natural, trustworthy steps.
11. **Sentence case everywhere** — titles, buttons, labels.
12. **Stop at the slice boundary.** Don't scaffold ahead.

---

## Part 8 · Still worth escalating

Shorter list than before, since backend questions no longer block you:

- **Rejection/decline reason taxonomy** for B4/B7 — real labels from real org use cases, not chips you invented. Same open question you already have on the mobile signature flow; resolve both together.
- **Relationship-authority source per entity type** (§11) — which register confirms a representative for a company vs a licensed business. Affects A1/A2 copy; parameterise it rather than hard-coding CRA.
- **Appeal windows** are provisional (10 working days / 5-day decision). Keep them in copy, not baked into a graphic.
- **What the demo is for, and who watches it.** Governance sign-off, engineering scoping, and a ministerial walkthrough want different depths of the same story. Worth asking before Slice 3 — it's the one input that would change the build order.
