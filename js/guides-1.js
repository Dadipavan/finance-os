/* guides-1.js — PROTECT & BANKING: insurance, emergency fund, scams, banking, credit cards, credit score */
window.FOS = window.FOS || {};
(function () {
  'use strict';
  const G = FOS.G;

  G({
    id: 'insurance', module: 'insurance', cat: 'Protect', read: '30 min read', title: 'Insurance — the complete expert guide',
    summary: `Every kind of insurance in India, who it actually helps, how to size it, what to check in the policy, how claims really work — and the exact order I would buy in.`,
    calcs: ['cover'], tools: [['Compare quotes', '#/tool/quotes']],
    sections: [
      [`Why insurance exists — and the four risks it covers`,
        `Insurance is a **swap**: you pay a small, certain amount every year so that a rare, huge loss is paid by someone else. It is not an investment and not a tax trick. Only four risks can wreck a family's finances, so only four kinds of cover matter first:`,
        ['ul', `**You die early** → your family loses your income (term life).`, `**You fall ill or are injured** → a hospital bill can cost more than a year's savings (health, personal accident).`, `**You cannot work** → disability or critical illness stops income while costs continue (disability, critical illness).`, `**Your property or liability is hit** → accident, theft, fire, a third party sues you (motor, home, liability).`],
        ['tip', `Buy in this order: **health → term life → personal accident → motor (legally compulsory anyway) → home/travel/others**. Everything else is optional or a bad deal.`]],
      [`Every type of insurance available in India`,
        ['tbl', ['Type', 'What it pays for', 'Who needs it', 'Key trap'], [
          [`Health – individual / family floater`, `Hospital bills (cashless or reimbursed)`, `Everyone`, `Low room-rent limits, co-pay, sub-limits`],
          [`Top-up / super top-up`, `Pays only after a deductible is crossed in a year`, `Anyone with ₹5–10L base cover`, `Deductible must match your base cover`],
          [`Critical illness`, `Lump sum on diagnosis of listed diseases (cancer, heart attack, stroke…)`, `Families with history, high debts`, `Only listed diseases; survival period`],
          [`Hospital daily cash`, `Fixed ₹ per hospital day`, `Optional`, `Does not replace real cover`],
          [`Term life`, `Lump sum to nominee if you die in the term`, `Anyone with dependants or loans`, `Under-sizing; hiding habits/diseases`],
          [`Endowment / money-back / whole life`, `Small cover + small maturity payout`, `Almost nobody`, `Poor returns (≈4–6%), lock-in, surrender loss`],
          [`ULIP`, `Market-linked investment with life cover`, `Rarely`, `Charges in early years; mixes two goals`],
          [`Pension / annuity plans`, `Regular income after retirement`, `Some retirees`, `Low payout, inflation erodes it`],
          [`Personal accident / disability`, `Accidental death, permanent/partial disability, temporary loss of income`, `Earners, drivers, field jobs`, `Illness is not covered`],
          [`Motor – third party`, `Injury/damage you cause to others`, `**Legally compulsory** for every vehicle`, `Does NOT cover your own vehicle`],
          [`Motor – comprehensive`, `Third party + your own vehicle damage, theft, fire`, `All vehicle owners`, `IDV too low; wrong add-ons`],
          [`Home insurance`, `Building and contents against fire, flood, theft`, `Homeowners; renters for contents`, `Under-insuring the rebuild value`],
          [`Travel insurance`, `Medical emergency abroad, trip loss, baggage`, `Any foreign trip (visas often require it)`, `Low medical limit; pre-existing disease exclusions`],
          [`Cyber / fraud cover`, `Online fraud losses (limits apply)`, `Heavy digital payers`, `Small limits, strict conditions`],
          [`Government schemes`, `PM-JAY (health, eligible families), PMJJBY & PMSBY (very cheap life/accident cover), Atal Pension`, `Low-income households`, `Eligibility and premiums change — verify`],
          [`Business covers`, `Fire, stock, professional indemnity, group health`, `Shops, firms, professionals`, `Not covered: business interruption unless added`]]]],
      [`Health insurance in depth`,
        `**How much cover?** Hospital inflation runs faster than normal inflation (often cited 10–14%/yr), so size for the city you would be treated in, not where you live.`,
        ['tbl', ['Situation', 'Base cover', 'Add a super top-up to reach'], [[`Single, small town`, `₹5L`, `₹25–50L`], [`Single, metro`, `₹10L`, `₹50L–1Cr`], [`Family of 4, metro`, `₹10–15L floater`, `₹1Cr`], [`Parents 60+ (own policy)`, `₹10L+`, `₹25–50L`]]],
        `**Features that decide whether a claim is actually paid — read these before the price:**`,
        ['ul', `**Room-rent limit**: a cap (e.g. 1% of sum insured per day) triggers *proportionate deductions* on the whole bill. Prefer “no room-rent cap”.`, `**Co-pay**: you pay a fixed % of every claim. Avoid unless premium savings are large.`, `**Sub-limits** on cataract, joint replacement, cancer, ICU, modern treatments.`, `**Waiting periods**: initial 30 days; named diseases typically 1–3 years; **pre-existing diseases up to 3 years** (IRDAI 2024 ceiling — check your policy).`, `**Moratorium**: after 60 continuous months of cover, claims generally cannot be denied for non-disclosure except proven fraud.`, `**Restoration / refill**: sum insured refills after a claim; **no-claim bonus** increases cover.`, `**Day-care, pre/post-hospitalisation (30/60 days or more), domiciliary, AYUSH, organ-donor cover.**`, `**Cashless network**: check hospitals near your home and parents' home. **Portability**: you can switch insurer without losing waiting-period credit — apply 30–60 days before renewal.`],
        ['ex', `Super top-up: Base ₹10L plus a ₹1 Cr super top-up with ₹10L deductible. A ₹35L hospital bill → base pays ₹10L, super top-up pays the remaining ₹25L. Premium for the super top-up is a fraction of a ₹1 Cr base policy (illustrative: ₹4–8k/yr vs ₹20k+).`]],
      [`Term life insurance in depth`,
        `Pure protection: pays the sum assured to your nominee if you die within the term; pays nothing if you survive. That is why it is cheap.`,
        ['ul', `**Sizing — three methods, take the highest sensible one:** (1) 12–20× annual income; (2) **expense replacement**: annual family expenses ÷ a safe 6–7% + all loans + future goals (education, marriage) − existing investments; (3) human-life-value. Use the Life Cover Estimator.`, `**Term:** till age 60–65 (when dependants no longer rely on you). Premium is **locked** for the term.`, `**Riders:** accidental death (worth it, cheap), waiver of premium, critical illness (compare with a separate policy). Skip return-of-premium plans — they cost 2–3× for a low-return refund.`, `**Choose the insurer by:** claim settlement ratio (number of claims) **and** amount settled ratio, repudiation reasons, how they handle early claims (first 2 years get investigated).`, `**Disclose everything** — smoking, alcohol, diseases, hazardous hobbies, other policies. Non-disclosure is the #1 reason claims fail.`, `**Nominee vs heir:** nominee receives the money; legal heirs may still claim. For a spouse and children consider a policy under the **Married Women's Property Act** so creditors cannot touch it.`],
        ['ex', `30-year-old non-smoker earning ₹12L/yr: cover ₹1.5–2 Cr till 60 costs roughly ₹13–20k/yr (illustrative). The same money in an endowment plan would give under ₹20L cover.`],
        [`warn`, `Buy term **while you are young and healthy** — every year of delay raises the premium, and a diagnosed illness can make you uninsurable.`]],
      [`Endowment, money-back, ULIP, child plans — why I advise against them`,
        `They bundle a small insurance cover with a savings product that keeps 20–40% of early premiums in charges. Agents earn large first-year commissions, which is why they are pushed.`,
        ['ex', `₹50,000 a year for 20 years. A typical endowment pays ~₹15–20L at maturity with ₹5–10L cover. Term cover of ₹1 Cr costs ~₹15k, and the other ₹35k a year in an index fund at an assumed 10% grows to about ₹22L — **more cover and more money**. (Assumptions, not guarantees.)`],
        `Exceptions worth knowing: a **guaranteed-income annuity** for a retiree, and existing policies — compare the *surrender value* with the premiums still to pay before dropping one; often the right move is to make it “paid-up” rather than surrender at a loss.`],
      [`Motor insurance (car and bike) in depth`,
        ['ul', `**Third-party (TP)** is compulsory. New vehicles are usually sold with a long-term TP cover (commonly 3 years for cars, 5 for two-wheelers — verify current rules).`, `**Comprehensive = TP + Own Damage (OD).** Own-damage-only policies exist if you already hold TP.`, `**IDV (Insured Declared Value)** = the vehicle's current market value for insurance. It drops with age (IRDAI depreciation slabs: 5% up to 6 months, 15% to 1 year, 20% to 2 years, 30% to 3, 40% to 4, 50% to 5 years). Claim for theft or total loss is paid up to IDV — **do not lower IDV just to cut premium.**`, `**No-Claim Bonus (NCB)**: discount on OD premium for each claim-free year — 20%, 25%, 35%, 45%, 50%. It belongs to **you**, not the vehicle, and transfers to your next vehicle. Even a tiny claim resets it, so small scratches are often cheaper to self-pay.`, `**Add-ons worth it:** zero/nil depreciation (first 3–5 years of a car), engine protection (flood-prone areas), return-to-invoice (new expensive cars), roadside assistance. **Usually skip:** consumables for an old car, key replacement unless keyless.`, `**Constructive total loss:** if repair cost exceeds ~75% of IDV, the insurer may settle as total loss.`],
        `**After an accident:** make the scene safe → photos/video of damage, position and the other vehicle's plate → **FIR for theft, third-party injury/death or major damage** → inform the insurer within 24–48 hours → do not repair before the surveyor inspects → keep the estimate and bills.`,
        `**Documents for a claim:** policy copy, RC, driving licence, claim form, FIR (where needed), repair estimate/invoice, bank details. Keep a photo of the **RC, licence and policy on your phone** (DigiLocker accepts them).`,
        ['warn', `A lapsed policy means **no NCB, a vehicle inspection and no cover while it lapsed**. If you sell the vehicle, transfer or cancel the policy within the time the insurer specifies (typically 14 days).`]],
      [`Personal accident, disability and critical illness`,
        ['ul', `**Personal accident (PA):** accidental death, permanent total/partial disability, sometimes temporary disability income. Cheap. Size ≈ 10× annual income. Essential for drivers, field staff, riders.`, `**Critical illness:** a lump sum on diagnosis of listed illnesses, independent of hospital bills — it replaces income during treatment. Compare the list of diseases, the **survival period** (often 30 days), and the sum (₹10–25L).`, `**Disability cover** is rare in India for individuals; a PA rider or group cover from the employer is the usual route.`]],
      [`Home and travel insurance`,
        ['ul', `**Home:** insure the **rebuilding cost** (not the market price of land) plus contents (electronics, jewellery over a limit needs declaring). Tenants can insure contents only. Premium is small relative to the risk, especially in flood or fire-prone areas.`, `**Travel:** check the medical limit (US trips: $100k+ is sensible; Schengen visas need at least €30,000), pre-existing conditions, trip cancellation, baggage, adventure sports. Buy before you fly; cover usually starts at departure.`]],
      [`Who benefits — five real-life examples`,
        ['tbl', ['Person', 'Must have', 'Sensible extras', 'Budget guide (of take-home)'], [
          [`Single, 25, salaried, ₹6L CTC`, `Own health ₹5–10L (employer cover vanishes if you quit), PA`, `Term ₹50L–1Cr only if parents depend on you`, `3–5%`],
          [`Married, 32, child, home loan, ₹15L`, `Term ₹2–3 Cr, health ₹15L floater + super top-up, PA`, `Home insurance, critical illness`, `7–10%`],
          [`45, parents + teenagers, ₹30L`, `Term to 60, health ₹25L + super top-up, parents' own senior policy`, `Critical illness, PA`, `6–9%`],
          [`Freelancer / business owner`, `Health ₹10L+super top-up, term ₹1.5 Cr+, PA`, `Shop/stock/fire, professional indemnity`, `8–12% (no employer cover)`],
          [`Retired, 62`, `Senior health ₹10–25L, top-up`, `Term not needed if no dependants; PA`, `Mostly health`]]]],
      [`Documents, numbers and identifiers to keep`,
        ['ul', `**Policy number** and **UIN** (Unique Identification Number of the product — it tells you exactly which product and which terms apply).`, `**Proposal number**, customer ID, agent/POSP code, **nominee** name and relationship, date of commencement and **renewal date**.`, `**Health:** health card / member ID, TPA name, cashless helpline, hospital network list, claim number for any claim.`, `**Motor:** registration number, **chassis and engine numbers** (must match the RC), IDV, NCB percentage, add-ons.`, `**e-Insurance Account (eIA)** with an IRDAI-approved repository keeps all policies in one place and makes claims easier for the family.`, `Store scanned copies in a shared folder and **tell your spouse/parents where they are** — many claims fail only because nobody knew the policy existed.`]],
      [`How claims really work, step by step`,
        ['ol', `**Cashless (planned):** request pre-authorisation at the network hospital at least 48–72 hours before admission; carry ID and health card; insurer approves/partially approves; you pay non-covered items.`, `**Cashless (emergency):** inform the insurer within 24 hours of admission; pre-auth is given during the stay.`, `**Reimbursement:** pay the bill, collect discharge summary, final bill with itemised breakdown, all prescriptions, test reports, pharmacy bills, payment receipts, claim form — submit within the policy's limit (usually 15–30 days of discharge).`, `**Term life:** nominee submits claim form, death certificate, policy, ID, bank details; if death is accidental/unnatural add FIR and post-mortem report. Settlement is typically within 30 days once documents are complete.`, `**If rejected:** ask for the written reason → appeal to the insurer's grievance officer → IRDAI's **Bima Bharosa** portal → **Insurance Ombudsman** (free, for disputes up to ₹30 lakh) → consumer court.`],
        ['tip', `Keep every bill and report even for claims you think will be denied — small claims count toward your NCB/health history, and documentation is what wins disputes.`]],
      [`Tax angle (verify every year)`,
        ['ul', `**80D (old regime):** health premiums up to ₹25,000 for self/family (₹50,000 if senior), plus ₹25,000/₹50,000 for parents, plus ₹5,000 preventive check-up within the limit.`, `**80C (old regime):** life insurance premiums count toward ₹1.5L when premium is within 10% of the sum assured (20% for policies before April 2012).`, `**Death benefit:** generally tax-free. **Maturity proceeds** are tax-free only if the conditions are met; for high-premium ULIPs/endowments (aggregate above ₹5 lakh a year, issued after Feb 2021) the gains can be taxed.`, `**GST:** individual life and health premiums were exempted from GST from 22 Sept 2025 (verify current position).`, `The **new tax regime** gives no deduction for these — buy insurance for protection, never for tax.`]],
      [`Mistakes that cost families lakhs`,
        ['ul', `Relying only on **employer group cover** — it ends with the job, usually just when you are older and less insurable.`, `Choosing health insurance by **lowest premium** and discovering co-pay, room-rent caps and sub-limits at claim time.`, `**Hiding** a disease, surgery or smoking “to get a cheaper premium”.`, `Insuring **children** heavily with life cover (they have no income to replace) and under-insuring the earner.`, `Buying **endowment/ULIP/child plans** on an agent's “returns” pitch; or surrendering them in panic at a big loss.`, `Letting a policy **lapse**, buying a new one, and restarting all waiting periods.`, `No **nominee**, wrong nominee, outdated contact details — claim money gets stuck.`]]
    ],
    advisor: [
      `**Health first:** a personal ₹10L base (metro) **plus a super top-up to ₹1 Cr total** for the family. Prefer no room-rent cap, no co-pay, restoration benefit. Give parents their own senior-citizen policy — do not add them to yours.`,
      `**Term second:** every earner with dependants or loans: cover ≈ 15× income (or the expense-replacement number), till 60–65, bought online, 100% disclosed. Add accidental-death rider.`,
      `**Personal accident** ≈ 10× income — it is the cheapest cover you will ever buy.`,
      `**Motor:** comprehensive every year, IDV not reduced, zero-depreciation for a car's first 3–5 years, renew *before* expiry, keep NCB.`,
      `**Do not buy** endowment, money-back, ULIP or child plans. Use **term + SIP + PPF/SSY** instead.`,
      `**Budget:** keep total premiums at roughly 5–10% of take-home pay; if it is higher you are probably over-buying savings plans.`,
      `**Organise:** one folder with all policies, nominees current, family told, review every 3 years and at marriage, child, loan, job change.`
    ],
    checklist: [`Do I have health cover that does NOT depend on my employer?`, `Is my base + super top-up enough for a metro hospital bill (₹1 Cr for a family)?`, `Have I read the room-rent limit, co-pay, sub-limits and waiting periods of my health policy?`, `Does every earner with dependants have term cover ≈ 15× income till 60–65?`, `Did I disclose smoking, diseases and other policies honestly?`, `Do I have a personal accident cover?`, `Is my vehicle insured comprehensively with correct IDV and current NCB?`, `Are TP cover, PUC and RC valid for each vehicle?`, `Do all policies have a current nominee and up-to-date phone/email?`, `Are policy numbers, UINs and renewal dates in my Records tool and in reminders?`, `Does my family know where the documents are?`, `Have I stopped paying for any endowment/ULIP I don't need (after checking surrender vs paid-up value)?`],
    verify: [`IRDAI — irdai.gov.in (insurer list, claim-settlement data, rules, Bima Bharosa)`, `Insurance Ombudsman — cioins.co.in`, `Each insurer's policy wording and the product UIN`, `Income Tax Department — incometax.gov.in (80D / 80C / 10(10D) limits)`]
  });

  G({
    id: 'emergency', module: 'emergency', cat: 'Protect', read: '12 min read', title: 'Emergency fund — build it, place it, use it',
    summary: `How much you really need, exactly where to keep it, how to build it fastest, and the rules for using (and refilling) it.`,
    calcs: ['emergency', 'whatif-job'],
    sections: [
      [`What it is — and what it is not`, `A cash reserve for **job loss, medical gaps, urgent repairs, family emergencies**. It is **not** a holiday fund, not an investment and not money you lend to relatives. Its only job is to stop a bad month from becoming debt.`],
      [`How much — three ways to size it`,
        ['tbl', ['Your situation', 'Months of (essentials + EMIs)'], [[`Salaried, stable, no dependants`, `3–4`], [`Salaried with dependants or a home loan`, `6`], [`Variable income (sales, gig), commission`, `9–12`], [`Self-employed / business owner`, `12 (keep business and personal separate)`], [`Single-income family, no health insurance`, `12 + buy health cover now`]]],
        `**Essentials** = rent/EMI, food, utilities, school fees, insurance premiums, transport, minimum debt payments. Not shopping, travel or subscriptions.`,
        ['ex', `Essentials ₹30,000 + EMIs ₹10,000 = ₹40,000. Six months = **₹2.4 lakh**.`]],
      [`Where to keep it (so it is safe AND reachable)`,
        ['tbl', ['Place', 'Access', 'Return', 'Use for'], [[`Savings account / sweep-in FD`, `Instant`, `~2.5–7% (bank-dependent)`, `First 1–2 months`], [`Liquid mutual fund`, `Next working day`, `~6–7% (not guaranteed)`, `Months 2–4`], [`Short FD (ladder) with premature-withdrawal option`, `1–2 days, small penalty`, `~6.5–7.5%`, `Months 4–6+`], [`UPI/cash at home`, `Instant`, `0`, `Only ₹5–10k for outages`]]],
        ['warn', `Never hold the emergency fund in stocks, crypto, equity funds, real estate, chit funds or lent to friends. If it can fall 30% the day you need it, it is not an emergency fund.`]],
      [`How to build it — fastest path`,
        ['ol', `Set the target in the Emergency Fund calculator.`, `Open a **separate** savings account (ideally a different bank, no debit card) named “Emergency”.`, `Automate a transfer on salary day (pay yourself first).`, `Direct windfalls (bonus, tax refund, gifts) there until full.`, `If you have 36% card debt, build **one month** first, then clear the card, then finish the fund.`]],
      [`Rules for using it`,
        ['ul', `**Use it for:** job loss, medical costs not covered by insurance, essential home/vehicle repair, urgent family travel.`, `**Don't use it for:** discounts, down payments, investments, weddings, gadgets.`, `**Refill first:** after use, redirect your savings to the fund before any investing until it is back to target.`, `**Review yearly:** your expenses grow with inflation, so the target must grow too.`]]
    ],
    advisor: [`Build **1 month first**, then clear any debt above ~15%, then complete 6 months.`, `Split: one month in the savings account, two in a liquid fund, the rest in a 3-FD ladder (so one FD matures every few months).`, `Buy **health insurance before** sizing the fund — otherwise a single hospital bill can empty it.`, `Keep it in a bank different from your salary account to avoid casual spending.`],
    checklist: [`I know my monthly essentials + EMIs.`, `Target set (months × essentials).`, `Separate account opened with no debit card.`, `Auto-transfer on payday is live.`, `Fund is NOT in volatile assets.`, `Health insurance exists.`, `I have a refill rule after using it.`, `Target reviewed this year.`],
    verify: [`DICGC — dicgc.org.in (deposit insurance ₹5 lakh per depositor per bank)`, `AMFI — amfiindia.com (liquid fund categories)`]
  });

  G({
    id: 'scams', module: 'scams', cat: 'Protect', read: '18 min read', title: 'Financial fraud — recognise it, stop it, recover',
    summary: `The patterns behind almost every financial scam in India, the exact rules that keep your money safe, and what to do in the first hour if you are hit.`,
    sections: [
      [`The seven patterns behind nearly every scam`,
        ['ol', `**Guaranteed high return** (“2–3% a month”, “double in 12 months”). Legitimate returns always carry risk.`, `**Urgency** (“offer ends today”, “your account will be blocked”).`, `**Secrecy or authority** (“don't tell your family”, fake police/CBI/customs/RBI/bank officer).`, `**Upfront fee** to release a loan, prize, refund or “higher returns”.`, `**Asks for a secret**: OTP, UPI PIN, CVV, card number, net-banking password, remote-access app (AnyDesk/TeamViewer).`, `**Recruitment income**: you earn by bringing others (pyramid / Ponzi / MLM).`, `**Unverifiable identity**: no registered office, number from an ad, fake website, WhatsApp-only.`]],
      [`Scam types and how they work`,
        ['tbl', ['Scam', 'How it works', 'Your defence'], [
          [`OTP / vishing`, `Caller poses as bank/KYC/electricity dept, asks OTP or to install an app`, `Banks never ask OTP/PIN. Hang up, call the number on your card.`],
          [`UPI “collect” / refund scam`, `You are told to “accept” a request to receive money — accepting sends money out`, `**You never enter a PIN to receive money.**`],
          [`QR scam`, `Buyer sends a QR for you to scan “to get paid”`, `Scanning QR = paying. Only share your own QR.`],
          [`Fake customer care`, `Number from a search ad or social post`, `Use only the app's Help section or the number on the official site typed by you.`],
          [`Fake investment apps / trading groups`, `Shows fake profits, asks more deposits; withdrawal needs “tax/fees”`, `Check SEBI registration on sebi.gov.in → Intermediaries; use only exchange-linked brokers.`],
          [`Fake loan apps`, `Instant loan, huge fees, access to contacts, harassment`, `Only RBI-registered lenders (check the RBI/lender's digital-lending list).`],
          [`Ponzi / chit-fund collapse`, `Old investors paid from new money`, `Ask for Registrar of Chits / SEBI / RBI registration and check it yourself.`],
          [`Digital arrest / parcel scam`, `Fake officer says a parcel with drugs is in your name; video call; demands money`, `No agency arrests by video call or takes money to “verify”. Disconnect and call 1930.`],
          [`Job / task scam`, `Pay small amounts, earn small “commission”, then a big “deposit”`, `Real jobs never ask you to pay to work.`],
          [`SIM swap / phishing`, `SMS link to a fake bank page`, `Never click links; type the website yourself; enable alerts.`],
          [`Crypto rug pulls`, `New coin with celebrity hype; developers vanish`, `Avoid unknown coins; use regulated, long-established platforms only.`]]]],
      [`Rules that would have stopped 95% of losses`,
        ['ul', `**Never share** OTP, UPI PIN, CVV, card number, passwords, Aadhaar, PAN photos, with *anyone* — including “bank staff”.`, `**Receiving money needs no PIN; entering a PIN means money leaves.**`, `**Don't install** screen-sharing/remote apps on anyone's instruction.`, `**Verify independently:** regulator website → registration number → call the number you looked up.`, `**Wait 24 hours** before any investment or payment you were pressed into.`, `Set **daily UPI/card limits** low; keep a separate low-balance account for apps.`, `Turn on **transaction alerts**, use **biometric** lock, keep the OS and apps updated.`, `Use a **strong unique password** per important account and a password manager; add 2-step verification.`]],
      [`If you have been scammed — the first hour`,
        ['ol', `**Call 1930** (National Cyber Crime Helpline) immediately — the sooner, the better the chance of freezing the money. Then file at **cybercrime.gov.in**.`, `Call your **bank's fraud helpline** and block cards/UPI/net banking; ask them to raise a dispute and note the complaint number.`, `**Change passwords** and PINs; remove remote-access apps; run a device scan.`, `**Preserve evidence:** screenshots, numbers, transaction IDs, chat, website address.`, `File a **police complaint/FIR**; keep copies. Write to the bank in 3 days — under RBI rules, customer liability is limited/zero when you report promptly for unauthorised transactions (verify your case).`, `For investment frauds also complain on **SEBI SCORES** (scores.sebi.gov.in).`]],
      [`Protecting your identity`,
        ['ul', `Share Aadhaar/PAN only with regulated entities; use **masked Aadhaar**; lock biometrics on the UIDAI site/app when not needed.`, `Check your **credit report** at least once a year for loans you did not take.`, `Shred documents with account numbers; don't post tickets, cards, cheques online.`, `Don't use public Wi-Fi for banking; check the address bar and padlock.`]]
    ],
    advisor: [`Make three rules **non-negotiable**: no OTP/PIN sharing, no payments under pressure, no investment without verified registration.`, `Keep a **low daily limit** on UPI and keep most money in a separate account.`, `Teach parents and grandparents the “receive money needs no PIN” rule — they are the most targeted.`, `Save **1930** and your bank's fraud number in your phone today.`],
    checklist: [`1930 and bank fraud helpline saved in contacts.`, `UPI daily limit lowered.`, `Transaction alerts on for all accounts.`, `No remote-access apps installed.`, `2-step verification on email and bank.`, `Family knows the “no PIN to receive” rule.`, `I checked my credit report this year.`, `I know how to verify SEBI/RBI registration.`],
    verify: [`National Cyber Crime Portal — cybercrime.gov.in, helpline 1930`, `SEBI — sebi.gov.in (registered intermediaries), scores.sebi.gov.in`, `RBI — rbi.org.in, sachet.rbi.org.in (check deposit takers)`]
  });

  G({
    id: 'banking', module: 'banking', cat: 'Money basics', read: '22 min read', title: 'Banking — accounts, interest rates, FDs and payments',
    summary: `Every type of bank account and deposit, how interest is really calculated, which banks pay what (enter your own rates in the Bank Rates Book), and the identifiers and fees to watch.`,
    calcs: ['fd', 'rd', 'compound'], tools: [['Bank Rates Book', '#/tool/bankrates']],
    sections: [
      [`Types of accounts`,
        ['tbl', ['Account', 'Best for', 'Points to know'], [[`Savings`, `Day-to-day money`, `Interest on daily balance; minimum-balance rules; limits on free transactions`], [`Salary`, `Employees`, `Often zero-balance; freebies (lounge, insurance); converts to normal savings if salary stops ~3 months`], [`Basic / BSBDA (zero balance)`, `Low-income, first account`, `Limited free withdrawals`], [`Current`, `Businesses`, `No interest; higher charges; overdraft facility`], [`Joint`, `Couples/parents`, `“Either or survivor” vs “jointly” — choose operating mode deliberately`], [`Senior-citizen savings`, `60+`, `Higher FD rates (+0.25–0.75%)`], [`Minor account`, `Children`, `Guardian operates until 18`], [`NRE / NRO / FCNR`, `NRIs`, `Different tax and repatriation rules`], [`Small finance / payment banks`, `Higher rates, niche`, `Check DICGC cover; payment banks have deposit caps`]]]],
      [`Identifiers you will meet (and what they mean)`,
        ['ul', `**Account number** — unique to you at that bank. **CIF / customer ID** — your profile across accounts.`, `**IFSC** — 11 characters: 4 letters (bank), a zero, 6 characters (branch). Needed for NEFT/RTGS/IMPS to another bank.`, `**MICR** — 9-digit code at the bottom of a cheque identifying city, bank, branch.`, `**UPI ID / VPA**, **mobile number**, **debit card** (16 digits + CVV — never share), **nominee**.`, `**Cheque details:** payee, amount in words and figures, date, signature; **crossing** (A/c payee only) prevents misuse.`]],
      [`Payments: which rail for what`,
        ['tbl', ['Method', 'Speed', 'Limit/charges', 'Use for'], [[`UPI`, `Instant, 24×7`, `Usually ₹1 lakh/day (₹5 lakh for some categories); mostly free`, `Everyday payments`], [`IMPS`, `Instant`, `Up to ₹5 lakh; small fee`, `Urgent transfers`], [`NEFT`, `Batches (near real-time now)`, `No minimum; cheap`, `Normal transfers`], [`RTGS`, `Real time`, `Min ₹2 lakh`, `Large payments, property`], [`Cheque / DD`, `1–3 days`, `Bounce penalty`, `Rent, formal payments`]]]],
      [`Fixed deposits (FD): every detail`,
        ['ul', `**Cumulative** (interest reinvested; paid at maturity) vs **non-cumulative** (monthly/quarterly payout — lower total but gives income).`, `Interest usually **compounds quarterly**: ₹1 lakh at 7.5% for 5 years → ₹1,44,995.`, `**Premature withdrawal** usually costs 0.5–1% of rate. Some banks allow partial withdrawal or loan against FD (rate ≈ FD rate + 1–2%).`, `**Tax-saver FD** (5-year lock-in, 80C in old regime): no early exit.`, `**Senior citizen** FDs give extra interest. **Auto-renewal**: check the renewal rate and set a reminder.`, `**TDS**: bank deducts 10% if interest exceeds the threshold (₹50,000 a year per bank for others, ₹1 lakh for seniors from FY 2025-26 — verify); submit **Form 15G/15H** if your total income is below the taxable limit. TDS is only advance tax: FD interest is taxed at your slab.`],
        ['ex', `30% slab: 7.5% FD → ~5.2% after tax → after 6% inflation your money barely grows. FDs protect capital; they do not build wealth over decades.`]],
      [`Which bank pays what — and why`,
        `Rates differ by bank type and change several times a year: **PSU banks** (steady, highly trusted), **private banks** (slightly higher), **small finance banks** (highest, newer, smaller). All are RBI-regulated; deposits up to **₹5 lakh per depositor per bank** (principal + interest) are insured by **DICGC**. Cooperative banks are riskier — check they are DICGC-insured and RBI-licensed.`,
        ['tip', `Open **Bank Rates Book**: it already lists ten banks with representative rates — replace them with your banks' current numbers and let the app rank them for your amount, tenure and tax slab. Update it at the start of every financial year.`]],
      [`Building an FD ladder`,
        `Instead of one big FD, split into several with staggered maturities so one matures every 6–12 months: liquidity + reinvestment at current rates.`,
        ['ex', `₹6 lakh in 3 FDs of ₹2 lakh each: 1-year, 2-year, 3-year. When the 1-year matures, reinvest for 3 years so a maturity arrives every year. Each ≤ ₹5 lakh per bank keeps principal insured.`]],
      [`Fees and traps`,
        ['ul', `**Minimum-balance penalty**, SMS/debit-card/annual fees, cheque-book charges, ATM beyond free limits, cash-handling fees.`, `**Sweep-in** FDs can be good (interest on idle balance) but check the minimum trigger amount.`, `**Mis-selling at the branch**: insurance/mutual funds pushed to depositors — you may refuse.`, `**Stale accounts** become inoperative/dormant after 2 years without transactions.`, `**Nominee** missing → heirs face long paperwork.`]]
    ],
    advisor: [`Keep **1–2 months** of expenses in a sweep-in/high-interest savings account; more in a short FD ladder and liquid fund.`, `Spread deposits so each bank holds ≤ ₹5 lakh (principal + interest) unless it is a large PSU bank you are comfortable with.`, `Use **senior-citizen** rates for parents' money by opening the FD in the senior's name (watch the tax impact).`, `Compare rates with the Bank Rates Book every financial year — a 0.5% gap on ₹10 lakh is ₹5,000 a year.`, `Use FDs for goals **under 3 years**; for longer goals, PPF/EPF/equity funds beat FDs after tax and inflation.`, `Add a **nominee** to every account and FD; keep one account with only you + spouse joint.`],
    checklist: [`Nominee added on all accounts and FDs.`, `Bank Rates Book updated this financial year.`, `No bank holds more than ₹5 lakh of mine unless I chose that deliberately.`, `FD renewal dates are in Reminders.`, `Form 15G/15H submitted if eligible.`, `UPI/IMPS limits set to what I actually need.`, `Dormant accounts closed or kept active.`, `I know my IFSC, account number and CIF (stored safely).`],
    verify: [`RBI — rbi.org.in`, `DICGC — dicgc.org.in`, `Each bank's website “Interest rates” page`]
  });

  G({
    id: 'cards', module: 'cards', cat: 'Credit & Debt', read: '20 min read', title: 'Credit cards — use them like a pro, never pay interest',
    summary: `How billing really works, every charge, how rewards are worth it (or not), EMI conversions, limits, and the exact habits that keep cards free.`,
    calcs: ['cardpay', 'utilization'],
    sections: [
      [`How a credit card actually works`,
        `The bank lends you money for up to ~45–50 days **interest-free** *if* you pay the **total due** by the due date. Any shortfall attracts interest (≈ 3–3.75% a month, 36–45% a year) **from the purchase date**, and the interest-free period on new purchases disappears until you clear the balance.`,
        ['tbl', ['Term', 'Meaning'], [[`Billing cycle / statement date`, `Purchases between two statement dates are billed together`], [`Due date`, `Usually 15–20 days after the statement`], [`Total due`, `Everything you owe — pay this to pay no interest`], [`Minimum due`, `~5% of balance — avoids late fee but interest runs on the rest`], [`Credit limit / available limit`, `Maximum you can borrow / what remains now`], [`Cash advance`, `ATM withdrawal: fee (~2.5%) + interest from day one`], [`Revolving credit`, `Carrying an unpaid balance month to month`]]]],
      [`The minimum-due trap`,
        ['ex', `Balance ₹1,00,000 at 42%: paying only the minimum (5%) takes **many years** and costs several lakhs in interest. Paying a fixed ₹10,000 clears it in about 14–15 months. Use the Credit Card Repayment Simulator with your own numbers.`],
        ['warn', `Converting a large purchase into EMI is a loan: check the processing fee, GST on interest and the interest rate (often 13–18%). “No-cost EMI” usually hides the interest in a lost discount.`]],
      [`Fees to read in the Most Important Terms`,
        ['ul', `**Joining/annual fee** (often waived on spend thresholds), **late payment fee** (slab-based), **over-limit fee**, **cash-advance fee**, **foreign-currency mark-up (~3.5%)**, **fuel surcharge** waivers (capped), **reward-redemption fee**, **GST 18% on every fee and interest**.`, `**Card replacement, duplicate statement, cheque-pick-up** fees.`]],
      [`Rewards — are they worth it?`,
        ['ul', `Reward value = (points × value per point) ÷ spend. Typical real value: **0.5–2%** of spend. One month of 3.5% interest cancels a year of rewards.`, `Caps and exclusions (rent, wallets, fuel, insurance, government payments, EMI) often earn nothing.`, `**Lifetime-free cards** are usually best for most people. Paying ₹5,000 annual fee needs >₹5,000 of real benefits you'd use anyway.`, `**Co-branded cards** (airline, e-commerce) help only if you are loyal to that brand.`]],
      [`Credit utilisation and your score`,
        `Utilisation = outstanding ÷ limit. Lenders like to see you using **well under ~30%** at statement time. Paying before the statement date lowers the reported utilisation. Asking for a limit increase (without extra spending) lowers utilisation automatically.`],
      [`Safety on cards`,
        ['ul', `Never share card number + CVV + expiry + OTP; set **per-transaction and international limits** in the app; switch **off online/international/contactless** when not needed.`, `Use **tokenisation** for saved cards; don't save cards on unknown sites.`, `Dispute unknown charges within 3 days; keep the complaint number.`, `A lost card: block it in the app immediately, then request a replacement.`]],
      [`How many cards do you need?`,
        `One or two. The first card builds your credit history; a second, no-fee backup covers outages. More cards means more fees to track, more temptation and more chances of missing a due date. **Closing your oldest card** can shorten your credit age — prefer downgrading to lifetime-free.`]
    ],
    advisor: [`Set **autopay for the total due** (not minimum) on every card today.`, `Spend only what you could pay from the account right now; treat the card as a debit card with a 45-day float.`, `Choose a **lifetime-free card** unless you can show that rewards exceed the fee for your real spend.`, `Never withdraw cash on a card; avoid EMI conversion unless the rate is clearly lower than alternatives.`, `If you carry a balance, stop using the card and clear it ahead of any investing (it is a guaranteed ~40% return).`, `Review annually: downgrade or close cards you don't use **after** checking the effect on credit age.`],
    checklist: [`Autopay set for the total due on each card.`, `I know statement and due dates (in Reminders).`, `No cash advances.`, `International/online limits set in the app.`, `Utilisation below 30% at statement date.`, `I have read fees/MITC of each card.`, `I have at most two cards.`, `Any balance being carried has a payoff plan.`],
    verify: [`RBI master directions on credit cards — rbi.org.in`, `Your card's Most Important Terms and Conditions (MITC)`]
  });

  G({
    id: 'score', module: 'score', cat: 'Credit & Debt', read: '15 min read', title: 'Credit score & report — how lenders judge you and how to improve it',
    summary: `What is in your credit report, what moves your score, how to read it, fix mistakes, and the steps to rebuild from a low score.`,
    calcs: ['utilization', 'dti'],
    sections: [
      [`Credit score vs credit report`,
        `Your **credit report** is a history of every loan and card — balances, payments, enquiries — held by credit bureaus (**CIBIL/TransUnion, Experian, Equifax, CRIF High Mark**). Your **score** (typically 300–900) is a number computed from that report. Each bureau's score can differ a little. You can get **one free report per bureau per year**.`],
      [`What moves the score (commonly cited factors)`,
        ['tbl', ['Factor', 'What helps', 'What hurts'], [[`Payment history (largest)`, `Every EMI/bill on time`, `Late payments, defaults, settlements, write-offs`], [`Credit utilisation`, `Use under ~30% of card limits`, `Maxed-out cards`], [`Credit age`, `Keep old accounts open`, `Closing the oldest card`], [`Credit mix`, `A healthy mix of secured and unsecured`, `Only unsecured loans`], [`New enquiries`, `Few, spaced-out applications`, `Many applications in a short time (“hard enquiries”)`]]],
        ['tip', `“Settled” on your report is **not** good — it means you paid less than owed. “Closed” and “paid” are fine. Try to get accounts marked “closed – paid in full”.`]],
      [`Reading your report`,
        ['ul', `**Personal details:** verify name, PAN, address, DOB — errors cause rejections.`, `**Account list:** each shows type, lender, open date, limit/loan amount, balance, **DPD** (days past due) history month by month.`, `**Enquiries:** who checked and when. Multiple loan enquiries look like credit hunger.`, `**Red flags:** accounts you don't recognise (identity theft or lender error), wrong “overdue”, duplicated loans.`]],
      [`Fixing errors`,
        ['ol', `Download the report; note the wrong entry.`, `Raise a **dispute on the bureau's portal** with proof (closure letter, statements).`, `The bureau asks the lender to verify within ~30 days; follow up with the lender's nodal officer.`, `If unresolved, escalate to the RBI Ombudsman.`]],
      [`Rebuilding a low score — a 12-month plan`,
        ['ol', `Pay **every** EMI and card bill on time (autopay).`, `Clear overdue amounts first; avoid “settlement”.`, `Bring utilisation under 30%.`, `No new loan applications for 6 months.`, `If you have no history: a **secured card against an FD** or a small loan repaid on time builds a record.`, `Check progress every 3 months.`],
        `Typical cut-offs: 750+ gets the best loan rates; 700–749 is fine; below 650 limits options and raises interest. It takes **6–12 months** of clean behaviour to see a big change.`],
      [`How the score affects your money`,
        ['ex', `₹50 lakh home loan for 20 years: 0.5% lower rate for a 780 score vs a 680 score saves roughly ₹3.5 lakh in interest. Your score is literally worth lakhs.`]]
    ],
    advisor: [`Download your free report from **each bureau once a year** and fix errors immediately.`, `Autopay all EMIs and cards; keep utilisation under 30%.`, `Apply for new credit only when needed; one application at a time.`, `Never guarantee a stranger's loan — it appears on your report as yours.`, `Keep your oldest card open (downgrade to free).`],
    checklist: [`Downloaded this year's free report from all bureaus.`, `No unknown accounts or wrong details.`, `All EMIs and cards on autopay.`, `Utilisation under 30%.`, `No settlements/write-offs on my report (or a plan to clear).`, `No stacked loan applications.`, `I checked my score before applying for a home loan.`],
    verify: [`CIBIL — cibil.com`, `RBI Integrated Ombudsman — cms.rbi.org.in`]
  });
})();
