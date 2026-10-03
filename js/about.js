/* ==========================================================================
   about.js — the short "About this page" text shown at the top of every
   calculator, tool and page:  what it does · when to use it · how to read it
   (or how often to update it).
   ========================================================================== */
window.FOS = window.FOS || {};
(function () {
  'use strict';
  // calculators: [what it does, use it when, how to read the result]
  const calc = {
    emi: ['Works out the fixed monthly instalment for any loan, the total interest, and the month-by-month split between principal and interest.', 'You are comparing or planning a home, car, personal or education loan.', 'EMI is what you pay monthly. "Total interest" is the extra you pay the lender. The chart shows the balance falling slowly at first, faster later.'],
    amortization: ['A full repayment schedule that responds to a rate change, an extra monthly payment and a one-time prepayment.', 'You want to see how prepaying or a rate rise changes the end date and the interest.', 'Compare "Months to repay" and "Total interest" with the plain schedule; the last two lines show what you saved or added.'],
    prepayment: ['Shows exactly how much interest and time an extra payment saves on a loan.', 'You have spare cash and wonder whether to prepay the loan.', '"Net interest saved" is after any prepayment charge. Compare it with what the same money could earn elsewhere before deciding.'],
    loancost: ['Adds processing fee, GST and other charges to show what a loan really costs and its true yearly rate.', 'A lender quotes a low interest rate but also charges fees.', '"Effective annual rate" is the honest comparison figure; it is higher than the stated rate whenever fees exist.'],
    dti: ['Shows what share of your monthly income goes to debt payments.', 'Before taking a new loan, or to check how stretched you are.', 'Under about 20% is light, 20–40% is stretched, above 40% is heavy. Lower is safer.'],
    utilization: ['Shows how much of your credit-card limit you are using.', 'You want to protect or improve your credit profile.', 'Staying at or below about 30% is the commonly quoted comfort level.'],
    cardpay: ['Simulates paying off a credit-card balance by paying only the minimum versus a fixed amount.', 'You carry a card balance and want to see how long and how costly it is.', 'Compare the two lines: the minimum-only path takes far longer and costs far more interest.'],
    debtpayoff: ['Compares two ways of clearing several debts with the same monthly payment: smallest balance first (snowball) or highest rate first (avalanche).', 'You have more than one loan or card balance.', '"Interest difference" is how much the avalanche saves. If a result shows a dash, the monthly payment is too low to clear the debts.'],
    'whatif-emi': ['Shows what happens to your EMI or loan length if the interest rate rises.', 'You have a floating-rate loan and want to know how a rate hike would hurt.', '"EMI at new rate" is the higher payment; the last two lines show the alternative of keeping the EMI and taking longer.'],
    simple: ['Calculates interest earned only on the original amount.', 'Learning, or for the few products that pay simple interest.', 'Interest earned grows in a straight line with time.'],
    compound: ['Shows how money grows when interest is earned on earlier interest, with a chart against simple interest.', 'You want to see the power of time and compounding frequency.', 'The gap between the two lines is the extra you earn from compounding. APY is the true yearly yield.'],
    inflation: ['Shows what today\'s costs will be in future and what today\'s money will be able to buy.', 'Planning anything long-term: retirement, education, goals.', '"Same item costs" is the future price; "Today\'s money buys" is its shrunken purchasing power.'],
    fv: ['Shows what a lump sum plus regular deposits could be worth in future at an assumed return.', 'Rough long-term planning.', 'The value is an assumption-based projection; compare with the amount you put in to see the growth part.'],
    pv: ['Shows what a future amount is worth today.', 'Comparing money now with money later.', 'A lower present value means a higher discount rate or longer wait.'],
    cagr: ['Converts a start value and end value into one steady yearly growth rate.', 'You want to compare how two investments grew over different periods.', 'CAGR smooths out ups and downs; the real path was bumpier.'],
    sip: ['Shows what regular monthly investing could grow to, with an optional yearly step-up and a lower-return comparison.', 'Planning a monthly investment for a long goal.', 'Compare "invested" with "hypothetical future value". The lower-return line shows how sensitive the result is.'],
    lumpsum: ['Shows what a one-time investment could become under three different return assumptions.', 'You have a bonus or lump sum to invest.', 'Conservative, base and alternative are scenarios, not predictions.'],
    fd: ['Calculates fixed-deposit maturity and shows the return after tax and after inflation.', 'Comparing FDs or checking if an FD beats inflation.', 'The last line, post-tax return after inflation, tells you whether your buying power actually grew.'],
    rd: ['Calculates recurring-deposit maturity for a monthly deposit.', 'You want a disciplined monthly saving with bank-level safety.', 'Interest earned is maturity minus total deposited. Banks differ slightly in method.'],
    ppf: ['Projects a PPF balance using the current PPF rate from the scheme data.', 'Planning safe, tax-free long-term saving.', 'The chart shows your deposits against the growing balance; update the rate in Data & Sources when the government changes it.'],
    nps: ['Estimates an NPS corpus at retirement, the lump sum and the monthly pension from the annuity part.', 'Planning retirement income.', '"Estimated monthly pension" depends on the annuity rate you assume.'],
    fees: ['Shows how a seemingly small yearly fund fee shrinks your final amount over decades.', 'Choosing between a low-cost and a high-cost fund (for example direct vs regular).', '"Cost of the higher fee" is the rupees lost to the fee alone.'],
    absreturn: ['Shows total gain or loss as a percentage of what you paid, after charges.', 'Quickly judging a completed investment.', 'It ignores time; use CAGR to compare across years.'],
    dividend: ['Shows a share\'s dividend as a percentage of its price and your yearly dividend income.', 'Comparing income from shares.', 'Dividends can be cut, so treat yield as a snapshot.'],
    pe: ['Computes EPS, P/E, P/B, ROE and market cap from a company\'s basic numbers.', 'Reading a company\'s valuation ratios.', 'The ratios describe the past and the price; they do not say what will happen next.'],
    allocation: ['Shows how your money is split across equity, debt, gold, property, cash and others.', 'Checking diversification and concentration.', 'Look for any one slice that dominates; there is no single right mix.'],
    bond: ['Prices a bond for a given yield and shows how much the price moves if yields change by 1%.', 'Understanding why bond prices fall when rates rise.', 'Modified duration is roughly the percent price change per 1% change in yield.'],
    goldcalc: ['Compares what ₹ you end up with from jewellery, coins/bars and gold ETFs after charges, under one assumed gold price path.', 'Deciding how to buy gold.', 'Jewellery starts behind because of making charges and buy-back deductions.'],
    cryptoscen: ['Shows what a crypto position becomes under price moves from +100% to −100%, after fees and tax.', 'Understanding the risk before buying.', 'These are scenarios, not forecasts. The last column shows how much each outcome would move your total net worth.'],
    oppcost: ['Shows what a one-time or monthly amount could become if saved or invested instead of spent.', 'Before a non-essential purchase or a recurring expense.', 'The table shows hypothetical values at different returns and periods. The 0% column is the same money kept as cash.'],
    edu: ['Projects a future education cost and the monthly saving needed, under three return scenarios.', 'Planning for a course or college fee.', '"Monthly needed" is what you must save; the table shows how it changes with returns.'],
    marriage: ['Projects a future family-event cost and the monthly saving needed.', 'Planning a big one-time family expense.', '"Gap" means you are short under the assumptions; "surplus" means you are ahead.'],
    child: ['Projects a child\'s education cost from their current age to the age money is needed.', 'Planning for a child\'s studies.', 'Uses years remaining = education age minus current age; check the three scenarios.'],
    goal: ['Turns any goal (phone, car, house deposit) into a required monthly saving.', 'You have a target and a deadline.', '"Required monthly contribution" already allows for price inflation and your assumed return.'],
    retirement: ['Estimates the corpus your future spending needs and compares it with your projected savings.', 'Planning retirement.', 'A "gap" means projected savings fall short of need. Study the three return scenarios, not one number.'],
    fi: ['Estimates how many years until your investments can cover your expenses (financial independence).', 'You want a target and a timeline for financial freedom.', '"Years to FI" changes a lot with the return; see the scenario table.'],
    emergency: ['Shows how many months of expenses you have saved and the target for 3, 6, 9 and 12 months.', 'Setting or checking your emergency fund.', '"You currently cover" is your months of safety. You can save your existing amount as your Emergency Fund with the button.'],
    'whatif-job': ['Shows how many months you could last if your salary stopped.', 'Testing your resilience.', 'The table shows how much longer you could last if you cut spending.'],
    networthcalc: ['Adds up your assets and liabilities to show your net worth.', 'A quick one-off check (use the Net Worth tracker to save it monthly).', 'Net worth = assets minus liabilities.'],
    lifesim: ['Simulates a hypothetical financial life year by year: income, expenses, savings, debt and net worth.', 'Seeing the long-term effect of your current habits.', 'The chart shows net worth by age; change any assumption to see sensitivity. "Pool runs out" tells you if savings last to the end age.'],
    savingsrate: ['Shows what share of your income you keep after expenses.', 'Monthly check on your saving habit.', 'Around 20% or more is commonly regarded as strong, but context matters.'],
    salary: ['Breaks a CTC into gross pay, deductions, tax and estimated take-home.', 'Reading a job offer or your salary slip.', '"Monthly take-home" is what reaches your account; use it (not CTC) to plan EMIs.'],
    subscription: ['Shows what recurring subscriptions cost per year, five years and ten years, with price rises.', 'Reviewing OTT, apps and memberships.', 'The table shows what the same monthly amount could become if invested instead.'],
    incometax: ['Estimates your income tax under the new and the old regime side by side.', 'Choosing a regime or estimating your yearly tax.', 'The lower total is the cheaper regime for these inputs. Change the tax year to compare.'],
    capgains: ['Estimates tax on selling shares, funds, gold or crypto.', 'Before selling an investment.', '"Estimated tax" uses the rate stored for the chosen year.'],
    cover: ['Estimates how much life (term) cover your family might need after loans, goals and existing assets.', 'Buying or reviewing term insurance.', '"Indicative cover gap" is the extra cover to think about; refine with an adviser if your situation is complex.'],
    rentbuy: ['Compares your financial position after N years if you buy a home versus rent and invest the difference.', 'Deciding whether to rent or buy.', 'The difference flips with appreciation and returns; use the three scenarios.'],
    car: ['Shows a vehicle\'s real monthly, yearly and 5-year cost and cost per kilometre.', 'Before buying or financing a car or bike.', '"Monthly cost incl. depreciation" is the honest number; depreciation is a cost even though no cash leaves.'],
    breakeven: ['Shows how many units you must sell before the business stops losing money.', 'Planning a product, shop or service.', 'Break-even units and revenue are your minimum targets.'],
    roi: ['Shows gross, operating and net profit, margins and the return on capital invested.', 'Judging whether a business or project is worth it.', 'Compare the margins at each layer to see where profit leaks.'],
    runway: ['Shows how many months a business can run before its cash runs out.', 'Managing a startup or small business.', 'Below about six months, plan funding or cost cuts.'],
    'whatif-salary': ['Shows how a raise changes your savings rate and the long-term value if you save part of it.', 'Deciding how to use a raise.', 'Saving a fixed share of each raise avoids lifestyle inflation.'],
    'whatif-inflation': ['Tests 3% to 10% inflation on your money and your monthly expenses.', 'Stress-testing long plans.', 'The table shows how much buying power is lost at each rate.'],
    'whatif-fall': ['Shows what a market fall does to your portfolio and how much gain is needed to recover.', 'Checking if you could live with a large fall.', 'A 50% fall needs a 100% gain to recover.'],
    'whatif-rent': ['Shows how rent compounds over years.', 'Planning housing costs.', 'Compare the final-year rent to your income.'],
    'whatif-invest': ['Compares investing ₹5,000, ₹10,000, ₹15,000 and ₹20,000 a month under the same assumptions.', 'Deciding how much to invest monthly.', 'The table shows invested amount versus hypothetical value, and the effect of a lower return.'],
    'whatif-retire': ['Compares retiring at different ages.', 'Deciding when you could stop working.', 'Each earlier year means one less year of saving and one more year of spending.'],
    afford: ['Tests a purchase (car, bike, home, phone) against common affordability guidelines and shows the highest price that fits.', 'Before you commit to a big buy or loan.', 'Each row says whether it is within the guideline; "Highest price that fits all rules" is your ceiling.'],
    taxopt: ['Compares both tax regimes on your actual numbers, names the cheaper one, and shows how much each unused deduction would save.', 'Planning tax at the start of the year or before you invest for tax.', '"FILE UNDER" is the cheaper regime. The table lists deductions still available and the tax each saves.'],
    hra: ['Works out how much of your house-rent allowance is tax-free under the old regime.', 'If you pay rent and receive HRA.', '"Tax-free HRA" is the least of the three legal tests.']
  };

  // tools: [what it does, how often to update it]
  const tool = {
    dashboard: ['One view of your money: income, spending, savings, assets, debts, net worth, goals and upcoming payments.', 'Nothing to type here; it reads your other screens. Open it weekly.'],
    snapshot: ['A one-page summary of your financial position.', 'Updates itself from your data.'],
    budget: ['Plan your monthly income against spending using 50/30/20, zero-based, pay-yourself-first, envelope or your own categories.', 'Set it once; revise when income or life changes, and review each month.'],
    expenses: ['Log what you actually spend (date, category, amount, how you paid).', 'Daily is best (one minute), or weekly in a batch.'],
    statement: ['Your monthly money slip for any month or range: income, spending by category, savings, payment modes and net worth. It shows ONLY figures you entered: months with nothing recorded say "no data" and are left out; nothing is estimated.', 'Read it after each Month-End Close. Nothing to type here.'],
    monthend: ['The two-minute monthly routine: actual income, expense check, balances, snapshot — plus a calendar reminder.', 'Once a month, in the last days of the month or the first ten days of the next.'],
    networth: ['Track assets and liabilities and save a monthly net-worth snapshot.', 'Update balances monthly (Month-End Close does it).'],
    goals: ['Create goals with target, deadline, inflation and return and see the monthly amount each needs.', 'Add a goal when you decide on one; update "Saved so far" monthly.'],
    recurring: ['List every subscription and repeating bill with yearly and 10-year costs.', 'When you add or cancel a subscription; review every quarter.'],
    purchase: ['Pick what you are buying and get its total cost of ownership and opportunity cost.', 'Use before a purchase; nothing is stored.'],
    spending: ['Three tools: cost of a spending habit, purchase analyzer, and recurring-expense auditor.', 'Use before spending; update the auditor when subscriptions change.'],
    loancompare: ['Compares up to three loan offers side by side.', 'Use when you get loan quotes; nothing is stored.'],
    scamchecker: ['Ten quick questions that flag the warning signs of a scam.', 'Use whenever someone offers a deal or asks for money, OTP or PIN.'],
    schemes: ['Government savings schemes with rate, limits, tax, lock-in and liquidity, with their official source.', 'Rates change quarterly; update in Data & Sources.'],
    'schemes-post': ['Post Office schemes with rate, limits, tax, lock-in and liquidity.', 'Rates change quarterly; update in Data & Sources.'],
    taxinfo: ['Tax concepts, the rules for each year, and links to the tax calculators.', 'Update the rules each year after the Budget in Data & Sources.'],
    scenarios: ['Eight "what if" simulators for salary, inflation, job loss, EMI, market fall, rent, investing and retirement.', 'Use any time; they pre-fill from your data.'],
    decision: ['Choose what you are about to do and get the full cost, risks, alternatives and a clear verdict based on your numbers.', 'Use before every big spend, loan or investment.'],
    health: ['Eight transparent health metrics with how each is calculated and its limits.', 'Updates itself from your data; glance at it monthly.'],
    knowledge: ['Your learning level, lessons read and quiz scores.', 'Marks update as you read lessons and take quizzes.'],
    checklists: ['Interactive checklists for buying, borrowing, investing and signing.', 'Tick as you verify each item; reset for the next purchase.'],
    reminders: ['Due dates and renewals shown inside the app, and as notifications if you allow them.', 'Add one whenever you take a loan, policy, FD or subscription.'],
    records: ['A list of policies, loans, cards, FDs and documents with renewal dates and nominees (no secrets).', 'Add when you buy something; update at renewals.'],
    timeline: ['Your personal life timeline of financial milestones.', 'Edit yearly.'],
    ladder: ['The 11-step order of financial priorities and where you stand on each.', 'Updates from your data; check quarterly.'],
    insights: ['My Money Review: observations, questions and ideas generated from your own numbers.', 'Read it after each Month-End Close.'],
    plan: ['Your ordered action plan with amounts: debt, buffer, cover, tax, investing, goals.', 'Updates itself; re-read after any big change.'],
    growth: ['Every way to grow money ranked by what you keep after tax and inflation.', 'Rates come from Data & Sources; re-check yearly.'],
    bizideas: ['A filterable list of business and side-income ideas with first steps and risks.', 'Browse when planning; nothing is stored.'],
    sources: ['Official links for every number, and the screens where you update tax rules, rates and limits.', 'After each Budget (yearly) and roughly every quarter for small-savings rates.']
  };

  const page = {
    home: 'Start here. It shows your snapshot and leads to every part of the app.',
    dashboard: 'Your money at a glance. It only reads what you entered elsewhere.',
    calculators: 'Every calculator in one list. Filter by name or group, then open one.',
    glossary: 'Plain-English and technical meanings of financial terms, each linked to a calculator.',
    reports: 'A printable summary of your numbers and the observations from My Money Review.',
    settings: 'Appearance, accessibility, password lock, Google Drive sync, your data and backup.',
    sources: 'Where each number comes from, and where you update it.',
    help: 'How to use the website, what to update, and when.'
  };

  FOS.ABOUT = { calc, tool, page };
  FOS.aboutHTML = function (kind, id) {
    if (kind === 'calc' && calc[id]) { const a = calc[id]; return `<details class="about" open><summary>About this page — what it does</summary><dl><dt>What it does</dt><dd>${a[0]}</dd><dt>Use it when</dt><dd>${a[1]}</dd><dt>How to read it</dt><dd>${a[2]}</dd></dl></details>`; }
    if (kind === 'tool' && tool[id]) { const a = tool[id]; return `<details class="about" open><summary>About this page — what it does</summary><dl><dt>What it does</dt><dd>${a[0]}</dd><dt>When to update</dt><dd>${a[1]}</dd></dl></details>`; }
    if (kind === 'page' && page[id]) return `<details class="about" open><summary>About this page — what it does</summary><p>${page[id]}</p></details>`;
    return '';
  };
})();
