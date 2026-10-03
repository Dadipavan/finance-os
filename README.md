# Finance OS — Personal Finance Operating System

A private, offline, local-first personal finance university + calculator suite + decision engine.
Plain HTML, CSS and vanilla JavaScript. **No server, no build step, no accounts, no external calls.**

## Run it

Open `index.html` in any modern browser (double-click it). Everything works offline.
Published on GitHub Pages it is also an **installable phone app** (Android: Install app · iPhone: Add to Home Screen) with offline support — see `DEPLOY_CHECKLIST.md` for what to provide, the publish steps and a first-day test list.

## What you get

| Area | Highlights |
|---|---|
| **Home / Dashboard** | Journey timeline, 13 KPI cards, income-vs-expense, asset & liability donuts, goal progress, net-worth timeline, upcoming payments, backup nudge |
| **Learn** | 45+ lessons across 40+ modules (analogy → simple → technical → worked example → risks → checklist → mistakes), quizzes with explanations, Levels 0–10, glossary of ~80 terms |
| **Calculators (58)** | Simple/compound interest, inflation, FV/PV, CAGR, SIP (with step-up), lumpsum, EMI, amortization (rate changes + prepayments), prepayment, loan true cost, credit-card payoff, debt snowball vs avalanche, FD, RD, PPF, NPS, retirement, FI, emergency fund, rent-vs-buy, vehicle cost, **affordability check (20/4/10, home, bike, phone)**, tax estimators, capital gains, salary/CTC, bonds, gold, crypto scenarios, break-even, ROI, runway, life simulator and 8 WHAT-IF simulators |
| **Every calculator** | Sliders + numeric input, validation (no NaN/Infinity), reset, copy, print, download, formula + variables + assumptions, Scenario A/B/C comparison |
| **Decision Engine** | 15 actions → 13 questions (total cost, fees, taxes, opportunity cost, risks, worst case, alternatives, income fall, price rise, job loss, early exit) → Decision Summary. **Never yes/no.** |
| **Things people forget** | 13-point list for every action; "CHECK BEFORE I PAY" and "BEFORE YOU SIGN" floating buttons |
| **Practical guides** | Buying a used bike/car (chassis & engine numbers, RC, hypothecation/NOC, challans, Forms 29/30/35, chit/finance-company sellers), new-vehicle checklist, EMI rules of thumb, essential tax rules, **legal ways to reduce tax vs evasion**, tax calendar, **start a business step by step** (validation → numbers → structure → registrations → funding → taxes → cash flow → first 90 days, Telangana/AP notes), earn-more / save-more, life playbook by decade, hard-moments guide |
| **My Money Review** | Reads *your* budget, expense log, assets, liabilities, goals and insurance → observations, questions and ideas (earn more, save more, business ideas). Printable. |
| **Trackers** | Budget (50/30/20, zero-based, pay-yourself-first, envelope, custom), expense log, net worth + monthly snapshots, goals, recurring-expense auditor, reminders (browser notifications only if you enable them), records organiser, editable life timeline, life ladder |
| **Adviser tools** | **My Action Plan** (ordered steps with ₹ amounts: debt → buffer → cover → tax → investing → goals), **Grow My Money** (every option ranked by post-tax, post-inflation return, with your own debts shown as guaranteed returns), **Tax Optimizer** (best regime + tax saved by each unused deduction), HRA calculator, **Adviser Verdict** in the Decision Engine |
| **Data & Sources** | ~35 official links (income tax, RBI, SEBI, AMFI, India Post, EPFO, NPS, Parivahan, Udyam, GST, MCA, state portals…) and an **update centre**: edit tax slabs/years, scheme rates & limits, loan rates, assumptions, or load a JSON config file — every calculator recalculates |
| **History & slips** | Expense log (date, category, amount, paid-by), **Monthly Statement** (any month/range/category → where every rupee went, by category and payment mode, vs budget, net-worth change; print, HTML slip, CSV), **Month-End Close**, month-end banner, recurring calendar reminder (.ics) |
| **Lock & sync** | Optional passphrase lock with AES-256 encryption at rest, idle auto-lock, encrypted export, **Google Drive auto-sync** to your own hidden app folder with monthly archive copies — see `PUBLISHING.md` |
| **Access key** | First run on a device: Step 1 a field for the shared access key, Step 2 (only if a Google client ID is configured) connect Google Drive — **first time only**. The verified key is remembered in the user's own Drive (a tiny file holding only the key's hash), so on any new device "Continue with Google Drive" replaces typing the key: once for life, until the administrator changes the key. Only a salted, iterated hash of the key is stored in `js/gate.js`. Browser-side check: keeps ordinary visitors out, but anyone with the key can share it, and a technical person could edit the files. Turn off with `required: false` |
| **Test box** | Settings → Test box: one-click checks for the access key, saving, encryption, Google Drive (writes and removes a tiny test file) and install/offline readiness. A ⚙ Settings icon sits in the top ribbon beside ? and the theme toggle |
| **Safety** | Scam centre + scam checker; refuses text that looks like card/account numbers, OTPs, PINs, CVVs, passwords, Aadhaar |
| **Privacy** | `localStorage` only; Export / Import JSON; Delete all data; high contrast, large text, reduced motion, dark mode, keyboard + screen-reader friendly |

## Built to last (it should still open in 200 years' time)

Plain HTML/CSS/JavaScript files. No build step, no framework, no server, no account, no licence check, no subscription, no fonts or scripts loaded from the internet.
The only network call in the whole app is the optional Google sign-in for Drive sync, which runs only when you press Connect. Dates work for any year, and the yearly tax/rate changes are made in the **Data & Sources** screens — never by editing code. Your data exports as readable JSON.
**Keep two things:** this folder (or your published copy) and your exported data file. Double-click `index.html` in any browser, import the file, and you are back.
No software can honestly promise 200 years; this design just removes everything that could lapse.

## Help inside the app

Press the **?** icon (top right) or the `?` key for the full guide: first 10 minutes, the daily/weekly/monthly/quarterly/yearly routine with exactly what to update where, a table of which data feeds which calculator, a tour of every section, backup/sync/lock, and troubleshooting. Every calculator and tool page also opens with a short **About this page** box (what it does · when to use it · how to read it / when to update).

## Your data and backups

Data lives **only in this browser**. Clearing site data erases it. Use **Settings → Export my data** regularly
(the dashboard reminds you) and keep the JSON somewhere safe. Import restores the full state on any device.
The review and reports are generated locally — nothing is uploaded anywhere.

## Configuration (change once, every screen updates)

All time-sensitive values live in `js/data.js`, each with **Source / Last updated / Applicable period / Verify** metadata:

```text
TAX_RULES             slabs, rebate, cess, deductions, capital-gains rates — by financial year
GOVERNMENT_SCHEMES    PPF, NSC, KVP, SCSS, SSY, Post Office schemes (rates, limits, tax, lock-in)
INTEREST_RATES        typical bank / loan rates used as calculator defaults
FINANCIAL_ASSUMPTIONS inflation, return assumptions, benchmarks, affordability rules, salary assumptions
EDUCATIONAL_CONTENT   js/content.js + js/playbook.js (lessons, quizzes)
```

**Important:** these values are configurable defaults entered from general knowledge — **not live data**. Verify against
the Income Tax Department, RBI, SEBI, India Post and your lender before acting. You can change them without editing code in **Data & Sources** (`#/sources`): Update tax rules · Update rates & limits · Data file (JSON).

## File map

```text
finance-os/
├── index.html · manifest.webmanifest · sw.js · icons/   (installable phone app + offline)
├── DEPLOY_CHECKLIST.md · PUBLISHING.md
├── css/        style.css (tokens, layout) · components.css · responsive.css (mobile nav, print)
├── js/
│   ├── data.js          configuration + module registry + glossary + checklists
│   ├── calculations.js  pure financial maths + formatting (Indian numbering)
│   ├── storage.js       local state, import/export, derived metrics
│   ├── ui.js            helpers, calculator registry, inline-editable tables, tabs
│   ├── charts.js        SVG line / bar / donut with hover tooltips
│   ├── content.js       lessons + quizzes (core modules)
│   ├── loans.js · investments.js · goals.js · budget.js · taxes.js · insurance.js · scenarios.js
│   ├── decision.js      Decision Engine + "Things people forget"
│   ├── dashboard.js     dashboard, onboarding, net worth, financial health, reports
│   ├── life.js          reminders, records, timeline, checklists, knowledge levels
│   ├── statement.js     monthly statement, month-end close, .ics reminder
│   ├── sync.js          Google Drive sync, lock screen, settings panels
│   ├── sources.js       official links + update centre (tax rules, rates, limits, JSON config)
│   ├── adviser.js       action plan, return ladder, tax optimizer, HRA
│   ├── playbook.js      practical guides, affordability, expense log, idea finder, ladder, My Money Review
│   ├── search.js        global search (press `/`)
│   └── app.js           router, calculator engine, module pages, quizzes, glossary, settings
├── tests/
│   ├── logic.js         DOM-free tests — 270+ checks: all calculators, independently verified maths, data update flow, statements, search, no-external-dependency and no-date-bomb scans (run: `jsc tests/logic.js`)
│   ├── smoke.js         walks every page/calculator/tool through the real app code with a fake DOM, fires ~3,300 interactions (bad inputs, every decision type, every quiz) and repeats the run with the clock set to 2226
│   └── selftest.html    open in a browser: renders every calculator and route, runs the 12 acceptance scenarios
└── investment_and_business_guide.md   source guide used for lesson content
```

## Principles

Facts, full costs, taxes, fees, risks and alternatives — then a clear verdict and an ordered plan built from your own numbers.
Projections use the assumptions listed in each calculator; change an assumption and the answer changes.

## Change the access key

The key itself is never stored — only `salt`, `hash` and `rounds` in `js/gate.js`. To change it, compute a new hash (replace `NEWKEY`) and paste the two printed values into `gate.js`:

```bash
python3 -c "import hashlib,os,base64;k=b'NEWKEY';s=os.urandom(16);h=hashlib.sha256(s+k).digest()
for _ in range(19999):h=hashlib.sha256(h+k).digest()
print('salt:',base64.b64encode(s).decode());print('hash:',base64.b64encode(h).decode())"
```
(`rounds` stays 20000.) Everyone will be asked for the new key on their next visit.
