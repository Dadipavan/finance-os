/* ==========================================================================
   guides-9.js — tax, in depth. Adds worked, section-by-section chapters to the Income-tax guide (id 'tax'):
   every deduction with its limit and a rupee example, savings-interest and tax-free income, TDS, advance tax with the
   interest worked out, capital gains examples, and the marginal-relief maths.
   Sections are inserted after "Deductions you should know (old regime)"; checklist items are only APPENDED (progress is saved by position).
   Figures marked "verify" change by year — the live values sit in Data & Sources. Every worked number below was computed, not estimated.
   ========================================================================== */
(function () {
  'use strict';
  const g = FOS.GUIDES.find((x) => x.id === 'tax'); if (!g) return;
  const at = g.sections.findIndex((s) => s[0].indexOf('Deductions you should know') === 0);
  const more = [
    [`Section 80C in depth — every eligible item, and the catch in each`,
      `**80C lets you deduct up to ₹1.5 lakh a year from your taxable income — old regime only.** The ₹1.5 lakh is a shared ceiling: EPF, PPF, insurance, tuition and the rest all count towards the same limit. It lowers your tax by your **slab rate plus 4% cess** on the amount used: ₹1,50,000 × 30% × 1.04 = **₹46,800**; at 20% it is ₹31,200; at 5% it is ₹7,800.`,
      ['tbl', ['Item', 'Lock-in', 'Return type', 'The catch to know'], [
        [`EPF / VPF (your share)`, `Till you leave work / retire`, `Declared yearly rate (verify)`, `Counts automatically through payroll; interest on your contributions above ₹2.5 lakh a year is taxable`],
        [`PPF`, `15 years`, `Government rate, reset quarterly`, `Interest and maturity are tax-free; limit ₹1.5 lakh a year for the account`],
        [`ELSS mutual fund`, `3 years per instalment`, `Market-linked`, `Shortest lock-in in 80C, but the value can fall; gains are taxed like other equity gains`],
        [`Life-insurance premium`, `Policy term`, `Insurance, not an investment`, `Deduction is limited to a share of the sum assured; the maturity money can be taxed if the premium is too high — check the rule for your policy`],
        [`Home-loan principal`, `Loan term`, `Repayment of debt`, `Counts only in the year paid; reversed if you sell the house within 5 years`],
        [`Tuition fees (up to 2 children)`, `None`, `A cost, not an investment`, `School and college fees count; donations and development fees do not`],
        [`5-year tax-saver FD`, `5 years`, `Fixed bank rate`, `Interest is taxable every year; lowest after-tax return of the group for high slabs`],
        [`NSC`, `5 years`, `Fixed rate`, `Interest of years 1–4 is deemed reinvested and counts for 80C again`],
        [`Sukanya Samriddhi`, `Until the girl is 21`, `Government rate`, `Girl child below 10 only; interest and maturity are tax-free`]]],
      ['ex', `**Meera (30% slab, old regime)** already has ₹60,000 of EPF and pays ₹30,000 of insurance premium: ₹90,000 used, **₹60,000 of room left.** If she puts ₹60,000 in an ELSS fund, her tax falls by ₹60,000 × 30% × 1.04 = **₹18,720** — but only if the old regime is cheaper for her overall. If she uses the new regime, none of this applies. Use the 80C & NPS Planner to see your own room.`],
      ['warn', `Do not buy a product only to save tax. A 15-year lock-in that saves ₹46,800 is worth it only if you would have saved that money anyway. Money you may need within 3 years should not be in 80C products at all.`]],
    [`Section 80D (health insurance) — limits and a worked example`,
      ['tbl', ['Who is covered', 'Maximum deduction a year (old regime)'], [
        [`You, spouse and children — all under 60`, `₹25,000`],
        [`You, spouse and children — you or your spouse is a senior citizen (60+)`, `₹50,000`],
        [`Your parents — both under 60`, `Additional ₹25,000`],
        [`Your parents — at least one senior citizen`, `Additional ₹50,000`],
        [`Preventive health check-up`, `Up to ₹5,000, inside the same limit — and it can be paid in cash`]]],
      ['ex', `**Ravi (40, 30% slab, old regime)** pays ₹22,000 for a family floater and ₹55,000 for his senior-citizen parents. Deduction for his family = ₹22,000 (below the ₹25,000 cap). Deduction for his parents = ₹50,000 (the premium of ₹55,000 is capped). **Total ₹72,000 × 30% × 1.04 = ₹22,464 of tax saved.** The extra ₹5,000 paid for the parents earns no deduction.`],
      ['ul', `**Pay by cheque, card, UPI or net banking** — cash premiums get no deduction (the preventive check-up is the exception).`, `You can claim for the premium you actually paid, even if the policy is in a parent's name, provided you paid it.`, `A company-paid group cover does not count; only premiums you pay do.`, `The deduction is for **insurance cover**; buy health insurance for protection first — the tax saving is a side benefit.`]],
    [`NPS — 80CCD(1), 80CCD(1B) and 80CCD(2) explained one by one`,
      ['tbl', ['Section', 'What it covers', 'Limit (verify each year)', 'Which regime'], [
        [`80CCD(1)`, `Your own NPS contribution`, `Part of the ₹1.5 lakh 80C ceiling (up to 10% of salary for employees)`, `Old only`],
        [`80CCD(1B)`, `Extra own NPS contribution`, `₹50,000 over and above 80C`, `Old only`],
        [`80CCD(2)`, `Your EMPLOYER's contribution to your NPS`, `Up to 14% of basic + DA in the new regime; 10% in the old regime (private sector)`, `Both regimes`]]],
      ['ex', `**Priya earns a basic + DA of ₹10,00,000 a year; her employer pays into her NPS.** Employer contribution allowed: new regime 14% = ₹1,40,000; old regime 10% = ₹1,00,000. At a marginal rate of 30% plus cess (new regime: taxable income above ₹24 lakh; old regime: above ₹10 lakh): new regime saving = ₹1,40,000 × 31.2% = **₹43,680**; old regime saving = ₹1,00,000 × 31.2% = ₹31,200, plus her own ₹50,000 under 80CCD(1B) = ₹15,600 → **₹46,800** in total.`],
      ['ul', `**The only NPS benefit that survives in the new regime is the employer's contribution** — ask HR whether your CTC can be restructured to include it.`, `At retirement 60% of the corpus can be withdrawn tax-free; the other 40% must buy an annuity (pension), and that pension is taxed as income.`, `The money is locked until about age 60, with limited early withdrawals — so it is for retirement, not for goals within 10 years.`]],
    [`Home-loan tax benefits — Section 24(b) and 80C, with a worked example`,
      ['tbl', ['Benefit', 'Rule', 'Regime'], [
        [`Interest, self-occupied house`, `Deduction up to ₹2 lakh a year (Section 24(b))`, `Old only`],
        [`Interest, let-out house`, `Full interest is allowed, but the loss from house property you can set off against other income is limited to ₹2 lakh a year; the rest carries forward 8 years`, `Old (loss set-off); let-out interest is deductible against rent in both`],
        [`Principal repaid`, `Counts within the ₹1.5 lakh 80C ceiling`, `Old only`],
        [`Interest before possession`, `Claimed in 5 equal parts, starting from the year of possession, within the same ₹2 lakh ceiling`, `Old only`],
        [`Joint loan, joint owners`, `Each owner can claim up to ₹2 lakh of interest on their own share`, `Old only`]]],
      ['ex', `**A ₹50 lakh loan at 8.75% for 20 years has an EMI of ₹44,186.** In the first year you pay about **₹4,33,689 of interest and ₹96,537 of principal.** The old regime lets you deduct only ₹2,00,000 of that interest, so ₹2,33,689 earns nothing. At 30% plus cess: interest deduction saves ₹2,00,000 × 31.2% = **₹62,400**; the principal, if 80C has room, saves ₹96,537 × 31.2% ≈ **₹30,100**. Together about ₹92,500 — but the new regime allows neither, so compare the regimes with your whole salary.`],
      ['tip', `A joint loan with a co-owner (spouse) can double the interest deduction to ₹4 lakh, because each owner claims ₹2 lakh — only if both are owners AND co-borrowers and both pay tax. Use the Home Loan Tax Benefit calculator.`]],
    [`Education-loan interest (80E), donations (80G) and savings interest (80TTA / 80TTB)`,
      ['tbl', ['Section', 'What you can deduct', 'Limit', 'One example'], [
        [`80E`, `Interest (not principal) on a loan for higher education of you, your spouse or children`, `No cap; for 8 years from the year you start repaying, or until the interest is paid`, `Interest paid ₹60,000 at the 20% slab: ₹60,000 × 20% × 1.04 = ₹12,480`],
        [`80G`, `Donations to approved funds and charities`, `50% or 100% of the gift; some are capped at 10% of income`, `₹10,000 to a registered charity eligible at 50% with a limit: ₹5,000 deducted; at 30% plus cess that is ₹1,560`],
        [`80TTA`, `Savings-account interest (under 60)`, `₹10,000 a year`, `Savings interest ₹14,000: ₹10,000 is deducted, ₹4,000 is taxed`],
        [`80TTB`, `Interest on savings, FD and RD (age 60+)`, `₹50,000 a year`, `Savings + FD interest of ₹95,000: ₹50,000 is deducted, ₹45,000 is taxed`]]],
      ['ul', `**80G:** get the receipt with the charity's 80G registration number and PAN; cash donations above ₹2,000 get no deduction. 80G is an old-regime deduction.`, `**80E:** the loan must be from a bank, financial institution or approved charitable institution — a loan from a relative does not qualify.`, `**80TTA and 80TTB** do not apply to FD interest for people under 60; FD interest is fully taxed at slab.`, `**80TTA and 80TTB** are not available if you choose the new regime.`]],
    [`Tax-free income and exemptions — a one-page list`,
      ['tbl', ['Income', 'Tax treatment', 'Condition to remember'], [
        [`PPF interest and maturity`, `Tax-free`, `Holds in both regimes`],
        [`Sukanya Samriddhi interest and maturity`, `Tax-free`, `Check the position under the new regime (verify)`],
        [`EPF withdrawal after 5 years of service`, `Tax-free`, `Earlier withdrawal can attract TDS; interest above the ₹2.5 lakh contribution limit is taxable`],
        [`Gratuity`, `Tax-free up to ₹20 lakh (private sector, verify)`, `The limit is set in Data & Sources; amount above is taxed as salary`],
        [`Agricultural income`, `Not taxed as income`, `It is added to your income only to work out the rate in some cases`],
        [`Gifts from relatives`, `Tax-free with no limit`, `Gifts from non-relatives above ₹50,000 a year are taxed`],
        [`Long-term gains on listed equity and equity funds`, `The first ₹1.25 lakh of gains a year is tax-free (verify)`, `Gains above it are taxed at 12.5%`],
        [`Life-insurance death benefit`, `Tax-free`, `A maturity payout (not a death benefit) can be taxed if the yearly premium is high compared with the sum assured — check your policy`],
        [`Sovereign Gold Bond held to maturity`, `Capital gain is tax-free`, `The 2.5% yearly interest is taxed at slab`]]],
      ['tip', `Tax-free does not always mean better: a tax-free 7.1% PPF equals a taxable 10.3% for someone in the 30% slab, but its 15-year lock-in is a real cost. Use the Taxable vs Tax-free Yield calculator to compare.`]],
    [`Interest, dividends and rent — how each is taxed, with one example`,
      `**All of these are added to your salary and taxed at your slab rate** (there is no special lower rate for savings interest, FD interest or dividends). Rent is taxed after a 30% standard deduction on the net annual value.`,
      ['tbl', ['Income', 'How it is taxed', 'TDS?'], [
        [`Savings-account interest`, `Slab; 80TTA / 80TTB can reduce it (old regime)`, `No`],
        [`FD / RD interest`, `Slab, every year as it accrues, even if you receive it only at maturity`, `10% if interest from one bank is above the limit (₹50,000 default; ₹1 lakh for seniors — verify)`],
        [`Dividends from shares and funds`, `Slab`, `10% by the company or fund above ₹10,000 a year (verify)`],
        [`Rent from a house`, `Slab on the rent after municipal tax and a 30% standard deduction`, `May apply if the tenant is a business or an individual paying high rent (verify the rate)`],
        [`Interest on a loan you gave to someone`, `Slab`, `Depends on who pays you`]]],
      ['ex', `**Anil has a salary of ₹18,00,000 and also earns ₹14,000 of savings interest, ₹60,000 of FD interest and ₹20,000 of dividends: ₹94,000 of other income.** In the new regime all ₹94,000 is added to his taxable income of ₹17,25,000 and falls in the 20% slab: ₹94,000 × 20% × 1.04 = **₹19,552** more tax. In the old regime ₹10,000 of the savings interest is deducted under 80TTA (a saving of ₹10,000 × 30% × 1.04 = ₹3,120 in his old-regime slab) and the remaining ₹84,000 is taxed. **Missing this income is the most common reason for a notice** — it is in the AIS.`]],
    [`TDS in depth — what is cut, at what rate, and how to avoid or claim it`,
      `**TDS (Tax Deducted at Source) is advance tax cut by the payer. It is not an extra tax:** you add up your real tax for the year, subtract the TDS in Form 26AS, and pay or get back the difference.`,
      ['tbl', ['Payment', 'Typical TDS (verify each year)', 'Notes'], [
        [`Salary`, `Slab, estimated for the year, cut monthly`, `Declare your regime and investments to HR; ask for Form 12BB to be filled in the old regime`],
        [`FD / RD interest`, `10% when one bank's interest passes the limit`, `The limit is in Data & Sources; the whole interest is cut, not only the excess`],
        [`Dividends`, `10% above the yearly limit`, `Claim credit in the return`],
        [`Rent (to a landlord)`, `10% above ₹6 lakh a year when the tenant is a business or professional`, `Individual tenants who pay a high monthly rent deduct a smaller percentage (verify the limit and rate)`],
        [`Professional / freelance fees`, `10%`, `Counts towards your tax; you may have more to pay`],
        [`Property purchase`, `1% of the price above ₹50 lakh`, `Buyer pays it with Form 26QB; seller claims credit`],
        [`No PAN given`, `Usually 20% or more`, `Always give your PAN`],
        [`Lottery / game winnings`, `30%`, `No exemption or deduction applies`]]],
      ['ex', `**Neha earns ₹80,000 of FD interest at one bank (limit ₹50,000), so the bank cuts 10% = ₹8,000.** Her real tax depends on her slab: at **30%** her tax on that interest is ₹80,000 × 31.2% = ₹24,960 — she still owes ₹24,960 − ₹8,000 = **₹16,960** at filing. At **5%** the tax is ₹4,160, so the ₹8,000 TDS gives a **refund of ₹3,840.** At **0%** (income below the taxable limit) she should have given the bank **Form 15G** (under 60) or **15H** (60+) so that no TDS was cut at all.`],
      ['ul', `**Check Form 26AS and the AIS** every year: a TDS missing there means you cannot claim it.`, `**Form 15G / 15H** are declarations that your total tax is nil; submit them at the start of each year to every bank.`, `If TDS was cut on income that is not yours or too high, claim the refund by filing your return.`]],
    [`Advance tax — a worked example with the interest worked out`,
      `**If your tax after TDS is ₹10,000 or more for the year, you must pay it in instalments** — not all at the end. The cumulative schedule is **15% by 15 June, 45% by 15 September, 75% by 15 December and 100% by 15 March.** Salaried people with only TDS usually have none; freelancers, landlords and investors with big gains do.`,
      ['ex', `**Kabir's tax after TDS is ₹1,60,000.** Due cumulatively: ₹24,000 (15 Jun), ₹72,000 (15 Sep), ₹1,20,000 (15 Dec) and ₹1,60,000 (15 Mar). Suppose he pays everything on 15 March. Interest under **Section 234C** is 1% a month on each missed instalment: June ₹24,000 × 1% × 3 = ₹720; September ₹72,000 × 1% × 3 = ₹2,160; December ₹1,20,000 × 1% × 3 = ₹3,600; March nothing. **Total ₹6,480** of interest, avoidable by paying on time. **Section 234B** (1% a month if less than 90% of the tax is paid by 31 March) does not apply because he paid in full by 15 March.`],
      ['ul', `**Presumptive taxpayers (44AD / 44ADA)** can pay the whole advance tax in one instalment by 15 March.`, `**Gains that arise late:** if a large capital gain or dividend arrives after an instalment date, pay the tax in the remaining instalments of the same year — no 234C interest for the earlier ones.`, `Pay online using the e-Pay Tax service; keep the challan.`]],
    [`Capital gains — worked examples, one for each situation`,
      ['tbl', ['Situation', 'Numbers', 'Tax (with 4% cess)'], [
        [`Listed shares held 18 months`, `Bought ₹2,00,000, sold ₹3,50,000: gain ₹1,50,000; first ₹1,25,000 exempt; ₹25,000 taxed at 12.5%`, `₹3,125 + ₹125 cess = **₹3,250**`],
        [`Listed shares held 8 months`, `Gain ₹80,000, short-term, taxed at 20%`, `₹16,000 + ₹640 cess = **₹16,640**`],
        [`Debt mutual fund (bought after Apr 2023)`, `Gain ₹50,000, taxed at your slab (30%)`, `₹15,000 + ₹600 cess = **₹15,600**`],
        [`Loss set-off`, `Short-term loss ₹40,000 on one stock set against a long-term gain of ₹1,80,000 → net ₹1,40,000; ₹1,25,000 exempt; ₹15,000 taxed at 12.5%`, `₹1,875 + ₹75 cess = **₹1,950**`],
        [`Property held 11 years (bought for ₹40 lakh, sold for ₹90 lakh)`, `Long-term gain ₹50,00,000; 12.5% without indexation (for property bought before 23 Jul 2024, individuals may choose 20% with indexation — compare with the Property Sale calculator)`, `₹6,25,000 + ₹25,000 cess = **₹6,50,000**, before any 54 / 54EC exemption`]]],
      ['ul', `**Exemptions that can cut a property gain:** Section 54 (reinvest in a residential house), 54EC (specified bonds, up to a ceiling) and 54F (for non-house assets) — each has a deadline and conditions; plan before you sell.`, `**Losses:** short-term losses can be set off against any capital gain; long-term losses only against long-term gains; both carry forward 8 years only if you filed the return on time.`, `**Harvesting:** selling and re-buying equity to use the ₹1.25 lakh yearly exemption resets your cost price; consider costs before you do it.`]],
    [`The new regime's rebate and marginal relief — the numbers just above ₹12 lakh`,
      `**In the new regime, taxable income up to ₹12 lakh pays no tax (the Section 87A rebate).** Just above ₹12 lakh the rebate stops, but **marginal relief** makes sure you never pay more tax than the income above ₹12 lakh.`,
      ['tbl', ['Taxable income', 'Slab tax', 'Rebate / relief', 'Tax + 4% cess'], [
        [`₹12,00,000`, `₹60,000`, `Full rebate`, `**Nil**`],
        [`₹12,10,000`, `₹61,500`, `Marginal relief: tax limited to ₹10,000`, `**₹10,400**`],
        [`₹12,25,000`, `₹63,750`, `Marginal relief: tax limited to ₹25,000`, `**₹26,000**`],
        [`₹12,75,000`, `₹71,250`, `Relief ends: the normal tax is now lower than the income above ₹12 lakh`, `**₹74,100**`]]],
      ['tip', `A salaried person gets a ₹75,000 standard deduction in the new regime, so a salary up to ₹12.75 lakh pays no tax. Do not chase deductions near this limit — check both regimes with the Income Tax Estimator before buying anything for tax.`]]
  ];
  if (at < 0) return;
  g.sections.splice(at + 1, 0, ...more);
  ['sec80c', 'taxeq', 'homeloantax', 'advancetax'].forEach((c) => { if (g.calcs.indexOf(c) < 0) g.calcs.push(c); });
  g.summary += ' Plus section-by-section deductions with rupee examples, tax-free income, TDS, advance-tax interest, capital-gains examples and marginal relief.';
  g.read = '95 min read';
  // append-only: progress ticks are saved by position, so new items go at the END
  g.checklist.push(`Each deduction I claim has its proof filed under its section (80C, 80D, NPS, home loan, 80E, 80G).`, `I checked the 80C room left and chose products I would buy anyway.`, `I gave Form 15G/15H to banks if my tax is nil, or checked TDS in 26AS.`);
})();
