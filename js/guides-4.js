/* guides-4.js — PLAN: tax, retirement, financial independence, net worth, goals, business, start-a-business */
window.FOS = window.FOS || {};
(function () {
  'use strict';
  const G = FOS.G;

  G({
    id: 'tax', module: 'tax', cat: 'Plan', read: '35 min read', title: 'Income tax for a salaried Indian — the complete practical guide',
    summary: `Old vs new regime, slabs, deductions, HRA, Form 16/26AS/AIS, ITR filing, advance tax, capital gains, TDS, refunds, notices and a year-round tax calendar.`,
    calcs: ['incometax', 'taxopt', 'hra', 'capgains', 'salary'], tools: [['Tax rules & sources', '#/tool/taxinfo']],
    sections: [
      [`Which year and which rules`,
        `Tax year = **financial year (1 April – 31 March)**; you file the return in the next **assessment year**. Example: FY 2025-26 is reported in AY 2026-27 by **31 July 2026** (non-audit). The new **Income-tax Act, 2025** takes effect from 1 April 2026 (FY 2026-27 onward), renumbering sections; the rates and most deductions below remain, but **verify section numbers and limits on incometax.gov.in every year** and update the figures in Settings → Rates.`],
      [`New regime (default) vs old regime`,
        ['tbl', ['', 'New regime (FY 2025-26)', 'Old regime'], [
          [`Slabs`, `0–4L nil · 4–8L 5% · 8–12L 10% · 12–16L 15% · 16–20L 20% · 20–24L 25% · >24L 30%`, `Up to 2.5L nil · 2.5–5L 5% · 5–10L 20% · >10L 30% (below 60)`],
          [`Standard deduction (salaried)`, `₹75,000`, `₹50,000`],
          [`Rebate 87A`, `Tax-free up to ₹12 L income (₹12.75 L salaried)`, `Up to ₹5 L`],
          [`Deductions`, `Almost none: employer NPS 80CCD(2), standard deduction, family pension`, `80C, 80D, HRA, LTA, 24(b), 80E, 80CCD(1B), 80TTA…`],
          [`Surcharge/cess`, `Surcharge capped at 25%; 4% cess`, `Up to 37%; 4% cess`]]],
        ['tip', `Rule of thumb: the old regime wins only if your deductions (80C + 80D + HRA + 24(b) + NPS…) exceed roughly **₹3.75–4.5 lakh** at ₹15 L income. Use Tax Regime Optimizer.`],
        ['ex', `Salary ₹15 L, deductions in old regime: 80C 1.5 L + 80D 25k + HRA 1.5 L + NPS 50k = ₹3.75 L. Old-regime tax ≈ ₹1.40 L (with cess); new-regime tax ≈ ₹0.98 L — new wins despite all those deductions. Verify with the app.`]],
      [`Salary components and what is taxable`,
        ['tbl', ['Component', 'Treatment'], [[`Basic + DA`, `Fully taxable; drives PF, HRA, gratuity`], [`HRA`, `Old regime exemption = least of (actual HRA, rent − 10% of basic, 50%/40% of basic)`], [`LTA`, `Exempt for 2 journeys in a 4-year block with tickets (old)`], [`Special allowance / bonus`, `Fully taxable`], [`Employer PF`, `Exempt up to ₹7.5 L total employer contributions; interest above limit taxable`], [`Gratuity`, `Exempt up to ₹20 L on retirement after 5 years`], [`Leave encashment`, `Exempt up to ₹25 L at retirement`], [`Perquisites`, `Car, housing, stock options are taxed per rules`], [`Reimbursements`, `Fuel, phone, meal cards: under the new regime most are taxable`]]]],
      [`Deductions you should know (old regime)`,
        ['tbl', ['Section', 'What', 'Limit'], [[`80C`, `EPF, PPF, ELSS, life insurance premium, tuition fee, home-loan principal, 5-yr FD, NSC, SSY`, `₹1.5 L`], [`80CCD(1B)`, `NPS extra`, `₹50,000`], [`80CCD(2)`, `Employer NPS (also new regime)`, `10%/14% of basic`], [`80D`, `Health insurance`, `₹25k/₹50k self (+ ₹25k/₹50k parents)`], [`80E`, `Education-loan interest`, `No cap, 8 years`], [`80G`, `Donations`, `50%/100% with limits`], [`80TTA/TTB`, `Savings interest`, `₹10k / ₹50k seniors`], [`24(b)`, `Home-loan interest, self-occupied`, `₹2 L`], [`80EEA/80EE`, `Extra home-loan interest for first-time buyers (legacy)`, `Closed to new loans`], [`HRA`, `Rent paid`, `Formula`]]]],
      [`Documents you receive and must check`,
        ['ul', `**Form 16 (Part A/B):** employer's TDS and salary certificate.`, `**Form 26AS / Annual Information Statement (AIS)** & **TIS:** everything the government knows (salary, interest, dividends, share trades, property, TDS). **Match your return to AIS**; report differences.`, `**Form 26QB/16B:** TDS on property. **Form 15G/15H:** avoid TDS when your income is below the taxable limit.`, `**Bank interest certificates, capital-gains statements** from brokers/AMCs, **rent receipts/agreement**, **80C/80D proofs**.`]],
      [`Filing your ITR — step by step`,
        ['ol', `Collect: **PAN, Aadhaar, Form 16, AIS, 26AS, bank statement, capital-gains reports**.`, `Log in to **incometax.gov.in**; choose **ITR-1** (salary ≤ ₹50 L, one house, other income), **ITR-2** (capital gains, foreign assets, multiple properties) or **ITR-3** (business/F&O).`, `Pick **regime** (you may change each year if you have no business income).`, `Pre-filled data loads from AIS; verify and complete deductions and bank details for refund.`, `**E-verify** within 30 days (Aadhaar OTP / net banking). An unverified return is void.`, `Keep a PDF of the return and acknowledgement; check **refund status** (typically 2–6 weeks).`],
        ['ul', `**Due dates:** 31 July (non-audit), 31 October (audit cases), 31 December (belated/revised). Belated filing costs ₹5,000 (₹1,000 if income ≤ ₹5 L) + interest and loses loss carry-forward.`, `**Updated return (ITR-U)** within 48 months if you missed income (extra tax).`]],
      [`Advance tax`,
        `Pay in instalments if your net tax after TDS is **₹10,000 or more**: 15 June (15%), 15 Sept (45%), 15 Dec (75%), 15 March (100%). Salary earners usually have none; those with capital gains or freelance income do. Pay via **Challan 280 (ITNS 280)**; interest under 234B/234C for shortfall. Presumptive taxpayers (44AD/44ADA) can pay all on 15 March.`],
      [`Capital gains`,
        ['tbl', ['Asset', 'Short-term', 'Long-term'], [[`Listed equity, equity MF`, `< 12 mo: 20%`, `> 12 mo: 12.5% above ₹1.25 L`], [`Debt MF (post Apr 2023)`, `Slab`, `Slab`], [`Listed bonds, gold ETF`, `Slab if < 12 mo`, `12.5% (no indexation)`], [`Property, unlisted shares`, `< 24 mo: slab`, `> 24 mo: 12.5% no indexation; option of 20% with indexation for property bought before 23 Jul 2024 (individuals)`], [`Crypto/VDA`, `30% flat, no set-off`, `—`]]],
        `**Exemptions:** Section 54 (new house), 54EC (bonds up to ₹50 L), 54F. **Set off** losses against gains; carry forward 8 years if the return is filed on time. **Grandfathering:** equity acquired before 1 Feb 2018 has a cost basis of the higher of cost and 31-Jan-2018 price.`],
      [`TDS, refunds, notices`,
        ['ul', `TDS rates: salary (slab), FD interest 10% above ₹50k/₹1 L seniors, rent 10% above ₹6 L/yr (verify), professional fees 10%, property 1%, lottery 30%.`, `**Refund** arrives in your pre-validated bank account; check **26AS** to make sure TDS credit shows.`, `**Notice?** Read the section, deadline and demand; respond on the e-filing portal with proof. Don't ignore; most are mismatches with AIS.`, `Keep documents for **6 years** (assessment reopening limit is 3 years, 10 years for ₹50 L+ concealed income).`]],
      [`Legal ways to pay less — the plan`,
        ['ol', `**Choose the right regime** each year (calculate both).`, `**Max out employer-linked benefits:** EPF/VPF, employer NPS (80CCD(2)) — allowed in both regimes.`, `**Health insurance** for self and parents (old regime).`, `**HRA/rent to parents** with proper agreement and payment proof (old regime).`, `**Home-loan** interest/principal (old regime).`, `**Harvest LTCG** ₹1.25 L a year; **set off losses**; hold equity > 12 months.`, `**Spread income** across family members legally (no clubbing): gift to adult parent in a lower slab is subject to clubbing only for spouse and minor child income.`, `**Donations** with 80G proof.`, `**Keep records.** Avoid "tax-saving tricks" involving cash, fake rent or bills — penalties are heavy.`]],
      [`Year-round tax calendar`,
        ['tbl', ['When', 'Do'], [[`April`, `Declare regime to employer; set up new SIPs/NPS; keep a tax folder`], [`May–June`, `Collect Form 16; advance tax (15 Jun) if needed`], [`July`, `File ITR by 31 July; e-verify`], [`September`, `Advance tax 15 Sept`], [`October`, `Submit investment proofs plan to employer`], [`December`, `Advance tax 15 Dec; tax-loss harvesting review`], [`January–March`, `Finish 80C/NPS/80D; harvest ₹1.25 L LTCG; pay 15 March advance tax`]]]]
    ],
    advisor: [`Run both regimes every April with your real numbers; default to **new** unless deductions exceed about ₹4 L.`, `Always use **EPF/VPF + employer NPS**, and buy **health insurance** regardless of tax.`, `File by 31 July, match **AIS/26AS**, and **e-verify immediately**.`, `Harvest ₹1.25 L LTCG every year; hold equity > 1 year.`, `Keep a tax folder (Form 16, AIS, proofs, rent agreement) for 6 years.`, `Never move money or claim deductions you can't document.`],
    checklist: [`Regime compared with my numbers.`, `Form 16, AIS and 26AS downloaded and reconciled.`, `Investments and insurance proofs saved.`, `HRA rent agreement and receipts (if old regime).`, `Capital-gains statements downloaded.`, `ITR filed and e-verified before the due date.`, `Advance tax paid if liability ≥ ₹10,000.`, `Bank account for refund pre-validated.`],
    verify: [`Income Tax Department — incometax.gov.in`, `Union Budget — indiabudget.gov.in`, `CBDT circulars and notifications`, `Your employer's payroll portal`]
  });

  G({
    id: 'retirement', module: 'retirement', cat: 'Plan', read: '22 min read', title: 'Retirement — how much, where from, and how to make it last',
    summary: `Corpus needed, inflation, the 4% rule in Indian conditions, EPF/NPS/PPF/annuity/SWP, healthcare, sequence risk, and a step-by-step plan from your current age.`,
    calcs: ['retirement', 'whatif-retire', 'nps', 'sip', 'inflation'],
    sections: [
      [`The number`,
        ['ol', `Estimate **monthly expenses today** that will continue after retirement (usually 70–80% of current).`, `**Inflate** them to retirement age: ₹50,000 today at 6% for 25 years = ₹2.15 L a month.`, `Corpus ≈ 25–30 × annual expenses at retirement (a 3.3–4% withdrawal rate) — in India, prefer 3–3.5% because of higher inflation and long life.`, `Subtract existing assets' future value; the gap is what SIPs must build.`],
        ['ex', `Age 30 → 60. Expenses ₹50,000/mo today = ₹6 L/yr. At 6% inflation ×5.74 = ₹34.5 L/yr. 30× ≈ **₹10.3 Cr**. SIP needed at 11% return ≈ ₹37,000/month (step-up 10% reduces it to ≈ ₹16,000 starting).`]],
      [`Build the corpus`,
        ['tbl', ['Tool', 'Role'], [[`EPF/VPF`, `Stable core for employees`], [`PPF`, `Tax-free stability (15-yr blocks)`], [`NPS`, `Low-cost equity + mandatory annuity discipline`], [`Equity index SIP`, `Growth`], [`Real estate (own home)`, `Rent-free living, not an income source`], [`Annuity / SCSS`, `Guaranteed income`]]],
        `**Glide path:** 70% equity at 35 → 50% at 50 → 30% at 60 → 20–30% through retirement.`],
      [`Living off the corpus`,
        ['ul', `**Bucket strategy:** Bucket 1 (2 years' expenses in savings/liquid/FD), Bucket 2 (3–5 years in debt/hybrid funds), Bucket 3 (rest in equity). Refill bucket 1 from 2 and 2 from 3 in good years.`, `**SWP** from a hybrid/equity fund with an inflation-indexed withdrawal.`, `**Annuity** for a floor of guaranteed income (cover basic expenses). Compare payouts across insurers; ensure it's inflation-aware or buy in instalments.`, `**SCSS, POMIS, PMVVY** add safe income. Keep health insurance going for life.`]],
      [`Risks`,
        ['ul', `**Longevity:** plan to age 90–95.`, `**Inflation:** 6% halves the real value in 12 years.`, `**Sequence risk:** a crash in the first years of retirement hurts most — bucket strategy helps.`, `**Healthcare:** cover ₹1 Cr+ and a dedicated medical fund.`, `**Family/dependents and no will.**`]],
      [`Planning by age`,
        ['tbl', ['Age', 'Focus'], [[`20s`, `Start SIP early; emergency fund; insurance`], [`30s`, `Save 20–30%; step-up; home decisions; retirement SIP`], [`40s`, `Peak saving; rebalance; kids' education`], [`50s`, `Catch-up; clear debt; glide path; health cover for life`], [`60s`, `Buckets; SCSS/annuity; estate plan`]]]]
    ],
    advisor: [`Start retirement SIPs **first**, before other goals (you can borrow for education, not retirement).`, `Aim for a corpus of 25–30× future annual expenses; use a step-up SIP.`, `Max EPF/VPF, PPF, NPS extra ₹50k.`, `Keep health insurance for life; clear debts before retiring.`, `Review the number every year with the calculator.`],
    checklist: [`Expenses projected and inflated.`, `Corpus target set (25–30×).`, `SIP and step-up active.`, `Glide-path plan written.`, `Health insurance to age 85+.`, `Will and nominees updated.`],
    verify: [`PFRDA — pfrda.org.in`, `EPFO — epfindia.gov.in`, `Income Tax — annuity and NPS taxation`]
  });

  G({
    id: 'fi', module: 'fi', cat: 'Plan', read: '16 min read', title: 'Financial independence (FI/FIRE) — the number and the path',
    summary: `What FI means, how to compute your number, Lean/Barista/Fat FIRE, savings-rate maths, and risks in the Indian context.`,
    calcs: ['fi', 'savingsrate', 'retirement'],
    sections: [
      [`The idea`, `Financial independence = investments produce enough (after tax and inflation) to cover your living costs. **FI number = annual expenses ÷ safe withdrawal rate** (e.g. 25× at 4%, 30× at 3.33%).`],
      [`Savings rate is the lever`,
        ['tbl', ['Savings rate', 'Years to FI (5% real return)'], [[`10%`, `≈ 51`], [`25%`, `≈ 32`], [`40%`, `≈ 22`], [`50%`, `≈ 17`], [`65%`, `≈ 10`], [`75%`, `≈ 7`]]],
        `Each ₹1 you cut from spending reduces the target **and** adds to savings — double effect.`],
      [`Flavours`,
        ['ul', `**Lean FIRE:** minimal expenses (₹30–50k/month in India).`, `**Fat FIRE:** comfortable, ₹2 L+/month.`, `**Barista FI:** part-time income covers some expenses.`, `**Coast FI:** enough invested that compounding alone reaches the number by 60.`]],
      [`Indian cautions`,
        ['ul', `Inflation is higher: use 3–3.5% withdrawal, not 4%.`, `Healthcare: self-insure with a ₹1 Cr+ policy.`, `Taxes on withdrawals and no social safety net.`, `Dependents: parents and kids.`, `Lifestyle creep; sequence risk.`]],
      [`A path`,
        ['ol', `Compute your FI number from today's expenses.`, `Track your savings rate monthly.`, `Automate investing; grow income (skills, side income).`, `Keep insurance, emergency fund, and reduce debts.`, `Review the number annually; consider semi-retirement at 80% of target.`]]
    ],
    advisor: [`Target a **40–50% savings rate** if you want FI in under 20 years.`, `Choose a 3–3.5% withdrawal rate.`, `Spend intentionally: cut what you don't love, keep what you do.`],
    checklist: [`FI number calculated.`, `Savings rate tracked.`, `Insurance and emergency fund done.`, `Automation in place.`, `Yearly review scheduled.`],
    verify: [`Trinity Study (background)`, `PFRDA, EPFO for post-retirement income rules`]
  });

  G({
    id: 'networth', module: 'networth', cat: 'Plan', read: '10 min read', title: 'Net worth — measure what you own minus what you owe',
    summary: `Build a true balance sheet, choose what counts, track monthly and read the trend.`,
    calcs: ['networthcalc'], tools: [['Net worth tracker', '#/tool/networth']],
    sections: [
      [`Definition`, `**Net worth = assets − liabilities.** Assets you can sell (bank, FD, MF, stocks, gold, property, EPF/PPF/NPS, vehicles at resale value); liabilities = loans, card dues, money owed. Household goods and your primary home are usually tracked separately as "lifestyle assets".`],
      [`How to list correctly`,
        ['ul', `Use **current market value**, not what you paid.`, `Value EPF/PPF at the current balance; property at a conservative resale value.`, `Include all loans at outstanding principal.`, `Use the same date each month (month-end).`]],
      [`Reading the trend`,
        ['ul', `Net worth should rise by **savings + returns**. If it's flat while you "save", you may be paying lots of interest or losing on investments.`, `Track **liquid net worth** (excluding home/vehicles) as the real safety number.`, `Milestones: 1× annual salary by 30, 3× by 40, 6× by 50, 8–10× by 60 (rule of thumb).`]]
    ],
    advisor: [`Snapshot net worth on the last day of every month (or quarter).`, `Focus on raising the **liquid** net worth and reducing high-interest debt.`],
    checklist: [`All assets and loans listed.`, `Market values used.`, `Snapshot taken this month.`, `Trend reviewed quarterly.`],
    verify: [`Your statements: bank, demat, EPFO, NPS, loan`]
  });

  G({
    id: 'goals', module: 'goals', cat: 'Plan', read: '12 min read', title: 'Financial goals — turn wants into monthly amounts',
    summary: `Define goals with amount, date and priority, inflate the cost, pick the right asset, size the SIP and track.`,
    calcs: ['goal', 'sip', 'inflation', 'fv'], tools: [['Goals tracker', '#/tool/goals']],
    sections: [
      [`SMART goals`, `Specific, Measurable, Achievable, Relevant, Time-bound: "Buy a ₹20 L car in 5 years" beats "buy a car".`],
      [`The calculation`,
        ['ol', `**Future cost** = cost today × (1+inflation)^years.`, `**Required SIP** = FV × i ÷ ((1+i)^n − 1) ÷ (1+i), where i = monthly return.`, `Choose the asset by horizon: < 3 yrs FD/debt; 3–5 hybrid; 5+ equity.`],
        ['ex', `₹20 L car in 5 years at 5% inflation → ₹25.5 L. With hybrid fund at 9%: SIP ≈ ₹33,500/month.`]],
      [`Prioritise`,
        ['tbl', ['Priority', 'Goal'], [[`1`, `Emergency fund, insurance`], [`2`, `Clear high-interest debt`], [`3`, `Retirement`], [`4`, `Children's education`], [`5`, `Home down payment`], [`6`, `Lifestyle: car, travel, gadgets`]]]],
      [`Tracking`,
        ['ul', `Keep each goal in a separate folio/account.`, `Review annually; adjust for inflation and changed timelines.`, `Shift to safer assets 2–3 years before the date.`]]
    ],
    advisor: [`List every goal with amount and date; fund **retirement before** lifestyle goals.`, `Pay for short goals from savings, not loans.`, `Step up SIPs by 10% every year.`],
    checklist: [`Each goal has amount, date, priority.`, `Inflation included.`, `SIP size computed.`, `Right asset for the horizon.`, `Yearly review.`],
    verify: [`Your own statements and calculators`]
  });

  G({
    id: 'business', module: 'business', cat: 'Plan', read: '22 min read', title: 'Business finance — margin, break-even, cash flow, tax and compliance',
    summary: `The numbers that decide whether a business survives: unit economics, margins, break-even, working capital, runway, GST, TDS, books of accounts and financing.`,
    calcs: ['breakeven', 'roi', 'runway'],
    sections: [
      [`The numbers`,
        ['tbl', ['Metric', 'Formula', 'Meaning'], [[`Gross margin`, `(Revenue − direct costs) ÷ revenue`, `Pricing power`], [`Contribution margin`, `Price − variable cost per unit`, `What each sale adds to pay fixed costs`], [`Break-even units`, `Fixed costs ÷ contribution per unit`, `Minimum sales to not lose`], [`Net margin`, `Profit ÷ revenue`, `What you keep`], [`ROI`, `Profit ÷ investment`, `Return on money put in`], [`Runway`, `Cash ÷ monthly burn`, `Months until cash ends`], [`CAC / LTV`, `Acquisition cost / lifetime value`, `LTV > 3× CAC is healthy`]]],
        ['ex', `Price ₹500, variable cost ₹300 → contribution ₹200. Fixed costs ₹80,000/month → break-even 400 units a month.`]],
      [`Cash flow beats profit`, `A profitable firm can run out of cash if customers pay in 60 days but suppliers want payment in 15. **Working capital = receivables + inventory − payables.** Invoice promptly, follow up, negotiate terms, hold a cash reserve of 3–6 months of fixed costs.`],
      [`Compliance basics (India)`,
        ['ul', `**Structure:** sole proprietorship, partnership, LLP, Pvt Ltd; trade-off is liability, compliance, and tax.`, `**Registrations:** PAN, bank account, Udyam (MSME), GST (mandatory above ₹40 L goods / ₹20 L services turnover; lower in special states), Shops & Establishment, FSSAI for food, professional tax.`, `**GST:** monthly/quarterly returns (GSTR-1, 3B), input tax credit, e-invoicing above thresholds.`, `**Income tax:** presumptive 44AD (6%/8% of turnover) / 44ADA (50% for professionals), books and audit above limits, advance tax.`, `**TDS** on payments (rent, contractors, professional fees) and TDS returns.`, `**Separate business and personal accounts** always.`]],
      [`Financing`,
        ['ul', `Bootstrapping, friends/family, Mudra loans, CGTMSE-covered bank loans, NBFC/working-capital lines, angel/VC (for scalable products).`, `Do not use personal credit cards for business expenses; pay yourself a salary.`]]
    ],
    advisor: [`Price from costs plus margin; know your break-even before you start.`, `Keep 6 months' fixed costs as a cash reserve in the business.`, `Register (Udyam, GST if required) and keep books from day one.`, `Avoid personal guarantees you can't afford to lose.`],
    checklist: [`Contribution margin and break-even calculated.`, `Business account separate.`, `Registrations done (Udyam, GST as required).`, `Books and invoices maintained.`, `Cash reserve ≥ 3 months.`, `Insurance (stock, liability, health) arranged.`],
    verify: [`MCA — mca.gov.in`, `GST portal — gst.gov.in`, `Udyam — udyamregistration.gov.in`, `Mudra — mudra.org.in`]
  });

  G({
    id: 'bizstart', module: 'bizstart', cat: 'Plan', read: '25 min read', title: 'Start a business — idea to first customer, in order',
    summary: `Validate the idea, test cheaply, pick the structure, register, price, sell, keep books and scale.`,
    calcs: ['breakeven', 'roi', 'runway'], tools: [['Business ideas', '#/tool/bizideas']],
    sections: [
      [`Step 1 — Idea and validation`,
        ['ol', `Write who the customer is, their problem, how they solve it today and what they pay.`, `Talk to **20 potential customers**. If 5 would pay now, go on.`, `Run a **cheap test:** a landing page, pre-orders, a pilot with 3 customers.`]],
      [`Step 2 — Money plan`,
        ['ul', `Startup cost + 6 months' running costs = capital needed. Keep personal **emergency fund separate**.`, `Decide your owner's salary; set a budget; calculate break-even.`]],
      [`Step 3 — Structure and registration`,
        ['tbl', ['Structure', 'Liability', 'Good for'], [[`Proprietorship`, `Unlimited`, `Freelancers, small shops`], [`Partnership / LLP`, `LLP limited`, `Professional firms`], [`Pvt Ltd`, `Limited`, `Scalable, outside investment`]]],
        `Register: PAN, bank account, **Udyam**, GST (if needed), trade licence, FSSAI/other sector licences, trademark for brand.`],
      [`Step 4 — Sell and deliver`,
        ['ul', `Start with a narrow niche; get 10 paying customers before scaling.`, `Price on value; never below cost + margin.`, `Collect advance payment; invoice properly.`]],
      [`Step 5 — Books and tax`, `Record every transaction, keep bills, file GST and income tax on time, pay yourself a salary and separate personal from business.`],
      [`Step 6 — Grow or stop`, `Reinvest profits, hire slowly, track margin and cash weekly. If you miss break-even for 6 months despite fixes, pivot or close before losing savings.`]
    ],
    advisor: [`Start on the side while employed; quit only when the business pays you ~50% of salary for 6 months.`, `Keep your emergency fund and health/term insurance intact.`, `Never borrow against your home for a first venture.`],
    checklist: [`20 customer conversations done.`, `Pilot with paying customers.`, `Capital needed computed.`, `Structure chosen; registrations done.`, `Separate account and books.`, `Owner's salary fixed.`],
    verify: [`Startup India — startupindia.gov.in`, `MCA — mca.gov.in`, `GST portal — gst.gov.in`]
  });
})();
