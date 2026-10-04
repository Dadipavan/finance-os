/* ==========================================================================
   data.js — CENTRALISED CONFIGURATION
   Every rate, limit, tax rule and assumption lives here (or is overridden by
   the user in Settings). Nothing time-sensitive is hard-coded elsewhere.

   IMPORTANT: Values below are CONFIGURABLE DEFAULTS entered by the developer
   from general knowledge. They are NOT live data. Each block carries
   lastUpdated / source / applicable period so you can see what to verify.
   ========================================================================== */
window.FOS = window.FOS || {};
(function () {
  'use strict';

  const VERIFY = 'Refresh from the official link in Data & Sources';

  /* ---------- INTEREST RATES (illustrative market defaults) ---------- */
  const INTEREST_RATES = {
    meta: { lastUpdated: 'Configurable default (not live)', source: 'Typical published ranges from banks / RBI statistics — check your own bank', period: 'Illustrative, FY 2025-26', note: VERIFY },
    rates: {
      savingsAccount: { label: 'Bank savings account', rate: 3 },
      fd1y: { label: 'Bank fixed deposit (1–3 yr)', rate: 6.5 },
      rd: { label: 'Bank recurring deposit', rate: 6.3 },
      homeLoan: { label: 'Home loan', rate: 8.75 },
      carLoan: { label: 'Car loan', rate: 9.5 },
      personalLoan: { label: 'Personal loan', rate: 13 },
      educationLoan: { label: 'Education loan', rate: 10 },
      goldLoan: { label: 'Gold loan', rate: 9.5 },
      creditCardAPR: { label: 'Credit card (annual, approx.)', rate: 42 },
      npsReturn: { label: 'NPS blended return assumption', rate: 9 },
      epf: { label: 'EPF / VPF declared rate', rate: 8.25 }
    }
  };

  /* ---------- GOVERNMENT / POST OFFICE SCHEMES ---------- */
  const GOVERNMENT_SCHEMES = {
    meta: { lastUpdated: 'Configurable default (not live)', source: 'India Post (indiapost.gov.in), Ministry of Finance / DEA, National Savings Institute', period: 'Quarterly-reset rates; shown values are indicative', note: VERIFY },
    schemes: {
      PPF: { name: 'Public Provident Fund', purpose: 'Long-term, tax-advantaged savings', eligibility: 'Resident individuals; one account per person', min: 500, max: 150000, tenure: '15 years (extendable in 5-year blocks)', rate: 7.1, mechanism: 'Interest compounded annually, computed on lowest monthly balance', tax: 'EEE under the old tax regime (deduction, interest and maturity exempt) — verify current rules', withdrawal: 'Partial withdrawal from 7th year; loan facility earlier', lockin: '15 years', risk: 'Sovereign-backed; rate can reset', liquidity: 'Low' },
      NSC: { name: 'National Savings Certificate', purpose: 'Fixed-rate 5-year savings certificate', eligibility: 'Resident individuals', min: 1000, max: null, tenure: '5 years', rate: 7.7, mechanism: 'Compounded annually, paid at maturity', tax: 'Interest taxable at slab; reinvested interest may qualify for deduction under old regime — verify', withdrawal: 'Premature encashment only in special cases', lockin: '5 years', risk: 'Sovereign-backed; rate fixed at purchase', liquidity: 'Low' },
      KVP: { name: 'Kisan Vikas Patra', purpose: 'Fixed-rate certificate that doubles money over a stated period', eligibility: 'Resident adults / guardians', min: 1000, max: null, tenure: 'About 115 months at the notified rate (verify)', rate: 7.5, mechanism: 'Compounded annually; paid at maturity', tax: 'Interest taxable as per slab', withdrawal: 'Allowed after a lock-in period', lockin: 'About 2.5 years', risk: 'Sovereign-backed', liquidity: 'Low–Medium' },
      SCSS: { name: 'Senior Citizens Savings Scheme', purpose: 'Regular quarterly income for seniors', eligibility: 'Age 60+ (some exceptions for retirees 55–60)', min: 1000, max: 3000000, tenure: '5 years (extendable by 3)', rate: 8.2, mechanism: 'Interest paid out quarterly (not compounded)', tax: 'Interest taxable; TDS may apply above thresholds', withdrawal: 'Premature closure with penalty', lockin: '1 year (with penalties after)', risk: 'Sovereign-backed', liquidity: 'Low–Medium' },
      SSY: { name: 'Sukanya Samriddhi Yojana', purpose: 'Savings for a girl child\'s education / marriage', eligibility: 'Girl child below 10 years; max 2 accounts per family (exceptions apply)', min: 250, max: 150000, tenure: 'Matures 21 years from opening; deposits for 15 years', rate: 8.2, mechanism: 'Compounded annually', tax: 'Tax-advantaged under the old regime — verify', withdrawal: 'Partial (up to 50%) for education after 18', lockin: 'Until 18 / 21 years', risk: 'Sovereign-backed', liquidity: 'Low' },
      POSB: { name: 'Post Office Savings Account', purpose: 'Basic savings account', eligibility: 'Any resident adult / minor via guardian', min: 500, max: null, tenure: 'Open-ended', rate: 4.0, mechanism: 'Interest on minimum balance between 10th and month-end; credited yearly', tax: 'Small interest exemption available — verify limit', withdrawal: 'Anytime', lockin: 'None', risk: 'Sovereign-backed', liquidity: 'High' },
      POTD: { name: 'Post Office Time Deposit (1/2/3/5 yr)', purpose: 'Fixed deposit at the post office', eligibility: 'Any resident', min: 1000, max: null, tenure: '1, 2, 3 or 5 years', rate: 7.0, mechanism: 'Interest rate depends on tenure; quarterly compounding, paid yearly', tax: '5-year TD may qualify for a deduction under old regime; interest taxable', withdrawal: 'After 6 months with penalty', lockin: '6 months', risk: 'Sovereign-backed', liquidity: 'Medium' },
      PORD: { name: 'Post Office Recurring Deposit', purpose: 'Monthly savings discipline', eligibility: 'Any resident', min: 100, max: null, tenure: '5 years', rate: 6.7, mechanism: 'Quarterly compounding', tax: 'Interest taxable', withdrawal: 'Partial withdrawal after 1 year (50%)', lockin: '1 year for partial', risk: 'Sovereign-backed', liquidity: 'Medium' },
      MIS: { name: 'Post Office Monthly Income Scheme', purpose: 'Regular monthly income', eligibility: 'Resident adults', min: 1000, max: 900000, tenure: '5 years', rate: 7.4, mechanism: 'Interest paid monthly (single holder limit ₹9 lakh, joint ₹15 lakh — verify)', tax: 'Interest taxable', withdrawal: 'After 1 year with deduction', lockin: '1 year', risk: 'Sovereign-backed', liquidity: 'Low–Medium' }
    }
  };

  /* ---------- TAX RULES (by financial year; configurable) ---------- */
  const TAX_RULES = {
    defaultYear: 'FY2025-26',
    years: {
      'FY2025-26': {
        label: 'FY 2025-26 (AY 2026-27)',
        lastUpdated: 'Configurable default (not live)', source: 'Income Tax Department — incometax.gov.in; Union Budget documents', note: VERIFY,
        regimes: {
          new: { name: 'New regime (default)', stdDeduction: 75000, cessPct: 4, rebate: { limit: 1200000, max: 60000, marginalRelief: true },
            slabs: [[400000, 0], [800000, 5], [1200000, 10], [1600000, 15], [2000000, 20], [2400000, 25], [null, 30]] },
          old: { name: 'Old regime (with deductions)', stdDeduction: 50000, cessPct: 4, rebate: { limit: 500000, max: 12500, marginalRelief: false },
            slabs: [[250000, 0], [500000, 5], [1000000, 20], [null, 30]] }
        },
        deductionsOld: { '80C': 150000, '80D (self/family, <60)': 25000, '80D (parents, <60)': 25000, '80D (parents, senior)': 50000, 'NPS 80CCD(1B)': 50000, 'Home-loan interest (self-occupied)': 200000 },
        capitalGains: {
          equitySTCG: { rate: 20, note: 'Listed equity / equity MF held ≤ 12 months' },
          equityLTCG: { rate: 12.5, exemption: 125000, note: 'Held > 12 months; gains above exemption' },
          debtMF: { rate: 'slab', note: 'Specified debt funds bought after Apr-2023 are taxed at slab' },
          gold: { rate: 12.5, note: 'Long-term gold (physical / ETF) — holding period rules differ; verify' },
          crypto: { rate: 30, tds: 1, note: 'Flat 30% on gains, no set-off of losses, 1% TDS on transfers — verify' }
        },
        other: { tdsOnFDInterestThreshold: 50000, standardCess: 4 }
      },
      'FY2024-25': {
        label: 'FY 2024-25 (AY 2025-26)',
        lastUpdated: 'Configurable default (not live)', source: 'Income Tax Department — incometax.gov.in', note: VERIFY + ' (capital-gains rates changed mid-year)',
        regimes: {
          new: { name: 'New regime', stdDeduction: 75000, cessPct: 4, rebate: { limit: 700000, max: 25000, marginalRelief: true },
            slabs: [[300000, 0], [700000, 5], [1000000, 10], [1200000, 15], [1500000, 20], [null, 30]] },
          old: { name: 'Old regime', stdDeduction: 50000, cessPct: 4, rebate: { limit: 500000, max: 12500, marginalRelief: false },
            slabs: [[250000, 0], [500000, 5], [1000000, 20], [null, 30]] }
        },
        deductionsOld: { '80C': 150000, '80D (self/family, <60)': 25000, 'NPS 80CCD(1B)': 50000 },
        capitalGains: { equitySTCG: { rate: 20, note: 'Post 23-Jul-2024 transfers' }, equityLTCG: { rate: 12.5, exemption: 125000, note: 'Post 23-Jul-2024 transfers' }, debtMF: { rate: 'slab', note: '' }, gold: { rate: 12.5, note: '' }, crypto: { rate: 30, tds: 1, note: '' } },
        other: { tdsOnFDInterestThreshold: 40000, standardCess: 4 }
      }
    }
  };

  /* ---------- FINANCIAL ASSUMPTIONS ---------- */
  const FINANCIAL_ASSUMPTIONS = {
    meta: { lastUpdated: 'Configurable default', source: 'Illustrative planning assumptions — NOT forecasts', period: 'n/a', note: 'Change these in Settings → Rates & Assumptions' },
    inflation: 6,
    // How SIP future value is calculated (see calculations.js): nominal-start | nominal-end | effective-start | effective-end
    sipMethod: 'nominal-start',
    equityReturn: 12,
    debtReturn: 7,
    goldReturn: 8,
    postRetirementReturn: 7,
    retirementAge: 60,
    lifeExpectancy: 85,
    emergencyMonths: [3, 6, 9, 12],
    // Hypothetical return rates used in every "opportunity cost" illustration
    oppRates: [0, 4, 7, 10, 12],
    oppYears: [5, 10, 20],
    // Rule-of-thumb health benchmarks (shown with their limitations)
    benchmarks: { emergencyMonthsLow: 3, emergencyMonthsOk: 6, savingsRateLow: 10, savingsRateOk: 20, dtiOk: 20, dtiHigh: 40, termCoverMultiple: 10 },
    // Affordability rules of thumb (used by the Affordability Check). These are widely quoted guidelines, NOT laws or advice.
    affordability: {
      meta: 'Rules of thumb only. Lenders allow more than is comfortable; your own cash-flow test matters more.',
      universal: { dtiMax: 40, efMonthsMin: 6 },
      car: { label: 'Car — the 20/4/10 guideline', downMin: 20, tenureMax: 4, costMax: 10, note: 'Down payment at least 20%, loan no longer than 4 years, and total vehicle costs (EMI + fuel + insurance + maintenance) about 10% of gross income or less.' },
      bike: { label: 'Bike / scooter (adapted from the car rule)', downMin: 15, tenureMax: 3, costMax: 6, note: 'Adapted guideline: smaller down payment, shorter loan, total vehicle costs about 6% of gross income or less.' },
      home: { label: 'Home', downMin: 20, tenureMax: 20, emiMax: 35, priceMultipleMax: 5, note: 'Down payment at least 20%, EMI about 35% of take-home or less, price up to roughly 3–5 times annual gross income, and 6+ months of expenses still in cash after the down payment.' },
      phone: { label: 'Phone / laptop / appliance', downMin: 0, tenureMax: 1, emiMax: 5, note: 'Prefer paying from savings; if financed, keep it short and the EMI a small share of take-home.' },
      other: { label: 'Other purchase', downMin: 0, tenureMax: 3, emiMax: 10, note: 'General guideline for optional purchases.' }
    },
    // Salary assumptions
    salary: { employerPfPctOfBasic: 12, employeePfPctOfBasic: 12, gratuityPctOfBasic: 4.81, professionalTaxMonthly: 200 }
  };

  /* ---------- MODULE REGISTRY (the 43 modules) ---------- */
  // lvl = knowledge level (1-10) the module counts towards; tool = custom tool rendered at top
  const M = (id, title, grp, blurb, o) => Object.assign({ id, title, grp, blurb, calcs: [], chk: [] }, o || {});
  const MODULES = [
    M('home', 'Home', 'Start', 'Your money. Your decisions. Your future.', { route: '#/home' }),
    M('dashboard', 'My Money Dashboard', 'Start', 'Everything you have, owe, earn and spend — in one calm view.', { route: '#/dashboard' }),
    M('basics', 'Money Basics', 'Foundations', 'What money is, why prices rise, and the six ideas behind every decision.', { lvl: 1, calcs: ['inflation', 'compound', 'simple', 'fv', 'pv'] }),
    M('income', 'Income & Salary', 'Foundations', 'CTC, gross, net and take-home — what actually reaches your account.', { lvl: 1, calcs: ['salary', 'savingsrate'] }),
    M('budgeting', 'Budgeting', 'Foundations', 'Give every rupee a job: 50/30/20, zero-based, envelope and more.', { lvl: 2, tool: 'budget', calcs: ['savingsrate'] }),
    M('spending', 'Everyday Spending', 'Foundations', 'See what small purchases cost over years — before you spend.', { lvl: 2, tool: 'spending', calcs: ['subscription', 'oppcost'], chk: ['pay'] }),
    M('bankrates', 'Bank Rates Book', 'Foundations', 'The real banks you use, their FD / savings / loan rates — compare them and refresh every financial year.', { tool: 'bankrates', calcs: ['fd', 'rd', 'emi'] }),
    M('banking', 'Banking', 'Foundations', 'Accounts, UPI, FD, RD — and the fees banks rarely highlight.', { lvl: 3, calcs: ['fd', 'rd', 'compound'], chk: ['bank'] }),
    M('cards', 'Credit Cards', 'Credit & Debt', 'A short-term loan with rewards attached. Know the real price.', { lvl: 4, calcs: ['cardpay', 'utilization'], chk: ['card', 'sign-card'] }),
    M('score', 'Credit Score', 'Credit & Debt', 'What lenders look at and how to read your credit report.', { lvl: 4, calcs: ['utilization'] }),
    M('loans', 'Loans', 'Credit & Debt', 'Personal, home, vehicle, education, gold, business — one framework.', { lvl: 5, tool: 'loancompare', calcs: ['afford', 'emi', 'loancost'], chk: ['loan', 'sign-loan'] }),
    M('emi', 'EMI & Debt', 'Credit & Debt', 'EMI, amortization, prepayment, snowball vs avalanche.', { lvl: 5, calcs: ['emi', 'amortization', 'prepayment', 'dti', 'debtpayoff', 'whatif-emi'] }),
    M('insurance', 'Insurance', 'Protect', 'Health, term, motor and more — what to compare before you pay.', { lvl: 6, tool: 'quotes', calcs: ['cover'], chk: ['insurance', 'sign-insurance'] }),
    M('emergency', 'Emergency Fund', 'Protect', 'Your buffer between a bad month and a bad decision.', { lvl: 6, calcs: ['emergency', 'whatif-job'] }),
    M('scams', 'Scam Protection', 'Protect', 'Recognise the patterns behind ponzi, OTP, UPI and fake-app frauds.', { lvl: 6, tool: 'scamchecker' }),
    M('investing', 'Investing', 'Invest', 'Risk, return, liquidity, diversification and time horizon.', { lvl: 7, calcs: ['sip', 'lumpsum', 'cagr', 'allocation'], chk: ['invest'] }),
    M('mutualfunds', 'Mutual Funds', 'Invest', 'NAV, expense ratio, SIP, SWP, STP and how fees compound against you.', { lvl: 7, calcs: ['sip', 'lumpsum', 'fees', 'whatif-invest'], chk: ['mf'] }),
    M('stocks', 'Stocks', 'Invest', 'Ownership in a business: ratios to understand, not predictions to follow.', { lvl: 7, calcs: ['cagr', 'absreturn', 'dividend', 'pe', 'allocation'], chk: ['stocks'] }),
    M('bonds', 'Bonds / Fixed Income', 'Invest', 'Coupon, yield, duration — and why bond prices move.', { lvl: 7, calcs: ['bond'] }),
    M('gold', 'Gold', 'Invest', 'Jewellery, coins, ETFs, digital gold, SGBs — compare real costs.', { lvl: 7, calcs: ['goldcalc'], chk: ['gold'] }),
    M('govt', 'Government Schemes', 'Invest', 'PPF, NSC, KVP, SCSS, SSY — configured data with sources.', { lvl: 7, tool: 'schemes', calcs: ['ppf', 'nps'] }),
    M('postoffice', 'Post Office Schemes', 'Invest', 'Savings, TD, RD and MIS from India Post.', { lvl: 7, tool: 'schemes-post', calcs: ['rd', 'fd'] }),
    M('retirement', 'Retirement', 'Plan', 'How much is enough, under assumptions you control.', { lvl: 9, calcs: ['retirement', 'nps', 'whatif-retire'] }),
    M('tax', 'Tax Center', 'Plan', 'Rules by year, the best regime for you, and every legal way to pay less.', { lvl: 8, tool: 'taxinfo', calcs: ['taxopt', 'incometax', 'hra', 'capgains'] }),
    M('property', 'Property', 'Plan', 'Rent vs buy and the full cost of owning a home.', { lvl: 9, calcs: ['afford', 'rentbuy', 'emi', 'whatif-rent'], chk: ['house', 'sign-property'] }),
    M('vehicle', 'Vehicle', 'Plan', 'Monthly, annual, 5-year cost and cost per km.', { lvl: 9, calcs: ['car', 'afford', 'emi'], chk: ['car', 'usedveh', 'newcar'] }),
    M('education', 'Education Planning', 'Plan', 'Future cost of education under inflation.', { lvl: 9, calcs: ['edu'] }),
    M('marriage', 'Marriage / Family Planning', 'Plan', 'Model costs and buffers without prescribing choices.', { lvl: 9, calcs: ['marriage', 'emergency'] }),
    M('children', 'Children Planning', 'Plan', 'Plan for a child\'s education with scenarios.', { lvl: 9, calcs: ['child', 'ppf'] }),
    M('crypto', 'Crypto / Bitcoin', 'Invest', 'Education, risk scenarios, taxes and security — never a tip.', { lvl: 10, calcs: ['cryptoscen'], chk: ['crypto'] }),
    M('business', 'Business / Entrepreneurship', 'Plan', 'Revenue, margin, break-even, runway.', { lvl: 10, calcs: ['breakeven', 'roi', 'runway'], chk: ['business'] }),
    M('bizstart', 'Start a Business: Step by Step', 'Plan', 'A practical, ordered guide from idea to first customers, registrations, taxes and cash flow.', { lvl: 10, tool: 'bizideas', calcs: ['breakeven', 'runway', 'roi'], chk: ['bizsteps', 'business'] }),
    M('earnmore', 'Earn More & Save More', 'Plan', 'Raise income, cut leaks, and keep more of what you earn — with the maths.', { lvl: 9, tool: 'expenses', calcs: ['subscription', 'whatif-salary', 'whatif-invest'] }),
    M('playbook', 'Life Playbook: Settle Well', 'Decide', 'What to do in which order, decade by decade — and how to handle the hard moments.', { lvl: 9, tool: 'ladder', calcs: ['emergency', 'fi', 'lifesim'] }),
    M('suggestions', 'My Suggestions', 'Decide', 'What to do next, in order, based on your savings, spending, debts and goals — tick them off as you go.', { tool: 'suggestions', calcs: ['taxopt', 'sip', 'emergency'] }),
    M('plan', 'My Action Plan', 'Decide', 'Your numbers turned into an ordered plan with amounts: debt, buffer, cover, tax, investing, goals.', { tool: 'plan', calcs: ['taxopt', 'sip', 'emergency'] }),
    M('growth', 'Grow My Money', 'Decide', 'Every way to grow money, ranked by what you keep after tax and inflation.', { tool: 'growth', calcs: ['taxopt', 'ppf', 'nps', 'sip'] }),
    M('statement', 'Monthly Statement', 'Decide', 'Filter any month or range: income, spending by category, savings and where every rupee went. Print as a slip.', { tool: 'statement' }),
    M('monthend', 'Month-End Close', 'Decide', 'Two minutes a month: actual income, expenses, balances, snapshot — and a calendar reminder so you never forget.', { tool: 'monthend' }),
    M('insights', 'My Money Review', 'Decide', 'Your own numbers turned into observations, questions and ideas to explore.', { tool: 'insights' }),
    M('fi', 'Financial Independence', 'Plan', 'The number at which work becomes optional — under assumptions.', { lvl: 9, calcs: ['fi', 'lifesim'] }),
    M('networth', 'Net Worth', 'Decide', 'Assets minus liabilities — tracked monthly.', { lvl: 9, tool: 'networth', calcs: ['networthcalc'] }),
    M('goals', 'Financial Goals', 'Decide', 'Turn goals into a required monthly amount.', { lvl: 9, tool: 'goals', calcs: ['goal'] }),
    M('scenarios', 'Scenario Simulator', 'Decide', 'WHAT IF? Mathematical simulations, never predictions.', { lvl: 10, tool: 'scenarios' }),
    M('oppcost', 'Opportunity Cost', 'Decide', 'The price of what you gave up by choosing this.', { lvl: 10, calcs: ['oppcost', 'fv'] }),
    M('decision', 'Decision Engine', 'Decide', 'WHAT ARE YOU ABOUT TO DO? Facts, costs, risks, alternatives.', { lvl: 10, tool: 'decision' }),
    M('health', 'Financial Health', 'Decide', 'Transparent metrics. No mystery score.', { lvl: 10, tool: 'health' }),
    M('guides', 'Expert Guides', 'Learn & Tools', 'In-depth expert guide for every topic: types, real documents to check, costs, traps, tax and my recommendation.', { tool: 'guides' }),
    M('knowledge', 'Financial Knowledge', 'Learn & Tools', 'Levels 0–10, quizzes and your progress.', { tool: 'knowledge' }),
    M('checklists', 'Checklists', 'Learn & Tools', 'Before you pay, sign, borrow or invest.', { tool: 'checklists' }),
    M('calculators', 'Calculator Library', 'Learn & Tools', 'Every calculator with formulas and assumptions.', { route: '#/calculators' }),
    M('sources', 'Data & Sources', 'Learn & Tools', 'Official links for every rate and rule — and where you update them.', { route: '#/sources' }),
    M('glossary', 'Glossary', 'Learn & Tools', 'Plain-English and technical definitions.', { route: '#/glossary' }),
    M('reports', 'My Reports', 'Learn & Tools', 'A printable summary of your numbers.', { route: '#/reports' }),
    M('settings', 'Settings', 'Learn & Tools', 'Theme, accessibility, rates, export / import / delete.', { route: '#/settings' })
  ];

  const LEVELS = [
    'Complete Beginner', 'Money Basics', 'Budgeting', 'Banking', 'Credit', 'Loans',
    'Insurance', 'Investing', 'Tax', 'Wealth Building', 'Advanced Finance'
  ];

  /* ---------- CHECKLISTS ---------- */
  const CHECKLISTS = {
    pay: { title: 'Before I pay (any purchase)', items: ['Is this a need, a want, or a habit?', 'What is the total cost including tax, delivery and accessories?', 'Is there a recurring cost (subscription, fuel, maintenance)?', 'Can I pay in cash without touching my emergency fund?', 'What is the return / refund / cancellation policy?', 'What does the warranty cover and for how long?', 'Have I compared at least two alternatives?', 'Will I still want this in 30 days?'] },
    phone: { title: 'Before buying a phone', items: ['Total cost with EMI interest and processing fee', 'Expected lifespan (software updates years)', 'Cost of a screen / battery repair', 'Trade-in or resale value of the old phone', 'Warranty terms and service-centre access', 'Cheaper model that meets the same needs', 'Insurance / protection plan cost vs benefit', 'Is "no-cost EMI" hiding a discount loss or fee?'] },
    car: { title: 'Before buying a car / vehicle', items: ['On-road price (registration, road tax, insurance, accessories)', 'Down payment and loan: rate, tenure, fees, foreclosure charges', 'Fuel / charging cost per month at my real usage', 'Annual insurance and service cost', 'Parking and toll costs', 'Depreciation: resale value after 3–5 years', 'EMI as % of take-home pay', 'Alternatives: used car, cab / rental, public transport'] },
    house: { title: 'Before buying a house', items: ['Total cost: price + stamp duty + registration + brokerage + interiors', 'Down payment source and effect on emergency fund', 'Loan rate type (floating / fixed), reset rules, fees', 'EMI as % of take-home (and if rates rise 2%)', 'Maintenance, society charges, property tax', 'RERA registration, title clarity, approvals, possession date', 'Rent alternative and investment of the difference', 'Exit cost if I need to sell or move within 5 years'] },
    loan: { title: 'Before taking a loan', items: ['Do I really need to borrow, or can I wait and save?', 'Interest rate: fixed or floating? Reducing balance?', 'Processing fee, GST and other charges', 'Total repayment and total interest', 'Prepayment / foreclosure charges', 'Late-payment penalty and default consequences', 'EMI as % of income and what if income falls', 'Insurance bundled? Is it optional?'] },
    card: { title: 'Before getting a credit card', items: ['Annual / joining fee and how to get it waived', 'Interest rate (monthly and annual) on unpaid balance', 'Billing cycle, due date and grace period', 'Late fee, over-limit fee, cash-advance fee, forex mark-up', 'Do rewards exceed the fees for my actual spending?', 'Can I commit to paying the full bill each month?', 'Autopay set for at least the total due?', 'Where do I check my statement and dispute process?'] },
    invest: { title: 'Before investing', items: ['Do I have an emergency fund and adequate insurance?', 'Do I have high-interest debt I should clear first?', 'What is the goal and time horizon?', 'Could I live with a 30–50% temporary fall?', 'What are all the fees (expense ratio, brokerage, exit load)?', 'What are the taxes on gains / income?', 'Is the seller / platform registered and verifiable?', 'Is anyone promising guaranteed or unusually high returns? (red flag)'] },
    mf: { title: 'Before buying a mutual fund', items: ['Category and risk level (riskometer)', 'Direct vs regular plan expense ratio', 'Exit load and minimum holding', 'Fund house and manager track record over full cycles', 'Benchmark and tracking error (for index funds)', 'Tax treatment for this category', 'SIP vs lumpsum and my ability to continue through falls', 'How it fits my overall allocation'] },
    stocks: { title: 'Before buying a stock', items: ['Can I explain how this company makes money?', 'Revenue, profit, debt and cash-flow trends', 'Valuation (P/E, P/B) vs peers and own history', 'What portion of my portfolio is this? (concentration)', 'Is my information from a verified source, not tips?', 'Brokerage, STT, other charges and taxes', 'What is my reason to sell — set before buying', 'Could I lose 50% and be financially fine?'] },
    crypto: { title: 'Before buying crypto', items: ['Am I prepared for a total loss of this amount?', 'Platform: registered, verifiable, withdrawal history', 'Custody: who holds the private keys?', 'Taxes: 30% on gains, 1% TDS, no loss set-off (verify)', 'Fees: trading, spread, withdrawal, network fees', 'Volatility: could I hold through an 80% fall?', 'Scam check: guaranteed returns, urgency, celebrity endorsements', 'Position size as % of net worth'] },
    insurance: { title: 'Before purchasing insurance', items: ['Sum insured / cover relative to my needs', 'Premium now and expected renewal increases', 'Waiting periods and pre-existing disease clauses', 'Co-pay, deductible, sub-limits (room rent etc.)', 'Exclusions — read them first', 'Claim settlement process and network hospitals / garages', 'Renewal terms and portability', 'Nominee details are correct'] },
    contract: { title: 'Before signing a contract', items: ['Total cost over the whole term', 'Fees, penalties and interest on delay', 'Lock-in period and exit / cancellation terms', 'Auto-renewal clauses', 'Default consequences', 'What I give up (collateral, rights)', 'Tax implications', 'Have I read every page, including fine print?'] },
    business: { title: 'Before starting a business', items: ['Startup cost and runway in months', 'Fixed and variable cost per unit', 'Break-even units and time to reach it', 'Personal expenses covered for 12 months?', 'Licences, registrations, GST applicability', 'Cash-flow timing: when do customers pay?', 'What if revenue is 50% of plan?', 'Separate business and personal accounts'] },
    gold: { title: 'Before buying gold', items: ['Making charges and wastage on jewellery', 'GST and other taxes', 'Purity (hallmark) and billing', 'Storage / locker cost and risk', 'Buy-back price vs buy price', 'Digital gold / ETF / SGB expense and taxes', 'Share of gold in my total allocation', 'Liquidity when I need cash'] },
    bank: { title: 'Before opening a bank account / FD', items: ['Minimum balance rule and penalty', 'Fees for ATM, SMS, cheque book, debit card', 'Interest rate and how often it is credited', 'FD premature-withdrawal penalty', 'Deposit insurance limit (DICGC) and bank coverage', 'Nominee is added', 'Auto-sweep / auto-renewal settings', 'TDS on interest'] },
    usedveh: { title: 'Buying a used bike / car (dealer, finance company or chit company)', items: [
      'RC (Registration Certificate) original seen — registration number, owner name, make/model, colour, fuel, year all match the vehicle and the seller\'s ID',
      'CHASSIS number on the RC matches the number punched on the frame (take a pencil/wax rubbing or photo); ENGINE number matches the crankcase — any mismatch, scratching or re-punching: walk away',
      'Hypothecation: does the RC say “hypothecated to a bank/NBFC”? If yes, get Form 35 (termination) and the loan-closure / NOC letter. Otherwise the old loan can still be on the vehicle',
      'Seller\'s right to sell: is the seller the registered owner? If a finance/chit company is selling a repossessed vehicle, ask for the repossession/auction papers, loan-closure proof and written authority to sell',
      'Number of previous owners (RC history), and whether it was used commercially (taxi/rental) — affects price and insurance',
      'Insurance valid? Comprehensive or only third-party? Ask for NCB (no-claim bonus) details and get the policy transferred to your name',
      'PUC (pollution) certificate valid; road tax paid (and validity); fitness certificate for older/commercial vehicles',
      'Pending e-challans / traffic fines / tax arrears checked on the official Parivahan e-challan portal and the Vahan / mParivahan app with the registration number (verify current portal names)',
      'Odometer vs service history and wear: tampering signs, service book or invoices, accident / flood damage, repainted panels, uneven panel gaps, rust under floor/boot',
      'Independent mechanic inspection: engine start cold, smoke colour, oil leaks, clutch, gears, brakes, suspension, tyres age (4-digit DOT code) and tread, chain/sprocket (bikes), lights, electricals, AC (cars)',
      'Test ride / drive on different roads; listen for knocking, vibration, pulling to one side',
      'Spare key, duplicate keys, original invoice, service manual, accessories — written list',
      'Transfer paperwork: Form 29 and Form 30 (two sets, signed by seller), signed RC, Form 35 if hypothecated, your ID/address proof, insurance copy, sale invoice/agreement. Transfer must be applied for within the legal time limit after sale (roughly 14 days to report by seller, 30 days by buyer — verify current rules)',
      'If the vehicle was registered in another state: NOC from the original RTO and re-registration in your state (time limits apply — verify)',
      'Price check: compare at least 3 similar listings; get a written invoice with full price; pay only by traceable bank transfer, never large cash; keep every receipt',
      'Do not pay the full amount until papers are complete; ideally pay the balance only at RTO transfer or against signed Form 29/30 and RC',
      'Total cost sheet: price + transfer fee + insurance + immediate repairs/tyres/battery + first service + loan interest. Compare with a newer model or a certified pre-owned option',
      'If financing: used-vehicle loans often cost more; apply the affordability rule (20% down, ≤4-year loan, total vehicle costs ≈10% of gross income) and read prepayment/foreclosure terms',
      'If buying through a CHIT: confirm the chit company is registered with the state Registrar of Chits (Chit Funds Act), read the foreman commission, auction discount, prize-money security and what happens on missed instalments',
      'Get any warranty, buy-back or “accident-free” promise in writing; “as is” sales give you little recourse'] },
    newcar: { title: 'Buying a new car / bike (dealer)', items: [
      'On-road price breakdown in writing: ex-showroom, registration, road tax, insurance, handling, FASTag, accessories, extended warranty',
      'Which charges are optional? Decline bundled add-ons you do not want (they can run into tens of thousands)',
      'Insurance: compare the dealer quote with other insurers (you can choose your own insurer)',
      'Discounts and offers in writing with validity; exchange bonus vs real resale value of your old vehicle',
      'Loan: rate, processing fee, foreclosure/part-payment charges; compare bank vs dealer finance; avoid insurance bundled into the loan without comparing',
      'Booking amount refund terms if you cancel; delivery date in writing',
      'Pre-delivery inspection: paint, panels, tyres, features, VIN/chassis and engine numbers match invoice and Form 21/22; odometer near zero',
      'Documents at delivery: tax invoice, Form 21 (sale certificate), Form 22 (roadworthiness), insurance cover note, temporary registration, warranty booklet, manuals, keys',
      'Permanent RC and HSRP number plate timeline; keep tracking until you receive the RC',
      'Running costs: mileage claim vs real-world, service interval cost, insurance renewals, tyres',
      'Affordability: 20% down, loan ≤4 years, EMI + fuel + insurance + maintenance ≈ ≤10% of gross income (rule of thumb)'] },
    bizsteps: { title: 'Starting a business — practical steps in order', items: [
      'Problem and customer written down in two sentences; talked to at least 20 real potential customers',
      'Pre-sold or run a tiny test (10 customers / 1 week) before spending big',
      'Unit economics done: price, variable cost, margin, break-even units (use the Break-even calculator)',
      'Startup budget + 6–12 months of personal expenses kept aside (runway calculator)',
      'Decided the structure: proprietorship / partnership / LLP / OPC / Pvt Ltd (see the lesson)',
      'PAN and a separate current/savings account for the business',
      'Udyam registration (free, online) done',
      'GST registration decided (mandatory above threshold or for certain inter-state/e-commerce supplies — verify)',
      'Local licences: Shops & Establishment, trade licence, FSSAI (food), professional tax, others for your sector',
      'Simple bookkeeping set up from day 1 (invoices, expenses, bank reconciliation); monthly review',
      'Pricing, invoicing and payment terms written; GST invoices if registered',
      'Insurance for stock/premises/liability where relevant',
      'Tax plan: advance tax dates, GST return dates, TDS if applicable, presumptive scheme eligibility (ask a CA)',
      'Marketing: first 10 customers plan — where they are, how to reach them, cost per customer',
      'Review monthly: revenue, margin, cash in bank, receivables, inventory; stop or pivot rules written in advance'] },
    'sign-loan': { title: 'Before you sign — Loan', items: ['Total cost', 'Interest (type, reset)', 'Fees', 'Penalties', 'Prepayment', 'Foreclosure', 'Default', 'Tax', 'Exit cost'] },
    'sign-insurance': { title: 'Before you sign — Insurance', items: ['Total premium over term', 'Exclusions', 'Renewal terms', 'Cancellation / free-look period', 'Waiting period', 'Claim process', 'Lock-in', 'Tax'] },
    'sign-card': { title: 'Before you sign — Credit card', items: ['Interest rate', 'Fees', 'Penalties', 'Renewal fee', 'Cancellation', 'Cash advance cost', 'Default consequences', 'Reward terms and expiry'] },
    'sign-property': { title: 'Before you sign — Property', items: ['Total cost with taxes and fees', 'Title and approvals', 'Penalties for delay', 'Cancellation and refund terms', 'Loan sanction conditions', 'Maintenance deposits', 'Tax implications', 'Exit cost / resale'] },
    'sign-subscription': { title: 'Before you sign — Subscription', items: ['Total cost per year', 'Auto-renewal and price increase terms', 'Cancellation process', 'Free trial conversion date', 'Lock-in', 'Refund policy', 'Taxes', 'Alternatives'] }
  };

  /* ---------- GLOSSARY: [term, simple, technical, example, calcId, related[]] ---------- */
  const GLOSSARY = [
    ['APR', 'The yearly cost of borrowing, including some fees.', 'Annual Percentage Rate: nominal yearly rate that may include fees; does not always include compounding.', 'A card charging 3.5% per month has an APR near 42%.', 'cardpay', ['APY', 'EMI']],
    ['APY', 'What you really earn in a year after compounding.', 'Annual Percentage Yield = (1 + r/n)^n − 1.', '6% compounded quarterly gives ≈6.14% APY.', 'compound', ['APR', 'Compounding']],
    ['EMI', 'The fixed amount you pay every month to repay a loan.', 'Equated Monthly Instalment = P×r×(1+r)^n / ((1+r)^n − 1) with monthly rate r.', '₹10 lakh at 10% for 5 years → EMI ≈ ₹21,247.', 'emi', ['Amortization', 'Prepayment']],
    ['Amortization', 'How each EMI is split between interest and principal.', 'A schedule where interest = opening balance × monthly rate; remainder reduces principal.', 'Early EMIs are mostly interest; later ones mostly principal.', 'amortization', ['EMI']],
    ['Prepayment', 'Paying extra towards a loan to finish it sooner.', 'Extra principal reduces future interest; check foreclosure / part-payment charges.', 'An extra ₹5,000/month on a 20-year home loan can cut years off the tenure.', 'prepayment', ['EMI']],
    ['CAGR', 'The steady yearly growth rate that links a start value to an end value.', 'CAGR = (End/Start)^(1/years) − 1.', '₹1 lakh becoming ₹2 lakh in 7 years ≈ 10.4% CAGR.', 'cagr', ['XIRR', 'Absolute return']],
    ['XIRR', 'Yearly return when you invest at different dates.', 'The discount rate that sets the net present value of dated cash flows to zero.', 'Used for SIP returns where each instalment is a separate cash flow.', 'sip', ['CAGR', 'SIP']],
    ['SIP', 'Investing a fixed amount regularly.', 'Systematic Investment Plan: periodic purchase of fund units, averaging the purchase price.', '₹10,000/month for 10 years.', 'sip', ['Lumpsum', 'SWP', 'STP']],
    ['SWP', 'Withdrawing a fixed amount regularly from an investment.', 'Systematic Withdrawal Plan: periodic redemption of units; taxes apply on gains portion.', '₹30,000/month from a ₹50 lakh fund.', 'retirement', ['SIP']],
    ['STP', 'Moving money gradually from one fund to another.', 'Systematic Transfer Plan, e.g. from a debt fund into an equity fund in instalments.', 'Move ₹6 lakh into equity at ₹1 lakh/month.', 'sip', ['SIP']],
    ['Lumpsum', 'Investing a big amount at once.', 'One-time investment compounding at the assumed rate.', '₹5 lakh bonus invested today.', 'lumpsum', ['SIP']],
    ['NAV', 'Price of one unit of a mutual fund.', 'Net Asset Value = (assets − liabilities) / units outstanding.', 'NAV ₹50, invest ₹10,000 → 200 units.', 'sip', ['AUM', 'Expense ratio']],
    ['AUM', 'Total money a fund manages.', 'Assets Under Management.', 'A fund with ₹10,000 crore AUM.', 'fees', ['NAV']],
    ['Expense ratio', 'The yearly fee a fund charges.', 'Annual fund running cost as a % of AUM, deducted daily from NAV.', '1.5% vs 0.2% on ₹10 lakh over 20 years is a large difference.', 'fees', ['NAV', 'Exit load']],
    ['Exit load', 'A fee for leaving a fund too early.', 'Percentage charged on redemption within a stated period.', '1% if redeemed within 1 year.', 'fees', ['Expense ratio']],
    ['Tracking error', 'How far an index fund drifts from its index.', 'Standard deviation of the difference between fund and index returns.', 'Lower is generally better for an index fund.', 'fees', ['ETF']],
    ['ETF', 'A fund that trades on the stock exchange like a share.', 'Exchange-Traded Fund tracking an index or asset; needs a demat account.', 'Nifty 50 ETF, gold ETF.', 'cagr', ['Index fund']],
    ['Index fund', 'A fund that copies a market index.', 'Passive fund replicating the composition of an index.', 'Nifty 50 index fund.', 'fees', ['ETF']],
    ['P/E', 'How many years of profit you pay for a share.', 'Price-to-Earnings = price per share / EPS.', 'Price ₹500, EPS ₹25 → P/E 20.', 'pe', ['EPS', 'P/B']],
    ['EPS', 'Profit per share.', 'Earnings Per Share = net profit / shares outstanding.', '₹100 crore profit, 10 crore shares → EPS ₹10.', 'pe', ['P/E']],
    ['P/B', 'Price compared with the company\'s book value.', 'Price-to-Book = market price / book value per share.', 'P/B of 3 means paying 3× accounting net worth.', 'pe', ['ROE']],
    ['ROE', 'Profit earned on shareholders\' money.', 'Return on Equity = net profit / shareholders\' equity.', 'Profit ₹15 on equity ₹100 → 15%.', 'roi', ['ROCE']],
    ['ROCE', 'Profit earned on all capital used (debt + equity).', 'Return on Capital Employed = EBIT / (total assets − current liabilities).', 'Compares efficiency across companies.', 'roi', ['ROE']],
    ['Dividend yield', 'Yearly dividend as % of the share price.', 'Dividend per share / price × 100.', '₹10 dividend on a ₹400 share = 2.5%.', 'dividend', ['EPS']],
    ['Market cap', 'The market\'s total price tag for a company.', 'Share price × shares outstanding.', '₹500 × 10 crore shares = ₹5,000 crore.', 'pe', ['P/E']],
    ['EBITDA', 'Operating profit before interest, tax and depreciation.', 'Earnings before interest, taxes, depreciation and amortization.', 'A rough measure of operating cash generation.', 'roi', ['Free cash flow']],
    ['Free cash flow', 'Cash left after running and maintaining the business.', 'Operating cash flow − capital expenditure.', 'A profitable firm can still have negative FCF.', 'roi', ['EBITDA']],
    ['Drawdown', 'How far an investment fell from its peak.', 'Peak-to-trough decline.', 'Peak ₹100 → ₹60 is a 40% drawdown.', 'cryptoscen', ['Volatility']],
    ['Volatility', 'How much and how fast prices swing.', 'Often measured as standard deviation of returns.', 'Equity and crypto are more volatile than FDs.', 'cryptoscen', ['Drawdown', 'Risk']],
    ['Risk', 'The chance things turn out worse than expected.', 'Dispersion of outcomes, including permanent loss, inflation and liquidity risk.', 'FDs have low market risk but inflation risk.', 'cagr', ['Volatility']],
    ['Liquidity', 'How quickly you can turn something into cash without losing value.', 'Ease and cost of converting an asset to cash.', 'Savings account: high. Property: low.', 'emergency', ['Emergency fund']],
    ['Diversification', 'Not putting everything in one basket.', 'Spreading across assets with different risk drivers to reduce concentration risk.', 'Equity + debt + gold.', 'allocation', ['Asset allocation']],
    ['Asset allocation', 'How your money is split across asset types.', 'Percentage weights across equity, debt, gold, cash etc.', '60% equity, 30% debt, 10% gold.', 'allocation', ['Diversification']],
    ['Compounding', 'Earning returns on your earlier returns.', 'Growth where interest is added to principal: A = P(1+r/n)^(nt).', '₹1 lakh at 10% becomes ≈ ₹6.7 lakh in 20 years.', 'compound', ['Time value of money']],
    ['Time value of money', 'Money today is worth more than the same money later.', 'Because of earning potential and inflation: PV = FV/(1+r)^t.', '₹1 lakh in 10 years is worth less than ₹1 lakh now.', 'pv', ['Inflation']],
    ['Inflation', 'The general rise in prices over time.', 'Purchasing power erosion: future cost = cost × (1+i)^t.', '6% inflation doubles prices in about 12 years.', 'inflation', ['Purchasing power']],
    ['Purchasing power', 'What your money can actually buy.', 'Nominal amount deflated by inflation.', '₹1 lakh today ≈ ₹56,000 of today\'s buying power after 10 years at 6%.', 'inflation', ['Inflation']],
    ['Opportunity cost', 'What you give up by choosing one option.', 'Value of the best foregone alternative.', '₹200/day on coffee vs invested hypothetically.', 'oppcost', ['Time value of money']],
    ['Emergency fund', 'Cash set aside for surprises.', 'Liquid reserve of several months of essential expenses.', '6 × ₹30,000 essentials = ₹1.8 lakh.', 'emergency', ['Liquidity']],
    ['Net worth', 'What you own minus what you owe.', 'Total assets − total liabilities.', '₹3 lakh assets, ₹1 lakh liabilities → ₹2 lakh.', 'networthcalc', ['Assets', 'Liabilities']],
    ['Savings rate', 'The share of income you keep.', 'Savings / income × 100.', '₹12,000 of ₹60,000 → 20%.', 'savingsrate', ['Budget']],
    ['DTI', 'How much of income goes to debt payments.', 'Debt-to-Income = monthly debt payments / monthly gross (or net) income × 100.', 'EMIs ₹20,000 on ₹80,000 → 25%.', 'dti', ['EMI']],
    ['LTV', 'How much of a property\'s value is borrowed.', 'Loan-to-Value = loan / property value × 100.', '₹40 lakh loan on ₹50 lakh home → 80%.', 'emi', ['EMI']],
    ['FD', 'A deposit for a fixed time at a fixed rate.', 'Fixed Deposit; interest compounded (often quarterly) or paid out; penalty on early exit.', '₹1 lakh for 3 years.', 'fd', ['RD']],
    ['RD', 'A monthly deposit for a fixed time.', 'Recurring Deposit with quarterly compounding typical.', '₹5,000/month for 5 years.', 'rd', ['FD']],
    ['PPF', 'A 15-year government savings scheme.', 'Public Provident Fund with annually compounded sovereign-set rate.', '₹1.5 lakh/year limit.', 'ppf', ['NSC']],
    ['NPS', 'A government-regulated retirement account.', 'National Pension System: market-linked contributions; part must buy an annuity at exit.', 'Monthly contributions till 60.', 'nps', ['Retirement']],
    ['NSC', 'A 5-year post office certificate.', 'National Savings Certificate with fixed rate set at purchase.', '₹50,000 invested for 5 years.', 'ppf', ['PPF']],
    ['TDS', 'Tax deducted before you receive the money.', 'Tax Deducted at Source by the payer, adjustable against final tax.', 'Bank deducting TDS on FD interest above a threshold.', 'incometax', ['Income tax']],
    ['GST', 'The indirect tax added to many goods and services.', 'Goods and Services Tax charged on supply; shown on invoices.', 'GST on processing fees of loans.', 'loancost', ['TDS']],
    ['Income tax', 'Tax on what you earn.', 'Computed slab-wise under the chosen regime for a financial year.', 'See Tax Center.', 'incometax', ['TDS']],
    ['CTC', 'Total yearly cost of an employee to the company.', 'Cost To Company includes salary, employer PF, gratuity, bonus — not all is take-home.', '₹12 lakh CTC may yield ≈₹90,000/month in hand.', 'salary', ['Take-home pay']],
    ['Take-home pay', 'What reaches your bank account.', 'Gross pay − PF, tax, professional tax and other deductions.', 'Always budget on this, not on CTC.', 'salary', ['CTC']],
    ['Credit utilization', 'How much of your card limit you use.', 'Outstanding / credit limit × 100.', '₹30,000 of ₹1 lakh → 30%.', 'utilization', ['Credit score']],
    ['Credit score', 'A number lenders use to judge repayment history.', 'Model-based score (e.g. 300–900) from payment history, utilization, age, mix, inquiries.', 'Late payments hurt it.', 'utilization', ['Credit utilization']],
    ['Minimum due', 'The smallest card payment that avoids a late fee.', 'A small % of the statement balance; remaining balance attracts interest.', 'Paying only minimum can take years to clear.', 'cardpay', ['APR']],
    ['Coupon', 'The interest a bond pays.', 'Fixed annual interest as % of face value.', '₹1,000 face, 8% coupon → ₹80/year.', 'bond', ['Yield']],
    ['Yield', 'The return you get at today\'s price.', 'Current yield = coupon / price; yield to maturity includes price change.', 'Bond bought at ₹950 paying ₹80.', 'bond', ['Coupon', 'Duration']],
    ['Duration', 'How sensitive a bond is to interest-rate changes.', 'Weighted average time to cash flows; modified duration ≈ % price change per 1% yield change.', 'Duration 5 → ≈5% fall if yields rise 1%.', 'bond', ['Yield']],
    ['Sum insured', 'The maximum an insurer will pay.', 'Coverage limit in the policy.', '₹10 lakh health cover.', 'cover', ['Deductible']],
    ['Deductible', 'The part you pay before insurance pays.', 'Fixed amount borne by the insured per claim / year.', '₹25,000 deductible.', 'cover', ['Co-pay']],
    ['Co-pay', 'Your fixed share of each claim.', 'Percentage of claim paid by the policyholder.', '20% co-pay on a ₹1 lakh claim = ₹20,000.', 'cover', ['Deductible']],
    ['Break-even', 'The sales level at which you stop losing money.', 'Fixed costs / (price − variable cost).', '₹1 lakh fixed, ₹100 margin → 1,000 units.', 'breakeven', ['ROI']],
    ['ROI', 'Gain relative to what you put in.', '(Gain − cost) / cost × 100.', '₹1 lakh becomes ₹1.2 lakh → 20%.', 'roi', ['CAGR']],
    ['Runway', 'How many months a business can survive.', 'Cash balance / monthly net burn.', '₹12 lakh / ₹2 lakh = 6 months.', 'runway', ['Burn rate']],
    ['Ponzi scheme', 'Paying old investors with new investors\' money.', 'Fraud that collapses when inflows slow; promises steady high returns.', 'Guaranteed 3% weekly returns.', 'cryptoscen', ['Scam']],
    ['Blockchain', 'A shared record that many computers keep in sync.', 'A distributed ledger of blocks linked by cryptographic hashes.', 'Bitcoin runs on one.', 'cryptoscen', ['Private key']],
    ['Private key', 'The secret that controls crypto.', 'A cryptographic secret that signs transactions; whoever holds it controls the funds.', 'Lose it and funds are gone.', 'cryptoscen', ['Blockchain']],
    ['Financial year', 'The 12-month period for tax: 1 April to 31 March.', 'Income earned in FY 2030-31 is assessed in AY 2031-32.', 'Salary earned between 1 Apr 2030 and 31 Mar 2031 is declared in AY 2031-32.', 'incometax', ['Income tax']],
    ['Nominee', 'The person who receives funds if you die.', 'Named in accounts, policies and investments; legal heir rules may still apply.', 'Add a nominee to each account.', 'networthcalc', ['Insurance']],
    ['IFSC', 'The code that identifies a bank branch.', '11-character code used in NEFT / RTGS / IMPS.', 'ABCD0123456', 'fd', ['UPI']],
    ['UPI', 'Instant bank-to-bank payments on your phone.', 'Unified Payments Interface; never share your UPI PIN to receive money.', 'Scan-and-pay.', 'subscription', ['Scam']],
    ['RC (Registration Certificate)', 'The official document proving who owns a vehicle.', 'Issued by the RTO; lists registration number, chassis and engine numbers, owner, make/model, hypothecation. Transfers happen by updating the RC.', 'Always compare RC numbers with the metal stamping on the vehicle.', 'afford', ['Chassis number', 'Hypothecation']],
    ['Chassis number', 'The unique ID stamped on a vehicle\'s frame.', 'VIN-style identifier punched on the chassis; must match RC, insurance and invoice. Engine number is a separate stamping on the engine.', 'A mismatch or re-stamping is a serious red flag when buying second-hand.', 'afford', ['RC (Registration Certificate)']],
    ['Hypothecation', 'A loan lender\'s claim on a vehicle until the loan is repaid.', 'The RC carries a lender endorsement; removal needs Form 35 and a loan-closure/NOC letter.', 'Buying a hypothecated vehicle without a NOC can leave you with the seller\'s debt problem.', 'afford', ['RC (Registration Certificate)', 'NOC']],
    ['NOC', 'A letter saying “no objection” — e.g. from a lender or RTO.', 'No Objection Certificate: lender NOC confirms loan closure; RTO NOC allows re-registration in another state.', 'Ask for the lender NOC before paying for a used vehicle.', 'afford', ['Hypothecation']],
    ['Challan', 'A traffic fine or penalty notice.', 'E-challans are linked to the registration number and can transfer with the vehicle if unpaid.', 'Check pending challans before buying a used vehicle.', 'afford', ['RC (Registration Certificate)']],
    ['Chit fund', 'A group savings scheme where members pay monthly and take turns receiving the pot.', 'Regulated by the Chit Funds Act, 1982 and state Registrars; foreman takes a commission; prize amount is often auctioned at a discount.', 'A registered ₹5 lakh chit of 50 months with ₹10,000 instalments.', 'rd', ['Ponzi scheme']],
    ['FOIR', 'The share of your income lenders allow for all EMIs.', 'Fixed Obligation to Income Ratio = total monthly obligations ÷ net monthly income; banks often cap it around 40–55% — but that is lender limit, not a comfort level.', 'EMIs ₹30,000 on ₹1 lakh = 30% FOIR.', 'dti', ['DTI', 'EMI']],
    ['Udyam registration', 'Free government registration for small businesses (MSME).', 'Online registration on the Udyam portal; helps with priority-sector loans, subsidies and some tender benefits.', 'A home-based business registering as a micro enterprise.', 'breakeven', ['GST']],
    ['Presumptive taxation', 'A simplified tax method where profit is assumed as a % of turnover.', 'Sections 44AD (small business) and 44ADA (professionals) let eligible taxpayers declare a fixed % as profit without detailed books — limits and conditions apply.', 'Turnover ₹30 lakh at an assumed 6–8% profit → declare ₹1.8–2.4 lakh. Verify current limits.', 'incometax', ['Income tax']],
    ['HRA', 'A salary component to cover house rent; partly tax-exempt in the old regime.', 'Exemption is the least of: actual HRA, rent paid − 10% of basic, and 50%/40% of basic (metro/non-metro). Requires genuine rent and receipts.', 'Claiming HRA on fake rent is illegal.', 'salary', ['Income tax']],
    ['Advance tax', 'Tax you pay during the year instead of at the end.', 'Due in instalments (mid-June, September, December, March) when tax after TDS exceeds a threshold — verify dates.', 'Business owners and people with large interest or capital gains.', 'incometax', ['TDS']],
    ['Working capital', 'The cash needed to run the business day to day.', 'Current assets − current liabilities; growth usually needs more of it (inventory, receivables).', 'A shop selling on credit needs cash to cover 30-day payments.', 'runway', ['Runway']],
    ['Scam', 'A trick to take your money or secrets.', 'Social-engineering or fake-product fraud.', 'Fake customer-care numbers.', 'cryptoscen', ['Ponzi scheme']]
  ];

  Object.assign(FOS, { INTEREST_RATES, GOVERNMENT_SCHEMES, TAX_RULES, FINANCIAL_ASSUMPTIONS, MODULES, LEVELS, CHECKLISTS, GLOSSARY });
  // Global aliases mirroring the spec
  window.TAX_RULES = TAX_RULES; window.GOVERNMENT_SCHEME_DATA = GOVERNMENT_SCHEMES; window.INTEREST_RATES = INTEREST_RATES; window.FINANCIAL_ASSUMPTIONS = FINANCIAL_ASSUMPTIONS;
})();
