/* guides-2.js — BORROW & BUY: loans, EMI/debt, vehicle, property, education, marriage, children */
window.FOS = window.FOS || {};
(function () {
  'use strict';
  const G = FOS.G;

  G({
    id: 'loans', module: 'loans', cat: 'Credit & Debt', read: '28 min read', title: 'Loans — every type, real cost, documents and negotiation',
    summary: `Home, personal, vehicle, education, gold, business, against-property and more: how each is priced, what the bank checks, the papers you need, and how to pay the least.`,
    calcs: ['emi', 'loancost', 'prepayment', 'dti'], tools: [['Compare loans', '#/tool/loancompare'], ['Bank Rates Book', '#/tool/bankrates']],
    sections: [
      [`Secured vs unsecured — the one idea that sets the price`,
        `A **secured** loan has collateral (house, vehicle, gold, FD, shares): the bank can sell it if you don't pay, so the rate is low. An **unsecured** loan (personal loan, card, consumer durable) has nothing behind it, so the rate is high.`,
        ['tbl', ['Loan', 'Typical rate (illustrative)', 'Tenure', 'Collateral'], [
          [`Home loan`, `8.3–9.5%`, `up to 30 yrs`, `The property`],
          [`Loan against property`, `9–12%`, `up to 15–20 yrs`, `Property you own`],
          [`Vehicle – car`, `8.5–11%`, `up to 7 yrs`, `The vehicle (hypothecation)`],
          [`Vehicle – two-wheeler`, `10–18%`, `1–5 yrs`, `The vehicle`],
          [`Education loan`, `8.5–13%`, `course + 1 yr moratorium, 10–15 yr repay`, `Often none under ₹7.5 L; co-borrower needed`],
          [`Gold loan`, `9–24%`, `3–36 months`, `Gold (LTV ≤ 75%)`],
          [`Loan against FD / shares / MF`, `FD rate +1–2% / 10–12%`, `flexible (overdraft)`, `The security itself`],
          [`Personal loan`, `11–24%`, `1–5 yrs`, `None`],
          [`Credit card EMI / BNPL`, `13–42%`, `3–24 months`, `None`],
          [`Business / MSME loan`, `10–20%`, `1–7 yrs`, `Varies; CGTMSE guarantee can waive it`]]],
        ['tip', `Rates above are **illustrative ranges** — replace with real ones in the Bank Rates Book → Loans tab.`]],
      [`What really decides your rate`,
        ['ul', `**Credit score** (750+ gets the best offers), **income stability** (salaried in a listed/large company beats a new business), **existing EMIs** (FOIR — fixed obligations to income ratio; banks like < 40–50%), **loan-to-value** (how much of the asset's value they finance), **relationship/salary account**, and **the lender type** (PSU, private, HFC, NBFC, fintech).`, `**Floating rates on home loans are linked to an external benchmark** (usually the RBI repo rate) under RBI rules. When the repo falls, your rate should fall within the reset period — check your loan letter for the **spread** and reset date.`]],
      [`The true cost of a loan`,
        ['ul', `**Interest** is only part. Add **processing fee** (0.25–2% + GST), **documentation / legal / valuation fees**, **insurance** the bank pushes (credit-life), **prepayment or foreclosure charges** (zero on floating-rate loans for individuals; fixed-rate loans can carry 2–5%), **late-payment penalties**, **part-payment limits**, **cheque-swap/ECS bounce charges**.`, `**APR / IRR** on the sanction letter includes more costs than the headline rate. Compare total outflow, not the EMI.`],
        ['ex', `₹10 lakh personal loan: 14% for 4 years → EMI ≈ ₹27,326; total paid ≈ ₹13.12 L. With 2% + GST processing (₹23,600) and a 12% rate competitor at 0.5% fee, the cheaper loan saves ≈ ₹1 L.`]],
      [`Reducing-balance vs flat interest`,
        `EMI loans charge interest on the **outstanding** balance each month. “Flat” rates (common in two-wheeler and informal loans) charge interest on the **original** amount for the whole term — a 9% flat rate is actually roughly **16–17%** reducing-balance. Always ask for the **IRR**.`],
      [`Documents the bank asks for (keep a digital folder)`,
        ['ul', `**Identity & address:** PAN, Aadhaar, passport/driving licence, recent utility bill, rent agreement.`, `**Income (salaried):** last 3 months' payslips, 6–12 months' salary-account statement, Form 16, last 2–3 years' ITR with computation, employment letter.`, `**Income (self-employed):** 2–3 years' ITR with audited financials/balance sheet, GST returns, bank statements of 12 months, business proof (Udyam, shop act).`, `**Property loans:** sale agreement, title documents, encumbrance certificate, approved plan, tax receipts, builder's RERA number/allotment letter.`, `**Vehicle loans:** proforma invoice, KYC, income proof, RC after registration.`, `**Photos, signature verification, cheques (post-dated / ECS / NACH mandate).**`]],
      [`How approval works — step by step`,
        ['ol', `**Eligibility check:** income, score, existing EMIs → maximum EMI ≈ 40–50% of net income minus other EMIs.`, `**Application + documents** → credit bureau pull (a hard enquiry on your report).`, `**Appraisal / valuation / legal check** for secured loans.`, `**Sanction letter** — read interest type, spread, reset date, fees, penalties, tenure, EMI, moratorium, insurance.`, `**Agreement & mandate** → **disbursement** (to the seller/builder for home and vehicle loans).`, `**Post-disbursal:** first EMI date, loan account number, statement access. On full repayment collect **NOC / No-Dues certificate** and the **original property papers back** (deadline: within 30 days under RBI rules, compensation of ₹5,000/day for delays).`]],
      [`Home loans — the extra detail`,
        ['ul', `**LTV limits (RBI):** up to 90% for loans ≤ ₹30 L, 80% for ₹30–75 L, 75% above ₹75 L. The rest is your **down payment** (plus stamp duty and registration, which banks don't fund).`, `**Tax (old regime):** interest up to ₹2 L a year on a self-occupied home (24(b)), principal within 80C (₹1.5 L), stamp duty in year of payment (80C). Joint loans allow each co-borrower to claim their share.`, `**Tenure vs EMI:** a longer tenure cuts EMI but multiplies interest; pay as if the tenure were shorter via prepayments.`, `**Balance transfer:** if another lender is 0.5%+ cheaper and years remain, transfer — but include the new fee.`, `**Insurance:** term life cover equal to the loan protects the family from losing the house.`, `**Pre-EMI** interest during construction: you pay only interest on the amount disbursed so far.`],
        ['ex', `₹50 lakh, 20 years: at 8.5% EMI ≈ ₹43,391, total interest ≈ ₹54.1 L. Paying one extra EMI a year cuts the tenure to roughly 16.5 years and saves about ₹14 L.`]],
      [`Personal loans and gold loans`,
        ['ul', `**Personal loan:** use only for genuine emergencies or to replace higher-cost debt. Check if the bank adds hidden insurance. Avoid loans for consumption.`, `**Gold loan:** quick, low documentation, but there is a risk of auction on default and some NBFCs charge high rates. Check the purity test method and storage insurance; take a **bullet repayment** only if you have the lump sum.`]],
      [`Education, vehicle and business loans`,
        ['ul', `**Education loan:** interest under 80E (old regime) is fully deductible for 8 years. Moratorium during study is subsidised for eligible schemes (PM-Vidyalaxmi, CSIS for economically weaker students — verify). Pay the simple interest during the course to prevent compounding.`, `**Vehicle loan:** see the Vehicle guide — the bank's hypothecation stays on the RC until closed.`, `**Business loan:** Mudra (Shishu ≤ ₹50k, Kishore ≤ ₹5 L, Tarun ≤ ₹10 L) — collateral free under PMMY; CGTMSE covers collateral-free loans for MSEs up to ₹5 crore. Keep business and personal accounts separate.`]],
      [`Negotiation and smart repayment`,
        ['ul', `Get **2–3 offers in writing**. Use them to ask for a lower spread, processing-fee waiver, and free part-prepayment.`, `**Pay EMIs on autopay**; keep a buffer of 1 EMI in the account.`, `**Step up EMIs** when your income grows (10% a year) — it slashes interest.`, `**Prioritise prepayment** on the highest-rate loan first (avalanche) unless a smaller loan's psychological win helps you (snowball).`, `**Never** take a new loan to pay an EMI — that is a debt spiral.`]],
      [`Red flags`,
        ['ul', `Loans with “guaranteed approval” + an upfront fee to a person, not to a bank account of a registered lender.`, `Apps asking for contacts/gallery access.`, `Agreements with blanks, a cheque signed and left blank, or the original property papers held without receipts.`, `Agents demanding cash commissions.`]]
    ],
    advisor: [`Borrow only for **assets that pay or protect you** (home you live in, education, business). Avoid borrowing for lifestyle.`, `Keep total EMIs ≤ 35–40% of take-home pay; aim for ≤ 30%.`, `Clear any debt above ~12% before investing in anything except the emergency fund and insurance.`, `For a home loan: 20%+ down payment, floating rate, tenure as long as cheap but **prepay to finish earlier**, and a term cover equal to the loan.`, `Insist on the **sanction letter and all fee lines** before paying anything; compare APR.`, `Always collect **NOC and original papers** on closure and check that your credit report shows “Closed”.`],
    checklist: [`My EMIs (all loans) are < 35–40% of take-home.`, `I compared at least 3 lenders in writing, with APR.`, `I read the sanction letter: rate type, spread, reset, fees.`, `Prepayment is free/allowed and I have a plan to use it.`, `I have term insurance that covers this loan.`, `Autopay is set and 1 EMI buffer is kept.`, `I know the documents to collect at closure (NOC, originals).`, `No upfront fee paid to an individual.`],
    verify: [`RBI — rbi.org.in (floating-rate benchmark rules, recovery rules)`, `Bank/NBFC websites for current rate cards`, `Income Tax — 24(b), 80C, 80E, 80EEA details`, `Mudra — mudra.org.in; CGTMSE — cgtmse.in`]
  });

  G({
    id: 'emi', module: 'emi', cat: 'Credit & Debt', read: '14 min read', title: 'EMI and debt payoff — the math, the strategy, the exit',
    summary: `How an EMI splits between interest and principal, why early years are expensive, prepayment math, snowball vs avalanche and how to get out of debt quickly.`,
    calcs: ['emi', 'amortization', 'prepayment', 'debtpayoff', 'whatif-emi'],
    sections: [
      [`The EMI formula`,
        `EMI = P × r × (1+r)ⁿ ÷ ((1+r)ⁿ − 1), where P = principal, r = annual rate ÷ 12 ÷ 100, n = months. Each month: interest = outstanding × r; principal repaid = EMI − interest.`,
        ['ex', `₹10 lakh at 9% for 20 years: EMI ≈ ₹8,997. First month: interest ₹7,500, principal only ₹1,497. In year 15 the split is roughly reversed. That is why the first years feel like only interest.`]],
      [`What makes a loan expensive`,
        ['ul', `**Rate** — 1% extra on a 20-year ₹50 L loan adds ≈ ₹6–7 lakh in interest.`, `**Tenure** — doubling tenure from 10 to 20 years nearly doubles interest.`, `**Timing** — interest is front-loaded, so a prepayment in the first years saves far more than one in the last years.`]],
      [`Prepayment: two ways`,
        ['ul', `**Reduce tenure** (keep EMI same): saves the most interest.`, `**Reduce EMI** (keep tenure): improves cash flow; saves less.`, `Floating-rate loans have no prepayment penalty for individuals; still confirm in writing.`],
        ['ex', `₹50 L, 8.5%, 20 yrs: a one-time ₹5 lakh prepayment in year 2 saves roughly ₹10 lakh of interest and ~3.5 years.`]],
      [`Snowball vs avalanche`,
        ['tbl', ['Method', 'How', 'Pros', 'Cons'], [[`Avalanche`, `Pay extra on the highest-rate debt first`, `Minimum interest cost`, `Slow first win`], [`Snowball`, `Pay extra on the smallest balance first`, `Quick wins, motivation`, `Slightly more interest`]]],
        `Rule: if the highest-rate debt is also small, the two methods are the same. Otherwise pick the one you'll stick to; the difference is usually small compared to not doing either.`],
      [`Debt-trap signals`,
        ['ul', `Paying the minimum on cards; taking a loan to pay a loan; EMIs > 50% of income; borrowing for monthly groceries; hiding loans from family.`, `**Exit plan:** list every debt (balance, rate, EMI) → stop new borrowing → emergency 1 month → avalanche with every spare rupee → use windfalls → talk to the lender about restructuring **before** missing a payment.`]],
      [`Consolidation and balance transfer`,
        `Replacing several high-rate debts with one lower-rate loan works **only if** total cost (fees + interest) is lower, and you don't then run the cards up again. Compare using Loan Compare.`]
    ],
    advisor: [`Make a one-page list of all debts with rate; attack the highest with every spare rupee.`, `Increase your EMI by the amount of each raise; it shortens tenure.`, `Treat each bonus as a prepayment opportunity on anything above your expected investing return (after tax) — roughly 9–10%.`, `Below ~8%, with a stable job, the mathematically better choice may be investing — but a debt-free mind has value; choose consciously.`],
    checklist: [`Debt list with rates is complete.`, `Autopay on every EMI.`, `No new unsecured debt this year.`, `Extra payments target the highest rate.`, `Prepayment preference (tenure/EMI) decided.`, `Statements reviewed every 6 months.`],
    verify: [`Your lender's loan statement and foreclosure statement`, `RBI — rbi.org.in`]
  });

  G({
    id: 'vehicle', module: 'vehicle', cat: 'Plan & Buy', read: '45 min read', title: 'Buying & owning a bike or car — every document, number and cost',
    summary: `New or used, two-wheeler or car: chassis number, engine number, RC, hypothecation, transfer forms, insurance, HSRP, FASTag, PUC, challans, inspection checklist, true cost and the 20/4/10 rule.`,
    calcs: ['car', 'afford', 'loancost'], tools: [['Records (store RC, insurance)', '#/tool/records']],
    sections: [
      [`Decide before you look: can you afford it?`,
        ['ul', `**20/4/10 rule (cars):** ≥ 20% down, loan ≤ 4 years, total vehicle costs (EMI + fuel + insurance + maintenance) ≤ 10% of gross income. For two-wheelers, total monthly cost ≤ 5–6% of take-home.`, `**True cost** = on-road price + fuel + service + tyres + insurance renewal + parking/toll − resale value. A ₹1.2 lakh bike costs ~₹25–30k a year to run.`, `**Depreciation:** new cars lose 10–15% in year 1 and ~50% in 5 years; bikes 15–25% in year 1.`, `Compare new vs 2–3-year-old used — the first owner takes the biggest hit.`]],
      [`The numbers that identify a vehicle`,
        ['tbl', ['Identifier', 'Where found', 'Why it matters'], [
          [`**Registration number** (plate)`, `Plate, RC, insurance, challans`, `Format KA-01-AB-1234: state, RTO code, series, number. Legal identity of the vehicle; BH series for transferable registration.`],
          [`**Chassis number / VIN** (17 characters, no I, O, Q)`, `Stamped on the frame (bike: neck of the frame or near the engine; car: near windshield / door jamb / engine bay) and printed on the RC`, `The vehicle's permanent fingerprint. Decode: first 3 = maker (WMI), next 6 = model/body/engine (VDS), last 8 = year, plant, serial (VIS). **Must match RC, insurance, and invoice.**`],
          [`**Engine number**`, `Stamped on the engine block; printed on RC`, `Changes if the engine is replaced — the change must be recorded in the RC. Mismatch = red flag for a stolen or tampered vehicle.`],
          [`**Model year / month of manufacture**`, `Chassis plate, RC`, `Determines IDV, resale and age-based rules (NGT 10-yr diesel / 15-yr petrol in Delhi NCR).`],
          [`**Colour, fuel type, seating, cubic capacity**`, `RC`, `Must match physical vehicle; changes need RTO endorsement.`],
          [`**Owner serial** (1st, 2nd owner)`, `RC`, `Every transfer increases it; resale value drops.`]]],
        ['warn', `Before buying used, **physically compare** the chassis and engine numbers with the RC (take a pencil rubbing or photo). If they don't match or look re-punched, walk away.`]],
      [`Documents for a NEW vehicle`,
        ['ol', `**Tax invoice** from the dealer (with chassis & engine number), **Form 21** (sale certificate), **Form 22** (roadworthiness/emission conformity) — the dealer prepares these.`, `**Insurance** cover note (comprehensive + TP), **PUC** for an existing-fuel vehicle (new vehicles get a 1-year exemption).`, `**Address & ID proof** of the buyer, passport photos, **Form 20** (application for registration) with road tax paid.`, `**Hypothecation** if loan: Form 34 is filed with the RTO to show the bank's interest.`, `**Temporary registration** (valid up to 1 month) → **RC** issued by the RTO (smart card / DigiLocker) and **HSRP** (High Security Registration Plate) with colour-coded sticker.`, `**Road tax (one-time for private vehicles in most states; annual for commercial)** — rates vary by state (e.g. 10–20% of ex-showroom for cars; verify your state).`],
        ['tip', `On-road price = ex-showroom + road tax + registration + insurance + HSRP + handling + optional extras + FASTag (cars). Ask the dealer for an itemised quote and strike anything optional you didn't ask for (extended warranty bundles, accessories packages).`]],
      [`The RC (Registration Certificate) — read every field`,
        ['ul', `Registration number and date, **owner name and father/spouse name, address**, class of vehicle (MCWG, LMV…), maker and model, **chassis number**, **engine number**, fuel, colour, seating, unladen weight, **hypothecation to (bank)**, RC **validity (15 years for private vehicles, renewed for 5-year blocks)**, and the **registering authority**.`, `**Smart-card RC** has a chip + QR. You can store a digital copy in **DigiLocker / mParivahan** — legally valid for police checks.`, `**A vehicle with hypothecation** cannot be sold until the bank issues **Form 35** (hypothecation termination) and the RC is endorsed/cleared.`]],
      [`Buying a USED bike or car — the safe procedure`,
        ['ol', `**Check the paperwork** first: original RC, valid insurance, PUC, service history, Form 29/30 (seller signed), **NOC from the bank** if loan was taken, tax receipts, **FASTag** linked (car).`, `**Verify online:** on the Parivahan / VAHAN “Know your vehicle” and the mParivahan app enter the registration number — compare owner, model, fuel, chassis last digits, insurance validity, pending challans/blacklist.`, `**Inspect the vehicle:** chassis/engine numbers vs RC; frame rust or welds; uneven paint; oil leaks; tyre wear; odometer vs service records; engine cold start, clutch, brakes, suspension, electricals; test ride 10–15 km; check for flood damage (damp smell, mud in corners).`, `**Hire a mechanic** or use a pre-purchase inspection service (₹500–1,500) — cheapest insurance against a lemon.`, `**Price:** use market-value guides (dealer quotes, online marketplaces) and subtract repairs/pending service. Confirm whether the quoted price includes transfer costs.`, `**Payment:** bank transfer to the registered owner only; never cash. Get a stamped **sale agreement / receipt** (name, chassis & engine number, price, date, odometer).`, `**Transfer:** within **14 days** sign **Form 29** (notice of transfer) and **Form 30** (application for transfer of ownership) — both seller and buyer. Buyer submits to the RTO where the vehicle is registered (or the new RTO if moving states).`, `**Deadlines:** notify the RTO within **14 days** of sale (seller) and apply for the transfer within **30 days** (buyer) — late fees and liability for challans follow the registered owner, so the seller must file Form 29.`, `**Insurance:** have the policy transferred into your name within 14 days (or buy a new one); NCB stays with the previous owner unless they transfer it to you.`]],
      [`Inter-state purchase & NOC`,
        ['ul', `**NOC (Form 28)** from the original RTO lets a vehicle be re-registered in a new state.`, `Within **12 months** of relocation, apply for new registration (Form 27) in the new state and pay the difference in road tax; refund of unused tax from the previous state may be claimable.`, `**BH series** registration avoids re-registration for people who transfer between states (government, defence, private firms in 4+ states).`]],
      [`Hypothecation, loans and closure`,
        ['ul', `The bank's name is written on the RC as **hypothecated to** (Form 34). You own the vehicle but the bank has a lien until repayment.`, `On closure collect the **loan closure letter + Form 35 + original Form 34** and deliver to the RTO for removal of hypothecation. **Keep the stamped receipt**; verify the RC afterwards.`, `Never buy a vehicle with a visible hypothecation entry unless the bank's NOC and Form 35 are given and RC is updated.`]],
      [`Insurance, PUC, HSRP, FASTag — the running compliance`,
        ['tbl', ['Item', 'Validity', 'If missing'], [
          [`Third-party insurance`, `1 year (long-term for new: car 3 yrs, two-wheeler 5 yrs)`, `Fine ₹2,000 / jail up to 3 months for first offence; uninsured accident costs are personal`],
          [`PUC (Pollution Under Control)`, `6–12 months (petrol/CNG 1 yr, diesel 6 months in some states)`, `Fine up to ₹10,000 in some states; no insurance renewal in some cases`],
          [`HSRP`, `Permanent (plate + sticker)`, `Fine ₹1,000+; must be affixed at authorised centres`],
          [`FASTag (cars)`, `Prepaid wallet; link to vehicle`, `Double toll on FASTag-less lanes; KYC must match the RC`],
          [`Driving licence`, `20 yrs / till 40 then 10 / 5 yrs after 50`, `Driving without: fine ₹5,000 and possible jail`],
          [`Fitness certificate (commercial)`, `1–2 years`, `Fine; permit can be cancelled`]]],
        `All are digital: keep **DigiLocker / mParivahan** copies.`],
      [`Challans, accidents and police`,
        ['ul', `Check **e-challans** at echallan.parivahan.gov.in by registration number. Unpaid challans travel with the vehicle and block transfer.`, `In an accident: ensure safety → call 112 / ambulance → photos → exchange details with the other party → FIR for injuries, major damage, theft or hit-and-run → inform the insurer within 24–48 hours.`, `Hit-and-run compensation and the **Good Samaritan** protection scheme exist — note the time/location and witness details.`]],
      [`Buying new: negotiate the real cost`,
        ['ul', `Compare 3 dealers on **on-road price**; negotiate discount, free accessories and exchange bonus separately.`, `**Book near festival/quarter end** for best discounts; ask about **year-end stock** and previous model-year discounts (model-year is on the VIN).`, `Finance: compare dealer loan vs your bank's — the dealer may receive a commission. Check the **IRR**.`, `Extended warranty: only from the manufacturer; read what's excluded.`, `Test drive at different times, with rear-seat and boot checks for a car; ride for ergonomics on a bike.`]],
      [`Running cost: cost per km`,
        `Cost per km = (fuel + service + insurance ÷ km + tyres + depreciation ÷ km) ÷ km. Run the Vehicle calculator. For a ~5,000 km/year commuter, a cab or rental may beat owning a car; for 12,000+ km/yr, owning often wins.`,
        ['ex', `Hatchback: ₹7.5 L car, 10,000 km/yr, mileage 16 km/l at ₹105/l → fuel ₹65,600; insurance ₹25k; service ₹12k; depreciation ≈ ₹70k → ≈ ₹1.7 L a year, ≈ ₹17 per km. A cab at ₹14/km for the same distance costs ₹1.4 L.`]],
      [`Selling a vehicle safely`,
        ['ol', `Clear all challans and loans (get Form 35).`, `Give the buyer the **RC, Form 29 & 30, insurance, PUC, service book, keys**.`, `Keep **copies of signed forms**, the buyer's ID and the sale receipt.`, `**Submit Form 29 to the RTO** within 14 days so that future fines/accidents are not on your name.`, `Transfer or cancel insurance; **remove FASTag/registered mobile number**; retain NCB certificate for your next vehicle.`]],
      [`Common scams and traps`,
        ['ul', `“Token advance” to an unknown person for a cheap listing; cloned ads using photos of real vehicles; buyers paying with fake screenshots; **loan-hypothecated vehicle sold without closure**; **forged RC or odometer tampering**; stolen vehicle with tampered chassis; flood-damaged cars repainted.`, `Dealers adding **mandatory insurance** at inflated prices (you may choose your own insurer) and **unneeded accessories**.`, `**Fitness/PUC/HSRP touts**: use government or authorised centres only.`]]
    ],
    advisor: [`Buy a vehicle only if **monthly cost ≤ 5–6% (bike) or 10% (car) of income**; otherwise buy a used one or use rentals/cabs.`, `Prefer a **1st-owner, 2–3-year-old** vehicle with full service history over a new one for your first vehicle — same reliability, 30–40% cheaper.`, `Always match **chassis + engine numbers** physically with the RC, and **VAHAN**-verify before paying anything.`, `Never pay cash; transfer to the RC owner; sign Forms 29/30 the same day; insist on NOC/Form 35 for loan vehicles.`, `Buy **comprehensive + zero-dep (first 3–5 yrs) + roadside**; renew before expiry; carry a digital RC/licence/insurance.`, `Finance ≤ 4 years, ≥ 20% down; don't finance accessories or insurance.`],
    checklist: [`Running cost (per month) is within 5–6% / 10% of income.`, `Chassis and engine numbers match the RC, invoice and insurance.`, `VAHAN/mParivahan check shows no blacklist or pending challans.`, `Original RC, insurance, PUC, service history seen.`, `Loan NOC and Form 35 obtained (if applicable).`, `Payment by bank transfer to the RC owner only.`, `Forms 29 and 30 signed and submitted within 14/30 days.`, `Insurance transferred/renewed; NCB retained.`, `HSRP fitted; FASTag linked (car).`, `Digital copies in DigiLocker and in Records.`, `Test ride/drive and mechanic inspection done.`, `Itemised on-road quote compared across 3 dealers.`],
    verify: [`Parivahan — parivahan.gov.in (VAHAN, mParivahan, e-challan)`, `MoRTH — morth.nic.in`, `Your state transport department website (road tax rates)`, `IRDAI — irdai.gov.in`, `NHAI — FASTag — ihmcl.co.in`]
  });

  G({
    id: 'property', module: 'property', cat: 'Plan & Buy', read: '45 min read', title: 'Buying property — title, documents, taxes, hidden costs',
    summary: `The due-diligence checklist for flats, plots and houses: sale deed, title chain, encumbrance certificate, khata/patta, RERA, OC/CC, stamp duty, TDS, GST, home-loan steps, rent-vs-buy.`,
    calcs: ['rentbuy', 'afford', 'emi', 'capgains'], tools: [['Loan compare', '#/tool/loancompare']],
    sections: [
      [`Decide: rent or buy?`,
        `Buying makes financial sense when you stay 7+ years, your EMI ≤ 35% of take-home, and price-to-annual-rent < ~25. Use the Rent vs Buy calculator with **all** costs: down payment, stamp duty, maintenance, interest, tax, property tax, opportunity cost of the down payment.`,
        ['ex', `₹80 L flat renting at 2.5% yield = ₹1.67 L a year rent. Owning costs ≈ 8.5% interest on a ₹64 L loan (₹5.4 L/yr) + 1% maintenance + property tax − principal is your savings. Renting and investing the difference often wins in the first ~10 years; buying wins if prices rise ≥ 5–6% a year and you stay long.`]],
      [`All the costs`,
        ['tbl', ['Cost', 'Typical', 'Notes'], [[`Down payment`, `10–25%`, `Minimum bank requirement; not funded`], [`Stamp duty`, `4–8% (varies by state; women often get a concession)`, `Paid on the higher of agreement value and circle rate`], [`Registration`, `0.5–1%`, `Sometimes capped`], [`GST`, `5% (non-affordable) / 1% (affordable) on under-construction, no GST on completed`, `Verify current slab`], [`Brokerage`, `0.5–2%`, `Negotiable`], [`Legal & valuation`, `₹10–50k`, `Advocate to search title`], [`Society/possession charges`, `corpus fund, maintenance deposit`, `Ask the builder in writing`], [`Interiors & moving`, `5–15% of value`, `Often forgotten`], [`Loan fees`, `0.25–1%`, `Processing + documentation`]]]],
      [`Ownership papers — what each proves`,
        ['ul', `**Sale deed** (conveyance deed) — the registered document that transfers ownership. Registered under the Registration Act at the Sub-Registrar. Keep the **original**.`, `**Agreement to sell / allotment letter** — pre-sale agreement; not a title.`, `**Title chain / mother deed** — the unbroken sequence of previous deeds (usually 30 years) back to the original owner. Your advocate must verify it.`, `**Encumbrance Certificate (EC)** — proves no mortgage/dues on the property for the period (30 years ideal). Apply at the Sub-Registrar / online (varies by state).`, `**Khata (Karnataka) / Patta (Tamil Nadu) / Khatauni / 7-12 extract / Jamabandi** — local revenue record of who owns the land. In Karnataka use **A-khata** (not B-khata) for loans.`, `**Mutation** — updating revenue/municipal records to your name after purchase. Do it within 60–90 days; file with the sale deed.`, `**Property tax receipts** up to date; **utility bills**; **society NOC** and share certificate (co-operative societies).`, `**Approved building plan**, **Commencement Certificate (CC)**, **Occupancy Certificate (OC)** / **Completion Certificate** — proof the building is legal and habitable. A flat without OC can't be legally occupied and banks may refuse loans.`, `**RERA registration** number of the project and the agreement for sale in the RERA format.`, `**Conversion certificate** for non-agricultural use (plots); **layout approval** by the local authority.`, `**Possession letter**, keys, **Form 16/26QB** proof of TDS, **builder-buyer agreement** and payment receipts.`]],
      [`Due diligence — step by step`,
        ['ol', `**Search the title:** get a lawyer to check the last 30 years of deeds, family tree/legal heirs' consent, court cases (civil + revenue), litigation, land acquisition or notification.`, `**EC for 30 years** (to spot any mortgage or earlier sale).`, `**Check RERA:** project registered, carpet area, timeline, promoter's record, complaints on the state RERA site.`, `**Verify approvals:** sanctioned plan, CC, land-use (zoning), OC for ready buildings, fire NOC for high-rises.`, `**Builder track record:** past projects, delay history, financial stability, bank approvals (banks screen a lot).`, `**Measure:** carpet vs built-up vs super built-up area — only **carpet area** counts in RERA; compare price per sq ft of carpet.`, `**Physical inspection:** water, drainage, ventilation, structural cracks, parking, commute, noise, flood history.`, `**Payment schedule:** construction-linked, never pay more than 10% before the agreement for sale is registered.`]],
      [`Buying steps`,
        ['ol', `**Book** with token (keep ≤ 1–2%; get a receipt).`, `**Agreement for sale** (notarised/registered) — check carpet area, price, payment plan, possession date, penalty for delay (RERA: interest at SBI MCLR + 2%), defect liability period (5 years), sale deed format.`, `**Home loan sanction** — bank legal/valuation; documents in the Loans guide.`, `**Pay stamp duty** (e-stamp / franking) and registration fees.`, `**Register the sale deed** at the Sub-Registrar with two witnesses; biometric and photo of both parties.`, `**Deduct TDS 1%** (Section 194-IA) if the price is ₹50 lakh or more; pay via Form 26QB within 30 days of the month end; give Form 16B to the seller.`, `**Take possession** after OC + snag list; get **society share certificate**, utility transfer, property-tax mutation.`]],
      [`Taxes on property (verify current rules)`,
        ['ul', `**Rental income:** standard deduction 30% on net annual value; property tax deduction; home-loan interest fully deductible for let-out property (loss set-off capped at ₹2 L against other income).`, `**Self-occupied:** interest ≤ ₹2 L (old regime) under 24(b); principal in 80C.`, `**Capital gains (sale):** long-term after 24 months; LTCG 12.5% without indexation (or for properties bought before 23 Jul 2024, the taxpayer can choose 20% with indexation — resident individuals/HUFs); short-term at slab. **Section 54 / 54EC / 54F** exempt gains reinvested in a house or specified bonds (within limits and timelines).`, `**Property tax (municipal)** is payable annually by the owner; keep receipts.`, `**TDS on rent** > ₹50,000 a month: 2% (194-IB) by individual tenants.`]],
      [`Different kinds of property`,
        ['tbl', ['Type', 'Advantage', 'Risk'], [[`Ready-to-move flat`, `See what you buy, start living`, `Resale paperwork; may need renovation`], [`Under-construction flat`, `Cheaper, flexible payments; GST`, `Delays, quality; use RERA-registered only`], [`Plot`, `No depreciation, appreciation`, `Title/encroachment; no rental yield; hard to insure`], [`Independent house`, `Land + building`, `Maintenance; approval compliance`], [`Agricultural land`, `Low price`, `Restrictions on buyers in many states; conversion`], [`Commercial`, `Higher yield (6–9%)`, `Vacancy risk; GST`], [`REIT units`, `Liquid, small ticket, dividends`, `Market volatility; taxes`]]]],
      [`Common traps`,
        ['ul', `Paying **cash** component — illegal, risks seizure, no loan, no tax proof.`, `Buying on a **power of attorney** or “agreement to sell” only.`, `Properties sold to multiple buyers; “clear title” claims without a chain.`, `Builder pre-launch offers with **no RERA number**.`, `Ignoring **maintenance / parking / clubhouse** charges, **corpus fund**, **floor rise** and **PLC** charges.`, `Thinking stamp duty on circle rate vs agreement value — pay on the higher.`]]
    ],
    advisor: [`Buy only when you can put **≥ 20% down without touching your emergency fund**, EMI ≤ 35% of take-home, and you'll stay ≥ 7 years.`, `Pay a **property lawyer** (₹10–25k) for a 30-year title and EC search before you sign anything — the best money you'll spend.`, `Buy **RERA-registered, OC-ready or well-advanced** projects by reputed builders; avoid pre-launches.`, `Never pay in cash; keep every receipt; file **Form 26QB** on time.`, `Take term insurance equal to the loan and home insurance for rebuild value.`, `For investment, compare rental yield (2–3% residential) with debt/equity returns; real estate is illiquid and transaction-heavy.`],
    checklist: [`Rent-vs-buy done with all costs.`, `Title verified for 30 years by my own lawyer.`, `EC for 30 years clean.`, `RERA registration verified on the state site.`, `Approved plan, CC and OC in hand (for ready property).`, `Khata/patta/7-12 in the seller's name; mutation plan ready.`, `Stamp duty/registration computed on the higher of agreement/circle value.`, `TDS 194-IA (1%) will be deducted and Form 26QB filed.`, `All payments are bank transfers with receipts.`, `Loan EMI ≤ 35% of take-home; emergency fund intact.`, `Term and home insurance arranged.`, `Original papers stored safely with scans.`],
    verify: [`RERA — your state's RERA website`, `State Registration & Stamps department (stamp duty, EC)`, `Income Tax — incometax.gov.in (194-IA, 54/54EC, 24(b))`, `RBI — LTV norms for housing loans`]
  });

  G({
    id: 'education', module: 'education', cat: 'Plan & Buy', read: '18 min read', title: 'Education planning — cost, funding, loans and tax',
    summary: `How education costs inflate, how to size a goal in today's rupees, where to save, when to borrow and how to claim tax benefits.`,
    calcs: ['edu', 'goal', 'sip'],
    sections: [
      [`Inflation is the enemy: education costs rise 8–12% a year`,
        ['ex', `Engineering at ₹8 L today → in 15 years at 10% inflation: **₹33 L**. A medical course at ₹20 L → ₹84 L. Study abroad ₹50 L → ₹2.1 Cr (plus currency depreciation).`],
        `Plan in **today's rupees**, inflate to the year the money will be needed, and fund with a monthly SIP sized by the Education calculator.`],
      [`How to fund it — by time horizon`,
        ['tbl', ['Years to go', 'Where to put money', 'Why'], [[`10+ years`, `Equity index/flexi-cap SIP (70–80%) + PPF/SSY (20–30%)`, `Growth beats inflation`], [`5–10 years`, `Balanced/hybrid + PPF/debt`, `Reduce volatility`], [`3–5 years`, `Shift 50% to debt as you approach`, `Protect gains`], [`< 3 years`, `FD ladder, short-duration debt`, `Certainty`]]],
        `**Glide path:** move 10–15% from equity to debt every year in the last 5 years. **SSY** (Sukanya Samriddhi) is excellent for a girl child — government-backed rate and tax-free; see Government Schemes.`],
      [`Borrowing for education`,
        ['ul', `Borrow only after using savings, scholarships and part-time income. Compare **interest rate, moratorium, collateral, margin money** and **fees** across banks and the Vidya Lakshmi portal.`, `**Interest subsidy and guarantee schemes** (PM-Vidyalaxmi, CSIS, CGFSEU) can waive collateral/interest for eligible families — verify eligibility.`, `**Tax (80E):** interest paid on an education loan is deductible with no cap for up to 8 years (old regime).`, `Pay the **simple interest** during the course to avoid capitalisation; keep EMI ≤ 15–20% of expected first salary.`],
        ['warn', `Check the **ROI of the course**: expected salary vs total cost. A ₹40 L MBA with ₹8 L starting salary can take 10+ years to repay.`]],
      [`Studying abroad — hidden costs`,
        ['ul', `Tuition + living + health insurance + visa + flight + lab/materials.`, `Currency risk: a 3% yearly fall in INR raises costs significantly. **Remittance under LRS** has TCS (tax collected at source) — 20% above ₹10 L except for loans (0.5%) and education (5%); verify rates.`, `Compare countries by **post-study work rules** and job prospects.`]],
      [`Scholarships and lower-cost routes`,
        ['ul', `National Scholarship Portal (scholarships.gov.in), state scholarships, institution merit aid, corporate scholarships, education-loan interest subsidies.`, `Online degrees from recognised universities, distance learning, and skill certifications can achieve the same career outcome at lower cost.`]]
    ],
    advisor: [`Start a dedicated SIP the day a child is born; even ₹5,000 a month at 10% for 18 years becomes ≈ ₹25 L.`, `Keep education money **in separate folios/accounts**; never withdraw for other goals.`, `Reduce equity near the goal date — no exceptions.`, `Avoid borrowing beyond the first year's expected salary; plan an EMI you can pay from a starting salary.`, `Buy term cover for the earning parent so the goal survives a shock.`],
    checklist: [`Goal cost in today's rupees and target year set.`, `Inflation assumption 8–10% used.`, `Dedicated SIP running with step-up.`, `Glide-path plan written (last 5 years).`, `Scholarships searched.`, `Education loan fully compared, including subsidies.`, `Term cover for the earner.`],
    verify: [`Vidya Lakshmi — vidyalakshmi.co.in`, `National Scholarship Portal — scholarships.gov.in`, `Income Tax — Section 80E`]
  });

  G({
    id: 'marriage', module: 'marriage', cat: 'Plan & Buy', read: '14 min read', title: 'Marriage and family finances — plan, budget, combine',
    summary: `How to budget a wedding, combine finances, handle names/nominees, insurance and taxes, and keep the first years stable.`,
    calcs: ['marriage', 'goal'],
    sections: [
      [`Budgeting a wedding without debt`,
        ['ul', `Set a **total ceiling first**, then split: venue & food 40–50%, clothing & jewellery 20–25%, photography 5–8%, travel & rituals 10%, buffer 10–15%.`, `Fund from savings or a dedicated 2–3-year SIP in debt/hybrid funds; **avoid personal loans and card EMIs**.`, `Gold for weddings: buy in instalments through gold savings schemes or SGBs; check hallmark/HUID.`, `A ₹10 lakh wedding financed at 14% over 4 years costs ₹13.1 L. A ₹10 L wedding saved over 4 years at 7% costs ≈ ₹8.6 L of your money.`]],
      [`Combining finances`,
        ['ol', `Share full numbers: income, debts, savings, credit score, obligations to parents.`, `Agree on **joint, yours and mine** accounts: one joint account for household costs (proportional to income), individual accounts for personal spend.`, `Set shared goals (home, children, retirement) and a monthly SIP each.`, `Check **both credit scores**; a bad score affects joint loans.`, `Review monthly for the first year.`]],
      [`Paperwork after marriage`,
        ['ul', `**Marriage certificate** (registered under the Hindu Marriage Act / Special Marriage Act / state rules) — needed for name change, passport, insurance and visas.`, `Update **nominees** on bank accounts, EPF, insurance, mutual funds, demat; update **name/address** on PAN, Aadhaar, bank, passport, GST.`, `**Insurance**: add spouse to health policy or buy a floater; increase term cover; make the spouse the nominee.`, `**Will**: write a simple will — the law of inheritance may not match your wishes.`]],
      [`Taxes`,
        ['ul', `Spouses are taxed separately. Gifts between spouses are exempt from gift tax but **clubbing of income** (Section 64) applies if you gift money that then earns income.`, `Split investments to use both spouses' basic exemption and slabs where lawful; claim HRA properly if paying rent to parents (needs rent agreement and payment proof).`, `Joint home loan allows both to claim interest and principal deductions (old regime).`]]
    ],
    advisor: [`Set a hard wedding ceiling and fund it **in cash**, not debt.`, `Put a **health + term** plan in place within 3 months of marriage.`, `Keep a joint emergency fund of 6 months of combined expenses.`, `Write wills and update nominees within a year.`],
    checklist: [`Wedding ceiling and budget split written.`, `Funded without personal loans/card EMIs.`, `Both credit scores reviewed.`, `Joint/individual account rules agreed.`, `Marriage certificate registered.`, `Nominees and KYC updated.`, `Insurance updated; will drafted.`],
    verify: [`State marriage-registration portals`, `Income Tax — Section 64 (clubbing)`, `UIDAI — uidai.gov.in (name/address update)`]
  });

  G({
    id: 'children', module: 'children', cat: 'Plan & Buy', read: '16 min read', title: 'Children — costs, insurance, Sukanya, PPF and a plan from birth',
    summary: `From delivery to graduation: what children cost, which accounts to open, which insurance to buy (and skip), and how to teach money.`,
    calcs: ['child', 'edu', 'goal'],
    sections: [
      [`What children cost`,
        ['tbl', ['Stage', 'Main costs', 'Plan'], [[`0–3`, `Delivery, vaccines, childcare`, `Health cover with maternity (waiting 2–4 yrs); emergency fund`], [`4–17`, `School fees, tuition, activities, health`, `Monthly budget; education SIP`], [`18–22`, `College, hostel, coaching`, `Dedicated goal fund`], [`22+`, `Marriage/startup support`, `Separate goal`]]],
        `Indicative: school + tuition ₹1.5–8 lakh a year in metros, growing 8–10%. Use the Child calculator.`],
      [`Accounts to open`,
        ['ul', `**Sukanya Samriddhi Account (girl child ≤ 10 yrs):** government rate (verify), ₹250–₹1.5 L a year, 21-year term, partial withdrawal for education at 18, EEE tax status.`, `**PPF in the child's name (guardian operates):** 15 years, tax-free, counts toward the guardian's ₹1.5 L limit.`, `**Mutual fund SIP in the child's name** (minor; guardian operates; taxed in the guardian's or child's hands by clubbing rules).`, `**NPS Vatsalya** (for minors; verify current features).`]],
      [`Insurance for the family with a child`,
        ['ul', `**Child's own health:** add to a family floater on day one; vaccines and maternity are often not covered in the first 2–4 years.`, `**Term cover on parents** — the best child plan is a parent who stays insured.`, `**Skip** child ULIPs/endowments/“education plans”. They give low returns and mix insurance with savings.`, `**Personal accident** for parents.`]],
      [`Documents`,
        ['ul', `Birth certificate (register within 21 days), Aadhaar, PAN (for investments), passport, school records, vaccination record, Ayushman/health card.`, `Bank account for the child with guardian; nominee details updated.`, `A **guardian clause in your will** stating who takes care of your children if both parents die.`]],
      [`Teaching money`,
        ['ul', `Pocket money with 3 jars — spend, save, give. Open a teen account at 13–16. Explain compounding using the SIP calculator. Let them pay a bill with you. Set a financial “allowance” for adolescents.`]]
    ],
    advisor: [`From day one: health floater + term for parents + emergency fund.`, `Start an **education SIP** of at least 10–15% of monthly savings; step it up by 10% every year.`, `Girl child: open **SSY** right away and deposit regularly.`, `Keep every goal (school, college, marriage) in separate buckets.`, `Review school vs college funds every year; shift to debt near the goal.`],
    checklist: [`Health cover includes the child.`, `Term cover for parents in place.`, `Education SIP running and stepped up yearly.`, `SSY/PPF opened where eligible.`, `Will names a guardian.`, `Documents organised in Records.`],
    verify: [`India Post — indiapost.gov.in (SSY)`, `Ministry of Finance — small-savings interest notifications`, `AMFI — amfiindia.com`]
  });
})();
