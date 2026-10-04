/* ==========================================================================
   help.js — the complete "How to use Finance OS" guide (opens from the ? icon)
   ========================================================================== */
window.FOS = window.FOS || {};
(function () {
  'use strict';
  const sec = (id, title, body, open) => `<details class="help-sec" id="h-${id}" ${open ? 'open' : ''}><summary><b>${title}</b></summary>${body}</details>`;
  const table = (head, rows) => `<div class="table-scroll"><table class="data schemes"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`;

  FOS.helpHTML = function () {
    const toc = [['start', 'Start here (first 10 minutes)'], ['routine', 'Your routine: what to update, when and how'], ['data', 'Which data goes where'], ['tour', 'A tour of every section'], ['calc', 'How to use a calculator'], ['decide', 'Decisions, plan and statement'], ['phone', 'Using it on your phone (install as an app)'], ['safe', 'Backup, sync and password lock'], ['forever', 'Keeping it working for decades'], ['faq', 'Problems and answers']];
    return `<div class="card"><p class="lead">Finance OS is your private money workbook. You type in your numbers once, keep them current with a few minutes each month, and it turns them into calculators, a monthly statement, a plan and warnings. Nothing is sent anywhere unless you turn on Google Drive sync.</p>
      <ol class="toc">${toc.map(([id, t]) => `<li><a href="#/help?s=${id}" data-h="${id}">${t}</a></li>`).join('')}</ol>
      <p class="note">Shortcuts: press <kbd>/</kbd> to search, <kbd>?</kbd> to open this help, <kbd>Esc</kbd> to close a dialog.</p></div>
    ${sec('start', '1 · Start here (first 10 minutes)', `<ol>
      <li><b>Open the Home page</b> and press <b>START MY FINANCIAL JOURNEY</b>. Answer the four short steps (age, income, savings, loans, insurance). Everything is optional and stays in your browser. Skip what you do not want to share.</li>
      <li><b>Budget</b> (menu → Budgeting): enter your monthly take-home income and your categories (rent, food, transport…). Choose a method, or just use <i>Custom</i>. This takes about five minutes.</li>
      <li><b>Net Worth</b> (menu → Net Worth): add what you own (bank, FD, investments, gold…) and what you owe (card dues, loans, with EMI and interest rate).</li>
      <li><b>Emergency fund</b>: open the Emergency Fund calculator and press "Record my existing savings as Emergency Fund" if you keep money aside for emergencies.</li>
      <li><b>Open the Dashboard</b> — it now shows your income, savings rate, net worth and goals. Then read <b>My Action Plan</b> for the ordered steps.</li>
      <li>Press <b>Settings → Export my data</b> once and save the file somewhere safe. That is your first backup.</li>
      <li>Optional but recommended: turn on <b>Google Drive auto-sync</b> and the <b>password lock</b> (Settings).</li></ol>
      <p>Try it first with made-up numbers: <b>Settings → Load sample data</b>. You can delete it later with <b>Delete all my data</b>.</p>`, true)}
    ${sec('routine', '2 · Your routine: what to update, when and how', `
      ${table(['When', 'Time', 'What to do', 'Where'], [
        ['Every day or every few days', '1 minute', 'Log what you spent: date, category, amount, how you paid. If you forget, do it in a batch once a week from your UPI/bank app.', 'Menu → Earn More & Save More (Expense Log), or My space → Expense log'],
        ['Every week', '5 minutes', 'Catch up missing expenses. Glance at the Dashboard. Check "Upcoming payments".', 'Dashboard'],
        ['Every month — last days of the month, or the first 10 days of the next', '2 minutes', 'Run <b>Month-End Close</b>: (1) income actually received, (2) check expenses are logged, (3) update balances of accounts, investments and loans, (4) press <i>Save and create snapshot</i>. Then read the Monthly Statement and My Money Review.', 'Menu → Month-End Close, then Monthly Statement'],
        ['Every month', '30 seconds', 'Update "Saved so far" on your goals and SIP amounts if they changed.', 'Menu → Financial Goals'],
        ['Every quarter (Jan, Apr, Jul, Oct)', '5 minutes', 'Small-savings rates (PPF, NSC, SCSS, SSY, Post Office) are announced for each quarter. Check them and update if changed. Check bank FD and loan rates if you are about to deposit or borrow.', 'Menu → Data & Sources → Update rates & limits'],
        ['Every year after the Union Budget (Feb) and when the new financial year starts (1 April)', '15 minutes', 'Update the <b>tax rules</b>: add the new year, change slabs, standard deduction, rebate, capital-gains rates. Then run the <b>Tax Optimizer</b> and choose your regime. Open the <b>Bank Rates Book</b> and enter your banks\' current FD / savings / loan rates (the app asks you each April). Review insurance cover, nominees, goals and your asset mix. Export a backup.', 'Menu → Data & Sources → Update tax rules; Bank Rates Book; Tax Center'],
        ['When life changes', '5 minutes', 'New job or raise → update Budget income. New loan or card → add it to Net Worth (with EMI and rate). Marriage, child, home → update dependants/insurance in onboarding and add goals. Before any big purchase → use the Decision Engine and Affordability Check.', 'Budget, Net Worth, Decision Engine'],
        ['Whenever you take or renew a policy, FD, loan or subscription', '1 minute', 'Add it to Records with the renewal date and nominee, and set a Reminder.', 'My space → Records, Reminders']])}
      <p class="note">The app will remind you: a banner appears when last month is not closed, when a new financial year starts, and when rates have not been checked for 90 days. A website cannot notify you while it is closed, so download the recurring calendar reminder from Month-End Close.</p>`)}
    ${sec('data', '3 · Which data goes where', `<p>There are two kinds of data.</p>
      <ul><li><b>Your data</b> (income, spending, balances, goals). Only you know it, so you type it in. It is saved automatically in your browser.</li>
      <li><b>Reference data</b> (tax slabs, PPF/FD rates, deduction limits, affordability rules). This is the government's and the market's data. It is built in, but it changes, so you refresh it at <b>Data & Sources</b>. The app cannot fetch it by itself because it works offline and sends nothing out.</li></ul>
      ${table(['Data', 'Enter it in', 'Changes calculators / pages'], [
        ['Monthly income, spending plan', 'Budget', 'Dashboard, savings rate, Action Plan, affordability defaults, Money Review'],
        ['What you actually spent', 'Expense Log', 'Monthly Statement, Money Review (category patterns)'],
        ['Actual income this month', 'Month-End Close', 'Monthly Statement'],
        ['Assets and liabilities (with EMI and interest %)', 'Net Worth or Month-End Close', 'Net worth, emergency months, debt ranking, Action Plan, Grow My Money'],
        ['Goals (target, date, inflation, return)', 'Financial Goals', 'Required monthly amounts, Action Plan'],
        ['Age, dependants, insurance, risk comfort', 'Onboarding (Home → START MY FINANCIAL JOURNEY)', 'Allocation, cover advice, health check'],
        ['Subscriptions', 'Recurring Expense Auditor', 'Yearly and 10-year cost'],
        ['Renewals and due dates', 'Reminders and Records', 'Banners, Dashboard "Upcoming payments"'],
        ['Tax slabs, deductions, capital-gains rates', 'Data & Sources → Update tax rules', 'Income tax, Salary, Tax Optimizer, Capital gains, Action Plan'],
        ['PPF/NSC/SCSS/SSY rates and limits; bank, loan and card rates; inflation and return assumptions', 'Data & Sources → Update rates & limits', 'FD, RD, PPF, NPS, loans, retirement, Grow My Money, Decision Engine']])}
      <p>Whenever you change a value, every screen that uses it recalculates. You never enter the same number twice.</p>`)}
    ${sec('tour', '4 · A tour of every section', `
      ${table(['Section', 'What it is for'], [
        ['Home / Dashboard', 'Where you start, and your money at a glance.'],
        ['Money Basics → Credit & Debt', 'Lessons in plain English with examples, checklists and a quiz for each topic: money, income, budgeting, banking, credit cards, loans, EMI.'],
        ['Protect', 'Insurance, emergency fund and scam protection.'],
        ['Invest', 'Investing, mutual funds, stocks, bonds, gold, government and Post Office schemes, crypto.'],
        ['Plan', 'Retirement, tax, property, vehicle (including buying a used vehicle), education, marriage, children, starting a business, financial independence, earning and saving more.'],
        ['Decide', 'Net worth, goals, what-if scenarios, opportunity cost, Decision Engine, Financial Health, Action Plan, Grow My Money, Monthly Statement, Month-End Close, My Money Review.'],
        ['Top ribbon', 'The ⚙ icon opens Settings (appearance, lock, Drive sync, backup and the Test box); the ? icon opens this guide; ☾/☀ switches dark mode; the search box finds anything.'],
        ['Learn & Tools', 'Knowledge levels, checklists, the calculator library, glossary, reports, Data & Sources, Settings.'],
        ['My space', 'Snapshot, expense log, life ladder, business ideas, reminders, records, life timeline, life simulator, recurring expenses, purchase analyzer.']])}
      <p>Every page starts with an <b>About this page</b> box that says what it does and when to use it.</p>`)}
    ${sec('calc', '5 · How to use a calculator', `<ol><li>Open it from the menu, the Calculator Library or by searching.</li><li>Change any number — type it, or drag the slider. Results and charts update instantly. A red message appears if a value is not allowed (negative, empty, too large).</li><li><b>Reset</b> returns the inputs to the defaults. Many defaults come from your own data.</li><li><b>Copy results</b>, <b>Print</b> and <b>Download summary</b> export what you see.</li><li><b>Save as A / B / C</b> stores up to three versions of your inputs and shows them side by side — for example "current loan" vs "with prepayment".</li><li>Below the result, <b>Formula &amp; assumptions</b> shows exactly how the number is produced. Change an assumption and the answer changes.</li></ol>`)}
    ${sec('decide', '6 · Decisions, plan and statement', `<ul>
      <li><b>Decision Engine</b> (before any big spend, loan or investment): pick the action, enter the numbers, read the thirteen questions, and finish with the <b>Adviser verdict</b> — go ahead, possible with changes, or hold off — with reasons and what to fix.</li>
      <li><b>CHECK BEFORE I PAY</b> (button at the bottom right): a 1-minute check for any purchase. <b>BEFORE YOU SIGN</b>: a checklist for loans, insurance, cards, property and subscriptions.</li>
      <li><b>Affordability Check</b>: tests a car, bike, home or phone against common guidelines (for a car: 20% down, loan of at most 4 years, total vehicle cost about 10% of gross income) and shows the highest price that fits.</li>
      <li><b>My Action Plan</b>: an ordered list with amounts: expensive debt → emergency fund → insurance → tax → investing → goals. It changes as your data changes.</li>
      <li><b>Monthly Statement</b>: choose a month, a range or a category to see where every rupee went, how you paid, and your savings. It shows only what you entered — months with nothing recorded say "no data" and months before you started are not shown. Print it as a slip or export the CSV.</li>
      <li><b>My Money Review</b>: plain observations and ideas (earn more, save more, business ideas) from your numbers.</li></ul>`)}
    ${sec('phone', 'Using it on your phone (install as an app)', `<ol><li>Open your published web address in <b>Chrome (Android)</b> or <b>Safari (iPhone)</b>.</li><li><b>Android:</b> menu ⋮ → <i>Install app</i> (or <i>Add to Home screen</i>). <b>iPhone:</b> Share button → <i>Add to Home Screen</i>.</li><li>Open it from the new home-screen icon. It runs full-screen like an app and keeps working with no internet.</li></ol>
      <p><b>Important for iPhone:</b> the home-screen app and the Safari tab keep <i>separate</i> data. Decide which one you will use. To move data between them (or to another phone), use <b>Export / Import</b> or <b>Google Drive sync</b> in Settings.</p>
      <p>On a phone the menu is the ☰ button (top left); the bottom bar has Home, Money (dashboard), Calc, Decide and Menu. The two round buttons at the bottom right are <b>CHECK BEFORE I PAY</b> and <b>BEFORE YOU SIGN</b>. Tables scroll sideways; rotate the phone for wide tables.</p>`)}
    ${sec('safe', '7 · Backup, Google Drive sync and password lock', `<ul>
      <li><b>Where is my data?</b> In your browser on this device for this web address. Clearing site data, using private browsing, a different browser, or a different web address will not show it. Some browsers (notably Safari) can erase site data for sites you have not opened for a week — another reason to back up.</li>
      <li><b>Export my data</b> (Settings) saves everything to a file you keep. <b>Import</b> restores it anywhere. Do this after each Month-End Close or at least every three months.</li>
      <li><b>Google Drive auto-sync</b> (Settings) keeps the latest copy and a monthly archive in a hidden folder of your own Drive, and lets you open the app on another device. One-time setup steps are shown in Settings and in PUBLISHING.md. Press <b>Sync now</b> once per browser session; afterwards changes upload automatically.</li>
      <li><b>Password lock</b> (Settings) asks for a passphrase every time and stores everything encrypted, on the device and in Drive. If you forget the passphrase the data cannot be opened — keep a plain export or a Drive copy too.</li>
      <li>Never type card or account numbers, passwords, OTPs, PINs or CVVs anywhere in the app. It will refuse text that looks like them.</li></ul>`)}
    ${sec('forever', '8 · Keeping it working for decades', `<ul>
      <li><b>No expiry.</b> The app is plain HTML, CSS and JavaScript files. It has no licence check, no subscription, no server and no required internet. The only optional outside call is Google sign-in when you choose Drive sync.</li>
      <li><b>Keep two things safe:</b> (1) the website folder (the files you published — a copy on your Drive or a pen drive) and (2) your exported data file. With just those two, you can double-click <code>index.html</code> in any browser, now or in the future, and import your data.</li>
      <li><b>Rules change — not the code.</b> Each year add the new tax year and update rates at <b>Data & Sources</b>. You never need to edit code for that.</li>
      <li><b>Your data is open text.</b> The export is readable JSON. Even if the app were ever unavailable, your numbers are not locked in.</li>
      <li>If a government website changes its address, use its search bar for the phrases on the Data & Sources page; the figures you enter are what matter.</li>
      <li>No one can promise any software will run unchanged for 200 years, but this design has nothing that can lapse: no accounts, no servers, no frameworks, no fonts or scripts loaded from elsewhere, and dates handled for any year.</li></ul>`)}
    ${sec('faq', '9 · Problems and answers', `
      <details><summary>My data disappeared.</summary><p>Browser data belongs to one address in one browser profile. Check you are on the same address and browser, not in private mode. Then import your last export, or connect Google Drive and choose to load the Drive copy.</p></details>
      <details><summary>Google says "Access blocked" / "has not completed the verification process" (Error 403 access_denied).</summary><p>Your Google Cloud project is in Testing mode and your Gmail is not on its test list. In Google Cloud open OAuth consent screen (Google Auth Platform → Audience), add your Gmail under Test users (or press Publish app), then press Sync now again.</p></details>
      <details><summary>The app shows "Google Drive sync needs a quick sign-in".</summary><p>Google requires a click each session. Press the banner button or Settings → Sync now.</p></details>
      <details><summary>The page says a new financial year has started.</summary><p>That is the yearly nudge. Open Data & Sources → Update tax rules → "Add a new year", change the numbers that changed and save. You can also press "I've checked" to dismiss it for 90 days.</p></details>
      <details><summary>A calculator shows "—".</summary><p>It means that value cannot be calculated from the inputs (for example a payment too small to repay a loan). Fix the inputs or read the note under the results.</p></details>
      <details><summary>My SIP result is different from another app or website (even by lakhs).</summary><p>Websites use different conventions: monthly rate = annual ÷ 12 versus a true yearly return, and investing at the start versus the end of the month. Open the SIP calculator: the table under the results shows all four for your inputs, with the one this app uses marked ●. Pick the one that matches the other site in Data & Sources → Planning assumptions. For a cautious plan use a “true yearly return” option, because fund returns are quoted as yearly returns.</p></details>
      <details><summary>How accurate are the calculators? Can I trust them?</summary><p>The formulas are checked against an independently written version on over a thousand random inputs, and agree to a fraction of a paisa (EMI, FD, RD, PPF, SIP, lump sum, CAGR, inflation, loan true cost, income tax, capital gains, retirement, goals and more). Two honest limits: (1) banks and websites sometimes use different conventions (rounding, compounding, the SIP convention) — compare with your bank's own quote; (2) the rates and tax rules are only as current as the figures in Data &amp; Sources. Quick personal check before a big decision: your EMI against the sanction letter, your FD against the bank's maturity amount, and your tax against the Income Tax Department's own calculator.</p></details>
      <details><summary>Numbers look different from my bank.</summary><p>Banks differ in how they compound and round. Use the calculators for planning and compare with the bank's exact quote.</p></details>
      <details><summary>I forgot the lock passphrase.</summary><p>The encrypted data cannot be recovered. Delete the browser's stored data for the site, then import a plain export or load the Drive copy if it is not encrypted.</p></details>
      <details><summary>The app asks for an access key.</summary><p>Enter the access key once, ever. After it is verified and Google Drive is connected, the key is remembered in your own Drive for life. On a new phone, a new browser or after clearing data, press <i>Continue with Google Drive</i> instead of typing the key. You are asked for the key again only if the administrator changes it. If you cleared your browser data you will be asked again; your own data is unaffected.</p></details>
      <details><summary>How do I start over?</summary><p>Settings → Delete all my data. It asks you to type DELETE.</p></details>`)}`;
  };

  FOS.openHelpSection = function (id) { const d = document.getElementById('h-' + id); if (d) { d.open = true; d.scrollIntoView(); } };
})();
