# Presenting the Entity Wallet to GovTech

A presenter's brief. Read it once start to finish, then rehearse with
**Demo controls → Practise with the guide**. In the room, use the
**Presentation** list instead. The aim isn't for GovTech to remember every screen.
It's for them to leave understanding one idea: **a company can now prove who
it is, and who may act for it, the same way a citizen does with Bhutan NDI.**

---

## 1. The 30-second version

> Bhutan NDI gave every citizen a wallet for their own credentials. The
> Entity Wallet does the same for organisations. A company holds its own
> credentials, such as its registration, its taxpayer number and its
> licences, in a wallet that belongs to the company, not to any one person.
> The company decides who can act for it, and how far. Anyone the company
> deals with, whether a bank, a ministry or the Single Window, can check
> those credentials with the office that issued them, instantly, without
> photocopies, stamps or phone calls.

If you only get to say one thing, say that.

---

## 2. The problem it solves (start here, before any screen)

Ask the room to picture how a company proves itself today:

- **Who the company is:** a printed registration certificate, copied and
  stamped, and checked by hand by whoever receives it.
- **Its tax status:** a copy of the TPN letter, which could be out of date.
  Nobody receiving the copy knows whether it was cancelled last week.
- **Who can act for it:** a letter of authority on letterhead, signed by a
  director. The receiver can't easily tell whether the signer was allowed to
  sign it, or whether it's still valid.
- **Agents:** a clearing agent carries the company's licence and TPN copies
  around, and has to keep handing them over.

Each copy is a snapshot. It can be forged, it goes stale, and checking it
costs time at every counter. The Entity Wallet replaces the copies with
credentials that are **issued by the office responsible, held by the
company, and checked live at the moment they're used.**

---

## 3. Five ideas to get across

Keep coming back to these. Every flow shows at least one of them.

1. **The person comes first, then the company.** You sign up as yourself.
   The company is proved separately, by the office that registered it.
2. **The office that issued it stays the source of truth.** The CRA confirms
   the company. The tax office issues the TPN. NDI carries the answer but
   never makes it up.
3. **Being in the company isn't the same as acting for it.** A colleague can
   be a member and see things. Acting for the company is a separate,
   specific permission, and the person has to accept it themselves.
4. **The company stays in control.** Nothing is shared without someone
   allowed to share it saying yes, and the screen shows exactly what will go
   before it goes.
5. **Checked every time, not once.** A bank or the Single Window doesn't
   trust a copy from last month. It checks at the moment of use, and if
   something has been withdrawn or revoked, the answer changes immediately.

---

## 4. Words to use, and words to avoid

GovTech may know the technology. The point is still to talk about what
people do, not how it's built.

| Instead of | Say |
| --- | --- |
| DID, key, agent, anchor | the company's wallet, the Bhutan NDI app |
| verifiable credential, VC | credential, or the document's name ("its registration", "its TPN") |
| holder, issuer, verifier | the company, the office that issues it, the bank / the Single Window |
| controller, relation, scope | someone appointed to act for the company, and what they can do |
| trust registry | NDI's list of trusted organisations |
| presentation, proof | sharing, checking |
| revocation registry | the office can withdraw it, and everyone checking sees that straight away |

If someone asks a technical question, answer it directly. Just don't lead
with it.

---

## 5. The cast

| Name | Who they are |
| --- | --- |
| **Pelden Trading Pvt. Ltd.** | A private limited company in Thimphu: our example business |
| **Dorji Wangchuk** | Pelden's director, and the first person to bring Pelden onto the Entity Wallet (its *representative*) |
| **Ugyen Phuntsho** | A colleague at Pelden |
| **Pema Choden** | A clearing agent at Druk Sharpa Freight, who declares Pelden's imports |
| **Corporate Regulatory Authority (CRA)** | Registered Pelden, so it confirms Pelden |
| **Department of Revenue & Customs (DRC)** | Issues Pelden's taxpayer number (TPN); its officer in the demo is Deki |
| **Bank of Bhutan** | Where Pelden opens an account |
| **Bhutan National Single Window (BNSW)** | Where customs declarations are made |

---

## 6. Walking the seven flows

In the room, press **Presentation** and pick each part from the list, in
order: Entity Wallet user onboarding, Entity onboarding, Appointing a
controller, Receiving credentials, Presenting credentials, Issuing authority
credentials, Acting at BNSW. Each one opens its first screen with no card,
so the clicks are yours to know; the practice guide teaches them. This
section is the *why*, plus the questions each part tends to raise.

Allow **35–45 minutes** for the full walk, plus questions. If time is
short, the strongest parts are Flows 2, 7, 8 and 9.

### Opening: what the Entity Wallet is (3 steps)

Use the 30-second version and the "problem today" list above. Point out the
**dashed panels**: anything dashed is pretend, standing in for a phone, an
inbox, the Bhutan NDI app, a register or another organisation's website.
Saying this early stops people asking "is this connected to the real CRA?"

### Flow 1: a person gets an account

**What happens:** Dorji signs up with an email address, confirms it, and sets
a name and password. He then has an account, but no company.

**Say:** "Nobody signs up *as* a company. The account belongs to a real
person, the one who'll prove who they are in a moment."

**Why it matters:** the same person can act for several companies, and
every action is tied to a named individual, not to a shared login.

**Likely question:** *"Why not just register the company directly?"*
Because a company can't sign anything itself. People act for it, so we
start from a real, accountable person.

### Flow 2: the company comes on

**What happens:**
1. Dorji chooses "Registered company" and types Pelden's registration
   number.
2. The **CRA**, not NDI, asks Dorji to prove who he is from his Bhutan NDI
   app. Only his identity is shared, nothing about the company.
3. The CRA checks its own register and confirms Dorji may act for Pelden.
4. Dorji reads and accepts his responsibilities as Pelden's representative.
5. Pelden's **registration credential arrives in Pelden's own wallet**,
   automatically.
6. Dorji invites Ugyen by email, and Ugyen joins.

**Say:** "This is where the platform admits it can't decide who a company
is. The registrar does. NDI just carries the answer."

**Why it matters for GovTech:** the registers stay where they are, owned by
the offices that own them. NDI doesn't copy or take over the CRA's data.

**Likely questions:**
- *"Does NDI store the company's records?"* No. The CRA checks its own
  register and gives its answer. What Pelden holds is the credential the
  CRA issued.
- *"What if the director leaves the company?"* That's Flow 12 (changing who
  controls a company), which is still being designed.

### Flow 3: appointing someone to act

**What happens:**
1. Ugyen is a member, so Ugyen can *see* Pelden but can't *act* for it.
2. Dorji appoints Ugyen and ticks what Ugyen can do. There are four
   choices:
   - **Receive credentials**
   - **Share credentials**
   - **Approve others' actions**
   - **Give authority to act**
3. The screen also lists what Ugyen *won't* be able to do.
4. Ugyen opens the appointment and accepts it with one approval in their own
   Bhutan NDI app.

**Say:** "Letting someone in and letting them act are two different
decisions. And nobody can be made to act for a company without agreeing
themselves."

**Why it matters:** it replaces the board letter. The permission is
specific, recorded, and accepted by the person who receives it.

**Likely question:** *"Can Dorji accept on Ugyen's behalf?"* No. An
acceptance someone else makes isn't worth recording.

### Flow 6: receiving a credential

**What happens:**
1. Pelden asks the tax office for its TPN. It shares its registration as
   proof, and the screen says exactly what will be shared.
2. **Deki**, the tax officer, sees what Pelden *proved*, and separately the
   name NDI shows, which isn't proof. She issues the TPN from the office's
   own records.
3. Back at Pelden, Dorji checks the offer and accepts it. The TPN is now
   held, and it's on the activity record.

**Say:** "Each office issues what it's responsible for. The wallet is where
it all comes together, under the company's control."

**Why it matters:** an office can issue to a business digitally and know
exactly which verified company it's issuing to.

**Likely question:** *"Does every office need a person to click Issue?"* No.
An office can connect its own system and answer automatically. The full
guided demo shows this for the bonded-warehouse authorisation.

### Flow 7: presenting a credential (the bank)

**What happens:**
1. On **Bank of Bhutan's website**, Pelden chooses to share from the Entity
   Wallet.
2. Before anything else, the screen shows who is asking and the bank's
   reference, and warns Dorji to continue only if he expected this.
3. Dorji sees **every detail that will go**, then shares. He's sent back to
   the bank, which confirms it has received and checked the details.
4. Then the bank asks again *inside* the wallet. Ugyen can see the request,
   but wasn't appointed to share, so passes it to Dorji, who shares it.
5. The **History** tab shows what was shared and who did it. The
   **Refused** tab shows requests from senders not on NDI's list, which are
   blocked before they reach anyone.

**Say:** "The bank gets the credential straight from the company, signed by
the office that issued it, and can check it's still valid. No photocopies
to verify by hand."

**Be honest about this one:** a credential is shared **whole**. The bank
receives every detail on the registration, not only the ones it asked for,
and the screen says so plainly rather than pretending otherwise.

**Likely questions:**
- *"Can a scam site ask for our credentials?"* Only organisations on NDI's
  list can ask. Anyone else is refused, and the request is filed under
  Refused.
- *"Can someone share without the director knowing?"* Only people appointed
  with *Share* can share, and a company can require a second person to
  approve each share.

### Flow 8: giving authority to act (the clearing agent)

**What happens:**
1. Pema, the clearing agent, needs to declare Pelden's imports at the Single
   Window. She **isn't a member and needs no account**.
2. Dorji fills in the authority:
   - **Who:** Pema's name and citizen ID number.
   - **Where:** the Single Window.
   - **What:** submit and amend customs declarations.
   - **Which licence:** one of Pelden's business licences. In the demo, a
     dashed step has the ministry issue it first.
   - **Limit:** up to Nu 1,000,000 per declaration.
   - **Until when:** 90 days by default, at most a year.
3. A check screen reads it all back as one sentence. It also says what Pema
   *won't* carry: not Pelden's licence document, and not its TPN.
4. Dorji sends Pema a link. Pema opens it, proves who she is with her
   Bhutan NDI app, and accepts. The authority is now in **her own app**.

**Say:** "This is the letter of authority, made checkable: who acted, for
which company, and under what authority, every time."

**Why the citizen ID matters:** only the person whose ID matches can collect
the authority, so a forwarded link is useless. After three wrong tries the
link stops working.

**Likely questions:**
- *"Does the authority stop if Dorji leaves?"* No. It's the company's
  authority, not Dorji's personally, so it stays until the company ends it.
- *"Can Pema pass it on?"* No. It's bound to her, in her app.

### Flow 9: acting at the Single Window

**What happens:**
1. On BNSW's (simulated) site, Pema signs in and chooses *Act for a company*,
   then shares her authority **once** from her app.
2. **First try: refused.** Pelden has never registered with BNSW. The
   message says why, and who can fix it.
3. Dorji registers Pelden with BNSW the same way Pelden shared with the
   bank: he shares the registration, TPN and licence once.
4. Pema tries again. BNSW now shows "acting for Pelden" with the licence,
   the limit and the session end, all filled in from the registration, so
   nobody types them.
5. She makes a declaration of **420,000: accepted**.
6. She makes a declaration of **1,200,000: refused**, because it's above her
   limit. Her draft is kept.
7. **The tax office revokes Pelden's TPN.** Her next declaration is refused
   straight away, and so is starting again. After the TPN is reinstated, it
   works again.
8. **Pelden withdraws her authority.** Her next declaration is refused.

**Say:** "Every declaration is checked against her authority, and against
Pelden's TPN and licence as they stand *right now*. And every refusal says
why, and who can fix it."

**Why it matters for GovTech:** this is the full chain working across
agencies. CRA issues, DRC issues, the company delegates, BNSW verifies, and
when DRC changes something, BNSW sees it on the next declaration without
anyone phoning anyone.

**Likely questions:**
- *"Does BNSW see Pelden's credentials every time?"* No, only once, at
  registration. Per declaration, it checks status and the limit.
- *"Is Pelden notified of each declaration?"* Not by BNSW. That's BNSW's own
  record, which keeps Pema's name and ID with each declaration.
- *"Is this connected to the real BNSW?"* No, BNSW is simulated here, which
  is why it's in a dashed frame.

### The close

Recap with the five ideas from section 3, then say plainly what wasn't
shown, so nobody assumes it's finished:

- **Not shown today, but built:**
  - setting up NDI's own administrators;
  - NDI approving organisations to verify or issue;
  - designating an authority, such as a ministry for sole proprietorships.
- **Still to be designed:**
  - decisions that need several signatories (Flow 10);
  - suspending and revoking (Flow 11);
  - changing who controls a company, or closing it (Flow 12);
  - recovering from a lost phone (Flow 13).

---

## 7. Hard questions, and honest answers

| Question | Answer |
| --- | --- |
| Is any of this live? | No. It's a clickable prototype, and every register, app and website outside the Entity Wallet is simulated. The **Prototype · data simulated** chip lists exactly what's simulated. |
| Does NDI see company data? | NDI carries credentials between parties, but the answers come from the issuing offices. The registration check happens against the CRA's own register. |
| What if a phone is lost? | Key loss and recovery is Flow 13, planned and not yet designed. Don't improvise an answer; say it's on the roadmap. |
| What if a director resigns or a company closes? | Flow 12, still being designed. |
| What about two-director approvals? | A company can already require a second person to approve shares and grants. Full multi-signatory rules are Flow 10, still being designed. |
| Can one person act for several companies? | Yes. The account is the person's, and each company is separate. |
| What does an agency need to do to accept this? | Be on NDI's list, and ask for credentials the same way the bank and BNSW do in the demo. The integration details are a technical conversation for a follow-up. |
| What does it cost / when is it live? | Don't answer from the demo. Take it as a follow-up. |

Rule of thumb: **if the prototype doesn't show it, say it's planned or that
you'll follow up.** Don't fill gaps on the spot.

---

## 8. Before the session: checklist

- [ ] Pull the branch and run it from `entity-wallet-prototype/`
  (`npm install`, then `npm run dev`), not from the repo root.
- [ ] Do one **full rehearsal** the day before with **Demo controls →
  Practise with the guide**, so you know every click without the card.
- [ ] Then rehearse once more from the **Presentation** list, the way you'll
  show it.
- [ ] In the room, open **Presentation** and choose **Entity Wallet user
  onboarding**. Each part resets everything it needs itself, so you never
  have to reset by hand.
- [ ] Zoom the browser to 110–125% if the room is large.
- [ ] Close the list while you talk; the client should see only the product.
- [ ] If something goes wrong in a part, choose that part again from the
  list. It starts it fresh.
- [ ] Have a backup: screenshots or a screen recording of a good run, in case
  the laptop or the dev server fails.
