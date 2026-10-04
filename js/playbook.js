/* ==========================================================================
   playbook.js — practical guides: used-vehicle buying, affordability rules,
   tax essentials & legal planning, starting a business, earn/save more,
   life playbook, expense log, business-idea finder, life ladder, My Money Review
   ========================================================================== */
(function () {
  'use strict';
  const { F, S, reg } = FOS, C = FOS.calc, fmt = FOS.fmt, U = FOS.ui, esc = U.esc, store = FOS.store, ch = () => FOS.charts;
  const L = (mod, title, o) => { (FOS.LESSONS[mod] = FOS.LESSONS[mod] || []).push(Object.assign({ id: mod + '-' + (FOS.LESSONS[mod].length + 1), t: title }, o)); };
  const Q = (mod, q) => { (FOS.QUIZ[mod] = FOS.QUIZ[mod] || []).push(q); };
  const mc = (q, o, a, e, w, rel) => ({ t: 'mc', q, o, a, e, w, rel });
  const tf = (q, a, e, w, rel) => ({ t: 'tf', q, o: ['True', 'False'], a: a ? 0 : 1, e, w, rel });
  FOS.LESSONS = FOS.LESSONS || {}; FOS.QUIZ = FOS.QUIZ || {};
  const V = 'Current figures: see Data & Sources.';

  /* ============================ VEHICLE ============================ */
  FOS.LESSONS.vehicle = FOS.LESSONS.vehicle || [];
  L('vehicle', 'Buying a second-hand bike or car: paperwork and inspection, step by step', {
    analogy: 'A used vehicle comes with a biography. Your job before paying is to read it — and check that the person handing it over is allowed to.',
    simple: 'Before any money moves, prove three things: the vehicle is who the papers say it is (chassis/engine numbers), nobody else has a claim on it (loan, challans, theft), and you can transfer it legally into your name.',
    tech: '1) RC (Registration Certificate): registration number, owner, make/model, year, chassis and engine numbers. Physically compare the chassis number on the frame and the engine number on the crankcase with the RC, insurance and invoice. 2) Hypothecation: if the RC shows a bank/NBFC, you need Form 35 and a loan-closure NOC. 3) Seller authority: the registered owner, or a finance/chit company with documents proving repossession/auction rights. 4) Dues: e-challans, road tax, insurance validity, PUC. 5) Condition: independent mechanic, test ride, service history, accident/flood signs. 6) Transfer: Forms 29 and 30 (signed by seller), signed RC, insurance transfer, ID/address proof, fees; apply within the legal time limit. 7) Payment: by bank transfer against documents, written invoice, keep receipts. ' + V,
    ex: 'A 4-year-old bike listed at ₹55,000 by a finance company: RC shows hypothecation to a bank. You ask for Form 35 and the loan-closure letter; the chassis number on the frame is scratched. Decision inputs: mismatch + missing NOC = walk away, however good the price. If papers are clean, add costs: transfer and insurance ₹4,000, tyres and battery ₹5,000, first service ₹1,500 → real cost ≈ ₹65,500, not ₹55,000.',
    risks: 'Loan still on the vehicle; stolen or tampered vehicle; unpaid challans and tax; seller not entitled to sell; odometer rollback; hidden accident damage; being unable to transfer the RC. A cheap price is often paying for one of these.',
    check: ['Chassis and engine numbers match RC on the metal', 'Form 35 / NOC if hypothecated', 'Seller\'s authority to sell', 'e-challans and dues cleared', 'Insurance and PUC valid', 'Independent mechanic report', 'Forms 29/30 and RC signed, payment traceable'],
    mistakes: ['Paying first and “collecting papers later”', 'Paying in cash with no receipt', 'Trusting the seller\'s mechanic', 'Ignoring the cost of immediate repairs', 'Not transferring the RC into your name (you stay liable for the seller\'s past and your future fines)'] });
  L('vehicle', 'Buying through a finance company, chit company or auction', {
    analogy: 'A chit is a group savings circle; a registered one is a tool, an unregistered one is a risk. The vehicle you buy with the prize is a separate decision.',
    simple: 'Companies that sell second-hand or repossessed vehicles, or sell through chit schemes, can offer fair prices — if the paperwork and the scheme are clean.',
    tech: 'Chit funds are regulated by the Chit Funds Act, 1982 and state Registrars of Chits: ask to see the registration, the chit agreement, foreman commission, how the prize is decided (auction discount), security required for prized subscribers and penalties on missed instalments. Repossessed vehicles are sold under the lender\'s rights after default: ask for the repossession/auction notice trail, loan closure proof, sale certificate, condition report and whether the vehicle is sold “as is”. Compare with the dealer price of a similar vehicle and with a normal used-vehicle loan.',
    ex: 'Chit of ₹5 lakh for 50 months (₹10,000/month): if you win the prize early through a 15% discount you receive ≈ ₹4.25 lakh but still owe the remaining instalments. That discount is a cost, like interest. Compare it with a 12% loan before using chit money for a vehicle.',
    risks: 'Unregistered chits can collapse; auction discounts and commissions are real costs; “as is” sales mean you absorb defects; transfer delays leave you liable.',
    check: ['Company and chit registration shown', 'Written terms for discount, commission, defaults', 'Full documents for the vehicle', 'Total cost vs a dealer / bank-loan route'],
    mistakes: ['Assuming a familiar brand name means every scheme is registered', 'Signing blank forms', 'Not reading default and seizure clauses'] });
  L('vehicle', 'Will I regret the EMI? The 20/4/10 guideline for vehicles', {
    analogy: 'A speed limit is not a ban; it tells you the pace at which most people can stay safe.',
    simple: 'For a car: put at least 20% down, finance for no more than 4 years, and keep total vehicle costs (EMI + fuel + insurance + maintenance) at or below about 10% of your gross income.',
    tech: 'Rationale: a down payment of 20% offsets early depreciation so you do not owe more than the car is worth; a short loan limits interest and keeps you from paying for a car you no longer like; the 10% cap keeps room for saving and other goals. Check with the Affordability Check calculator — it computes the EMI, tests each rule and shows the highest price that fits. Adapted versions exist for bikes. These are guidelines, not laws; your income stability, dependants and other EMIs change the answer.',
    ex: 'Gross income ₹80,000/month → vehicle budget ≈ ₹8,000/month in total. If fuel + insurance + maintenance take ₹3,500, the EMI headroom is ₹4,500 → at 9.5% for 4 years that supports a loan of ≈ ₹1.8 lakh and, with 20% down, a car of ≈ ₹2.2 lakh. A ₹9 lakh car needs roughly ₹3.6 lakh/month of income to fit the guideline — a hint that it may be a stretch (or that another option, such as a used car, could fit).',
    risks: 'Longer loans lower the EMI but raise total interest and keep you “underwater”. Buying on the maximum a bank will lend is a common path to EMI stress.',
    check: ['Down payment ≥ 20%', 'Loan ≤ 4 years', 'Total vehicle costs ≤ ~10% of gross income', 'Total EMIs still ≤ ~40% of take-home', '6 months of expenses still in cash after the down payment'],
    mistakes: ['Looking only at the EMI', 'Forgetting fuel and insurance', 'Stretching the loan to 7 years to afford a bigger car'] });
  Q('vehicle', mc('Under the 20/4/10 guideline, how long should a car loan be?', ['Up to 4 years', '7 years', 'As long as possible', 'No loan is ever allowed'], 0, 'The guideline is 20% down, loan up to 4 years, total vehicle costs about 10% of gross income.', 'Longer loans raise total interest and the risk of owing more than the car is worth.', 'afford'));
  Q('vehicle', mc('Which is the biggest red flag when buying a used bike?', ['Slightly worn seat', 'Chassis number on the frame does not match the RC', 'A service book', 'A spare key'], 1, 'A mismatch can mean tampering, theft or a wrong RC.', 'The others are normal or positive.', 'afford'));
  Q('vehicle', tf('If the RC shows hypothecation to a bank, you should get Form 35 and a loan-closure NOC before paying.', true, 'Otherwise the lender\'s claim may continue on the vehicle.', 'It is not a formality.', 'afford'));

  /* ============================ LOANS: how much can I borrow ============================ */
  FOS.LESSONS.loans = FOS.LESSONS.loans || [];
  L('loans', 'How much can I safely borrow? EMI rules of thumb', {
    analogy: 'A bank tells you the maximum weight the bridge can hold once; your life needs to cross it every month for years.',
    simple: 'Lenders approve far more than is comfortable. Use your own tests: total EMIs within ~40% of take-home, each purchase within its own guideline, and enough cash left after the down payment.',
    tech: 'Tests to run: (1) DTI/FOIR: all EMIs ÷ take-home ≤ ~40% (lower is safer). (2) Purchase rule: car 20/4/10; home: EMI ≤ ~35% of take-home, price ≲ 3–5× annual gross, 20% down. (3) Shock test: can you still pay if income falls 30% or the rate rises 2%? (4) Emergency fund: 6 months of essentials + EMIs remain after the down payment. (5) Compare total repayment and effective rate across lenders. Use the Affordability Check and the “What if my EMI increases?” simulator.',
    ex: 'Take-home ₹70,000 with existing EMI ₹8,000: a new EMI of ₹20,000 takes total EMIs to 40% (₹28,000) — at the limit. A 2-point rate rise on a floating home loan could push it above. Options: a smaller loan, bigger down payment, longer tenure (more interest), or waiting.',
    risks: 'Over-borrowing is the fastest path to a debt spiral. Variable-rate loans change EMI or tenure.',
    check: ['Total EMIs % of take-home', 'Stress test at -30% income and +2% rate', 'Cash left after down payment', 'Total cost incl. fees'],
    mistakes: ['Using gross income instead of take-home', 'Ignoring rent/other commitments', 'Counting expected bonuses as income'] });
  Q('loans', mc('Which test best protects you from over-borrowing?', ['Whatever the bank approves', 'Keeping total EMIs within ~40% of take-home and stress-testing a fall in income', 'Choosing the longest tenure', 'Borrowing against a credit card'], 1, 'Your own cash-flow limit is lower than the lender\'s maximum.', 'The other options increase cost or risk.', 'afford'));

  /* ============================ TAX ============================ */
  FOS.LESSONS.tax = FOS.LESSONS.tax || [];
  L('tax', 'Essential tax rules in one page (India)', {
    analogy: 'Tax is like a toll road with two routes (regimes). You pick the route once a year — you do not pick whether to pay the toll.',
    simple: 'You pay tax on income above an exempt limit, by slabs. For salaried people the new regime is the default; the old regime allows many deductions. Tax is deducted in advance (TDS) and settled when you file the return.',
    tech: 'Who: residents are taxed on worldwide income. Income heads: salary, house property, business/profession, capital gains, other sources. Regimes (the year set in Data & Sources; the defaults shipped are FY 2025-26): new regime — basic exemption to ₹4 lakh, slabs 5–30%, standard deduction ₹75,000, rebate so taxable income up to ₹12 lakh pays no tax (salaried ≈ ₹12.75 lakh); old regime — slabs from ₹2.5 lakh, deductions like 80C/80D/HRA, rebate up to ₹5 lakh. Plus 4% cess. Capital gains: listed equity held > 12 months — 12.5% on gains above ₹1.25 lakh a year; short-term — 20%; crypto — flat 30% with no loss set-off and 1% TDS. Interest income is added to income and taxed at slab. TDS is only an advance. Advance tax applies if your tax after TDS exceeds ₹10,000. ITR filing is due around 31 July for most individuals. ' + V,
    ex: 'Salaried, ₹15 lakh gross: new regime taxable ₹14.25 lakh after the ₹75,000 standard deduction → roughly ₹1.1 lakh tax including cess (use the Income Tax Estimator). Under the old regime with ₹2.5 lakh of deductions the result can be similar or higher — compare every year.',
    risks: 'Wrong regime, missed TDS credits, unreported interest or capital gains, late filing penalties, notices from mismatches with AIS/26AS.',
    check: ['Compare both regimes yearly', 'Check Form 26AS / AIS before filing', 'List all income: interest, dividends, capital gains, rent', 'Advance tax if applicable', 'Keep proofs for deductions'],
    mistakes: ['Assuming TDS means you have filed', 'Ignoring savings-account and FD interest', 'Investing only to save tax'] });
  L('tax', 'How to legally reduce tax — and where the line to evasion is', {
    analogy: 'Tax planning is using the doors the law provides. Evasion is breaking a window — and the alarm (penalties, prosecution, interest) is loud.',
    simple: 'You are allowed, and encouraged, to arrange your affairs to use deductions, exemptions and the better regime. You are not allowed to hide income, invent expenses or forge receipts.',
    tech: 'LEGAL (old regime): 80C up to ₹1.5 lakh (EPF/VPF, PPF, ELSS, term/life premiums, home-loan principal, children\'s tuition, NSC, 5-year tax-saver FD); 80D health insurance (self/family and parents; higher for seniors); 80CCD(1B) extra ₹50,000 NPS; HRA exemption with genuine rent; home-loan interest up to ₹2 lakh (self-occupied); 80E education-loan interest; 80TTA savings-account interest up to ₹10,000; 80G donations. LEGAL in both regimes: standard deduction for salaried; employer NPS contribution (80CCD(2)); choosing the better regime; using the ₹1.25 lakh yearly LTCG exemption on equity by booking gains in steps (tax-gain harvesting); holding equity over 12 months; tax-free PPF interest; splitting investments across family members only within clubbing rules. BUSINESS/PROFESSION: deduct genuine business expenses and depreciation; keep books; presumptive schemes (44AD/44ADA) can simplify compliance for eligible small businesses/professionals; choose GST composition only if suitable. ILLEGAL: not reporting income or cash receipts, fake rent receipts or HRA, false deduction claims, fake invoices, under-invoicing, hiding capital gains or crypto gains. Consequences: tax + interest + penalties up to a multiple of the tax evaded and possible prosecution. ' + V,
    ex: 'Old-regime example: ₹20 lakh gross, 30% slab. 80C ₹1.5 lakh + NPS ₹50,000 + 80D ₹25,000 = ₹2.25 lakh of deductions saves ≈ ₹70,000 + cess in tax — but only if you would have invested or insured anyway. New-regime example: ₹12.75 lakh salary = zero tax without any investing. Always compare using the calculator rather than assuming.',
    risks: 'Buying unsuitable products only for the deduction (e.g. insurance-investment combos); locking money you need; relying on “agents” who promise to make tax disappear.',
    check: ['Which regime is lower for me this year?', 'Would I buy this product without the tax benefit?', 'Is each deduction documented?', 'Is every income source reported?'],
    mistakes: ['Hiding small cash income', 'Claiming HRA without paying rent', 'Taking a loan or product only for the deduction'] });
  L('tax', 'Tax calendar & records — the habits that keep you out of trouble', {
    analogy: 'A calendar on the fridge beats a panic in July.',
    simple: 'A few dates and a folder of papers cover most of what individuals and small businesses need.',
    tech: 'Typical dates (verify each year): advance tax — 15 June (15%), 15 Sept (45%), 15 Dec (75%), 15 Mar (100%); salaried ITR — around 31 July; audit cases — later; GST — monthly/quarterly returns for registered businesses; TDS deposit — by the 7th of the next month. Records to keep: Form 16/16A, 26AS, AIS, investment proofs, rent receipts, loan interest certificates, capital-gains statements from brokers/AMCs, business invoices and bank statements for several years. Add reminders in the Reminders tool.',
    ex: 'A freelancer with ₹12 lakh of receipts should expect advance-tax instalments; paying only in March can attract interest under Sections 234B/234C.',
    risks: 'Interest and penalties for delay; lost deductions from missing proofs.',
    check: ['Reminders set for the four advance-tax dates if applicable', 'Folder of proofs per financial year', 'AIS reviewed before filing'],
    mistakes: ['Filing without reconciling AIS', 'Mixing business and personal transactions'] });
  Q('tax', mc('Which is legal tax planning?', ['Hiding cash income', 'Choosing the regime that gives lower tax and using eligible deductions', 'Fake rent receipts', 'Under-invoicing sales'], 1, 'Using provisions the law offers is planning; the others are evasion.', 'Evasion attracts tax, interest, penalties and possible prosecution.', 'incometax'));
  Q('tax', tf('Under the new regime defaults in this app, a salaried person earning about ₹12.75 lakh pays no income tax (standard deduction + rebate).', true, 'Standard deduction ₹75,000 plus the rebate on taxable income up to ₹12 lakh — verify current rules.', 'Rules change with every Budget.', 'incometax'));
  Q('tax', mc('What is the yearly LTCG exemption on listed equity in the configured rules?', ['None', '₹1.25 lakh', '₹10 lakh', '₹50,000 only for seniors'], 1, 'Gains up to ₹1.25 lakh a year are exempt under the configured rule; verify current law.', 'The amount is configured in TAX_RULES.', 'capgains'));

  /* ============================ BUSINESS: step by step ============================ */
  L('bizstart', '1 · Validate the idea before spending', {
    analogy: 'Do not build the restaurant before you know anyone is hungry for your food.',
    simple: 'Prove that real people will pay real money, in a small test, before you spend savings.',
    tech: 'Write the problem and customer in two sentences. Talk to 20 potential customers (not friends being polite). Pre-sell: take 5–10 advance orders or run a week-long pilot (a WhatsApp catalogue, a stall, a small batch). Measure: who paid, what price, why others refused. Only then scale spend.',
    ex: 'Home-made pickles: sell 30 jars to neighbours and office groups at ₹250. If 12 reorder in a month and you earn ₹60 per jar after ingredients, packaging and delivery, you have an early signal; if nobody reorders, change the product before buying machines.',
    risks: 'Spending on a shop, stock and branding before any customer has paid.',
    check: ['Who exactly is the customer?', 'How will they find me?', 'What will they pay, and how often?', 'What is my cost per unit?'],
    mistakes: ['Asking friends if they “like the idea”', 'Starting with the biggest version', 'Ignoring competitors'] });
  L('bizstart', '2 · The numbers: price, margin, break-even, runway', {
    analogy: 'A business is a bucket with a hole (costs) and a tap (sales). Break-even is when the tap matches the hole.',
    simple: 'Know your cost per unit, your selling price, your monthly fixed costs, and how many units you must sell to stop losing money.',
    tech: 'Variable cost per unit (ingredients, packaging, delivery, payment fees). Fixed costs per month (rent, salaries, EMI, software). Margin = price − variable cost. Break-even units = fixed ÷ margin. Startup budget = equipment + deposits + licences + initial stock + marketing + buffer. Runway = cash ÷ monthly burn. Also set your own owner\'s pay and keep 6–12 months of personal expenses outside the business. Use the Break-even, ROI and Runway calculators.',
    ex: 'Tiffin service: price ₹120, food cost ₹55, delivery/packaging ₹15 → margin ₹50. Fixed: cook ₹15,000, gas and electricity ₹5,000, app/marketing ₹3,000 = ₹23,000 → break-even 460 meals/month ≈ 18/day. If you can reliably get only 10 customers a day, the plan needs changes before launch.',
    risks: 'Underestimating costs; counting revenue as profit; forgetting your own salary; ignoring slow-paying customers.',
    check: ['Break-even per month and per day', 'Months of runway', 'What if sales are 50% of plan?'],
    mistakes: ['Pricing only from competitors, not from cost', 'Mixing personal and business cash'] });
  L('bizstart', '3 · Choose the structure', {
    analogy: 'Renting a room (proprietorship) is quick; building a house (company) protects you more but needs paperwork.',
    simple: 'Start as simple as the risk allows; upgrade when you need investors or liability protection.',
    tech: 'Proprietorship: one person, unlimited personal liability, simplest. Partnership firm: 2+ people, unlimited liability, written deed. LLP: limited liability, moderate compliance. One Person Company (OPC): solo founder with limited liability. Private Limited: limited liability, most credible for investors and scaling, highest compliance. Taxes differ (individual slabs vs company rates). Decide with a CA; ' + V,
    ex: 'A freelancer earning ₹8 lakh/year with low risk often starts as a proprietorship and may use the presumptive scheme. A startup planning external funding usually needs a Pvt Ltd.',
    risks: 'Unlimited liability in the simple structures; compliance cost in the complex ones.',
    check: ['Will I take loans or guarantee contracts?', 'Will investors be involved?', 'Who is liable if something fails?'],
    mistakes: ['Picking a company just for prestige', 'Partnering without a written agreement'] });
  L('bizstart', '4 · Registrations and licences (checklist)', {
    analogy: 'Registrations are the business\'s identity documents.',
    simple: 'Most are free or cheap; the order matters.',
    tech: '1) PAN; 2) a separate bank account (current/savings) in the business name; 3) Udyam (MSME) registration — free, online; 4) GST registration when required (threshold for goods/services differs; mandatory for some inter-state and e-commerce supplies — verify thresholds); 5) Shops & Establishment registration for a premises; 6) trade licence from the local body; 7) FSSAI licence for food; 8) professional tax registration where applicable; 9) sector-specific licences (drugs, education, transport etc.); 10) Startup India recognition if genuinely innovative. ' + V,
    ex: 'A home-based bakery: PAN + bank account + Udyam + FSSAI (registration/licence depending on turnover) + GST only when thresholds or marketplaces require it.',
    risks: 'Fines and closure for operating without licences; losing access to schemes.',
    check: ['Which licences does my sector need?', 'Do marketplaces require GST?', 'Who files what, and when?'],
    mistakes: ['Waiting to “see if it works” before registering', 'Collecting GST without registering'] });
  L('bizstart', '5 · Funding: bootstrap, bank schemes, investors', {
    analogy: 'Funding is fuel; choose the kind your engine can burn.',
    simple: 'Start with your own money and small loans; bring in investors only if the business truly needs to scale fast.',
    tech: 'Bootstrapping keeps ownership. Mudra loans (Shishu/Kishore/Tarun categories) offer collateral-free loans for small businesses up to a cap; CGTMSE-backed loans reduce collateral needs; PMEGP offers a subsidy on project cost for eligible new units; Stand-Up India supports eligible SC/ST/women entrepreneurs; angels/VCs trade equity for capital. Compare interest, processing fees, moratorium, prepayment and personal guarantees. State schemes vary (see Telangana/AP notes). ' + V,
    ex: '₹8 lakh food-processing unit without collateral: a Mudra loan can be cheaper than a 14–18% unsecured personal loan — but you still repay and may give a personal guarantee.',
    risks: 'Personal guarantees put your home at risk; over-borrowing before revenue exists.',
    check: ['Total cost of the loan', 'Collateral / guarantee needed', 'Subsidy conditions and timelines'],
    mistakes: ['Using credit cards to fund the business', 'Borrowing the maximum offered'] });
  L('bizstart', '6 · Taxes and compliance for a small business', {
    analogy: 'Keep the paperwork tidy and the taxman is just another customer with a schedule.',
    simple: 'Income tax on profit, GST if registered, TDS if you pay certain expenses or salaries, and advance tax during the year.',
    tech: 'Books: record every sale and expense; keep invoices and bank statements. Income tax: profit is taxed in your hands (proprietor) or the entity\'s. Presumptive schemes (44AD/44ADA) may let eligible small businesses/professionals declare a fixed % of turnover/receipts as profit with limited books — eligibility, limits and conditions apply. Advance tax instalments. GST: charge tax on invoices, claim input credit, file returns on time; a composition scheme exists for small traders (conditions apply). Payroll: PF/ESI apply only above employee-count thresholds (commonly 20 and 10 — verify). ' + V,
    ex: 'A consultant with ₹30 lakh receipts may choose presumptive taxation at 50% profit under 44ADA (if eligible) — tax is computed on ₹15 lakh, saving the effort of detailed accounts. A CA can confirm what fits.',
    risks: 'Penalties and interest; losing input credit; inconsistent records.',
    check: ['Monthly reconciliation', 'Filing calendar', 'Separate personal and business accounts'],
    mistakes: ['Paying personal expenses from the business account', 'Issuing cash sales with no records'] });
  L('bizstart', '7 · Running it: cash flow, pricing, people', {
    analogy: 'Profit is an opinion, cash is a fact.',
    simple: 'More businesses fail from running out of cash than from lack of profit.',
    tech: 'Collect faster than you pay: shorter credit terms, advance payments, deposits. Hold the minimum stock that avoids stock-outs. Review weekly: cash balance, receivables, payables, sales, margin. Price for cost + target margin, test increases. Hire only when the existing team is consistently at capacity; use written offer letters. Separate owner pay. Keep a cash reserve equal to 2–3 months of fixed costs.',
    ex: 'B2B supplier invoices ₹5 lakh on 45-day terms but pays its own supplier in 15 days: it needs ₹5 lakh of working capital for 30 days every cycle.',
    risks: 'Growth that outruns cash; one customer who owes most of the money.',
    check: ['Receivable days', 'Reserve months', 'Biggest customer share'],
    mistakes: ['Scaling before unit economics work', 'Discounting too early'] });
  L('bizstart', '8 · First 90 days and why businesses fail', {
    analogy: 'A good first 90 days is a series of small, cheap experiments.',
    simple: 'Plan the first 90 days week by week and decide upfront when you would stop or change.',
    tech: 'Weeks 1–2: validation and registrations. Weeks 3–6: first 10 customers; refine the offer. Weeks 7–10: repeat customers; measure cost per customer. Weeks 11–13: decide — continue, change, or stop based on pre-written numbers. Typical failure causes: no demand, cost too high, cash crunch, founder conflict, over-hiring, legal/tax problems, personal money mixed in. Keep your job or an income source until the business covers expenses for several months.',
    ex: 'Set rules before starting: “If after 90 days I have fewer than 20 repeat customers or my margin is below 30%, I change the offer.”',
    risks: 'Emotional attachment keeps you spending after the data says stop.',
    check: ['Pre-written stop/continue rules', 'Personal runway in months'],
    mistakes: ['Quitting a job before any revenue', 'Hiring friends without roles'] });
  L('bizstart', '9 · Telangana and Andhra Pradesh support (verify current policies)', {
    analogy: 'State schemes are the handrails on the staircase — use them, but check they still exist.',
    simple: 'Both states run single-window clearances and MSME incentives; details change with each policy cycle.',
    tech: 'Telangana: TS-iPASS single-window clearance, T-Hub (startup incubator), WE Hub (women entrepreneurs), MSME/industrial policy incentives such as capital/interest subsidies and SGST reimbursement for eligible units. Andhra Pradesh: AP Industrial Development Policy incentives and the Single Desk Portal; District Industries Centres (DICs) help with Udyam registration, loans and subsidies outside major cities. Realistic local categories: agri-processing, food brands (pickles, millets), IT services, e-commerce/D2C, education and skilling, healthcare and diagnostics in Tier-2/3 towns. Always confirm the current scheme name and subsidy percentage on the official Industries Department website.',
    ex: 'A small food unit outside a big city: first stop is the District Industries Centre for Udyam, loan facilitation and subsidy information.',
    risks: 'Relying on outdated subsidy information.',
    check: ['Current policy document', 'Eligibility and timeline for subsidy'],
    mistakes: ['Paying agents for “guaranteed subsidy”'] });
  Q('bizstart', mc('What should you do before spending savings on a new business?', ['Rent a shop', 'Test with real customers (pre-sell / pilot)', 'Buy stock in bulk', 'Hire staff'], 1, 'Validation reduces the risk of spending on an idea nobody buys.', 'The others commit money before demand is proven.', 'breakeven'));
  Q('bizstart', calc0('Fixed costs ₹23,000/month; margin ₹50 per meal. Break-even meals per month?', 460, 0, '23,000 ÷ 50 = 460.', 'breakeven'));
  Q('bizstart', tf('Mixing personal and business money in one account is fine when starting out.', false, 'Separate accounts make books, tax and loan applications far simpler.', 'Mixing hides whether the business actually makes money.', 'runway'));
  function calc0(q, a, tol, e, rel) { return { t: 'calc', q, a, tol, e, w: 'Use the formula in the related calculator.', rel }; }

  /* ============================ EARN MORE / SAVE MORE ============================ */
  L('earnmore', 'Earn more: the five levers', {
    analogy: 'Your income is a tree with five branches; most people only water one.',
    simple: 'Raise what you are paid, add a second stream, build a business, invest wisely, and reduce tax leakage.',
    tech: '1) Skills: pay follows scarce, demonstrable skills — certifications, projects, portfolios. 2) Job moves and negotiation: switch when the market pays more; compare total compensation (fixed, variable, PF, insurance). 3) Side income: freelancing, tutoring, services, resale (part-time; check employer rules). 4) Business: see the Start a Business guide. 5) Investing: returns on capital over time (uncertain). 6) Tax efficiency: keep more of each rupee legally. Track the extra income separately and decide in advance what share is saved (e.g. half of every raise) to avoid lifestyle inflation.',
    ex: 'A ₹10,000/month side income invested at a hypothetical 10% for 15 years ≈ ₹41 lakh (illustrative, not guaranteed); saving even half of each raise makes a long-run difference the calculator can show.',
    risks: 'Burnout, conflicts of interest with the employer, unreliable side income.',
    check: ['What skill would raise my pay most?', 'What % of extra income will I save?', 'Does my contract allow side work?'],
    mistakes: ['Raising spending as fast as income', 'Starting many side projects'] });
  L('earnmore', 'Save more: the big three first, then the leaks', {
    analogy: 'If a bucket leaks, fix the big hole before polishing the handle.',
    simple: 'Housing, transport and food usually make up most spending — small cuts there beat cutting coffee.',
    tech: 'Audit 3 months of spending with the Expense Log. Rank categories. Housing: rent ≤ ~30% of take-home is a common reference; consider sharing, moving closer to work, renegotiating rent. Transport: cost per km, public transport, used vehicle. Food: cooking share, delivery fees. Then recurring leaks: subscriptions, bank fees, late fees, interest on card balances, unused insurance riders. Then interest: refinance expensive loans, prepay card debt first, compare insurance quotes. Automate savings on payday (pay yourself first).',
    ex: 'Food delivery ₹450 × 12 orders = ₹5,400/month. Cooking half saves ≈ ₹1,900/month ≈ ₹22,800/year; invested at a hypothetical 10% for 15 years ≈ ₹7.9 lakh.',
    risks: 'Cutting joy to zero leads to rebound spending; saving while keeping 36% card debt is backwards.',
    check: ['Top 3 categories', 'Subscriptions I still use', 'Any debt above 15%?'],
    mistakes: ['Tracking nothing', 'Cutting tiny items while ignoring rent or EMI'] });
  L('earnmore', 'The maths of small changes', {
    analogy: 'One degree of change in direction decides whether you reach another city.',
    simple: 'A small extra monthly amount, started early, grows into a large sum; a small recurring leak drains a large one.',
    tech: 'FV of a monthly amount P over n months at monthly rate i = P × ((1+i)^n − 1)/i × (1+i). ₹2,000/month at a hypothetical 10% for 20 years ≈ ₹15 lakh on ₹4.8 lakh invested. The same rupees spent monthly for 20 years cost ₹4.8 lakh at 0% growth. Use the What-if “invest more” tool to see ranges.',
    ex: 'Increasing a SIP by 10% a year (step-up) is often more achievable than a large jump now.',
    risks: 'Projected returns are not guaranteed.',
    check: ['Step-up plan with each raise', 'Fees'],
    mistakes: ['Waiting for the “right” amount'] });
  Q('earnmore', mc('Where should you look first when trying to cut spending?', ['The 3 biggest categories', 'The smallest subscription', 'Nothing', 'Only coffee'], 0, 'Big categories (often housing, transport, food) move the total most.', 'Small leaks matter later.', 'subscription'));
  Q('earnmore', tf('Saving half of every raise is a simple way to avoid lifestyle inflation.', true, 'It locks in progress while improving lifestyle moderately.', 'Any fixed share works if you stick to it.', 'whatif-salary'));

  /* ============================ PLAYBOOK ============================ */
  L('playbook', 'The order of operations (the financial ladder)', {
    analogy: 'You do not build the second floor before the foundation. Each rung supports the next.',
    simple: 'Do the steps in order: track → emergency fund → insurance → clear expensive debt → invest regularly → goals → retirement → protect and review.',
    tech: 'Rung 1: know income and spending (Budget / Expense Log). Rung 2: emergency fund (3–6+ months, more if income is variable). Rung 3: health insurance (and term cover if others depend on you). Rung 4: clear debt costing more than you could sensibly earn (credit cards, instant loans). Rung 5: invest regularly matched to time horizon. Rung 6: define goals with amounts and dates. Rung 7: retirement path with EPF/PPF/NPS/equity. Rung 8: nominees, will, documents. Rung 9: review yearly, back up your data. The Life Ladder tool shows where you stand.',
    ex: '₹20,000 spare money in month 1 with no emergency fund or insurance: first to the emergency fund and insurance premium, not a SIP.',
    risks: 'Skipping to investing leaves you forced to sell at a bad time.',
    check: ['Which rung am I on?', 'What is the smallest next step?'],
    mistakes: ['Chasing returns before building a buffer', 'Mixing insurance and investing'] });
  L('playbook', 'Your 20s: habits, income and a safety net', {
    analogy: 'Your biggest asset in your 20s is time — and the habits that time multiplies.',
    simple: 'Get income growing, build a buffer, start small SIPs, avoid lifestyle debt.',
    tech: 'First salary: open accounts, set autopay, budget on take-home, start an emergency fund (even ₹5,000/month), buy health insurance (cheap when young), pay card bills in full. Invest ₹500–₹5,000 a month in a diversified low-cost option; raise it with each pay rise. Avoid buying a car/phone on long EMIs. Build skills. Keep a record of every account and nominee.',
    ex: '₹5,000/month started at 24 vs 34 (hypothetical 12%, until 60): roughly ₹3.2 crore vs ₹1.1 crore — the decade of time matters more than the amount.',
    risks: 'Lifestyle inflation, card debt, early big EMIs, scams targeting first-time earners.',
    check: ['Savings rate ≥ 10–20%', 'Health cover', 'No revolving card balance'],
    mistakes: ['Waiting to “earn more” before starting', 'Trading or crypto with borrowed money'] });
  L('playbook', 'Your 30s: build, protect and buy carefully', {
    analogy: 'Your 30s stack up big decisions: home, family, career leaps. The order matters.',
    simple: 'Protect dependants, buy assets you can carry, keep investing, and keep options open.',
    tech: 'Term insurance sized to dependants, higher health cover, emergency fund grows with expenses. Purchases: use the affordability checks before a car or home; keep total EMIs under ~40% of take-home; keep 6 months of expenses after the down payment. Set goals for children\'s education and retirement; step up SIPs yearly; consider a side income or business carefully using the business guide. Review tax regime each year; keep nominees updated.',
    ex: 'A family of four with ₹1.2 lakh take-home: EMIs cap ≈ ₹48,000 at 40%; a comfortable plan might aim much lower, leaving room for education SIPs.',
    risks: 'Over-leveraging on a home at peak prices or rates; under-insuring.',
    check: ['Cover vs dependants', 'EMI load', 'Goal SIPs set'],
    mistakes: ['Stretching for a bigger home than needed', 'Not updating nominees after marriage/children'] });
  L('playbook', 'Your 40s and 50s: consolidate and de-risk', {
    analogy: 'Sailing toward a harbour: trim the sails as the shore approaches.',
    simple: 'Clear debt, maximise retirement contributions, shift goals that are near from risky to safer assets.',
    tech: 'Prepay home loan if it costs more than your realistic post-tax returns (and you still have cover and buffer). Children\'s education goals shift to safer assets as the date nears. Retirement corpus review: use the Retirement planner with ranges; add healthcare inflation. Parents\' care and your own health cover upgrades. Simplify holdings; write a will; put nominees and account lists in one place for family.',
    ex: 'Age 50 with 60% equity: shift gradually toward 40–50% over the next years (a common glide-path idea, not a rule).',
    risks: 'Sequence-of-returns risk near retirement; underestimating medical costs.',
    check: ['Retirement gap under 3 return scenarios', 'Will and nominees', 'Health cover adequacy'],
    mistakes: ['Taking big risks to “catch up”', 'Funding children\'s wants over your own retirement'] });
  L('playbook', 'Hard moments: job loss, medical emergency, debt spiral, family support', {
    analogy: 'Storms are normal; what matters is whether you have a boat.',
    simple: 'A buffer, insurance and a written plan turn crises into problems instead of catastrophes.',
    tech: 'JOB LOSS: compute months of coverage (What if I lose my job?), cut discretionary spending, prioritise rent/EMIs/insurance, talk to lenders early (restructuring is better than default), use unemployment-friendly skills/freelance. MEDICAL: check cashless network, pre-authorisation, claim documents; buffer for co-pay and non-covered items. DEBT SPIRAL: stop new borrowing, list all debts, pay highest-rate first, ask lenders for lower rates/consolidation, avoid instant-loan apps. SUPPORTING PARENTS/FAMILY: budget a fixed line, keep your emergency fund separate. MARKET CRASH: do not sell to “stop the pain” if your horizon is long; rebalance only if planned. Use the Decision Engine for big choices and wait 72 hours.',
    ex: 'With ₹2.4 lakh emergency fund and ₹40,000/month outflow, a job loss gives 6 months; cutting discretionary by 25% stretches it to ~7.5.',
    risks: 'Panic decisions, asking relatives to pay off expensive debt without a plan.',
    check: ['Emergency months', 'Insurance details handy', 'Lenders\' contact plan'],
    mistakes: ['Hiding problems from family/lenders', 'Taking a new loan to pay an old one at a higher rate'] });
  L('playbook', 'Sustain it: automate, review yearly, back up your data', {
    analogy: 'A garden grows if you water it on a schedule, not by heroics.',
    simple: 'Automate the good behaviour and review once a year.',
    tech: 'Automate: salary → separate accounts (bills, savings, investing) on payday; SIP on the salary date; card autopay for total due. Annual review (pick a date): update net worth snapshot, savings rate, goals, insurance adequacy, tax regime, nominees, asset allocation. Backup: use Export in Settings to save your JSON file somewhere safe (cloud drive / pen drive) at least every 3 months — browser data can be cleared. Teach family where the records are.',
    ex: 'A 1-hour review each birthday: update snapshot, compare with last year, adjust SIP by 10%, renew insurance, export backup.',
    risks: 'Drift: no review means plans silently expire.',
    check: ['Review date set', 'Backup exported', 'Nominees current'],
    mistakes: ['Keeping data only on one device', 'Not telling family where documents are'] });
  Q('playbook', mc('In the financial ladder, which usually comes before regular investing?', ['Buying a car', 'Emergency fund and insurance', 'Trading', 'Crypto'], 1, 'A buffer and protection stop a bad month from forcing you to sell investments.', 'The others add risk first.', 'emergency'));
  Q('playbook', tf('Reviewing your finances once a year and exporting a backup is a sustainable habit.', true, 'It keeps plans current and protects your data.', 'Browser data can be cleared.', 'networthcalc'));

  /* ============================ AFFORDABILITY CALCULATOR ============================ */
  const AR = () => FOS.FINANCIAL_ASSUMPTIONS.affordability;
  reg({
    id: 'afford', title: 'Affordability Check (car, bike, home, phone)', group: 'Purchases', module: 'vehicle', tags: 'afford affordability car bike house home loan emi 20/4/10 rule down payment income percent can i buy',
    intro: 'Will this purchase fit your life? Tests the price and loan against widely used guidelines (for cars: 20% down, 4-year loan, total vehicle cost about 10% of gross income) and shows the highest price that fits. Guidelines, not verdicts.',
    fields: [F.sel('type', 'What are you buying?', 'car', Object.entries(AR()).filter(([k]) => k !== 'meta' && k !== 'universal').map(([k, v]) => [k, v.label])), F.money('price', 'Price (on-road for vehicles)', 900000, 30000000, 10000, { lo: 1 }), F.pct('down', 'Down payment', 20, 90, 1), F.yrs('ten', 'Loan tenure (years)', 4, 30, 0.5, { lo: 0.5, hi: 40 }), F.pct('rate', 'Loan interest rate', () => FOS.store.interest('carLoan'), 30, 0.05), F.money('gross', 'Your gross monthly income', () => Math.round(FOS.metrics().income * 1.15) || 100000, 1000000, 1000, { lo: 1 }), F.money('net', 'Your take-home monthly income', () => Math.round(FOS.metrics().income) || 85000, 1000000, 1000, { lo: 1 }), F.money('run', 'Monthly running costs (fuel, insurance, maintenance / society charges)', 6000, 100000, 250), F.money('emis', 'Your existing EMIs per month', () => Math.round(FOS.metrics().emi) || 0, 300000, 500), F.money('liquid', 'Cash and liquid savings today', () => Math.round(FOS.metrics().liquid) || 500000, 20000000, 10000), F.money('ess', 'Monthly essential expenses', () => Math.round(FOS.metrics().essential) || 35000, 500000, 500, { lo: 1 })],
    formula: ['Loan = Price × (1 − down%) ; EMI = standard EMI formula', 'Total vehicle cost = EMI + running costs ; share of gross = total ÷ gross income', 'Highest price that fits = largest price where every chosen rule holds'],
    vars: ['Car guideline: down ≥ 20%, tenure ≤ 4 years, total vehicle cost ≤ 10% of gross income', 'Home guideline: down ≥ 20%, EMI ≤ 35% of take-home, price ≲ 5× annual gross', 'All purchases: total EMIs ≤ 40% of take-home; ≥ 6 months of essentials left in cash after the down payment'],
    assumptions: ['Rules of thumb are widely quoted conventions, not laws or advice. Adjust for your income stability, dependants and goals.', 'Rule values live in FINANCIAL_ASSUMPTIONS.affordability (data.js)'],
    compute(v) {
      const R = AR()[v.type] || AR().other, U2 = AR().universal, loanAmt = v.price * (1 - v.down / 100), n = Math.round(v.ten * 12), emi = C.emi(loanAmt, v.rate, n), down = v.price - loanAmt;
      const total = emi + v.run, pctGross = total / v.gross * 100, emiNet = emi / v.net * 100, dti = (emi + v.emis) / v.net * 100, after = v.liquid - down, efm = v.ess > 0 ? after / v.ess : NaN;
      const rows = []; let met = 0, cnt = 0;
      const rule = (name, val, limit, cmp, fmtv, note) => { const okk = cmp === '>=' ? val >= limit - 1e-9 : val <= limit + 1e-9; cnt++; if (okk) met++; rows.push([name, fmtv(val), (cmp === '>=' ? 'at least ' : 'up to ') + fmtv(limit), okk ? '✓ within guideline' : '✗ outside guideline', note || '']); };
      const P = (x) => fmt.pct(x, 1), Y = (x) => fmt.years(x);
      if (R.downMin !== undefined) rule('Down payment', v.down, R.downMin, '>=', P);
      if (R.tenureMax !== undefined) rule('Loan tenure', v.ten, R.tenureMax, '<=', Y);
      if (R.costMax !== undefined) rule('Total vehicle cost ÷ gross income', pctGross, R.costMax, '<=', P);
      if (R.emiMax !== undefined) rule('EMI ÷ take-home', emiNet, R.emiMax, '<=', P);
      if (R.priceMultipleMax !== undefined) rule('Price ÷ annual gross income', v.price / (v.gross * 12), R.priceMultipleMax, '<=', (x) => fmt.num(x, 1) + '×');
      rule('All EMIs (incl. this one) ÷ take-home', dti, U2.dtiMax, '<=', P);
      rule('Cash left after down payment, in months of essentials', efm, U2.efMonthsMin, '>=', (x) => (Number.isFinite(x) ? fmt.num(x, 1) + ' mo' : '—'));
      // highest price that fits the chosen loan rules (with the entered down %, tenure, rate)
      const unit = C.emi(1, v.rate, n) * (1 - v.down / 100), caps = [];
      if (unit > 0) {
        if (R.costMax !== undefined) caps.push(((R.costMax / 100) * v.gross - v.run) / unit);
        if (R.emiMax !== undefined) caps.push(((R.emiMax / 100) * v.net) / unit);
        caps.push(((U2.dtiMax / 100) * v.net - v.emis) / unit);
      }
      if (R.priceMultipleMax !== undefined) caps.push(R.priceMultipleMax * v.gross * 12);
      caps.push(v.liquid > 0 && v.down > 0 ? (v.liquid - U2.efMonthsMin * v.ess) / (v.down / 100) : 1e12);
      const best = Math.max(0, Math.min.apply(null, caps.filter(Number.isFinite)));
      return {
        summary: [S('Down payment', down), S('Loan amount', loanAmt), S('EMI', emi, 'inr', true), S('Total monthly cost (EMI + running)', total), S('Total cost ÷ gross income', pctGross, 'pct', true), S('Interest over the loan', emi * n - loanAmt), S('Guidelines within range', met, 'num', true), S('Highest price that fits all rules', best, 'inr', true)],
        table: { head: ['Guideline', 'Your value', 'Reference', 'Status'], rows: rows.map((r) => r.slice(0, 4)) }, tableTitle: 'Guideline checks — ' + R.label,
        notes: [R.note, met === cnt ? 'All checks are within the reference ranges. You still decide whether the purchase fits your goals.' : (cnt - met) + ' of ' + cnt + ' checks are outside the reference range. Options to explore: a lower price, bigger down payment, shorter or longer tenure (with the trade-offs), waiting, or a second-hand alternative.', 'These are guidelines, not advice. ' + AR().meta]
      };
    }
  });

  /* ============================ EXPENSE LOG ============================ */
  const MODES = ['UPI', 'Cash', 'Debit card', 'Credit card', 'Bank transfer', 'Other'];
  const CATS = ['Rent / housing', 'Food & groceries', 'Eating out', 'Transport / fuel', 'Utilities & bills', 'Subscriptions', 'Entertainment', 'Shopping', 'Health', 'Education', 'EMI / loan', 'Travel', 'Family support', 'Insurance', 'Other'];
  const monthKey = (d) => String(d || '').slice(0, 7);
  FOS.expenseStats = function () {
    const ex = store.get().expenses.filter((e) => e.date && +e.amount > 0), months = [...new Set(ex.map((e) => monthKey(e.date)))].sort().slice(-3);
    const byCat = {}, byMonth = {}; ex.forEach((e) => { byMonth[monthKey(e.date)] = (byMonth[monthKey(e.date)] || 0) + +e.amount; if (months.includes(monthKey(e.date))) byCat[e.cat] = (byCat[e.cat] || 0) + +e.amount; });
    const n = months.length || 1; Object.keys(byCat).forEach((k) => { byCat[k] /= n; });
    return { count: ex.length, months, byCat, byMonth, avg: Object.values(byCat).reduce((a, b) => a + b, 0) };
  };
  FOS.tools.expenses = function (root) {
    const today = new Date().toISOString().slice(0, 10), bnames = store.get().budget.items.map((i) => i.name).filter(Boolean), cats = [...new Set(CATS.concat(bnames))];
    root.innerHTML = `<div class="card"><h3>Expense log — where does the money actually go?</h3><p class="muted">Add expenses as they happen (or in bulk once a week). After a month or two, My Money Review can show patterns. Do not enter account/card numbers.</p>
      <div class="fields"><div class="field"><label>Date<input class="input" id="x-d" type="date" value="${today}"></label><div class="chips date-chips"><button type="button" class="chip" data-day="0">Today</button><button type="button" class="chip" data-day="1">Yesterday</button><button type="button" class="chip" data-day="2">2 days ago</button></div></div><div class="field"><label>Category<select class="input" id="x-c">${cats.map((c) => `<option>${esc(c)}</option>`).join('')}</select></label></div><div class="field"><label>Amount ₹<input class="input" id="x-a" type="number" min="0" step="any" inputmode="decimal"></label></div><div class="field"><label>Paid by<select class="input" id="x-m">${MODES.map((c) => `<option>${c}</option>`).join('')}</select></label></div><div class="field"><label>Note<input class="input" id="x-n" type="text" maxlength="60"></label></div></div>
      <div class="row-actions"><button class="btn primary" id="x-add">Add expense</button></div></div>
      <div class="card"><h3>This log</h3><div id="x-sum"></div><div id="x-list"></div></div>`;
    const sum = () => {
      const st = FOS.expenseStats(), mk = Object.keys(st.byMonth).sort().slice(-6);
      root.querySelector('#x-sum').innerHTML = st.count ? `<div class="grid-2"><div>${ch().donut({ title: 'Average monthly spend by category (last 3 months)', items: Object.entries(st.byCat).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value) })}</div><div>${ch().bar({ title: 'Spending by month', cats: mk, series: [{ name: 'Total spent', data: mk.map((k) => st.byMonth[k]) }], yfmt: 'inr' })}</div></div><p class="note">Average over ${st.months.length} month${st.months.length === 1 ? '' : 's'}: <b>${fmt.inr(st.avg)}</b> per month.</p>` : '<p class="muted">No entries yet.</p>';
    };
    const list = FOS.crud(root.querySelector('#x-list'), { list: (s) => s.expenses, addLabel: 'Add blank row', empty: 'Nothing logged yet.', cols: [{ k: 'date', label: 'Date', type: 'date' }, { k: 'cat', label: 'Category', type: 'select', options: cats }, { k: 'amount', label: 'Amount ₹', type: 'money' }, { k: 'mode', label: 'Paid by', type: 'select', options: MODES }, { k: 'note', label: 'Note', type: 'text' }], blank: () => ({ date: today, cat: 'Other', amount: '', mode: 'UPI', note: '' }), onChange: sum, addToTop: true, pageSize: 40 });
    root.querySelector('.date-chips').onclick = (e) => { const b = e.target.closest('[data-day]'); if (!b) return; const dt = new Date(); dt.setDate(dt.getDate() - +b.dataset.day); root.querySelector('#x-d').value = dt.toISOString().slice(0, 10); };
    root.querySelector('#x-add').onclick = () => {
      const a = parseFloat(root.querySelector('#x-a').value), note = root.querySelector('#x-n').value;
      if (!(a > 0)) return U.toast('Enter an amount greater than zero.'); if (U.looksSensitive(note)) return U.toast(U.SENSITIVE_MSG);
      store.update((s) => s.expenses.unshift({ id: store.uid(), date: root.querySelector('#x-d').value || today, cat: root.querySelector('#x-c').value, amount: a, mode: root.querySelector('#x-m').value, note }));
      root.querySelector('#x-a').value = ''; root.querySelector('#x-n').value = ''; list.draw(); sum(); U.toast('Added');
    };
    sum();
  };

  /* ============================ BUSINESS IDEAS ============================ */
  const IDEAS = [
    { n: 'Tiffin / home-kitchen meals', cap: [20000, 150000], hrs: 'both', tag: 'food', skill: 'Cooking, hygiene, consistency', steps: ['Pilot 10 customers in a 2 km radius', 'FSSAI registration/licence as applicable', 'Fix menu, price and delivery slots', 'Collect weekly/monthly prepayments'], risks: 'Hygiene lapses, daily workload, dependence on one cook.' },
    { n: 'Pickles, millet foods or regional snacks (D2C)', cap: [30000, 300000], hrs: 'both', tag: 'food', skill: 'Recipe + packaging + selling online', steps: ['Test 30 jars with neighbours/office groups', 'FSSAI and Udyam', 'List on marketplaces/Instagram/WhatsApp catalogue', 'Track cost per jar and repeat orders'], risks: 'Shelf life, packaging cost, marketplace fees, returns.' },
    { n: 'Home bakery / cloud kitchen', cap: [60000, 400000], hrs: 'both', tag: 'food', skill: 'Baking / cooking + online ordering', steps: ['Start with 5 signature items', 'Delivery partner or own rider', 'FSSAI and GST as thresholds require', 'Price for aggregator commission'], risks: 'Aggregator commissions, ingredient price changes.' },
    { n: 'Tuition / coaching (online or offline)', cap: [5000, 100000], hrs: 'part', tag: 'education', skill: 'Subject expertise + teaching', steps: ['Pick one subject/exam niche', 'Small batch of 5–10 students', 'Collect monthly fees in advance', 'Build results and referrals'], risks: 'Seasonal demand, dependence on reputation.' },
    { n: 'Freelance writing, design or video editing', cap: [0, 50000], hrs: 'part', tag: 'creative', skill: 'Writing / design / editing portfolio', steps: ['Build 3 sample projects', 'Create profiles on freelance platforms and LinkedIn', 'Quote by project; track time', 'Invoice properly; plan advance tax'], risks: 'Irregular income, payment delays, foreign-exchange and platform fees.' },
    { n: 'Software / web development services', cap: [0, 100000], hrs: 'both', tag: 'tech', skill: 'Programming', steps: ['Niche (e.g., local business websites)', 'Portfolio and 3 pilot clients', 'Fixed-scope packages + maintenance retainers', 'Contract template'], risks: 'Scope creep, client concentration.' },
    { n: 'Digital marketing for local businesses', cap: [10000, 150000], hrs: 'both', tag: 'services', skill: 'Social media, ads, reporting', steps: ['Choose one niche (clinics, salons, coaching)', 'Offer a 30-day pilot', 'Monthly retainer', 'Report on leads, not likes'], risks: 'Client churn, ad-platform changes.' },
    { n: 'Resale / online selling (marketplaces)', cap: [20000, 300000], hrs: 'part', tag: 'retail', skill: 'Sourcing + listing + customer service', steps: ['Pick a narrow category', 'Order small batches', 'Track returns and real margin after fees', 'GST when required'], risks: 'Returns, fees, inventory lock-up.' },
    { n: 'Tailoring / boutique / alterations', cap: [40000, 300000], hrs: 'both', tag: 'skilled', skill: 'Tailoring / design', steps: ['Start with alterations for steady cash', 'Local tie-ups (schools, offices)', 'Advance on custom orders', 'Shops & Establishment licence if premises'], risks: 'Seasonality, dependence on skill of staff.' },
    { n: 'Two-wheeler / mobile repair shop', cap: [60000, 400000], hrs: 'full', tag: 'skilled', skill: 'Technical repair skills', steps: ['Learn/certify first', 'Location near colony/market', 'Spare-parts supplier credit', 'Transparent price list'], risks: 'Inventory, warranty disputes.' },
    { n: 'Car / bike detailing and washing', cap: [50000, 300000], hrs: 'both', tag: 'skilled', skill: 'Detailing + customer handling', steps: ['Monthly subscription plans for apartments', 'Water and waste permissions', 'Quality checklist', 'Insurance for customer vehicles'], risks: 'Water costs, local permissions.' },
    { n: 'Used-vehicle dealership (small)', cap: [500000, 3000000], hrs: 'full', tag: 'retail', skill: 'Vehicle knowledge + paperwork', steps: ['Dealer licence/trade certificate as required', 'Strict RC/NOC/challan checks on every vehicle', 'Mechanic partnership', 'Clear warranty terms'], risks: 'Stolen/encumbered vehicles, inventory cost, financing. Only for people who master the paperwork.' },
    { n: 'Kirana / online grocery delivery', cap: [200000, 1500000], hrs: 'full', tag: 'retail', skill: 'Retail operations', steps: ['Count footfall at the location', 'Supplier credit terms', 'WhatsApp ordering + delivery boy', 'FSSAI; GST if required'], risks: 'Thin margins, stock expiry, competition from quick-commerce.' },
    { n: 'Agri-input retail / agri-processing (local)', cap: [300000, 2500000], hrs: 'full', tag: 'agri', skill: 'Local farming network', steps: ['Licences for pesticides/fertiliser where required', 'Credit terms with farmers', 'Seasonal cash-flow plan', 'District Industries Centre for schemes'], risks: 'Monsoon dependence, credit losses.' },
    { n: 'Photography / videography and events', cap: [50000, 400000], hrs: 'part', tag: 'creative', skill: 'Camera + editing', steps: ['Portfolio and packages', 'Tie up with event planners', 'Contract with advance (30–50%)', 'Equipment insurance'], risks: 'Seasonal, equipment cost.' },
    { n: 'Event planning / catering coordination', cap: [20000, 200000], hrs: 'part', tag: 'services', skill: 'Coordination, vendor network', steps: ['Start with small family events', 'Vendor rate cards', 'Advance payments', 'Written scope'], risks: 'Cash gaps, reputation risk.' },
    { n: 'Bookkeeping / GST filing services', cap: [10000, 100000], hrs: 'both', tag: 'services', skill: 'Accounting + tools', steps: ['Qualification/CA tie-up where required', 'Fixed monthly packages', 'Secure document handling', 'Client checklist'], risks: 'Liability for errors, deadline crunches.' },
    { n: 'Pet care / grooming (home-based)', cap: [20000, 200000], hrs: 'part', tag: 'services', skill: 'Animal handling', steps: ['Pilot in your apartment community', 'Vet partnership', 'Insurance', 'Monthly plans'], risks: 'Animal injury, licences.' },
    { n: 'Rooftop solar / electrical installation services', cap: [100000, 1000000], hrs: 'full', tag: 'skilled', skill: 'Electrical + sales', steps: ['Certifications where required', 'Vendor partnerships (panels/inverters)', 'Subsidy paperwork support', 'Warranty handling'], risks: 'Policy changes, warranty obligations.' },
    { n: 'Rental: PG / hostel for students or workers', cap: [500000, 5000000], hrs: 'both', tag: 'rental', skill: 'Property management', steps: ['Demand check near colleges/offices', 'Licences/fire safety', 'Deposit and agreement', 'Manager or caretaker'], risks: 'Vacancy, regulations, maintenance.' },
    { n: 'Skill training / spoken-English / coding bootcamp', cap: [30000, 300000], hrs: 'both', tag: 'education', skill: 'Teaching + curriculum', steps: ['Pilot batch', 'Outcome tracking', 'Partner colleges', 'Refund policy clarity'], risks: 'Outcomes vs promises, marketing cost.' }
  ];
  FOS.tools.bizideas = function (root) {
    const m = FOS.metrics(), safe = Math.max(0, Math.round((m.liquid - 6 * (m.essential + m.emi)) / 10000) * 10000);
    const tags = ['any', ...new Set(IDEAS.map((i) => i.tag))];
    root.innerHTML = `<div class="card"><h3>Business &amp; side-income idea finder</h3><p class="muted">A starting list to explore — not predictions and not recommendations. Earnings vary enormously; validate locally with real customers.</p>
      <div class="fields"><div class="field"><label>Capital I can risk losing completely (₹)<input class="input" id="bi-cap" type="number" inputmode="decimal" min="0" step="any" value="${safe}"></label><small class="muted">${m.liquid ? 'Suggested from your data: liquid savings minus 6 months of essentials and EMIs.' : 'Add your savings in Net Worth for a suggestion.'}</small></div>
      <div class="field"><label>Time I can give<select class="input" id="bi-h"><option value="any">Any</option><option value="part">Part-time (alongside a job)</option><option value="full">Full-time</option></select></label></div>
      <div class="field"><label>Area<select class="input" id="bi-t">${tags.map((t) => `<option>${esc(t)}</option>`).join('')}</select></label></div></div></div><div id="bi-out"></div>
      <div class="card note"><b>Before you commit:</b> run the Start a Business checklist, the Break-even and Runway calculators, keep 6–12 months of personal expenses outside the business, and never borrow against your home or use card debt to fund an unproven idea.</div>`;
    const draw = () => {
      const cap = Math.max(0, parseFloat(root.querySelector('#bi-cap').value) || 0), h = root.querySelector('#bi-h').value, t = root.querySelector('#bi-t').value;
      const list = IDEAS.filter((i) => i.cap[0] <= cap && (h === 'any' || i.hrs === 'both' || i.hrs === h) && (t === 'any' || i.tag === t));
      root.querySelector('#bi-out').innerHTML = list.length ? `<div class="cards">${list.map((i) => `<div class="card"><small class="muted">${esc(i.tag)} · ${i.hrs === 'both' ? 'part or full time' : i.hrs === 'part' ? 'part-time friendly' : 'full-time'}</small><h3>${esc(i.n)}</h3><p>Typical starting capital (very rough): <b>${fmt.short(i.cap[0])} – ${fmt.short(i.cap[1])}</b></p><p><b>Skills:</b> ${esc(i.skill)}</p><h5>First steps</h5><ul>${i.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ul><p class="warn-t" style="font-weight:500">Watch out: ${esc(i.risks)}</p></div>`).join('')}</div>` : '<p class="muted">No ideas fit these filters. Raise the capital, change the time or area — or explore skill-based freelancing that needs almost no capital.</p>';
    };
    root.addEventListener('input', draw); root.addEventListener('change', draw); draw();
  };

  /* ============================ LIFE LADDER ============================ */
  FOS.ladder = function () {
    const m = FOS.metrics(), s = store.get(), p = s.profile, B = FOS.FINANCIAL_ASSUMPTIONS.benchmarks, has = (x) => Number.isFinite(x) && x > 0;
    const risky = s.liabilities.filter((l) => l.cat === 'Credit card' || (l.cat === 'Personal loan' && +l.value > 0));
    const recent = (d) => d && (Date.now() - new Date(d)) < 100 * 864e5, snap = [...s.snapshots].sort((a, b) => a.date.localeCompare(b.date)).pop();
    const st = (done, part, unknown) => (unknown ? 'unknown' : done ? 'done' : part ? 'part' : 'todo');
    return [
      { t: 'Know your numbers (income, spending)', s: st(m.hasBudget && m.income > 0, m.income > 0, !m.income && !m.hasBudget), href: '#/tool/budget', why: 'Everything else depends on this.' },
      { t: `Emergency fund (${B.emergencyMonthsLow}–${B.emergencyMonthsOk}+ months)`, s: st(m.efMonths >= B.emergencyMonthsOk, m.efMonths >= 1, !m.essential), href: '#/calc/emergency', why: Number.isFinite(m.efMonths) ? `You have ${m.efMonths.toFixed(1)} months of essentials.` : 'Add essential expenses and an emergency fund.' },
      { t: 'Health insurance', s: st(p.hasHealth, false, false), href: '#/m/insurance', why: 'One hospital bill can erase years of saving.' },
      { t: 'Term cover (if others depend on your income)', s: st(p.hasTerm || !+p.dependents, false, p.dependents === ''), href: '#/calc/cover', why: +p.dependents ? 'You listed dependants.' : 'No dependants recorded.' },
      { t: 'No expensive debt (cards / instant loans)', s: st(risky.length === 0, false, !s.liabilities.length && !m.income), href: '#/calc/debtpayoff', why: risky.length ? `${risky.length} high-cost liability item(s) recorded.` : 'None recorded.' },
      { t: 'Investing regularly', s: st(m.budgetSave > 0 || has(m.investments), false, !m.income), href: '#/calc/sip', why: 'Match the asset to the time horizon.' },
      { t: 'Goals with amounts and dates', s: st(s.goals.length > 0, false, false), href: '#/tool/goals', why: s.goals.length + ' goal(s) recorded.' },
      { t: 'Retirement path checked', s: st(has(m.investments) && !!+p.age, false, !+p.age), href: '#/calc/retirement', why: 'Use ranges, not a single number.' },
      { t: 'Nominees and records in one place', s: st(s.records.length > 0, false, false), href: '#/tool/records', why: s.records.length + ' record(s).' },
      { t: 'Net-worth snapshot in the last 100 days', s: st(snap && recent(snap.date + '-01'), false, false), href: '#/tool/networth', why: snap ? 'Last snapshot: ' + snap.date : 'No snapshot yet.' },
      { t: 'Data backup exported in the last 100 days', s: st(recent(s.meta && s.meta.lastExport), false, false), href: '#/settings', why: s.meta && s.meta.lastExport ? 'Last export ' + fmt.date(s.meta.lastExport) : 'Never exported — your data lives only in this browser.' }
    ];
  };
  FOS.tools.ladder = function (root) {
    const lab = { done: 'Done', part: 'In progress', todo: 'Not yet', unknown: 'Add data' }, cls = { done: 'good', part: 'watch', todo: 'low', unknown: 'info' };
    const steps = FOS.ladder(), age = +store.get().profile.age, stage = !age ? null : age < 30 ? 'playbook-2' : age < 40 ? 'playbook-3' : age < 60 ? 'playbook-4' : 'playbook-4';
    root.innerHTML = `<div class="card"><h3>Your financial ladder</h3><p class="muted">Work through the rungs in order. Status comes from the data you have entered; “Add data” just means Finance OS cannot tell yet.</p><ol class="ladder">${steps.map((x, i) => `<li><span class="pill ${cls[x.s]}">${lab[x.s]}</span><div><b>${i + 1}. ${esc(x.t)}</b><br><small class="muted">${esc(x.why)}</small></div><a class="btn ghost sm" href="${x.href}">Open</a></li>`).join('')}</ol>${stage ? `<p>Based on your age, read: <a href="#/m/playbook?l=${stage}">your life-stage lesson</a>.</p>` : ''}</div>`;
  };

  /* ============================ MY MONEY REVIEW ============================ */
  FOS.insights = function () {
    const m = FOS.metrics(), s = store.get(), p = s.profile, B = FOS.FINANCIAL_ASSUMPTIONS.benchmarks, out = [], add = (sev, title, body, ideas) => out.push({ sev, title, body, ideas: ideas || [] });
    const inr = fmt.inr, pct = (x) => fmt.pct(x, 1), missing = [];
    if (!m.income) missing.push('monthly income'); if (!m.expenses) missing.push('monthly expenses (Budget or Expense Log)'); if (!s.assets.length) missing.push('assets'); if (!s.liabilities.length && !p.loans) missing.push('loans/liabilities (enter 0 items if none)');
    if (missing.length) add('info', 'Fill in these to get a sharper review', 'Missing: ' + missing.join(', ') + '. The more you record, the more specific this page becomes. Nothing leaves your device.', ['Start with the Budget tool or onboarding', 'Log expenses for a month in the Expense Log']);
    // cash flow
    if (m.income > 0 && m.expenses > 0) {
      const sr = m.savingsRate;
      if (sr < 0) add('low', 'You are spending more than you earn', `Expenses ${inr(m.expenses)} vs income ${inr(m.income)} — a gap of ${inr(-m.savings)} each month is being funded by savings or debt.`, ['List expenses in the Expense Log and mark needs vs wants', 'Look at the three biggest categories first (often housing, transport, food)', 'Pause new EMIs until the gap closes', 'Look for one-time vs recurring causes']);
      else if (sr < B.savingsRateLow) add('watch', `Savings rate ${pct(sr)} is on the low side`, `You keep ${inr(m.savings)} per month. Reference bands: under ${B.savingsRateLow}% low, ${B.savingsRateLow}–${B.savingsRateOk}% building, above ${B.savingsRateOk}% strong. Context matters (early career, high rent, dependants).`, [`Each extra ${inr(2000)}/month invested for 20 years is ≈ ${inr(C.sipFV(2000, 10, 240))} at a hypothetical 10% — illustrative only`, 'Automate a small transfer on payday, then raise it with every raise']);
      else if (sr < B.savingsRateOk) add('watch', `Savings rate ${pct(sr)} — building`, `${inr(m.savings)} per month is being saved. Reaching ${B.savingsRateOk}% would mean ${inr(m.income * B.savingsRateOk / 100)} per month.`, ['Step up savings by 10% of each raise', 'Review subscriptions and bank/late fees']);
      else add('good', `Savings rate ${pct(sr)} — strong`, `About ${inr(m.savings)} per month is left after expenses.`, ['Make sure it is going somewhere intentional (emergency fund, goals, long-term investing)']);
    }
    // category shares from budget or log
    const ex = FOS.expenseStats(), cat = ex.count ? ex.byCat : s.budget.items.filter((i) => i.kind !== 'save').reduce((a, i) => { a[i.name || 'Unnamed'] = +i.amount || 0; return a; }, {});
    const total = Object.values(cat).reduce((a, b) => a + b, 0), share = (re) => Object.entries(cat).filter(([k]) => re.test(k)).reduce((a, [, v]) => a + v, 0);
    if (total > 0 && m.income > 0) {
      const housing = share(/rent|housing|home|society|maintenance/i), food = share(/food|grocer|dining|eating|restaurant/i), transp = share(/transport|fuel|petrol|vehicle|cab|auto|bike|car/i), subs = share(/subscr|ott|streaming|app/i), emis = share(/emi|loan/i), top = Object.entries(cat).sort((a, b) => b[1] - a[1]).slice(0, 3);
      add('info', 'Where your money goes' + (ex.count ? ` (average of last ${ex.months.length} month${ex.months.length > 1 ? 's' : ''} in the log)` : ' (from your budget)'), 'Top categories: ' + top.map(([k, v]) => `${k} ${inr(v)} (${pct(v / m.income * 100)} of income)`).join(' · ') + '.', ['Compare them with your priorities: are the top three categories the ones you value most?']);
      if (housing / m.income > 0.3) add('watch', `Housing is ${pct(housing / m.income * 100)} of income`, `Around 30% of take-home is a commonly quoted reference for rent/housing. Yours is ${inr(housing)} per month.`, ['Options people explore: sharing, moving closer to work, renegotiating rent, a smaller place', 'If this is a home loan, see “What if my EMI increases?” and prepayment']);
      if (transp / m.income > 0.15) add('watch', `Transport is ${pct(transp / m.income * 100)} of income`, `${inr(transp)} per month. For a vehicle, the 20/4/10 guideline keeps total vehicle cost near 10% of gross income.`, ['Run the Vehicle Cost calculator to see the cost per km', 'Compare with cab/public transport for your actual usage']);
      if (food / m.income > 0.25) add('watch', `Food is ${pct(food / m.income * 100)} of income`, `${inr(food)} per month across groceries and eating out.`, ['Split groceries vs delivery in the log to see the real difference', 'Cooking half of delivery meals is often the biggest lever']);
      if (subs > 0) add('info', 'Subscriptions and apps', `${inr(subs)} per month in budget/log categories.`, ['Cancel what you have not used in 30 days', 'Yearly plans can cost less — only if you will use them']);
      if (emis > 0) add('info', 'EMI/loan payments in spending', `${inr(emis)} per month.`, ['Check interest rates; refinancing or prepaying the costliest loan is usually the biggest saving']);
      const bud = s.budget.items; if (bud.length && s.budget.method === '50-30-20') { const t = (k) => bud.filter((i) => i.kind === k).reduce((a, i) => a + (+i.amount || 0), 0); add('info', '50/30/20 check', `Needs ${pct(t('need') / m.income * 100)} · Wants ${pct(t('want') / m.income * 100)} · Savings ${pct(t('save') / m.income * 100)} of income (template: 50 / 30 / 20).`, []); }
    }
    // debt
    if (m.income > 0 && m.emi > 0) { const d = m.dti; add(d > B.dtiHigh ? 'low' : d > B.dtiOk ? 'watch' : 'good', `EMIs take ${pct(d)} of income`, `Reference bands: up to ${B.dtiOk}% comfortable, ${B.dtiOk}–${B.dtiHigh}% stretched, above ${B.dtiHigh}% heavy. Lenders often approve more than is comfortable.`, d > B.dtiOk ? ['Avoid new EMIs until this falls', 'List loans by interest rate and use the Snowball/Avalanche tool', 'Ask lenders about rate reduction or balance transfer (compare total cost including fees)'] : []); }
    const cc = s.liabilities.filter((l) => l.cat === 'Credit card').reduce((a, l) => a + (+l.value || 0), 0);
    if (cc > 0) { const apr = FOS.store.interest('creditCardAPR'); add('low', 'Credit-card balance is the most expensive money you hold', `${inr(cc)} outstanding at about ${apr}% a year costs roughly ${inr(cc * apr / 1200)} every month in interest (illustrative).`, ['Clearing this is a “guaranteed return” equal to the rate — no investment reliably matches it', 'Use the Credit Card Repayment Simulator with your payment', 'Stop new card spending until cleared']); }
    // emergency
    if (m.essential > 0) {
      const target6 = (m.essential + m.emi) * 6, gap = Math.max(0, target6 - m.ef);
      if (!m.ef) add('low', 'No emergency fund recorded', `Six months of essentials plus EMIs would be about ${inr(target6)}. Even one month (${inr(m.essential + m.emi)}) changes how a bad month feels.`, ['Start with a small automatic transfer', 'Keep it in instantly accessible low-risk places']);
      else if (gap > 0) add(m.efMonths < B.emergencyMonthsLow ? 'low' : 'watch', `Emergency fund covers ${m.efMonths.toFixed(1)} months`, `A 6-month target is about ${inr(target6)}; the gap is ${inr(gap)}${m.savings > 0 ? ` — ${fmt.months(Math.ceil(gap / m.savings))} at your current monthly savings` : ''}.`, ['The right number depends on income stability, dependants and insurance']);
      else add('good', 'Emergency fund meets a 6-month reference', `${inr(m.ef)} against a reference of ${inr(target6)}.`, []);
    }
    // insurance
    if (!p.hasHealth) add('low', 'No health insurance recorded', 'A single hospital bill can exceed years of savings. Employer cover can vanish when you change jobs.', ['Compare 2–3 policies on waiting periods, co-pay, room-rent limits and exclusions (Insurance checklist)']);
    if (+p.dependents > 0 && !p.hasTerm) add('low', 'Dependants but no term cover recorded', `Use the Life Cover Estimator; a rough reference is ${B.termCoverMultiple}× annual income (${inr(m.income * 12 * B.termCoverMultiple)}), adjusted for loans, assets and years of need.`, ['Term insurance is pure protection; keep investing separate']);
    // investing
    if (m.savings > 0 && !m.investments && !m.budgetSave) add('watch', 'Savings are not yet invested or allocated', 'If the emergency fund and expensive debt are sorted, a regular investment matched to your time horizon is the next rung.', ['SIP calculator: see ranges, not a single number', 'Short goals (under ~3 years) suit low-volatility options']);
    // goals vs surplus
    const req = s.goals.reduce((a, g) => { const dl = g.deadline ? (new Date(g.deadline) - new Date()) / (365.25 * 864e5) : 0; if (!(+g.target > 0) || dl <= 0) return a; return a + C.requiredMonthly(C.futureCost(+g.target, +g.inflation || 0, dl), +g.current || 0, +g.ret || 0, Math.round(dl * 12)); }, 0);
    if (req > 0 && m.income > 0) add(req > m.savings ? 'watch' : 'good', 'Your goals vs your monthly surplus', `Goals with deadlines need about ${inr(req)} per month in total; your surplus is ${inr(m.savings)}.`, req > m.savings ? ['Options: extend deadlines, lower targets, raise income, trim spending — choose what matters most'] : ['You can cover them if the money is actually earmarked']);
    // tax
    if (m.income * 12 > 700000) add('info', 'Tax: compare both regimes every year', `At your income level the regime choice can matter. Use the Income Tax Estimator with your actual deductions. Legal planning only — see the tax lessons for where planning ends and evasion begins.`, ['Keep proofs for any deductions you claim', 'Check interest income (FD/savings) is included']);
    // earn more
    if (m.income > 0) add('info', 'Ideas to earn more (explore, not promises)', 'Upskilling, a job move with negotiation, freelance or side income, or a small business. The idea finder filters by the capital you can afford to lose and the time you have.', ['Open “Start a Business: Step by Step” and the idea finder', 'Decide in advance to save a fixed share (e.g. half) of every raise or side income']);
    return out;
  };
  FOS.insightsHTML = function (short) {
    const lab = { good: 'Looks comfortable', watch: 'Worth a look', low: 'Needs attention', info: 'For your information' };
    const list = FOS.insights();
    return list.map((f) => `<div class="finding ${f.sev}"><div class="between"><h4>${esc(f.title)}</h4><span class="pill ${f.sev === 'info' ? 'info' : f.sev}">${lab[f.sev]}</span></div><p>${esc(f.body)}</p>${f.ideas.length ? `<ul>${f.ideas.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}</div>`).join('') + (short ? '' : '');
  };
  FOS.tools.insights = function (root) {
    const last = store.get().meta && store.get().meta.lastExport;
    root.innerHTML = `<div class="card"><h3>My Money Review</h3><p class="muted">Finance OS reads what you have entered (budget, expense log, assets, liabilities, goals, insurance) and turns it into observations, questions and ideas. It never tells you what to buy or sell.</p>${last ? '' : '<div class="status warn">You have not exported a backup yet. Your data lives only in this browser — use Settings → Export now and then.</div>'}<div class="row-actions"><a class="btn" href="#/tool/expenses">Log expenses</a><a class="btn" href="#/tool/budget">Edit budget</a><a class="btn" href="#/tool/bizideas">Business ideas</a><a class="btn" href="#/tool/ladder">Life ladder</a><button class="btn primary" id="mr-print">Print / Save as PDF</button></div></div><div id="mr-body"></div>`;
    root.querySelector('#mr-body').innerHTML = FOS.insightsHTML();
    root.querySelector('#mr-print').onclick = () => window.print();
  };
})();
