# Running the demo

How to drive the Entity Wallet demo in front of people. Written for whoever is
presenting, not for whoever is building.

---

## The easiest way: the guided demo

Press **Guided demo** — the green button at the bottom-left of every screen.
It resets the demo and walks the whole story, one step at a time, in a panel
on the right: what is happening on this screen, exactly what to press, and
sometimes a line worth saying. You do the clicking; the guide keeps up, and
switches you to the right person when the story changes hands. **Next** and
**Back** move between steps (and take you to the right screen), **Take me
there** brings you back if you wander off, and the chevron minimises it.

**The prototype's focus is onboarding**, and the guide walks that and then
approval to verify or issue, designating an authority, receiving a credential,
sharing one, giving a clearing agent authority to act and her using it at the
Single Window — fourteen chapters, 98 steps, starting on the platform's day
zero:

1. **Root admin onboarding** — the NDI root account signs in. It is NDI's
   own account, held by two custodians together, not a person's, and made
   when the platform was deployed — so there is no sign-up and nothing to
   onboard (FLOW-ONB-02 v0.6, P6, S10).
2. **Platform admin onboarding** — root invites Kinzang Dorji
   (`kinzang.dorji@bhutanndi.bt`) and then Tshendu (`tshendu@bhutanndi.bt`),
   each with the custodians present (required) and a reason (optional), which
   are logged. Each opens the invitation — from the "Bhutan NDI root
   administrator" — sets up the account there, and lands on a confirmation
   that they're now a platform admin. Two, because the root account approves
   nothing: every second approval is a second named admin (S2). Once two are
   active, root's invite form is replaced by the reason it can't add more
   (S9, P8). Until an admin exists no authority is connected, so no
   organisation can be verified yet — and the screen says that, naming the
   authorities.
3. **A new company signs up** — Dorji creates a personal account first. Just
   the person; the company comes next.
4. **Verify the organisation** — Dorji picks the type, types Pelden's
   registration number, and answers the Corporate Regulatory Authority's
   identity request from their own NDI wallet. The CRA checks its own records
   and confirms; Pelden's wallet is set up and its registration added
   automatically. It ends on Pelden's first day: nothing but its
   registration and Dorji's authority — **no other members, no history** —
   and the dashboard's first suggestion is its tax identity (TPN).
5. **Pelden brings on its people** — Dorji invites Ugyen Phuntsho
   (`ugyen.phuntsho@peldentrading.bt`) as a member. The invitation says,
   before it is sent, what it gives (seeing Pelden) and what it does not
   (acting for it). Ugyen opens it, sets up an account from the link — the
   same way the platform admins did — and lands in Pelden's console as a
   member with no authority. Back as Dorji, the Members page lists Ugyen:
   identity not yet confirmed, authority none.
6. **Appoint someone** (FLOW-DEL-01) — Dorji chooses Ugyen and
   ticks what they can do (**Receive credentials**) from four boxes that
   combine, sees what Ugyen won't be able to do worked out from the rest,
   and confirms they're authorised to make the
   appointment; citing a document is optional and folded away. Ugyen reviews
   who appointed them and what they can and can't do, then **one approval in
   their NDI wallet** both confirms who they are and accepts. (The page was
   *Give someone authority to act*; UX-EW-01 v0.23 renamed it so it isn't
   confused with Flow 8.)
7. **Recognise Bank of Bhutan** (FLOW-ACC-01, recognition) — Kinzang opens
   **Accreditations**, where the bank is listed as seen verifying without an
   approval, asking for five things from the citizen credential. Kinzang
   proposes approving it, removing the date of birth and the address that
   opening an account doesn't need. Kinzang can't approve their own
   proposal; Tshendu, the other named admin, does — never the root account. Yeshey, the bank's owner, sees it on the dashboard,
   reads what accepting means — including that the bank goes on **NDI's
   public list of trusted organisations** with Yeshey's name recorded — and
   accepts with one wallet approval. The listing publishes and the bank is
   approved to verify, for three items where it used to ask for five.
8. **Pelden asks to verify customers** (FLOW-ACC-02) — Dorji, as Pelden's
   representative, asks to check customers are **over 18** — a check only,
   so Pelden never sees anyone's date of birth. Kinzang reviews and
   recommends approval without being able to edit it; Tshendu approves it as
   asked, and Pelden is listed.
9. **Designate the ministry** (FLOW-ORG-02 Kind E, FLOW-ORG-03) — nobody
    confirms sole proprietorships yet. Kinzang proposes the Ministry of
    Industry, Commerce & Employment, already on the platform; Tshendu
    approves. Kesang Wangmo, the ministry's director, reads what it is taking
    on — including that NDI hosts its keys — and accepts. One activation
    check fails (an entitlement NDI grants); Kinzang grants it and the checks run again.
    Kesang reads what people will be asked, sends back the date of birth the
    register doesn't need, and adopts for sole proprietorships. Then **Stop
    something** shows three different stops, none pre-selected.
10. **Pelden gets its TPN** (FLOW-CRD-01, FLOW-CRD-03) — Dorji opens **Get a
    credential**, asks the Department of Revenue & Customs for the taxpayer
    number, and reads exactly what is shared: all of Pelden's registration,
    every item listed. Deki Yangzom, the tax office's officer, opens the
    request and decides on what Pelden proved, with NDI's name for Pelden
    kept apart as unverified. Deki issues; Dorji checks the details and
    accepts, and the Activity tab shows an offer the wallet refused on its
    own.
11. **Pelden shares with its bank** (FLOW-PRS-01, FLOW-PRS-02) — on Bank of
    Bhutan's website (dashed), Dorji presses **Share from NDI Entity Wallet**,
    checks the bank's reference on the wallet's page, signs in, and reads
    every detail of the registration under *Bank of Bhutan will receive all
    of the details below — not only the ones it asked for.* He shares and is
    counted back to the bank, which acts on what it fetched. Then the bank
    asks again with nobody at a website: Ugyen, who can receive but not
    share, passes it to Dorji, who shares. History shows who shared; Refused
    shows a sender NDI doesn't list, which nobody was told about.
12. **Authority for the clearing agent** (FLOW-AUT-01) — Dorji gives Pema
    Choden, Druk Sharpa Freight's clearing agent, authority to submit and
    amend customs declarations at the Bhutan National Single Window, under
    Pelden's business licence (issued from a dashed step), up to Nu 1,000,000
    per declaration, for 90 days. Pema is never invited: she needs no
    account. The check screen says what she'll carry and what she won't —
    not the licence, not the TPN. Pelden's first authority adds it to NDI's
    list (dashed), then Dorji sends the link himself; Pema opens it, proves
    who she is with Bhutan NDI (dashed), sees the full authority and accepts
    it in the app (dashed). She is listed under *Active*.
13. **Pema declares for Pelden** (FLOW-AUT-02, Journey W) — on the Single
    Window's site (dashed), Pema signs in as herself, chooses **Act for a
    company** and shares her citizen ID and authority from her app (dashed),
    once. NDI's checks pass, but BNSW has no registration from Pelden: E8,
    saying who can fix it. Dorji registers Pelden from BNSW's site — the
    bank's flow again, sharing the registration, TPN and licence. Pema tries
    again and is *acting for* Pelden: the sentence with licence, limit and
    end time, the TPN and name shown from the registration. One declaration
    is accepted, one above the limit is refused with the draft kept, and
    after Pelden withdraws the authority (dashed — flow 11) the next is
    refused and the session ends.
14. **Where to go next.**

Appointing follows the rule **invite first, appoint second**, and identity
is confirmed **at the appointment, not at the invitation** (FLOW-ONB-02
§7.3); it follows FLOW-DEL-01. Giving a clearing agent authority is Flow 8 —
FLOW-AUT-01, EW-FLOW8-SD and UX-EW-05 SCR-AUT-01 to 06 — where the agent is
never invited and is identified when she collects it. Using it at the Single
Window is Flow 9 — FLOW-AUT-02, EW-FLOW9-SD, EW-FLOW9-CIG and UX-EW-06
SCR-AUT-07, on BNSW's simulated site. Flow 4 follows FLOW-ACC-01
v0.2, FLOW-ACC-02 v0.3 and UX-EW-02 v0.3 SCR-ACC-01 to 06 — the first-release
simplification of EW-FLOW4-SD v0.2 (D20–D24). Flow 6 follows FLOW-CRD-01 to 03
and UX-EW-03 SCR-CRD-01 to 10. Flow 7 follows FLOW-PRS-01, FLOW-PRS-02 and
EW-FLOW7-SD v0.2, with UX-EW-04 v0.2 SCR-PRS-01 to 06; the approval path —
a Controller shares, the Root approves — is a Walk a flow entry, because the
onboarding story never appoints anyone with *Share*. The screens for what
comes after — appeals, and Bank of Bhutan being verified — still exist and
are described further down, but the guide and the demo controls no longer
walk them.

### The first day is really empty

Registering Pelden lands on a first day, not on the story's three-months-in
seed. Only Dorji is a member; nobody else from Pelden's side of the story has
an account yet, so the persona switcher and the sign-in panel do not offer
them, the Members page lists Dorji alone, and **Appoint someone**
says there is nobody to choose yet and offers to invite someone.
Everyone else arrives the way the member chapter shows: an invitation Dorji
sends and they accept. The activity feed is Pelden's own — it shows who joined
and when, and nothing from NDI's side of the platform.

---

## Before you start

```bash
npm install      # first time only
npm run dev      # http://localhost:3000
```

Two things to do in the room before you say anything:

1. **Open the demo controls** — bottom-left of the window, the small
   `Prototype · data simulated` chip with a **Demo controls** button beside it.
   That panel is your remote: the guided demo, the onboarding flows (root
   admin, platform admin, new company, member, appointing someone, and
   Flows 4 to 8), who you are signed in as, and reset. Each flow starts from
   the state it needs — day zero, the platform with its two admins, Pelden's
   first day, or the first day with Ugyen joined — never from whatever the
   last person left. Each screen's states are folded under **For reviewers**.
2. **Press Reset demo** if anyone has touched it before you. The demo persists
   to browser storage, so it remembers whatever the last person did. Reset —
   like a browser that has never run the demo — opens the platform's **day
   zero**: root's account and NDI's organisation, the organisations already on
   NDI, and nothing else. No business, no colleagues, no history.

**Leave the prototype chip visible, and know that it is a link.** It goes to
**/whats-real**, a page listing exactly which parts are simulated and what
would have to be built for each. That chip is the one thing standing between
this demo and somebody concluding the register integration exists. Read the
page once before you present, and send people the link afterwards rather than
paraphrasing it — the question usually arrives by email, from somebody who was
not in the room.

---

## The one-sentence framing

Open with this, before any screen:

> Bhutan NDI already lets an organisation **issue** and **verify** credentials.
> This adds the third thing: an organisation can **hold** them — and can let
> named people act for it, within limits it sets and can withdraw.

If you only get one idea across, that is the one.

---

## What is built right now

**All six acts are built**, though only onboarding is in the prototype's
current focus. The acts beyond it need the story three months on —
controllers appointed, approvals parked, an authority to revoke — which is no
longer what the demo opens on. To show them: Demo controls → **For
reviewers** → **Beyond onboarding: open the story three months on**. That
puts you on Pelden's lived-in dashboard as Dorji; the act walkthroughs below
start from there (the act buttons they mention were the old story runner,
since removed — go to the route each one names).

| Act | What the audience learns | Roughly |
|---|---|---|
| 1 · The entity becomes real | The platform never asserts the entity's identity — a register does | 5 min |
| 2 · Authority is granted, narrowly | Authority is a scoped, accepted relation, not a role dropdown | 6 min |
| 3 · The Controller works, under approval | Least disclosure, an approval gate, dual attribution | 6 min |
| 4 · Authority given to act, in a wallet | Now Flow 8 — see its section | 5 min |
| 5 · Authority is checked at the point of use | PASS, then FAIL with the failing link named | 4 min |
| 6 · There is recourse | Revocation carries a reason and an appeal | 3 min |

**The full run is about 25 minutes.** If you have ten, show acts 2 and 5. If
you have five, show act 5 alone.

---

## The Act 1 walkthrough

**Walk a flow → Register the company**, as Dorji. Five minutes, and it is the
act that establishes the product is not self-certifying.

### 1 · What kind of organisation — `/onboarding`

Each type — registered company, sole proprietorship, partnership — names
*the authority that registered it*, which is who checks it.

> "The authority decides, not NDI. You can read that off this list before
> you've typed anything."

Leave **Registered company** selected and press **Continue**.

### 2 · Its registration number — `/onboarding/details`

One field. The format is stated before it, and a wrong shape is corrected
inline before anything is sent. The button names the authority — **Verify
with Corporate Regulatory Authority** — because it is the last thing read
before a request arrives on Dorji's phone, and the two must agree.

Type `CRA-2019-04477` or press it in the dashed prototype panel, which lists
numbers for the other outcomes too:

| Number | What it shows |
|---|---|
| `CRA-2019-04477` | Pelden Trading — the CRA's records show Dorji: verified |
| `CRA-2015-03310` | Norbu Construction — the records don't show Dorji: not verified |
| `CRA-2008-00731` | Gangri Exports — deregistered: worded exactly as the one above |
| `CRA-2023-11802` | Druk Valley Hardware — already verified here: refused, without saying why |
| `CRA-1997-00112` | Bank of Bhutan — confirms Yeshey, its owner (Kind E, below) |

### 3 · The authority asks who Dorji is — `/onboarding/prove`

The scan card is the NDI integration page people already know. The request
is **the Corporate Regulatory Authority's**, named the way Dorji's wallet will
show it. Point at what is shared — name and citizenship ID number — and what
is not: nothing about the organisation. NDI keeps nothing from the proof.
Press **Simulate the scan** in the dashed panel.

Every way it can end is walkable or in the state switcher: **I don't have the
NDI wallet**, **Show what happens if you decline in the wallet**, and **Show
what happens if someone else's wallet answers** — that last one is where
proxy sign-up is caught, before the authority is asked anything.

### 4 · The authority decides — `/onboarding/verifying`

Two named steps: *the Corporate Regulatory Authority is checking its
records*, then *setting up your organisation's wallet* (stated in minutes; the
prototype compresses them).

> "This is the moment the platform admits it can't decide who a company is.
> We ask the authority; it checks its own records, which NDI never sees; and
> the answer is its decision."

The page can be closed — **Close this page** goes to Dorji's account, which
shows the application in progress with **Check progress** and **Cancel**.
Coming back picks up where it is, never from the beginning. **Show what
happens if the Corporate Regulatory Authority can't be reached** gives E8,
which says nothing is wrong with the application; **Show what happens if
setting up stalls** gives E9, which leads with the approval.

With `CRA-2015-03310` instead, it ends on **Not verified**: the authority's
records don't show Dorji, the decision is theirs, and the primary action is
how to correct it *with the authority*. NDI offers no override and no review.

### 5 · Dorji accepts responsibility — `/onboarding/responsibility`

Verified isn't usable yet (FLOW-DEL-02, SCR-DEL-01). The screen says what
acting for Pelden means: what Dorji can and can't do, Dorji's
responsibilities as things to do, that every action is recorded against
Dorji's name, and that NDI holds Pelden's keys. No scan — Dorji proved who
they are to the CRA a minute ago. Coming back later asks for the wallet
first (state **returning**). **Decline** leaves Pelden verified but unusable,
and says how to reopen it. Press **Accept responsibility**.

### 6 · Pelden is verified — `/onboarding/foundational`

The registration itself needed no accepting: it was added to Pelden's wallet
automatically. The next step offered is **Get its tax identity (TPN)** — the
next credential in the chain (the prototype says that flow isn't built yet),
with **View the credential** beside it. The summary says what Pelden can do
*and what it can't*: hold and present credentials, not issue or verify them.

**Go to Pelden Trading** lands on Pelden's first day:
*Welcome, Dorji*, a **Start here** panel led by the TPN, nothing waiting, no
activity. Inviting colleagues is offered third; appointing someone to act is
available but not prompted.

> "Nothing has happened here yet, and the console doesn't pretend otherwise."

Pressing **Next** to act 2 moves the story on to Pelden three months in —
Rinzin appointed, credentials held, Pema holding authority to act. Say so out
loud: *"Let's skip ahead a few months."* Your account and anything you did in
the onboarding flows are kept.

---

## The Gate 2 walkthroughs — Flows 1 and 2

For the Gate 2 review. Demo controls → **Walk a flow** offers the
onboardings in focus — **Root signs in**, **Root invites a platform admin**,
**Create an account**, **Register the company**, **Invite a member**,
**Appoint someone** — each on its first
screen as the right person, from a known starting state: the root and admin
flows on day zero, the company flows on the platform with its two admins
(Kinzang and Tshendu) and no business, the member flow on Pelden's first day, and
appointing on the first day with Ugyen already joined and holding no
authority. The other walkthroughs below are still built but not in the controls:
switch person with **Driving as** and go to the route named in the heading.

### FLOW-ONB-02 · Root invites a platform admin — `/sign-in`

Starts on the platform's day zero. Sign in as **Root** (the dashed
panel fills the address; any password), type an address on **Platform
admins** and **Send invitation**, then open it as the invitee: they set up
their account on the invitation itself — name, password and confirmation — and land as a
platform admin.

### FLOW-ONB-01 · Create an account — `/sign-up`

1. Enter an email address. Point at the warning that the
   account must belong to the person who will prove their identity later —
   sign-up cannot tell a director from their accountant, and the identity step of Flow 2
   is where that is enforced.
2. **Check your email.** No email is sent. The dashed **Prototype** panel says
   so, and **Open the link from the email** stands in for the inbox. Resend
   is limited to five sends an hour, with a cooldown between them.
3. **Your name and a password**, against a policy shown up front rather than
   after a failure, typed twice — whether the two match is shown as you type.
4. **Welcome** lists the account's organisations — none yet — and **Add an
   organisation** leads into Flow 2. Run Flow 2 from here and the account
   comes back to this list with Pelden Trading on it, as Owner.

### FLOW-ONB-02 · An owner invites a member — as Dorji, `/members`

**Walk a flow → Invite a member** starts on Pelden's first day, with Dorji
its only member.

1. **Members** lists Dorji alone. Press **Invite someone**.
2. Enter an address — `ugyen.phuntsho@peldentrading.bt` — and a role. Beside
   the form, *What this invitation does* says, before anything is sent, what
   it gives and — just as plainly — that it does not let them act for Pelden.
   **Send invitation**: the form is replaced by the confirmation (14 days, it
   gives nothing until accepted) with **Open the invitation as …** in a
   dashed panel standing in for the invitee's inbox.
3. The invitation names Dorji and Pelden, what it lets the invitee do and
   what it does not, and when it expires. With no account at that address,
   the invitee **sets one up right there** — name, password, the password
   again — and **Set up account and accept** does both. This follows the
   platform admin's invitation, not FLOW-ONB-02 A1's detour through sign-up:
   the link already proves the address, so the four sign-up screens re-proved
   it. The spec's version is kept as the **no_account** state for comparison.
4. **You've joined Pelden Trading** names the organisation — a person can
   belong to several — and **Go to Pelden Trading Pvt. Ltd.** opens its console as the
   new member: a dashboard and a wallet, no Members, no Who can act, and
   *What you may do* says they can see its information and nothing on its
   behalf yet.
5. Back as Dorji, **Members** lists them — identity *not yet confirmed*
   (joining never asks the register), authority *none — membership only* —
   and the dashboard's activity shows who joined. **Appoint someone**
   now offers them; confirming who they are happens when they accept.

Invite a second colleague at an address the story does not know and they get
a record of their own — the persona switcher and the sign-in panel list them
after they accept. Inviting an address that is already a member, or already
has an invitation waiting, is refused with the reason (E3).

State switcher on the invitation shows **setup**, **no_account** (the spec's
sign-up detour), **expired**, **revoked**, **void** (the inviter lost their
authority since sending — worded as a lapse, never a rejection),
**already_accepted**, **declined** and **wrong_person**.

### FLOW-ORG-02 · Designating an authority — `/admin/designations`, as Kinzang

Starts on the platform with its two admins and no business. **Designations**
lists who confirms what: the Corporate Regulatory Authority for companies,
designated before the Entity Wallet opened. **Propose a designation**
(SCR-DSG-01): the ministry, sole proprietorships and partnerships, a legal
basis — the summary says what it will be able to do and nothing else, that
the scope can't be edited once switched on, and that a different
administrator has to approve it. **Propose**.

Kinzang opening it sees **Approve** disabled with the reason (E7) and can
only withdraw it. As **Tshendu**, **Approve** (SCR-DSG-02) — the consequence
is stated in the dialog. The root account can't: Designations isn't in its
menu, and the store refuses it.

As **Kesang**, the dashboard says NDI has proposed it, with the days left.
**Review it** opens SCR-DSG-03: what the ministry would confirm, the legal
basis, who proposed and approved, and NDI's access in the spec's words —
including that NDI hosts the ministry's keys. **Accept**. Activation runs at
once (SCR-DSG-04): one check fails — schema creation is missing — and says
NDI grants it. As Kinzang, **Designations → Accepted — checks not passing
yet**, **Grant them**: the checks run again, and it's designated, with nothing live yet.

As Kesang, **Authority** (SCR-DSG-05 and SCR-ADO-03, one page): the
designation, NDI's access with **Remove NDI's access**, members including
NDI's service account, and nothing live. **Review and adopt** beside sole
proprietorships (SCR-ADO-01): the date of birth is flagged as not needed —
**Raise an objection** sends it back and takes it out. **Continue to adopt**
(SCR-ADO-02): three things as one act. Sole proprietorships are now live —
and in Flow 2's first screen, sole proprietorship is no longer disabled.
**Stop something** (SCR-ADO-04): pause NDI's access, stop an entity type, or
change what people are asked — none pre-selected, and none un-verifies
anyone.

### Also built · Inviting an agency — as Kinzang, `/admin/invitations/new`

Not in **Walk a flow**: this is Kind N, a new authority invited to register,
which the prototype doesn't walk past the invitation — Flow 5 walks Kind E, an
organisation already on the platform, below. It is still reachable from NDI
administration → Invitations, and needs two NDI administrators.

1. As Kinzang, propose the agency. It waits in **Approvals**.
2. Still as Kinzang, open **Approvals**: **Approve** is disabled with the
   reason in its place — *you issued this, so a different administrator must
   approve it*. Not enabled and then refused.
3. Switch to **Tshendu** and approve. The invitation is sent. The root
   account can't: Approvals isn't in its menu, and opened by address it says
   the root account approves nothing (E13). With only one administrator
   active, proposing it is refused up front (E12).

### Also built · An administrator invites another — as Kinzang, `/admin/team`

After bootstrap, new administrators come from the administrators (Kind A).
Kinzang's invitation waits in **Approvals** for Tshendu, like a designation,
and lasts 14 days once sent. As root, the same page shows only the
invitations root sent, and may resend or revoke them; each is logged as a
root-account use, with a reason if one is given. Root can keep inviting until
two admins are active; an invitation it sent that's accepted after that is
void (E6).

### Flow 2 · Two ways onto the platform

Which one applies is a deployment setting — self-service sign-up on or off
(FLOW-ONB-01 P3). The controls keep it on — the focus is self-service; the
invited route below is kept for reference. Both routes end in the same check: the
register confirms the person represents the organisation.

**Sign up and add it yourself** (self-service on) is act 1 above: the person
types the registration number and the authority confirms them, or doesn't.

**NDI invites a business** (self-service off), as Kinzang:

1. On the invitation form choose **To register as an ordinary business**. The
   form fills with Pelden's details. No second administrator is needed —
   the second approval follows what is being granted, and an ordinary
   business is not a root of trust. **Send invitation**.
2. **Invitations → Open as the invitee** (dashed — stands in for the email).
   The invitation says plainly that it doesn't confirm Pelden by itself.
3. **Create an account** — allowed even with self-service off, because the
   invitation opened that door. Finish sign-up and you are brought back;
   **Accept**.
4. **Register the organisation** → its registration number → the authority's
   identity request → the authority decides, exactly as on the self-service
   route. The invitation names Pelden but isn't the confirmation; if the
   authority's name differs from the invitation's, the verified screen says
   so rather than swapping it silently.

If the authority does not confirm them, it ends on **Not verified**, exactly
as the self-service route does.

With self-service off, the public **Create an account** page shows its
switched-off state — try it to show the open door is shut.

### Flow 2 · An organisation already on the platform — Kind E

Bank of Bhutan issues and verifies on NDI but has never been verified as a
holder. Start from day zero (**Walk a flow → Root signs in** resets to it,
then drive as **Yeshey Choden** with **Driving as**) — but an authority is
only connected once a platform admin exists, so walk the platform-admin flow
first, or the first screen says nothing can be verified yet.

1. As Yeshey, Bank of Bhutan's dashboard says it hasn't been verified yet.
   **Verify Bank of Bhutan** (or **Verify organisation** in the sidebar).
2. The same screens as a new company: the type, `CRA-1997-00112`, the CRA's
   identity request, the wait. Nobody at NDI approves anything — there is no
   request to NDI.
3. **Bank of Bhutan Ltd.** is verified — and because the CRA's name differs
   from the one on the platform, the verified screen says so. Its issuing and
   verifying carry on throughout, and the screen says that instead of the
   negative clause.

### Flow 2 · Before any authority is connected

From day zero, before the platform-admin flow, open `/onboarding`. The first
screen says organisations can't be verified yet because no authority is
connected. **Tell us you're waiting** asks for nothing about the
organisation, and once pressed says nothing is pending — no application, no
queue.

---

## The Act 6 walkthrough

Three minutes, and it is the act that makes everything else defensible. Best
shown **straight after act 5**, while the revocation is fresh.

Switch to **Pema** and open **Appeals**.

> "Her authority has been withdrawn. Here is the notice, with the reason Dorji
> actually typed, and a reference. She did not have to go looking for it."

(Withdrawing authority and appeals are catalogue flow 11, which has no
specification yet; this screen predates it.)

Type an answer in the box and press **Submit the appeal**.

> "Ten working days to appeal, five for a decision. Those numbers are
> provisional until the governance framework settles them, which is why they
> are text on a screen rather than a graphic anyone has to redraw."

Switch to **Dorji** and open **Appeals** again.

> "Same object, different actions. He can uphold or reject. Pema was never
> shown an uphold button and Dorji was never shown a submission form."

Press **Uphold and reinstate**.

> "That puts the authority back exactly as it was. An appeal process that
> concluded in someone's favour and left the authority revoked would be a
> complaints box, not a remedy."

---

## The Act 2 walkthrough — appointing someone (Flow 3)

**Walk a flow → Appoint someone**, as Dorji, on Pelden's first day
with Ugyen joined. About five minutes. It follows FLOW-DEL-01 and
UX-EW-01 SCR-DEL-02 to 05.

### 1 · Choose what they can do — `/people-who-can-act/give`

Choose **Ugyen Phuntsho**. Then tick one or more of **four boxes** —
Receive credentials, Share credentials, Approve others' actions, Give
authority to act — each saying what it allows. They combine (EW-FLOW3-SD
§4.2, D18): an accountant who receives certificates and sends them on gets
*Receive* and *Share*, without becoming an approver. There is no
*Everything*, no list of permissions, and no custom option.

Under the boxes, the grant reads back as one sentence, with what Ugyen
**won't be able to do** worked out from the boxes left unticked, plus two
lines that are always there.

> "Dorji can say exactly what Ugyen can do, in one sentence. That's the
> test: if you can't restate what you granted, you didn't really grant it."

Worth showing:

- **Share** asks for a reach: only organisations Dorji names, or any that
  asks. The ones Dorji can name are the organisations NDI has approved to
  verify — on the story's first day, only Bank of Bhutan; the list grows as
  Flow 4 approves more. Named with none chosen, **Appoint** stays unavailable (E12).
  With approval on and nobody else able to approve, it says before you
  submit that Dorji will be asked each time (A1). *Give authority to act*
  works the same way with its own approval setting.
- Untick everything: **Appoint** is unavailable — choose at least one
  thing (E13).
- Tick **Approve** with **Share**: the screen says Ugyen can approve what
  others share, never what they share themselves (A2). The approvals queue
  enforces it too.
- Tick all four: the two fixed lines still say Ugyen can't appoint anyone
  else or take the credentials off the platform. All four is not a deputy.
- The **statement** is required: Dorji confirms they're authorised to make
  this appointment. **Cite the document behind this** is optional and folded
  away — the file stays on the device, and only a fingerprint would be kept.
- Someone who can already act is shown but can't be chosen (E3). Driven as
  Ugyen, the page says only Dorji can give authority (E1).

Leave **Receive credentials**, tick the statement, **Appoint**.

### 2 · Waiting — `/people-who-can-act`

Dorji first, as the representative; Ugyen *waiting to accept*, with the date
it lapses. **Open it as Ugyen Phuntsho** (dashed) stands in for Ugyen's
notification.

### 3 · Ugyen reviews — `/appointments/…`

Who is appointing them — Dorji, by name — that Dorji confirmed they may,
what Ugyen will and **won't** be able to do, and Ugyen's responsibilities as
things to do. It says before they press anything that accepting needs their
NDI wallet. **Decline** ends it, and Dorji's list then says *Ugyen declined*
with **Appoint again**.

### 4 · One approval is the acceptance — `/appointments/…/confirm`

The request comes from **Bhutan NDI Verification** (a stand-in name; the
real one is set when that organisation is created), and the screen names it
as the wallet would. Approving confirms it's Ugyen *and* records the
acceptance — nothing to press afterwards, whoever the appointee is. Declined
(E6), someone else's wallet (E7 — deliberately says nothing about why) and
no wallet (E11) are walkable.

> "Dorji couldn't accept on Ugyen's behalf. An acceptance someone else makes
> isn't worth recording."

It lands on **Pelden Trading Pvt. Ltd.** as Ugyen sees it: what Ugyen can
do, and what they can't, and nothing more.

---

## Flow 4 — approval to verify or issue

**Walk a flow → Recognise an organisation already verifying** (as Kinzang)
or **A business asks to verify** (as Dorji), both from Pelden's first day
with its team joined. About five minutes each. Organisation-facing screens
never say "accreditation" — they say *approved to verify* or *approved to
issue*; only the administrators' screens use the word.

### Recognition — `/admin/accreditations`, as Kinzang

Four lists: **Waiting for approval**, **Requests to review**, **Operating
without approval** (with the date after which it will be refused) and, once
there is anything, **All accreditations**. **Propose an accreditation** is
for an organisation already on the platform or one that isn't yet (it is
invited to register, then accepts).

**Propose to verify** beside Bank of Bhutan opens SCR-ACC-01 with what the
bank was seen asking for, each item marked *observed*. Untick **Date of
birth** and **Permanent address**; the summary on the right says what it
will be able to ask for, that anything else will be refused, what was
removed, and that it will be publicly listed. **Propose**.

> "The bank has been asking for more than it needs. Recognition is where
> that gets narrower, before anything is refused."

Open it from **Waiting for approval**: Kinzang sees it all, with "You
proposed this, so a different administrator has to approve it" in place of
Approve, and who can. Switch to **Tshendu** and **Approve** —
"Every citizen's NDI wallet will trust it for this."

### Acceptance — `/verify-or-issue/…`, as Yeshey

The dashboard says NDI has proposed approving the bank, when it was
approved, and the enforcement date. Nothing counts down: an approval waiting
to be accepted never expires. The owner and NDI are reminded after 10
working days, and an administrator can **Withdraw** it from its record with
a reason, which the officer then reads as *NDI has withdrawn this approval:
<reason>* — and a new proposal for the same organisation is no longer
refused. **Review it** opens SCR-ACC-03: what the bank can
ask for, that anything else is refused before it reaches anyone, the public
listing sentence — *Accepting adds Bank of Bhutan to NDI's public list of
trusted organisations. Anyone can see that it is on the list. Your name is
recorded as the person who accepted.* — the public identity it will be
listed under, and that NDI hosts the keys. **Accept with your NDI wallet**,
**Simulate the scan**, **See approval status**: publishing, then approved.

An organisation proposed through the ordinary door (not recognition)
without a did:ethr public identity is first asked to **Set it up**, before
the wallet step. The identity is created *not primary* and becomes the
organisation's primary DID only when the acceptance is recorded, so a
wallet step that doesn't confirm changes nothing. To see it for real, propose **Pelden Trading** to issue
(*Already on the platform*), approve it as Tshendu, and accept as Dorji.

### A business asks — `/organisation`, as Dorji

**Ask NDI** opens SCR-ACC-06. **Verify customers**, open **Citizen ID**, tick
**Is over 18** — *check only, you'll learn whether it's true, not the
value*. Say what it's for, **Send to NDI**. The page says NDI will approve
or decline it as written and won't change it. A business can choose
**Verify customers** and **Issue credentials** together: each is its own part
of the request, reviewed and decided on its own, so one can be approved and
the other declined. Issuing names the credential types, then one purpose and
one legal basis (with a reference) for all of them — not a basis per type.

As Kinzang, **Requests to review** → the request → **Recommend approval**
(or **Recommend decline** with a reason written to the business). As Tshendu,
**Waiting for approval** → **Approve**. A recommended decline has no
Approve at all, and nothing to send it back to: Tshendu reads *Kinzang
recommends declining: <reason>. Confirm the decline, or talk to Kinzang if
you disagree* and can only **Confirm the decline**; the business then reads
Kinzang's reason. If they do disagree, Kinzang — and only Kinzang — can
**Withdraw your recommendation** from the same page and review it again.
Nothing here expires: a request, and a recommendation waiting for its second
administrator, are reminded after 10 working days. Back as Dorji, **Verify or
issue** shows Pelden approved and listed; a declined request shows the
reason word for word and **Change and ask again**.

A wider scope is a **replacement**: propose (or ask) again naming the active
approval. The current one stays in force until the replacement is listed,
then shows under it as *Replaced* — nothing stops in between. There is no
suspension: if an organisation's primary identity stops matching its
listed one, its requests are refused and the approval shows *Stopped* with
**Restore**, but the approval itself still stands.

---

## Flow 6 — receiving a credential

Start from **Demo controls → Walk a flow → Pelden asks for its TPN**: Pelden
is verified, with Dorji as its representative.

### Asking — `/wallet/get`, as Dorji

**Get a credential** (SCR-CRD-01) lists what offices issue to a company, each
with what the office needs to see first. The bonded-warehouse authorisation
is badged *Needs Taxpayer Number (TPN) first*. On the TPN, **Ask for this**
(SCR-CRD-02): what Pelden shares, with every attribute of its registration —
the ones the office doesn't use marked as shared, not used — beside what it
may receive, and that nothing is added until someone accepts it. **Ask the
Department of Revenue & Customs**. The request page says who has it:
sending, then waiting for the office, usually within 5 days.

**Requests and offers** (SCR-CRD-03) lists it with the next date and
**Withdraw**. The dashed **Have it ask for a bank account too** stands in
for an issuer asking for more than was agreed: **Answer** opens SCR-CRD-06,
with what was agreed and what is asked now as two lists, and **Share this
too** or **Don't share — withdraw the request**.

### Answering — `/issuer/requests`, as Deki

**Requests to answer** (SCR-CRD-08), least time left first, led by the
registration number Pelden proved. **Open next** (SCR-CRD-09): the sentence
*Decide on what Pelden Trading has proved. The name and type shown below come
from NDI, not from Pelden Trading's credentials.* — then *Verified* and,
dashed and below it, *From NDI (not verified by you)*. Fill in the taxpayer number's
details — the fields start empty, showing the format — then **Issue**, or
**Decline** with a reason and a message Pelden reads word for word.
**What you offer** (SCR-CRD-07) pauses, retires or publishes a new version;
**Integration** (SCR-CRD-10) starts empty — *Not set up. Requests go to your
officers' queue.*

### Accepting — `/wallet/requests`, as Dorji

**Waiting for you → Review** (SCR-CRD-04): every detail, the office marked as
on NDI's list, and the prompt to decline and contact the office if anything
is wrong. **Accept** → **Go to your credentials** (SCR-CRD-05): the TPN
beside the registration. **Activity** lists the request and an offer
*claiming to be from Bhutan Revenue Authority*, refused because the sender
isn't on NDI's list — nobody was notified.

---

## Flow 7 — presenting a credential

Two ways in, from **Demo controls → Walk a flow → Presenting a credential**,
and chapter 11 of the guided demo walks both routes in one go.

The rules to point at: the **whole credential is shared** — every attribute,
the asked-for ones marked, never a choice of attributes (EW-FLOW7-SD D4,
UXD-42); a sender NDI doesn't list never becomes a request anyone can answer,
and nobody is told about it (D3); and whether someone may share, and whether
someone else must approve, comes from the *Share* box ticked when they were
appointed — its reach and its approval — never from who they are.

### From the bank's website — **Share from Bank of Bhutan's website**, as Dorji

Starts on Bank of Bhutan's account form at `/simulated/bank` — dashed,
because it's another organisation's website. **Share from NDI Entity Wallet**
creates a session and sends you to `/present?session=…` (SCR-PRS-01): the
wallet's address, *Bank of Bhutan is asking for your organisation's details*,
*You're on the NDI Entity Wallet. Nothing is shared until you choose.*, and
the bank's application number with *Only continue if you started this on Bank
of Bhutan's website just now and see this reference there.* **Continue**,
then the dashed **Sign in as Dorji Wangchuk**; with one organisation there's
no choice to make, so *Getting Bank of Bhutan's request…* and on.

**Share with Bank of Bhutan?** (SCR-PRS-02): the bank's reason in quotes,
labelled as theirs; the reference again; then *Bank of Bhutan will receive all
of the details below — not only the ones it asked for.* above every attribute
of the registration, each marked *Asked for* or *Also shared*; and *None of
your other credentials is shared.* Dorji is the representative (AUTO), so
**Share with Bank of Bhutan** sends at once. SCR-PRS-03 says *Shared with Bank
of Bhutan. Taking you back in 5 seconds.* — the only outcome that counts
down — and returns to the bank's registered address, where the bank shows
what its own system fetched, not what the address said.

**Keep for later** instead returns with *Bank of Bhutan doesn't have this
yet. It's saved under Sharing until …*, no countdown. Driving as Pema (no
appointment) gives E4; removing the bank's address on **Verification →
Return addresses** as Yeshey gives E15 (*Done. Go back to Bank of Bhutan's
website to continue.*, no link).

### A controller shares, the owner approves — as Rinzin, then Dorji

Starts three months on, at **Sharing** (SCR-PRS-05) as Rinzin, who may share
the registration with Bank of Bhutan and the Single Window, with an approver.
*Waiting* holds three requests:

- **Bank of Bhutan** — *Waiting for Dorji Wangchuk to approve*: Rinzin chose
  it yesterday. Opening it as Rinzin says *Sent to Dorji Wangchuk to
  approve.*; she can't approve her own.
- **Department of Revenue & Customs** — **Answer** shows everything and, in
  place of *Share*, *You can share only with Bhutan National Single Window
  and Bank of Bhutan. Dorji Wangchuk can share with Department of Revenue &
  Customs.* and **Pass to someone who can** (E5).
- **Ministry of Industry, Commerce & Employment** — asks for the tax
  clearance too, which Pelden holds only expired: *…which can't be shared
  right now: it expired on …*, and *Share* is unavailable (E3, D17).

The dashed **Bank of Bhutan asks on its connection** adds a request Rinzin can
share: **Answer** shows *Dorji Wangchuk will be asked to approve before Bank
of Bhutan gets this.* before **Share with Bank of Bhutan**, which sends it to
him. Switch to **Dorji**: **Approve** opens SCR-PRS-04 — *Rinzin Dema wants to
share this with Bank of Bhutan*, the same list, *Rinzin Dema chose to share
this on …*, and **Approve and share with Bank of Bhutan** or **Don't
approve** with an optional note. Not approving puts the request back to
*Waiting* with *Dorji Wangchuk didn't approve sharing this: <note>.* — the
bank isn't refused. Approving shares it; Rinzin is told, and the History row
names both.

**History** has the account Dorji opened, the loan Rinzin shared and Dorji
approved, and a request that expired. **Refused** has *Request claiming to be
from Druk Trading House refused — not on NDI's list of trusted organisations.*
and the bank asking for something it isn't approved to ask for — neither was
notified. The other dashed buttons add a refused sender and a request held
while NDI's list can't be reached (*Checking Bank of Bhutan — you can't
answer this yet*), with **NDI's list answers** to release it.

Who is told is written to the dashboard's activity feed, naming who it goes
to — UX-EW-04 has no notification copy yet, so the wording is the
prototype's (see the what's-real page).

---

## Flow 8 — giving authority to act

A business gives a named person — its clearing agent, or an employee —
limited, time-bound authority to act for it at the Bhutan National Single
Window, and that person collects it into their own Bhutan NDI app. It
follows FLOW-AUT-01 v0.2, EW-FLOW8-SD v0.2 and UX-EW-05 v0.2, SCR-AUT-01 to
06. Chapter 12 of the guided demo walks the representative's path; **Demo
controls → Walk a flow → Giving authority to act** has three entries.

The rules to point at:

- **Who may give it comes from the relation**, never the person: the Root,
  or a Controller appointed with *Give authority to act*. Anyone else sees
  *Authority* but, in place of **Give authority**, the reason and who can
  (E1). Whether someone else must approve comes from that box's setting —
  one approver by default; the Root's own grants go at once.
- **The agent needs no account** and isn't a member. She is identified when
  she collects it, by the citizen ID number the grantor typed — kept only as
  a keyed hash, never shown again, and not in what she carries.
- **One kind of authority, no chains, no passing it on** (D1, D3). It names
  the licence number she acts under, never the licence or the TPN — the
  check screen says so in the sentence that must survive review.
- **It is the organisation's**, not the grantor's: it stays in force if
  whoever gave it leaves (D15).
- **At most a year**, 90 days by default; the limit is per declaration.

### The representative gives it — **The owner gives a clearing agent authority**, as Dorji

Starts on Pelden's first day, so it is Pelden's first grant. **Authority**
is empty: *Nobody can act for Pelden Trading Pvt. Ltd. outside the wallet
yet…* Press **Give authority**.

The form asks where first (only the Single Window is offered), then what
(*Submit customs declarations*, *Amend customs declarations*), then which
licence. Pelden has none yet, so the form says *Declaring at Bhutan National
Single Window needs a business licence that someone acting for you can use.
You don't have one yet.* with **Get a business licence** — press **Have the
ministry issue Pelden's business licence** (dashed) instead. Enter **Pema
Choden**, **11512002960**, tick both tasks and **BL-PLG-2025-00871**, type
**1000000**, leave the date, **Continue**.

**Check and give** reads the terms as one sentence, then *What they carry* —
including what she won't. **Give authority**. Pelden isn't yet on NDI's
list as able to give authority, so SCR-AUT-04 shows *Setting up Pelden
Trading Pvt. Ltd. to give authority…*; press **NDI's list confirms…**
(dashed). The link appears with **Copy link** and **Show QR code** — Dorji
sends it himself. Press **Open the link as Pema Choden** (dashed).

On the claim page — no sign-in — only Pelden's name and *Only continue if
you expected authority from Pelden Trading Pvt. Ltd.* Press **Continue with
Bhutan NDI**, then in the dashed app panel **Share Pema Choden's ID**. The
full authority appears, addressed to her; press **Accept in the app**
(dashed). Back as Dorji, **Authority** lists her under *Active*.

Things worth trying on the way:

| Try | Shows |
|---|---|
| Share someone else's ID on the claim page | E9 — *This authority is for someone else…*; the third ends it, and Dorji is told |
| **Let seven days pass** on the waiting link | E15 — *…didn't collect their authority by…*, under Ended |
| **Have the ministry revoke BL-PLG-2025-00871**, then collect | E11 at collection — nothing is given |
| **Decline in the app**, **Let 30 minutes pass**, **The offer can't be sent**, **Accept — the registration is slow** | A2, E13, E12, E17 |
| **Cancel this authority** while it waits | E14 — *Cancelled. The link no longer works.*, and the link reads as dead |
| Give Pema the same again | A3 — *Pema Choden already has authority for this until…* |

### A Controller gives it, the representative approves — as Rinzin, then Dorji

Starts three months on. Rinzin holds *Give authority to act* at its default,
so **Check and give** says *Dorji Wangchuk will be asked to approve before
the link is ready*, and SCR-AUT-04 says *Sent to Dorji Wangchuk to approve.*
Switch to Dorji: **Approvals** lists it (and Sangay Wangmo's, seeded); it
opens SCR-AUT-06 — *Rinzin Dema wants to give … authority* — with **Approve —
the link will be ready for …** and **Don't approve** with a note. Rinzin
can't approve her own: she sees the content and *You can't approve your
own.* Dorji is told whenever someone else's link goes out and when it is
collected, declined, fails, lapses or is cancelled — in the activity feed.

### Collecting from a link — **Collect authority from a link**

Opens the seeded link for Kinley Wangdi with nobody signed in. **Share
Kinley Wangdi's ID** matches; anyone else's doesn't.

---

## The Act 3 walkthrough

About six minutes, as **Rinzin**. The story: an ordinary working day, and the
approval gate doing its job.

### 1 · The landing screen — act button **3**

You arrive at `/dashboard` as Rinzin.

> "This is what a controller sees on signing in. Not a chart — a list of what
> is waiting. And on the right, a reminder of exactly what she is allowed to
> do, every single time, so she never has to discover her own limits from a
> refusal."

Point at the ordering:

> "Approvals first, because somebody else is blocked until they are decided.
> Then organisations asking for something. Then offers, which nobody is waiting
> on. Sorted by expiry, a lapsing offer would sit above a colleague."

Note that **Rinzin has no Approvals item in the sidebar** — her authority does
not include deciding approvals.

### 2 · Accept an offer — the holder inbox

Click the **Business Licence** offer.

> "Here is the thing the studio could never do before. Pelden Trading is
> the *holder*. Somebody has offered the company a credential."

Two things to point at:

- **Every attribute in full**, before any button.
  > "She is accepting these values. A screen that said 'Business Licence,
  > 4 attributes' would be asking her to accept something she had not seen. And
  > this is read from the offer itself, not from anything anyone typed."
- **The issuer's trust-registry status.**

Press **Accept**. Then follow **See what we hold** — note the **Root of trust**
panel, held apart from the table:

> "The Business Registration is not one credential among several. It is the
> root everything else chains back to, including everything the company has
> delegated. Burying it in a row between a tax certificate and an insurance
> policy would misstate what it is."

### 3 · The refusal — worth showing deliberately

Go to **Offers**, open **Fleet Insurance Certificate**, and pick
**out_of_scope** in the state switcher.

> "Accepting is never limited by what the credential is — every preset that
> can accept can accept anything. So the only refusal here is about the
> person: a role without accepting. She can still read every attribute; what
> she can't do is accept or decline."

Point at what replaced the buttons:

> "It says who can accept, and nothing else. There is deliberately no way for
> her to widen her own authority from here — this is exactly the moment
> somebody would reach for that, and it must not exist."

### 4 · Sharing, and the approval — `Sharing`

The pre-spec screen here let Rinzin tick which attributes to disclose. That
is gone: an entity credential is shared whole (EW-FLOW7-SD D4), and the
screen says so. Walk it as **Flow 7 — A controller shares, the owner
approves** above: Rinzin shares with the bank, Dorji approves on SCR-PRS-04,
and neither ever approves their own.

### 6 · The record — `Controllership → Audit`

> "Pelden Trading, acted by Rinzin Dema, approved by Dorji Wangchuk. Three
> questions an investigation actually asks — on whose behalf, by whose hand, on
> whose authority — and no single-name log can answer any of them."

Point at the disclosed line:

> "A fingerprint of what went out. Not the values. An audit trail that stored
> what it was protecting would be a second copy of the company's data with a
> longer retention period than the original."

### Other things on this loop worth a look

| Where | What it shows |
|---|---|
| `/approvals/park-stale` | Approved, then invalidated before it ran |
| `/approvals` → the dual-control card | 1 of 2 signatures, needing a different person |
| `/wallet/sharing/pr-drc-check` (as Rinzin) | Her *Share* reach doesn't include the tax office: the reason, and *Pass to someone who can* |
| `/dashboard` → **access_suspended** state | A controller whose authority was pulled mid-session |

---

## Flow 9 — acting for a company at the Single Window

Built to FLOW-AUT-02 v0.1, EW-FLOW9-SD v0.1, the counterparty integration
guide (EW-FLOW9-CIG) and UX-EW-06 SCR-AUT-07. Pema, holding the authority
Flow 8 gave her, signs in to the Bhutan National Single Window as herself,
chooses **Act for a company**, and shares her citizen ID and her authority
from her Bhutan NDI app **once**. NDI's `client-service` checks V1–V6, BNSW
checks B0–B4, and an *authority session* opens: "You're acting for <company>
under licence <number>, up to Nu <limit> per declaration, until <time>."
After that each declaration is checked at submission — the authority's,
her citizen ID's, the licence's and the listing's status, then the limit —
with no further trip to the app. This replaces the page that predated the
specification (`/verifier/bnsw`, which now redirects): a wallet hop per
declaration and a signed PASS/FAIL from an "Authority Verification API".

Everything at `/simulated/bnsw` is **BNSW's**, not NDI's, so the whole site
sits inside one dashed frame, with no Studio chrome. Below the site, three
dashed panels: Pema's app (SCR-AUT-08 is the app team's screen), things that
happen elsewhere (the company withdrawing — catalogue flow 11, unspecified —
the ministry suspending a licence, NDI's services down, BNSW's sign-in timing
out), and **BNSW's records** — the registration, the session and what it
keeps with each declaration. Point at the last one: BNSW does see Pema's
name and citizen ID number (EW-FLOW9-SD §4.2), and Pelden is told nothing
(D7).

**Say plainly that BNSW is not live yet** if anyone from customs, trade or
GovTech is in the room. Its main system is still being procured; customs
today runs on DRC's eCMS.

### A clearing agent declares — **A clearing agent declares for Pelden**

Three months in. Pelden registered with BNSW after its first grant, so its
registration carries the identity it gives authority from.

| Try | What it demonstrates |
|---|---|
| **Sign in as Pema Choden**, **Act for a company**, **Share** | *Checking…*, then *Acting for* with the company's name, TPN and licence from the registration — never typed |
| Value `420000`, **Submit declaration** | Accepted, and what BNSW keeps: `relationId`, the revocation id, licence, name and citizen ID |
| Value `1200000` | E13 — above the limit; the draft stays, the session goes on |
| **Pelden Trading withdraws the authority**, then submit | E12 — nothing submitted, the session ended, the draft kept. The withdrawal reached BNSW at the next check (DA-CORE's target is within 60 seconds; the prototype shows it as immediate) |
| **The ministry suspends licence …**, then submit | E12 with the licence as the reason (AC-05) |
| **NDI's revocation service can't be reached**, then submit | E7 — nothing submitted, the session kept (D18) |
| **Amend** on a declaration | A3 — offered only because Pema's authority includes amending |
| **Close BNSW and come back later** | A4 — resumed after B0, no new proof |
| **BNSW's sign-in times out** | E14 — the draft kept |
| Sign in as **Kinley Wangdi**, **Act for a company**, then **Pema Choden scans the code and shares instead** | E15 — a relayed QR code: the authority shared isn't the signed-in person's (B0) |
| **A copied authority, signed with another key** | E3 — V2, the holder binding |
| Withdraw it, then **Act for a company** again | E5 at sign-in (AC-03) |

### Registering again — **Pelden registers with BNSW again**, as Dorji

BNSW's registration page is the bank's page again (FLOW-PRS-01): a reference,
**Share from NDI Entity Wallet**, the wallet's consent with BNSW asking for
the registration, the TPN and the business licence, and back. BNSW keeps
what EW-FLOW9-SD §4.1 lists — with Pelden's publishing DID because Pelden is
listed as able to give authority. A company that registered *before* its
first grant has none, and its delegates get E8 until it registers again:
the guided demo walks exactly that (Journey W), because in the story Pelden
first registers with BNSW after Pema's first try.

### Choices the specification leaves open

- **TPN status** (pr-9 item 1): not looked up — B4, step 13 and §8.1 name
  the licence, the authority, the citizen ID and the listing only.
- **Several licences** (pr-9 item 2): B4 checks every registered licence the
  authority names; the session opens if any is ACTIVE, and A2 offers only
  those.
- **BNSW's sign-in length** (§13 item 8): eight hours.
- **E12's reasons** and "You've stopped acting for <company>." are the
  prototype's words.

---

## Showing the states nobody can click to

For a design or engineering audience, the state switcher is the interesting
part. Open **Demo controls** and look at **This screen's states** — it lists
whatever the screen you are on has declared, and switching is instant.

Worth showing:

| Screen | Try | Why it matters |
|---|---|---|
| `/wallet/authority` | **suspended**, **expired** | A dead end with a reason, not a broken screen |
| `/wallet/authority` | **no_authority** | What Pema, who holds no controllership, sees |
| `/controllership/relations/.../scope` | **over_broad** | The advisory warnings, without having to build a bad scope |
| `/onboarding/responsibility` | **returning**, **not_representative**, **could_not_finish**, **not_confirmed**, **offline** | SCR-DEL-01: the wallet step-up in a later session, and every refusal |
| `/people-who-can-act/give` | **no_one_to_choose**, **already_has_authority**, **approval_falls_to_you**, **nothing_to_share_with**, **not_representative**, **offline** | SCR-DEL-02's E1, E2, E3, E12 and A1 |
| `/appointments/...` | **expired**, **declined**, **no_longer_valid**, **offline** | SCR-DEL-03's E4, E5, E8/E9 |
| `/appointments/.../confirm` | **same_device**, **declined**, **could_not_confirm**, **no_wallet** | SCR-DEL-04's E6, E7, E11 |
| `/people-who-can-act` | **only_you**, **pending**, **accepted**, **declined**, **expired** | SCR-DEL-05, including a verified name that differs from the account |
| `/onboarding/foundational` | **not_yet_accepted**, **declined**, **sole_proprietorship** | Verified but not usable yet; no delegation for a proprietor |
| `/simulated/bnsw` | **signed_out**, **waiting**, **checking**, **acting**, **choose_licence**, **resumed**, **refused_E2**…**refused_E15**, **not_submitted_E7/E9/E12/E13**, **ended_E14**, **offline** | SCR-AUT-07: every state in UX-EW-06's table, with §3.5's copy |
| `/authority-to-act` | **empty**, **no_permission**, **not_in_standing**, **first_grant**, **offline** | SCR-AUT-01: E1 and E2 in place of *Give authority*, and the first-grant notice |
| `/authority-to-act/give` | **licence_unavailable**, **counterparty_unavailable**, **field_error**, **duplicate**, **no_permission** | SCR-AUT-02's E4, E5, E6 and A3 |
| `/authority-to-act/give/check` | **default_auto**, **default_approval**, **error** | SCR-AUT-03 with and without an approver |
| `/authority-to-act/g-…` | **waiting_approval**, **setting_up**, **setting_up_long**, **collecting**, **done**, **ended**, **no_permission** | SCR-AUT-04, A1, A4, E3 |
| `/authority-to-act/g-sangay/approve` | **own**, **cant_go_ahead**, **grantor_lapsed**, **already_decided**, **no_permission** | SCR-AUT-06, E11, E16 |
| `/authority/claim/…` | **error_link**, **error_no_app**, **error_not_you**, **error_no_answer**, **error_cant_give**, **error_offer_expired**, **declined**, **finishing** | SCR-AUT-05, E7–E13, A2, E17 |
| `/dashboard` | **all_clear**, **access_suspended** | An empty queue, and a pulled authority |
| `/wallet/offers/...` | **out_of_scope**, **requires_approval** | Both refusal shapes on any offer |
| `/approvals/...` | **stale**, **expired**, **rejected** | The outcomes nobody demos |
| `/present?session=…` | **signed_out**, **choose**, **checking**, **error_unknown**, **error_expired**, **error_used**, **no_organisation**, **refused**, **no_request**, **offline** | SCR-PRS-01: FLOW-PRS-01 E1–E4, E7, E8, E11 |
| `/wallet/sharing/…` | **with_approval**, **cant_satisfy**, **no_approver**, **recheck_error**, **send_error**, **already_answered**, **cancelled**, **no_permission**, **outside_reach**, **offline** | SCR-PRS-02, including E6/E13 (no approver while the Root is inactive) |
| `/wallet/sharing/…/done` | **pending_approval**, **pending_kept**, **pending_passed**, **pending_checking**, **declined**, **refused**, **failed**, **cancelled**, **no_return** | SCR-PRS-03: only *Shared* counts down |
| `/wallet/sharing/…/approve` | **own**, **initiator_lapsed**, **recheck_error**, **already_decided**, **send_error**, **cancelled**, **no_permission** | SCR-PRS-04, including E16/E11 — nothing in the prototype ends an appointment |
| `/wallet/sharing` | **empty**, **loading**, **error**, **offline** | SCR-PRS-05's three empty tabs |
| `/verification/return-addresses` (as Yeshey) | **empty**, **error_invalid**, **sign_in_again**, **no_permission**, **offline** | SCR-PRS-06 |
| `/controllership/audit` | **filtered_empty** | A filter finding nothing, trail still intact |
| `/onboarding` | **none_supported**, **no_permission** | No authority connected yet; Kind E by someone who isn't the owner |
| `/onboarding/details` | **invalid_format**, **loading**, **already_claimed** | The shape check, and E3 saying nothing about why |
| `/onboarding/prove` | **same_device**, **declined**, **expired**, **credential_rejected**, **no_wallet**, **name_mismatch** | Every way the authority's identity request can end |
| `/onboarding/verifying` | **unreachable**, **setup_failed**, **issuing_failed**, **resumed** | Not decided vs approved-but-not-finished, and coming back |
| `/onboarding/not-verified` | **not_a_representative**, **not_recognised** | E6 and E7, worded alike on purpose |
| `/onboarding/not-supported` | **interest_recorded** | Nothing pending, said in so many words |
| `/welcome` | **in_progress** | An application in flight, instead of the empty account |
| `/sign-up/check-email` | **delivery_failed** | The verification email bouncing |
| `/invitation/...` | **expired**, **revoked**, **void**, **wrong_person** | Every way an invitation can fail to be accepted |
| `/admin/approvals` | **self_issued** | Dual control: approve disabled, with the reason |
| `/onboarding/foundational` | **name_differs** | The authority's name shown, with the difference stated |
| `/controllership/entity` | **foundational_expired** | What lapses when the root lapses |
| `/appeals` | **under_review**, **upheld**, **rejected** | Every stage of an appeal |
| `/admin/accreditations` | **empty**, **offline** | Nothing pending, nothing to review, nobody observed |
| `/admin/accreditations/new` | **recognition**, **error**, **existing_org**, **overlap**, **success**, **offline**, **no_permission** | Observed scope; E10, including a Kind N name already on the platform; an issuer type someone else issues, shown not refused |
| `/admin/accreditations/…` | **self_proposed**, **recommended_decline**, **lapsed**, **not_accepted**, **success**, **offline** | Dual control; a recommended decline can only be confirmed; E14, the one lapse; withdrawing an approval nobody accepted (E2) |
| `/admin/accreditations/…/review` | **holder_alert**, **overdue**, **lapsed**, **error**, **empty** | ACC-02/E8, E9, E10 |
| `/verify-or-issue/…` | **recognition**, **setting_up**, **set_up_failed**, **not_set_up**, **waiting_wallet**, **not_confirmed**, **withdrawn**, **offline**, **no_permission** | Every way acceptance can go, E2 (withdrawn by NDI) to E7 |
| `/verify-or-issue` | **waiting**, **withdrawn**, **request_lapsed**, **listing_abandoned**, **withdrawn_by_ndi**, **replaced**, **declined**, **publishing**, **held**, **stopped**, **resigned**, **empty**, **member** | Every state an approval can be in |
| `/verify-or-issue/ask` | **choosing_verify**, **choosing_issue**, **choosing_both**, **step_up**, **already_asked**, **error**, **offline**, **no_permission** | E2, E3 per capability, E6; one capability or both, one legal basis for issuing |
| `/kitchen-sink` | — | Every component, both themes. Not part of the story |

> "Denied, expired and suspended states get the same care as the happy path.
> They are more frequent in a system that fails closed, and they are where
> trust is won or lost."

---

## Switching who you are

Demo controls → **Driving as**. The four people the story is about:

- **Dorji Wangchuk** — owner. Sees everything, including Who can act and
  Authority.
- **Rinzin Dema** — controller. Sees Wallet. **No Controllership group at
  all.**
- **Pema Choden** — clearing agent. Not a member of Pelden and needs no
  account: she collects her authority from a link and uses it at the Single
  Window's website.
- **Ugyen Phuntsho** — warehouse manager. Holds nothing until act 2 grants it,
  which is exactly why he is the one to build an authority for. Before that,
  his wallet correctly says he has no authority here.

And three more for the Gate 2 flows:

- **Root** — NDI's root administrator: the deployment's own account, named
  as a role rather than a person.
- **Kinzang Dorji** and **Tshendu** — NDI's two platform administrators.
  They see the Studio and **NDI administration**: organisations,
  invitations, approvals and platform admins, and each approves what the
  other proposes. The root account never approves. There is no manual
  review: whether an organisation is verified is its authority's decision.
- **Whoever joins Pelden by invitation** — each gets a record of their own
  and appears once they accept. A member of Pelden who can see it and act
  for nothing.

NDI's organisation has nobody else. The Studio's **Users** page lists exactly
these two (Kinzang once the invitation is accepted) and any admin invitation waiting.

Switch from Dorji to Rinzin with the sidebar visible and point at it:

> "The Controllership section is not greyed out for her. It is not there.
> A disabled menu item would tell her that administering her own authority is
> something she might do — which is exactly the idea this product cannot
> afford her to have."

Rinzin also has no **Approvals** item, because her authority does not include
deciding approvals. That is read from her actual grant, not from a role list.

---

## If something goes wrong

| Problem | Fix |
|---|---|
| Screen looks stale or half-built | **Reset demo** in the demo controls (back to day zero) |
| A sidebar item 404s | Shouldn't happen now — tell me if one does |
| A countdown says "Expired" | Only the deliberately-lapsed fixtures should. Others self-update |
| Acceptance button is disabled | You are the wrong persona. Use **Continue as …** |
| The verifier says no authority exists | Open the story three months on (For reviewers), or issue one via act 4 |
| A second FAIL when you wanted a PASS | The role is still revoked. Open the story three months on again |
| Everything is dark and you wanted light | Theme toggle, top right |

**The fixture dates no longer rot.** Story dates are offsets from today, so an
offer that expires "in a week" always does, and the capability in act 5 is
always inside its validity window. The handful of things that read as expired
are meant to — a lapsed tax certificate, a revoked permit, an offer nobody
answered.

**Every wait is skippable.** Look for **Skip the wait** on any hand-off. The
only long one is the register lookup in act 1, and that length is the point.

---

## What to say when asked "is this real?"

Be straightforward. The honest version lands better than a hedge:

> "The screens are real and the model behind them is real. Nothing underneath
> is — no register integration, no `client-service` checks, no server enforcing
> any of this. It is a frontend prototype whose job is to make us agree on what
> the product should be before anyone builds it."

Then hand over **/whats-real** — click the prototype chip. It lists every
simulated part, what it really is, and what would have to exist for it to be
real, including the bits that genuinely are decided. It is written to be
forwarded.
