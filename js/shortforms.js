/* ==========================================================================
   shortforms.js — makes every calculator self-explanatory:
   1. a plain one-line help under each input (taken from that calculator's worked-example notes), and
   2. a "Short forms on this page" box that spells out every abbreviation used in the title, inputs, formula and notes.
   (Loaded after examples.js / invest.js and before app.js. Wording is explanation, never advice; figures live in Data & Sources.)
   ========================================================================== */
(function () {
  'use strict';
  const esc = FOS.ui.esc;
  // [short form, full form and what it means in one line, (optional) only for these calculators]
  const ABBR = [
    ['EMI', 'Equated Monthly Instalment — the fixed amount you pay the lender every month (part principal, part interest).'],
    ['APR', 'Annual Percentage Rate — the yearly cost of a loan or card including fees, not just the interest rate.'],
    ['SIP', 'Systematic Investment Plan — investing a fixed amount in a mutual fund on a fixed date every month.'],
    ['STP', 'Systematic Transfer Plan — moving money from one fund to another (often debt to equity) in regular steps.'],
    ['SWP', 'Systematic Withdrawal Plan — taking a fixed amount out of a fund every month.'],
    ['XIRR', 'Extended Internal Rate of Return — the yearly return when money goes in and out on different dates.'],
    ['CAGR', 'Compound Annual Growth Rate — the steady yearly growth that connects a start value and an end value.'],
    ['APY', 'Annual Percentage Yield — the true yearly return after compounding is counted.'],
    ['FD', 'Fixed Deposit — money locked with a bank for a fixed time at a fixed rate.'],
    ['RD', 'Recurring Deposit — a fixed amount saved with a bank or post office every month for a fixed time.'],
    ['TD', 'Time Deposit — the post-office version of a fixed deposit.'],
    ['PPF', 'Public Provident Fund — a 15-year government savings scheme; interest and maturity are tax-free.'],
    ['NSC', 'National Savings Certificate — a 5-year post-office certificate with a fixed rate.'],
    ['KVP', 'Kisan Vikas Patra — a post-office certificate that doubles your money in a stated number of months.'],
    ['SCSS', 'Senior Citizens Savings Scheme — a government scheme for people aged 60+ that pays interest every quarter.'],
    ['SSY', 'Sukanya Samriddhi Yojana — a government savings scheme for a girl child.'],
    ['MIS', 'Monthly Income Scheme — a post-office scheme that pays the interest every month.'],
    ['POMIS', 'Post Office Monthly Income Scheme — pays the interest every month for 5 years.'],
    ['PORD', 'Post Office Recurring Deposit.'],
    ['SGB', 'Sovereign Gold Bond — a government bond priced in grams of gold, paying 2.5% yearly interest on top.'],
    ['ETF', 'Exchange-Traded Fund — a fund that you buy and sell on the stock exchange like a share.'],
    ['ELSS', 'Equity-Linked Savings Scheme — a mutual fund with a 3-year lock-in whose investment counts for 80C (old regime).'],
    ['NPS', 'National Pension System — a long-term retirement account; money stays locked until about age 60.'],
    ['EPF', 'Employees\' Provident Fund — the retirement fund to which you and your employer contribute from salary.'],
    ['VPF', 'Voluntary Provident Fund — extra money you choose to add to your EPF.'],
    ['EPS', 'Employees\' Pension Scheme — the part of the employer\'s contribution that gives a pension.', ['epf']],
    ['EPS', 'Earnings Per Share — a company\'s profit divided by its number of shares.', ['pe', 'dividend']],
    ['UAN', 'Universal Account Number — the single number that identifies your EPF account across jobs.'],
    ['NAV', 'Net Asset Value — the price of one unit of a mutual fund.'],
    ['TER', 'Total Expense Ratio — the yearly fee a mutual fund charges, as a % of your money.'],
    ['AMC', 'Asset Management Company — the company that runs the mutual funds.'],
    ['DICGC', 'Deposit Insurance and Credit Guarantee Corporation — insures bank deposits up to a limit per depositor per bank.'],
    ['CTC', 'Cost To Company — the total yearly amount the employer spends on you, which is more than your take-home pay.'],
    ['DA', 'Dearness Allowance — a part of salary that rises with inflation (common in government jobs).'],
    ['HRA', 'House Rent Allowance — the part of salary meant for rent; partly tax-free in the old regime if you pay rent.'],
    ['LTA', 'Leave Travel Allowance — the part of salary for domestic travel, tax-free in the old regime when claimed within the rules.'],
    ['ESOP', 'Employee Stock Option Plan — the right to buy your employer\'s shares at a fixed price.'],
    ['RSU', 'Restricted Stock Unit — shares your employer gives you after you stay for a set time.'],
    ['LTCG', 'Long-Term Capital Gains — profit on something held for longer than the "long-term" period for that asset.'],
    ['STCG', 'Short-Term Capital Gains — profit on something sold within the "short-term" period.'],
    ['TDS', 'Tax Deducted at Source — tax cut by the payer (employer, bank) before the money reaches you.'],
    ['TCS', 'Tax Collected at Source — tax a seller collects from you on certain purchases or payments.'],
    ['ITR', 'Income Tax Return — the form you file every year to report income and tax.'],
    ['AIS', 'Annual Information Statement — a government record of the income and transactions reported against your PAN.'],
    ['PAN', 'Permanent Account Number — your 10-character tax identity.'],
    ['KYC', 'Know Your Customer — the identity check needed to open a bank, demat or mutual-fund account.'],
    ['GST', 'Goods and Services Tax — the indirect tax added to most purchases.'],
    ['CII', 'Cost Inflation Index — a yearly index once used to adjust the cost of an asset for inflation when computing capital gains.'],
    ['HUF', 'Hindu Undivided Family — a family unit that can be taxed separately.'],
    ['NRI', 'Non-Resident Indian — an Indian citizen who lives abroad and is treated as a non-resident for tax.'],
    ['DTI', 'Debt-to-Income ratio — the share of your monthly income that goes to loan payments.'],
    ['LTV', 'Loan-to-Value — the loan as a % of the price of the asset.'],
    ['ROI', 'Return On Investment — profit divided by the money invested.'],
    ['ROE', 'Return On Equity — a company\'s profit divided by shareholders\' money.'],
    ['P/E', 'Price-to-Earnings — the share price divided by earnings per share.'],
    ['P/B', 'Price-to-Book — the share price divided by book value per share.'],
    ['EPS', 'Earnings Per Share — a company\'s profit divided by its number of shares.', ['whatif-fall']],
    ['CAC', 'Customer Acquisition Cost — what it costs to win one new customer.'],
    ['LTV', 'Lifetime Value — the total profit you expect from one customer.', ['unitecon']],
    ['ARPU', 'Average Revenue Per User.'],
    ['ESG', 'Environmental, Social and Governance.'],
    ['FIRE', 'Financial Independence, Retire Early — saving enough that investments cover your living costs.'],
    ['IRR', 'Internal Rate of Return — the yearly rate that makes the money in and out balance.'],
    ['YTM', 'Yield To Maturity — the total yearly return on a bond if held until it matures.'],
    ['G-Sec', 'Government Security — a bond issued by the government.'],
    ['RBI', 'Reserve Bank of India — the central bank.'],
    ['SEBI', 'Securities and Exchange Board of India — the regulator of stock markets and mutual funds.'],
    ['IRDAI', 'Insurance Regulatory and Development Authority of India — the insurance regulator.'],
    ['UPI', 'Unified Payments Interface — the instant bank-to-bank payment system.'],
    ['OTP', 'One-Time Password — a short code you must never share.'],
    ['80C', 'Section 80C — lets you deduct up to a limit a year for investments such as PPF, ELSS, EPF and tuition fees (old regime).'],
    ['80D', 'Section 80D — a deduction for health-insurance premiums (old regime).'],
    ['80CCD(1B)', 'Section 80CCD(1B) — an extra deduction for your own NPS contribution, over and above 80C (old regime).'],
    ['80CCD(2)', 'Section 80CCD(2) — a deduction for your employer\'s contribution to your NPS.'],
    ['80TTA', 'Section 80TTA — a small deduction for savings-account interest (old regime, under 60).'],
    ['80TTB', 'Section 80TTB — a larger deduction for deposit interest for senior citizens (old regime).'],
    ['80E', 'Section 80E — a deduction for interest on an education loan.'],
    ['80G', 'Section 80G — a deduction for approved donations.'],
    ['24(b)', 'Section 24(b) — a deduction for home-loan interest.'],
    ['87A', 'Section 87A — the rebate that makes tax nil up to a certain income.'],
    ['112A', 'Section 112A — the rule that taxes long-term gains on listed equity and equity funds.'],
    ['Form 15H', 'Form 15H — a declaration by a senior citizen to the bank so that no TDS is cut when total tax is nil.'],
    ['Form 16', 'Form 16 — the certificate your employer gives showing salary paid and tax deducted.'],
    ['26AS', 'Form 26AS — your tax passbook showing TDS and tax paid against your PAN.']
  ];
  FOS.ABBR = ABBR;

  const re = (a) => new RegExp('(^|[^A-Za-z0-9])' + a.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&') + '(?![A-Za-z0-9])');
  const cache = {};
  FOS.abbrFor = function (c) {
    const text = [c.title, c.intro].concat((c.fields || []).flatMap((f) => [f.label, f.help || '']), c.formula || [], c.vars || [], c.assumptions || [], (FOS.ABOUT && FOS.ABOUT.calc[c.id]) || []).join(' \n ');
    const out = [];
    ABBR.forEach(([a, m, only]) => {
      if (only ? only.indexOf(c.id) < 0 : (out.some((x) => x[0] === a) || ABBR.some((x) => x[0] === a && x[2] && x[2].indexOf(c.id) >= 0))) return;   // a calculator-specific meaning wins
      if (out.some((x) => x[0] === a)) return;
      if ((cache[a] || (cache[a] = re(a))).test(text)) out.push([a, m]);
    });
    return out;
  };
  FOS.abbrHTML = function (c) {
    const list = FOS.abbrFor(c); if (!list.length) return '';
    return `<section class="card abbr-box" aria-label="Short forms used on this page"><h3>Short forms on this page</h3><p class="muted">Every abbreviation used above, in full.</p><dl>${list.map(([a, m]) => `<dt>${esc(a)}</dt><dd>${esc(m)}</dd>`).join('')}</dl></section>`;
  };

  // a plain line under each input: reuse the worked-example note written for that exact field
  Object.keys(FOS.calcs).forEach((id) => {
    const c = FOS.calcs[id], ex = FOS.EXAMPLES && FOS.EXAMPLES[id];
    if (!ex) return;
    c.fields.forEach((f, i) => { if (!f.help && ex[2][i]) f.help = ex[2][i]; });
  });
})();
