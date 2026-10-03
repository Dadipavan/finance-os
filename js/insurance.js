/* ==========================================================================
   insurance.js — cover estimator + Scam Checker
   ========================================================================== */
(function () {
  'use strict';
  const { F, S, reg } = FOS, C = FOS.calc, fmt = FOS.fmt, U = FOS.ui, esc = U.esc;

  reg({
    id: 'cover', title: 'Life Cover Estimator (needs-based)', group: 'Insurance', module: 'insurance', tags: 'insurance term life cover sum insured human life value premium',
    intro: 'A rough, needs-based view of how much term cover might replace your income for your family. A starting point for discussion with an adviser — not a prescription.',
    fields: [F.money('inc', 'Annual income you contribute to the household', () => Math.round(FOS.metrics().income * 12) || 1200000, 10000000, 50000, { lo: 1 }), F.yrs('yrs', 'Years your family would need support', 15, 40, 1), F.pct('r', 'Return your family could earn safely', 6.5, 10, 0.1), F.pct('inf', 'Inflation', () => FOS.store.assume('inflation'), 12, 0.1), F.money('debt', 'Outstanding loans', () => Math.round(FOS.metrics().liabilities) || 0, 20000000, 50000), F.money('goals', 'Big future goals to fund (education, marriage)', 0, 20000000, 50000), F.money('assets', 'Existing investments / liquid assets', () => Math.round(FOS.metrics().investments + FOS.metrics().liquid) || 0, 20000000, 50000), F.money('existing', 'Existing life cover', 0, 50000000, 100000), F.money('health', 'Health cover you have (for reference)', 500000, 10000000, 100000)],
    formula: ['Income to replace = Annual income × annuity factor at real return over the years needed', 'Cover gap = Income to replace + Loans + Goals − Assets − Existing cover'], vars: ['Real return = (1+r)/(1+inflation) − 1'], assumptions: ['Rules of thumb like “10× income” exist but ignore your loans, dependants and assets', 'Premium depends on age, health and term — compare quotes and read exclusions'],
    compute(v) {
      const rr = (1 + v.r / 100) / (1 + v.inf / 100) - 1, replace = v.inc * C.annuityDue(rr, v.yrs), need = replace + v.debt + v.goals, gap = Math.max(0, need - v.assets - v.existing);
      return { summary: [S('Income to replace (present value)', replace), S('Total need', need, 'inr', true), S('Less: assets and existing cover', v.assets + v.existing), S('Indicative cover gap', gap, 'inr', true), S('“10 × income” rule of thumb (for comparison)', v.inc * FOS.FINANCIAL_ASSUMPTIONS.benchmarks.termCoverMultiple)], notes: ['Health insurance is separate from life cover: a single hospital bill can exceed savings. Compare waiting periods, co-pay, room-rent limits and exclusions using the Insurance checklist.'] };
    }
  });

  const Q = [
    ['ret', 'Is the return guaranteed (fixed, high, “risk-free”)?', 3, 'No legitimate investment can guarantee high returns with no risk.'],
    ['urg', 'Is there urgency (“limited time”, “only today”, “slots filling”)?', 2, 'Pressure stops you from checking. Real opportunities survive a day of verification.'],
    ['otp', 'Are they asking for an OTP?', 5, 'An OTP is a key to your money. No bank or company legitimately needs it from you.'],
    ['pin', 'Are they asking for a PIN, CVV, password or to approve a UPI “collect” request?', 5, 'Receiving money never needs your PIN. Entering a PIN always sends money out.'],
    ['fee', 'Are they requesting upfront fees to release a loan, prize or returns?', 4, 'Genuine lenders deduct charges from the loan; prize/“processing fee” requests are a classic scam.'],
    ['ver', 'Can you NOT independently verify the organisation (official website, physical office, registered number)?', 3, 'Verify using numbers and sites you look up yourself, not links they send.'],
    ['reg', 'Is their regulator status unverifiable (SEBI / RBI / IRDAI / registrar)?', 3, 'Check registration directly on the regulator\'s website.'],
    ['ref', 'Do returns depend on recruiting other people?', 4, 'Paying earlier members from new members\' money is the structure of Ponzi and pyramid schemes.'],
    ['app', 'Did it arrive via unsolicited WhatsApp / Telegram / SMS / social media or an unknown app?', 2, 'Scammers prefer channels where they can hide.'],
    ['sec', 'Are they asking you to keep it secret or to lie to your bank?', 4, 'Secrecy is a tactic to stop you from getting a second opinion.']
  ];
  FOS.tools.scamchecker = function (root) {
    root.innerHTML = `<div class="card"><h3>SCAM CHECKER</h3><div class="safety" role="note">🔒 Never type an OTP, PIN, CVV, password, Aadhaar or card number anywhere — including here. This checker needs none of them and stores nothing.</div><p class="muted">Answer about the offer or call you received.</p>
      <form id="scamf">${Q.map(([k, q]) => `<fieldset class="yn"><legend>${esc(q)}</legend><label><input type="radio" name="${k}" value="1"> Yes</label><label><input type="radio" name="${k}" value="0"> No</label><label><input type="radio" name="${k}" value="" checked> Not sure</label></fieldset>`).join('')}</form><div id="scamres" aria-live="polite"></div></div>
      <div class="card"><h3>Common patterns</h3>${[['Ponzi / pyramid schemes', 'Returns come from new investors, not real profit. Promises of fixed high monthly returns and referral bonuses.'], ['Fake investment apps', 'Show fake profits to persuade bigger deposits; withdrawals need “tax” or “fees”.'], ['Fake loan apps', 'Grant small loans, demand excessive permissions (contacts, gallery), then harass. Use only RBI-regulated lenders.'], ['Phishing & OTP scams', 'Links/calls pretending to be your bank. Hang up and call the number on your card.'], ['UPI fraud', 'A “collect” request or QR to receive money — you only pay. Never enter PIN to receive.'], ['Fake customer support', 'Numbers found via search results or social posts. Use the bank\'s official app or site.'], ['Identity theft', 'Protect KYC documents; share only with regulated entities; check your credit report yearly.'], ['Fake crypto projects', 'Celebrity-endorsed coins, rug-pulls, “guaranteed staking returns”.'], ['Guaranteed-return schemes', 'If it were guaranteed and high, banks would lend you money to invest in it.']].map(([t, d]) => `<details><summary>${esc(t)}</summary><p>${esc(d)}</p></details>`).join('')}<p class="note">If money is lost: call your bank immediately, report at the national cyber-crime helpline <b>1930</b> or cybercrime.gov.in (verify).</p></div>`;
    const form = root.querySelector('#scamf'), out = root.querySelector('#scamres');
    const run = () => {
      const d = new FormData(form); let score = 0, flags = [], answered = 0;
      Q.forEach(([k, q, w, why]) => { const a = d.get(k); if (a !== '' && a !== null) answered++; if (a === '1') { score += w; flags.push([q, why]); } });
      out.innerHTML = answered < 3 ? '<p class="muted">Answer at least three questions.</p>' : `<div class="status ${score >= 5 ? 'bad' : score >= 2 ? 'warn' : 'ok'}"><b>${score >= 5 ? 'Multiple serious warning signs' : score >= 2 ? 'Some warning signs' : 'No major red flags from your answers'}</b> — ${flags.length} flag${flags.length === 1 ? '' : 's'} ticked. This is a checklist, not a verdict: absence of flags does not prove something is safe.</div>${flags.length ? `<ul class="flags">${flags.map(([q, w]) => `<li><b>${esc(q)}</b><br>${esc(w)}</li>`).join('')}</ul>` : ''}<p class="note">Next steps: pause, do not pay, verify independently (regulator websites, official numbers), talk to someone you trust.</p>`;
    };
    form.onchange = run; run();
  };
})();
