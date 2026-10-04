/* guides-5.js — FOUNDATIONS & DECISIONS: basics, income, budgeting, spending, earn more, playbook (+ will/nominee/estate), scenarios, opportunity cost, decision, financial health */
window.FOS = window.FOS || {};
(function () {
  'use strict';
  const G = FOS.G;

  G({
    id: 'basics', module: 'basics', cat: 'Money basics', read: '16 min read', title: 'Money basics — the ideas behind every decision',
    summary: `Inflation, interest, compounding, the time value of money, risk vs return, needs vs wants, and the Rule of 72 — explained with rupees.`,
    calcs: ['inflation', 'compound', 'fv', 'pv', 'cagr'],
    sections: [
      [`Inflation — the silent tax`,
        `Prices rise ~5–7% a year in India. ₹100 of groceries today costs ₹179 in 10 years at 6%. **Money that doesn't grow faster than inflation is quietly shrinking.**`,
        ['ex', `₹10 lakh in a 3.5% savings account with 6% inflation loses about 2.5% of purchasing power a year — in 20 years its "real" value is ~₹6 L.`]],
      [`Simple vs compound interest`,
        ['ul', `**Simple:** interest on the original amount only. ₹1 L at 8% for 10 years = ₹1.8 L.`, `**Compound:** interest on interest. Same ₹1 L becomes ₹2.16 L. At 20 years: ₹3.2 L vs ₹2.6 L.`, `**Rule of 72:** years to double ≈ 72 ÷ rate. At 8% → 9 years; at 12% → 6 years; at 36% card interest → 2 years (debt doubles fast).`]],
      [`Time value of money`, `₹1 lakh today is worth more than ₹1 lakh in 5 years, because today's money can earn and inflation erodes the future money. Use **PV** (what a future sum is worth today) and **FV** (what today's money will become).`],
      [`Risk and return`, `Higher potential return always comes with the chance of loss. Safe assets protect; growth assets build. Diversify across asset classes; match risk to the time you can wait.`],
      [`Needs, wants, habits`, `Needs: housing, food, health, transport, insurance. Wants: upgrades, dining out. Habits: automatic spending you never decided (subscriptions). Trim habits first; they are invisible and large.`],
      [`Six principles`,
        ['ol', `Spend less than you earn.`, `Pay yourself first (automate savings).`, `Build a buffer, then insure.`, `Avoid high-interest debt.`, `Invest early and steadily, by goal.`, `Review yearly; ignore noise.`]]
    ],
    advisor: [`Set up an automatic transfer of 20% of salary to savings/investments the day pay arrives.`, `Treat inflation as the enemy; hold growth assets for 5+ year goals.`, `Learn one concept a week using the Knowledge section.`],
    checklist: [`I can explain inflation and compounding.`, `Savings are automated.`, `No high-interest debt.`, `I track one monthly number: savings rate.`],
    verify: [`RBI — inflation data (rbi.org.in)`, `MoSPI — mospi.gov.in (CPI)`]
  });

  G({
    id: 'income', module: 'income', cat: 'Money basics', read: '20 min read', title: 'Income & salary — CTC, payslip, PF, gratuity, Form 16',
    summary: `Decode your offer letter and payslip: CTC vs gross vs net, each component, PF/ESI, gratuity, variable pay, notice period, Form 16 and negotiation.`,
    calcs: ['salary', 'hra', 'incometax', 'whatif-salary'],
    sections: [
      [`CTC, gross, in-hand`,
        ['tbl', ['Term', 'Meaning'], [[`CTC`, `Cost to company: everything the employer spends on you`], [`Gross`, `Monthly pay before deductions (basic + HRA + allowances)`], [`Net / take-home`, `Gross − PF − professional tax − TDS − other deductions`], [`Variable pay`, `Performance-linked; not guaranteed`], [`Employer-only items`, `Employer PF, gratuity, insurance, bonus — not in your hand monthly`]]],
        ['ex', `CTC ₹12 L: basic ₹5 L, HRA ₹2.5 L, special allowance ₹2.8 L, employer PF ₹0.6 L, gratuity ₹0.24 L, insurance ₹0.1 L. In-hand ≈ ₹8.9–9.1 L before tax, ≈ ₹73–76k per month after PF and tax (varies by regime).`]],
      [`Reading the payslip`,
        ['ul', `**Earnings:** basic, HRA, special allowance, LTA, bonus, reimbursements.`, `**Deductions:** employee PF (12% of basic), professional tax (≤ ₹2,500/yr), TDS, NPS, loan recoveries, health premium.`, `**YTD** totals; verify TDS with Form 16 at year end.`, `Low basic = low PF and gratuity (less retirement money) but higher take-home; high basic = more retirement savings.`]],
      [`PF, gratuity, ESI, bonus`,
        ['ul', `**PF:** 12% + 12%; see the Government Schemes guide.`, `**Gratuity:** (last basic + DA) × 15/26 × years of service; paid after **5 years** (exempt up to ₹20 L).`, `**ESI:** for gross up to ₹21,000: medical and cash benefits.`, `**Bonus Act:** 8.33–20% of wages (capped) for eligible staff.`]],
      [`Joining or leaving a job`,
        ['ul', `Get an **offer letter**, **appointment letter** with notice, probation, bond, and variable terms in writing.`, `On exit collect **relieving letter**, **experience letter**, **Form 16**, **full-and-final settlement** statement, **PF transfer**, and ensure **UAN** is active.`, `Keep health cover alive (portability or your own policy).`]],
      [`Negotiating pay`, `Know market pay (Glassdoor, LinkedIn, peers). Negotiate **fixed** pay, not variable; ask about joining bonus, notice buy-out, learning budget, remote days, health cover. Compare offers on **in-hand + benefits + growth**, not CTC alone.`],
      [`Second income and side income`, `Freelance, teaching, rental, interest, dividends: report in ITR; freelancers can use 44ADA (50% presumptive). Keep invoices and pay advance tax.`]
    ],
    advisor: [`Ask for a CTC breakup with basic ≥ 40%, PF treatment, variable %, and the in-hand value.`, `Move your spending to what you earn fixed; treat variable pay as savings.`, `Build a second income stream within 3 years.`],
    checklist: [`CTC breakup read and understood.`, `Payslip verified monthly for the first 3 months.`, `UAN active; PF passbook checked.`, `Form 16 received every June.`, `Notice period and bond terms known.`],
    verify: [`EPFO — epfindia.gov.in`, `Labour codes / Payment of Gratuity Act`, `Income Tax — Form 16 guide`]
  });

  G({
    id: 'budgeting', module: 'budgeting', cat: 'Money basics', read: '16 min read', title: 'Budgeting — 50/30/20, zero-based and envelope systems',
    summary: `Three proven methods, how to set categories for Indian households, fix irregular expenses with sinking funds, and the monthly routine that makes it stick.`,
    calcs: ['savingsrate', 'subscription'], tools: [['Budget planner', '#/tool/budget'], ['Expense log', '#/tool/expenses']],
    sections: [
      [`Three methods`,
        ['tbl', ['Method', 'How', 'Best for'], [[`50/30/20`, `50% needs, 30% wants, 20% savings/debt`, `Beginners`], [`Zero-based`, `Income − all planned spending = 0; every rupee assigned`, `Tight budgets, debt payoff`], [`Envelope / cash-stuffing`, `Fixed cash or sub-accounts per category`, `Overspenders`], [`Pay-yourself-first`, `Auto-save first, spend the rest`, `Simple and effective`]]],
        `In high-rent cities needs can hit 60%; then push wants to 20% and keep the 20% savings intact.`],
      [`Build the budget in 30 minutes`,
        ['ol', `List take-home income.`, `List **fixed** (rent, EMI, insurance, school), **variable** (food, fuel, utilities), **irregular** (vehicle service, gifts, annual premiums, festivals).`, `Divide irregular costs by 12 → a **sinking fund** transfer each month.`, `Set the savings amount first (20%+), then limits for wants.`, `Use the Expense log for 2 months to see real numbers; adjust.`]],
      [`Indian specifics`, `Festival months, weddings, annual insurance premiums, school fees in April, and family support are predictable — plan them. Keep a **"family" line** in the budget for parents or relatives.`],
      [`Monthly routine (15 minutes)`, `Log expenses weekly, close the month on the last day with Month-End Close, compare with budget, move leftover to savings, and reset.`],
      [`Common failures`,
        ['ul', `Budget too strict → abandoned. Leave a 5–10% "fun" line.`, `Forgetting irregular costs.`, `Not tracking cash/UPI.`, `Saving what is left — nothing is left.`]]
    ],
    advisor: [`Use **pay-yourself-first**: a SIP and a sinking-fund transfer on salary day; spend the rest freely.`, `Review every category quarterly; cut the top 3 leaks only.`],
    checklist: [`Income, fixed, variable, irregular listed.`, `Savings automated first.`, `Sinking funds set.`, `Expense log in use.`, `Month-End Close done monthly.`],
    verify: [`Your bank/UPI statements`]
  });

  G({
    id: 'spending', module: 'spending', cat: 'Money basics', read: '10 min read', title: 'Everyday spending — the small leaks that cost lakhs',
    summary: `The latte factor done honestly: subscriptions, delivery fees, impulse buys and lifestyle creep — and how to decide when a purchase is worth it.`,
    calcs: ['subscription', 'oppcost', 'fv'],
    sections: [
      [`Small daily costs compound`,
        ['ex', `₹200 a day on snacks/delivery = ₹73,000 a year. Invested at 12% for 20 years: **₹59 lakh**. The point is not never to spend — it is to spend on purpose.`]],
      [`Where leaks hide`,
        ['ul', `**Subscriptions:** OTT, apps, gym, cloud — audit every quarter.`, `**Delivery fees, surge, convenience fees.**`, `**Impulse buys:** sale-driven shopping, BNPL.`, `**Convenience debt:** EMIs on gadgets.`, `**Lifestyle creep:** every raise becomes spending.`]],
      [`The 24-hour / 30-day rule`, `Wait 24 hours before any non-essential purchase under ₹5,000; 30 days above that. Ask: cost per use, what I would give up, can I buy a good used/refurbished one?`],
      [`Spend on what you value`, `Cut ruthlessly on things you don't care about; spend freely on 2–3 things you love. Budgets fail from deprivation, not from generosity.`]
    ],
    advisor: [`Audit subscriptions today; cancel anything not used in 30 days.`, `Freeze the UPI limit for discretionary apps; adopt the 24-hour rule.`, `Send 50% of every raise straight to investments.`],
    checklist: [`Subscriptions audited.`, `24-hour rule adopted.`, `Delivery/app spends tracked.`, `Raise → 50% to SIP.`],
    verify: [`Your bank/UPI statements`]
  });

  G({
    id: 'earnmore', module: 'earnmore', cat: 'Plan', read: '18 min read', title: 'Earn more, keep more — income growth and leak plugging',
    summary: `How to raise income (skills, job moves, side income, business), cut expenses smartly, use tax and benefits fully, and compound both.`,
    calcs: ['whatif-salary', 'savingsrate', 'oppcost'], tools: [['Business ideas', '#/tool/bizideas']],
    sections: [
      [`Income growth ladder`,
        ['ol', `**Skills:** one high-demand skill every 2 years.`, `**Job moves:** 15–30% jumps come from switching roles, not annual hikes (8–10%).`, `**Side income:** freelancing, tutoring, consulting, content.`, `**Business:** scale what already works.`, `**Assets:** dividends, rent, interest.`]],
      [`Keep more`,
        ['ul', `Use the right **tax regime**, EPF/NPS employer benefits, HRA, health insurance.`, `Reduce **fees**: direct mutual funds, zero-fee cards, no-minimum accounts.`, `Switch **utilities/insurance** at renewal; negotiate loans.`, `Avoid interest: pay card dues in full.`]],
      [`Side income ideas (realistic)`,
        ['tbl', ['Idea', 'Start cost', 'Time', 'Notes'], [[`Tutoring / coaching`, `Low`, `5–10 hrs/wk`, `₹500–2,000 per hr`], [`Freelance (design, writing, dev)`, `Low`, `10 hrs`, `Portfolio, platforms`], [`Online store / reselling`, `Medium`, `10+ hrs`, `Inventory risk`], [`Consulting in your field`, `Low`, `Variable`, `Use network`], [`Rent out an asset (room, equipment)`, `Varies`, `Low`, `Rent/tax rules`]]]],
      [`Tax and compliance`, `Side income is taxable; freelancers may use 44ADA, pay advance tax, and need GST only above thresholds. Keep invoices.`],
      [`Compounding both sides`, `₹5,000 a month more savings for 20 years at 12% ≈ ₹50 lakh. Earning ₹10,000 extra a month and investing half gives ≈ ₹50 lakh too. Do both.`]
    ],
    advisor: [`Pick one skill and one side income to build this year.`, `Invest at least 50% of extra income.`, `Review fees and renewals every quarter.`],
    checklist: [`Skill plan for 12 months.`, `Side-income experiment started.`, `Fees and renewals reviewed.`, `Extra income → investments.`],
    verify: [`Income Tax — 44ADA; GST thresholds`]
  });

  G({
    id: 'playbook', module: 'playbook', cat: 'Decide', read: '25 min read', title: 'Life playbook — order of operations, plus will & estate',
    summary: `What to do in which order from your first salary to retirement, and how to protect your family with a will, nominees and a document trail.`,
    calcs: ['lifesim', 'goal'], tools: [['Life ladder', '#/tool/ladder']],
    sections: [
      [`The order of money`,
        ['ol', `**Stabilise:** budget, track, 1-month emergency fund.`, `**Protect:** health, term, accident insurance.`, `**Clear** high-interest debt.`, `**Emergency fund** to 6 months.`, `**Retirement** SIPs (EPF/PPF/NPS/index).`, `**Goals:** education, home, child.`, `**Optimise:** tax, fees, allocation.`, `**Give/estate:** will, nominees, gifting.`]],
      [`By decade`,
        ['tbl', ['Age', 'Focus'], [[`22–30`, `Skills, savings rate, insurance, first SIPs, avoid lifestyle debt`], [`30–40`, `Home decision, kids, term cover, step-up SIPs`], [`40–50`, `Peak earning, education funding, retirement catch-up, rebalance`], [`50–60`, `Debt-free, glide path, health cover, estate plan`], [`60+`, `Buckets, SCSS, annuity, legacy`]]]],
      [`Will, nominee and succession`,
        ['ul', `**Nominee ≠ owner:** for most assets the nominee is a trustee who must pass money to legal heirs (except insurance, where the nominee under Section 39 beneficiary status may be the beneficial owner). Keep both nominee and will aligned.`, `**Will:** write a simple will on plain paper (or stamp paper); 2 witnesses; name an executor; mention guardians for children; sign each page. **Registration** is optional but adds strength. Update after marriage, kids, property.`, `**Intestate (no will)** → succession by personal law (Hindu Succession Act, Muslim law, etc.). It takes months/years and legal fees.`, `**Documents to leave:** list of accounts, policies, FDs, demat, EPF/NPS UAN/PRAN, property papers, loan details, digital-account access instructions, lockers, passwords (via a password manager with an emergency contact).`, `**Joint holding:** "either or survivor" simplifies bank/demat access.`, `**Power of attorney and health directives** for older age.`]],
      [`Family communication`, `One hour a year: walk through the Records tool with spouse and parents. If you were unavailable tomorrow, could they find everything in 10 minutes?`],
      [`Big-decision list`,
        ['ul', `Buying a home → see Property guide.`, `Buying a vehicle → see Vehicle guide.`, `Loans → see Loans guide.`, `Career move → compare in-hand, growth, benefits, risk.`, `Business start → see Start a Business.`]]
    ],
    advisor: [`Follow the order: protect → clear debt → emergency fund → retirement → goals.`, `Write a will this year and update nominees everywhere.`, `Hold an annual family money meeting; keep the Records tool current.`],
    checklist: [`Insurance in place.`, `Emergency fund funded.`, `Retirement SIP on.`, `Will drafted; nominees updated.`, `Records shared with family.`],
    verify: [`Indian Succession Act / personal laws (indiacode.nic.in)`, `IRDAI — nominee rules`, `Bank/EPFO/NPS nomination portals`]
  });

  G({
    id: 'scenarios', module: 'scenarios', cat: 'Decide', read: '10 min read', title: 'Scenario simulator — ask "what if?" with maths',
    summary: `Stress-test job loss, rate rises, market falls, inflation and raises using transparent assumptions.`,
    calcs: ['whatif-job', 'whatif-emi', 'whatif-fall', 'whatif-inflation', 'whatif-invest', 'whatif-rent', 'whatif-retire', 'whatif-salary'],
    sections: [
      [`Why scenarios`, `A forecast is a guess; a scenario is a test: "If I lose my job for 6 months, how long does my buffer last?" It shows weak spots before life does.`],
      [`Scenarios worth running every year`,
        ['tbl', ['What if', 'Learn'], [[`Job loss 3–12 months`, `Runway; need for emergency fund`], [`Interest rate +2%`, `EMI stress`], [`Market −30%`, `Portfolio and sequence risk`], [`Inflation 8%`, `Retirement and SIP targets`], [`Salary +10% / +0%`, `Impact of raises on goals`], [`Rent +10%`, `Housing choices`]]]],
      [`How to use results`, `If a scenario breaks your plan, fix the weak link: more emergency fund, lower EMI, more insurance, better asset mix. Re-run after the fix.`]
    ],
    advisor: [`Run job-loss and market-fall scenarios every January.`, `Make sure your plan survives a 30% equity drop without selling.`],
    checklist: [`Job-loss runway ≥ 6 months.`, `EMI OK at +2% rate.`, `Plan survives −30% equity.`, `Inflation-8% scenario reviewed for retirement.`],
    verify: [`Your own inputs; see each calculator's note`]
  });

  G({
    id: 'oppcost', module: 'oppcost', cat: 'Decide', read: '8 min read', title: 'Opportunity cost — the price of what you gave up',
    summary: `How to compare any spend with the alternative use of the same money and time.`,
    calcs: ['oppcost', 'fv'],
    sections: [
      [`Idea`, `Every rupee has one best alternative use. Opportunity cost = the value of the next-best option you give up.`,
        ['ex', `A ₹1.2 L phone upgrade vs investing it at 12% for 20 years = ₹11.6 L. The phone's true cost is ₹11.6 L of future freedom, not ₹1.2 L.`]],
      [`How to use it`,
        ['ol', `Write the alternative.`, `Compute future value at a realistic rate.`, `Add time costs (hours worked to pay).`, `Decide consciously; buy if the value exceeds the alternative.`]],
      [`Time cost`, `Your hourly take-home = monthly take-home ÷ hours. A ₹3,000 item at ₹300/hour costs 10 hours of your life.`]
    ],
    advisor: [`Apply to every purchase above ₹10,000: FV at 10–12% and hours of work.`, `Keep guilt-free categories; the aim is awareness, not deprivation.`],
    checklist: [`Alternative identified.`, `FV computed.`, `Hours of work computed.`, `Decision made consciously.`],
    verify: [`Your own numbers`]
  });

  G({
    id: 'decision', module: 'decision', cat: 'Decide', read: '12 min read', title: 'Decision engine — a method for big money decisions',
    summary: `A six-step method: facts, total cost, risks, alternatives, regret test, and reversible vs irreversible.`,
    calcs: ['loancost', 'oppcost', 'rentbuy'], tools: [['Decision Engine', '#/tool/decision']],
    sections: [
      [`Six steps`,
        ['ol', `**Facts:** price, tenure, rate, fees, penalties — write all.`, `**Total cost** over the whole period, not EMI.`, `**Risks:** job loss, rate rise, market fall, health.`, `**Alternatives:** do nothing, cheaper version, later, rent, used.`, `**Regret test:** would I be OK if this went wrong? 10 days, 10 months, 10 years.`, `**Reversibility:** avoid irreversible big bets without a 1-week pause.`]],
      [`Red flags`,
        ['ul', `Pressure to decide today, guaranteed returns, EMI-only pricing, "limited period", a contract you don't fully understand, an advisor paid by commission.`]],
      [`Get a second opinion`, `For purchases above 3 months' income, share the numbers with a trusted person or a fee-only adviser (SEBI-registered RIA).`]
    ],
    advisor: [`Use the Decision Engine for anything above 1 month's income.`, `Pause 7 days before big commitments.`, `Prefer reversible choices.`],
    checklist: [`Total cost computed.`, `Risks listed.`, `3 alternatives considered.`, `7-day pause observed.`],
    verify: [`SEBI — RIA list: sebi.gov.in → Intermediaries`]
  });

  G({
    id: 'health', module: 'health', cat: 'Decide', read: '12 min read', title: 'Financial health — ratios that tell the truth',
    summary: `Savings rate, debt-to-income, emergency months, insurance adequacy, net-worth-to-income and investment-to-income — with target ranges.`,
    calcs: ['savingsrate', 'dti', 'emergency', 'cover'], tools: [['Health check', '#/tool/health']],
    sections: [
      [`The ratios`,
        ['tbl', ['Ratio', 'Formula', 'Healthy'], [[`Savings rate`, `Savings ÷ income`, `≥ 20%`], [`Debt-to-income`, `EMIs ÷ income`, `≤ 35%`], [`Emergency months`, `Liquid savings ÷ essentials`, `≥ 6`], [`Insurance adequacy`, `Term cover ÷ income`, `≥ 15×`], [`Housing cost`, `Rent/EMI ÷ income`, `≤ 30%`], [`Net worth multiple`, `Net worth ÷ annual income`, `Age-based: 1× at 30, 3× at 40, 6× at 50`], [`Credit utilisation`, `Card balance ÷ limit`, `< 30%`]]]],
      [`How to improve`, `Fix the weakest ratio first: usually emergency months or insurance. Re-measure quarterly.`],
      [`No mystery score`, `Each metric is shown with its formula so you can see what to change; there is no black-box number.`]
    ],
    advisor: [`Measure quarterly; pick one ratio to improve per quarter.`, `Order: emergency → insurance → debt → savings rate.`],
    checklist: [`All ratios measured.`, `Weakest ratio has an action.`, `Quarterly review scheduled.`, `Numbers come from my own entries, not estimates.`],
    verify: [`Your own statements`]
  });
})();
