/* guides-3.js — GROW: investing, mutual funds, stocks, bonds, gold, government & post-office schemes, crypto */
window.FOS = window.FOS || {};
(function () {
  'use strict';
  const G = FOS.G;

  G({
    id: 'investing', module: 'investing', cat: 'Invest', read: '30 min read', title: 'Investing — the complete framework',
    summary: `Risk, return, inflation, asset allocation, SIP, rebalancing, costs, tax and behaviour: how a normal salaried person builds wealth without gambling.`,
    calcs: ['sip', 'cagr', 'allocation', 'inflation', 'fees'], tools: [['Grow My Money', '#/tool/growth']],
    sections: [
      [`Before you invest: the foundation`,
        ['ol', `**Emergency fund** (6 months) in safe, liquid places.`, `**Insurance:** health, term, personal accident.`, `**High-interest debt** (above ~12%) cleared.`, `**Goal list** with amounts and dates (home, education, retirement).`, `Only then invest, by goal and time horizon.`],
        ['warn', `Money needed within **3 years** doesn't belong in equity. Money for **10+ years** shouldn't sit only in FDs.`]],
      [`Return, risk, inflation`,
        ['tbl', ['Asset', 'Long-term return (historical, illustrative)', 'Worst year', 'Liquidity'], [[`Savings account`, `2.5–4%`, `0`, `Instant`], [`FD / RD`, `6.5–7.5%`, `0 (bank risk)`, `Days`], [`PPF / EPF`, `7–8.25%`, `0`, `Lock-in`], [`Debt mutual funds`, `6–8%`, `−3% to −5%`, `1–3 days`], [`Gold`, `8–10% (very uneven)`, `−20%+`, `Days`], [`Equity index (Nifty 50)`, `11–13% over 15+ yrs`, `−50% (2008)`, `Days`], [`Real estate`, `6–9%`, `flat years`, `Months`], [`Crypto`, `Unknowable`, `−80%`, `Instant`]]],
        `**Real return = nominal − inflation − tax.** FD 7% − 6% inflation − 30% tax on interest = **≈ 0.9% real**. Equity funds after 12.5% LTCG above ₹1.25 L: roughly 8–10% real. Inflation is the silent tax; you need assets that beat it.`],
      [`Asset allocation: the main decision`,
        `Studies show allocation explains most portfolio outcomes. A simple rule: **equity % ≈ 100 − age** (up to 75–80% for aggressive), the rest in debt and gold.`,
        ['tbl', ['Profile', 'Equity', 'Debt', 'Gold'], [[`Age 25–35, long horizon`, `70–80%`, `15–20%`, `5–10%`], [`Age 35–50`, `60–70%`, `25–30%`, `5–10%`], [`Age 50–60`, `40–50%`, `40–50%`, `5–10%`], [`Retired`, `20–30%`, `60–70%`, `5–10%`]]],
        `**Rebalance** once a year (or when any asset drifts 5%+): sell what grew, buy what lagged. It forces “buy low, sell high”.`],
      [`SIP, lumpsum, SWP, STP`,
        ['ul', `**SIP:** fixed amount monthly. Rupee-cost averaging reduces timing risk; builds discipline. **Step-up SIP** (increase 10% a year) is powerful.`, `**Lumpsum:** best for windfalls; spread via **STP** (Systematic Transfer) into equity over 6–12 months if nervous.`, `**SWP:** systematic withdrawals for retirement income from a fund.`],
        ['ex', `₹10,000/month for 20 years at 12%: ≈ ₹99.9 L (total invested ₹24 L). With 10% yearly step-up: ≈ ₹1.9 Cr. Different conventions (start vs end of month, nominal vs effective rate) change the answer by a few lakh — see the SIP note in the calculator.`]],
      [`Costs and taxes`,
        ['ul', `**Expense ratio:** direct plans cost 0.1–1%; regular plans 1–2.5%. On ₹50 L over 25 years a 1% gap costs ≈ ₹30–40 L. **Prefer direct plans / index funds.**`, `**Equity funds:** LTCG above ₹1.25 L a year at 12.5% (held > 12 months); STCG 20%. **Debt funds** (bought after 1 Apr 2023): gains taxed at slab rate.`, `**Tax-efficient use of limits:** harvest ₹1.25 L LTCG each year by selling and buying back. Keep **ELSS** (old regime, 3-year lock-in) only if it fits your asset allocation.`, `**STT, brokerage, exit load, demat AMC** — check each.`]],
      [`Behaviour decides results`,
        ['ul', `Markets fall 10% almost every year and 30%+ every ~8 years. **Investors lose more from selling in panic than from the fall.**`, `Avoid tips, WhatsApp groups, “can't lose” products, leverage, F&O (SEBI data: ~9 in 10 retail traders lose money).`, `Check your portfolio quarterly, not daily. Automate SIPs and increase them with income.`, `**Write an investment policy:** goals, allocation, instruments, rebalancing rule, what you will do in a 30% fall. Follow it.`]],
      [`A simple portfolio (illustrative)`,
        ['tbl', ['Goal', 'Instrument'], [[`Emergency (6 mo)`, `Savings/sweep + liquid fund + FD ladder`], [`Retirement (20+ yrs)`, `Nifty 50 / Nifty Next 50 / flexi-cap index fund SIP, EPF/PPF, NPS (extra ₹50,000 under 80CCD(1B), old regime)`], [`Child's education (10+ yrs)`, `Index/large-cap fund + SSY/PPF`], [`House in 5 yrs`, `Hybrid / short-duration debt / FD`], [`Gold hedge`, `5–10% in SGB/gold ETF`]]],
        ['tip', `Two or three funds are enough: a broad index fund, a mid/flexi-cap fund and a debt fund. More funds ≠ more diversification.`]]
    ],
    advisor: [`Invest by **goal**: match each goal's time to the right asset; never invest short-term money in equity.`, `Automate: SIP on salary day, step-up 10% a year, until the goals are covered.`, `For most people: **index funds (direct) + PPF/EPF + NPS + 5–10% gold**, rebalanced yearly.`, `Avoid: F&O, intraday trading, tips, crypto beyond what you can lose (max 2–5%), unregulated schemes.`, `Fix your savings rate first (20–30% of income) — it matters more than picking the “best” fund.`, `Review: once a year. Do nothing in between.`],
    checklist: [`Emergency fund + insurance in place.`, `Each goal has an amount, year and matching asset.`, `SIP automated with a yearly step-up.`, `Direct plans or index funds; expense ratio < 1%.`, `Allocation written and rebalanced yearly.`, `No money needed in < 3 years sits in equity.`, `No leverage, F&O or unregulated products.`, `Tax harvest done before March.`],
    verify: [`SEBI — sebi.gov.in`, `AMFI — amfiindia.com`, `NSE — niftyindices.com (index factsheets)`, `Income Tax — capital-gains rules`]
  });

  G({
    id: 'mutualfunds', module: 'mutualfunds', cat: 'Invest', read: '30 min read', title: 'Mutual funds — every type, cost, risk and how to choose',
    summary: `NAV, categories, direct vs regular, expense ratio, exit load, riskometer, taxation, SIP/STP/SWP, KYC, folios, choosing an index fund and a checklist of mistakes.`,
    calcs: ['sip', 'lumpsum', 'cagr', 'fees'],
    sections: [
      [`How a mutual fund works`,
        `Investors pool money; a fund manager invests in stocks/bonds; profits/losses are shared in proportion to **units**. Units are priced at **NAV** (Net Asset Value) = (assets − liabilities) ÷ units outstanding. You buy at the day's NAV (cut-off 3 pm for most funds; 1:30 pm for liquid funds), so a low NAV is **not** "cheap" — only % return matters.`,
        ['tbl', ['Term', 'Meaning'], [[`AMC`, `Asset management company (HDFC MF, SBI MF…)`], [`Scheme / plan`, `Fund (direct/regular, growth/IDCW)`], [`Folio`, `Your account with an AMC`], [`SIF / PMS / AIF`, `Higher-ticket products — not for most investors`], [`Riskometer`, `Six levels from Low to Very High, set by SEBI`], [`Exit load`, `Fee for selling within a period (e.g. 1% within 1 year)`], [`TER`, `Total expense ratio — yearly cost taken from NAV`]]]],
      [`Fund categories (SEBI)`,
        ['tbl', ['Family', 'Examples', 'Risk', 'Horizon', 'Use'], [
          [`Equity – large cap`, `Top 100 companies`, `Med-high`, `5+ yrs`, `Core`],
          [`Equity – mid/small cap`, `101–250 / 251+`, `High / Very high`, `7–10 yrs`, `Satellite (≤ 30%)`],
          [`Flexi-cap / multi-cap`, `Any size`, `High`, `5–7 yrs`, `One-fund core`],
          [`Index / ETF`, `Nifty 50, Sensex, Next 50, Midcap 150`, `Market risk`, `7+ yrs`, `Cheapest core`],
          [`ELSS`, `Tax saver, 3-year lock-in`, `High`, `3+ yrs`, `Old regime 80C`],
          [`Hybrid – aggressive / balanced advantage`, `65–80% equity`, `Med-high`, `3–5 yrs`, `Smoother`],
          [`Arbitrage`, `Equity taxed, low risk`, `Low`, `3–12 mo`, `Parking (tax-efficient vs debt)`],
          [`Debt – liquid / overnight`, `≤ 91 days`, `Low`, `Days–months`, `Emergency`],
          [`Debt – short/corporate/gilt`, `Duration varies`, `Low–Med`, `1–5 yrs`, `Goals`],
          [`Gold ETF / FoF`, `Tracks gold`, `Med`, `5+ yrs`, `Hedge`],
          [`International`, `US/global index`, `High + currency`, `7+ yrs`, `Diversifier`],
          [`Thematic / sector`, `Single theme`, `Very high`, `Avoid`, `Concentrated bets`]]]],
      [`Direct vs regular; growth vs IDCW`,
        ['ul', `**Direct** (no distributor commission) has ~0.5–1.0% lower TER than **regular** — on a ₹50 lakh portfolio ≈ ₹25–50k a year. Buy direct via the AMC site, MF Central, Kuvera/Coin/Groww etc. Regular is only worth it if paying an adviser you trust.`, `**Growth** reinvests gains (best for compounding). **IDCW** (formerly dividend) is paid out of your own NAV and taxed at slab — avoid for wealth creation.`]],
      [`Taxes (verify yearly)`,
        ['tbl', ['Fund type', 'Short-term', 'Long-term'], [[`Equity (≥ 65% equity)`, `< 12 months: 20%`, `> 12 months: 12.5% on gains above ₹1.25 L a year`], [`Debt (bought after 1 Apr 2023)`, `Slab rate`, `Slab rate`], [`Hybrid (35–65% equity)`, `Slab rate (if bought after 2023)`, `Rules vary`], [`Gold funds / international`, `Slab`, `Slab (older rules differ)`]]],
        `Switching between funds is a **sale** and is taxable. **FIFO** is used on units. Capital-loss set-off against gains is allowed for 8 years if you file ITR on time.`],
      [`How to pick a fund (a simple method)`,
        ['ol', `**Decide the role:** core equity (index), growth (flexi/mid), stability (debt), parking (liquid).`, `**Prefer index funds** for large-cap exposure — most active large-cap funds lag the index after cost.`, `For active funds compare **5- and 10-year rolling returns** vs category and benchmark, **consistency**, **fund-manager tenure**, **AUM** (too large hurts small-caps), **TER**, **portfolio turnover**, **top-10 holdings**.`, `For index funds compare **tracking error** and **TER** (0.1–0.2% is good).`, `For debt funds check **credit quality** (AAA/sovereign), **duration** vs your horizon, and **yield to maturity**.`, `Read the **riskometer** and **Scheme Information Document**.`]],
      [`Getting started`,
        ['ol', `Complete **KYC** (PAN, Aadhaar, bank, selfie) — once for all AMCs.`, `Create an account with a **direct platform**.`, `Select funds, start a **SIP** (date right after your salary), enable **step-up**.`, `Enable **NACH/UPI AutoPay** and nominee; download the **Consolidated Account Statement (CAS)** from CAMS/KFintech.`, `Track with the app's Portfolio tool.`]],
      [`Common mistakes`,
        ['ul', `Buying because **NAV is low**, or because last year's return was high.`, `Owning **15 funds** with the same stocks (overlap).`, `Stopping SIPs in a crash. (This is when units are cheapest.)`, `Selling before 12 months and paying 20% tax.`, `Investing in **NFOs** on hype; **thematic** funds at the peak.`, `Choosing **regular** plans and paying commission for years.`, `Ignoring **exit load** and **tax on switching**.`]]
    ],
    advisor: [`Core: one **Nifty 50 / Sensex index fund (direct)**, plus one **Nifty Next 50 or flexi-cap** for growth. Add one **short-duration/corporate bond** or **PPF/EPF** for stability.`, `Keep the fund count to **3–5**, each with a clear purpose.`, `SIP with a yearly step-up; never pause in a fall; review once a year.`, `Avoid sector/thematic funds and NFOs; cap mid/small-cap exposure at 25–30% of equity.`, `Use arbitrage or liquid funds for parking; use equity only for 5+ years.`],
    checklist: [`KYC complete; direct plan selected.`, `Growth option chosen.`, `Fund purpose written (core/satellite/debt/parking).`, `TER and exit load checked.`, `Riskometer matches my risk capacity.`, `SIP date and step-up set; autopay active.`, `Nominee added; CAS downloaded.`, `No overlapping or thematic funds.`, `Tax harvesting scheduled before 31 March.`],
    verify: [`SEBI — categorisation circular; sebi.gov.in`, `AMFI — amfiindia.com (NAV, TER, SIP)`, `AMC factsheets and Scheme Information Documents`, `MF Central — mfcentral.com`]
  });

  G({
    id: 'stocks', module: 'stocks', cat: 'Invest', read: '28 min read', title: 'Stocks — how the market works and how to analyse a business',
    summary: `Demat, trading, orders, charges, ratios (P/E, ROE, debt/equity), quality checks, IPOs, dividends, taxes, position sizing and risk control.`,
    calcs: ['pe', 'dividend', 'cagr', 'allocation'],
    sections: [
      [`How the market works`,
        ['ul', `**Exchanges:** NSE and BSE; trading 9:15–15:30 IST on weekdays; T+1 settlement.`, `**Demat** account holds shares in electronic form; **trading** account places orders; **bank** account funds them. Brokers: discount (flat fee) or full-service (research, advice).`, `**Order types:** market, limit, stop-loss, GTT (good-till-triggered). Prefer **limit orders**.`, `**Segments:** cash/delivery (investment), intraday, F&O (derivatives). F&O is not investing.`, `**Circuits:** price bands (2/5/10/20%) stop extreme moves.`]],
      [`Costs you pay`,
        ['tbl', ['Charge', 'Typical'], [[`Brokerage`, `₹0 delivery (some) to ₹20/order`], [`STT`, `0.1% on delivery buy and sell`], [`Exchange + SEBI + stamp`, `~0.003–0.02%`], [`GST`, `18% on brokerage + fees`], [`DP charges`, `~₹13–16 per sell`], [`Demat AMC`, `₹0–500/yr`]]]],
      [`Reading a company — eight questions`,
        ['ol', `**What does it sell, to whom and why do they pay?** (business model, moat)`, `**Is revenue and profit growing** steadily for 5–10 years?`, `**ROE / ROCE** above 15% consistently?`, `**Debt/equity** below 1 (lower for non-financials); interest cover above 3×?`, `**Cash flow from operations** supports profits?`, `**Promoter holding** stable/high, no high pledge?`, `**Valuation:** P/E vs own history, peers, growth (PEG), earnings yield vs bond yield.`, `**Governance:** auditor changes, related-party deals, SEBI actions.`],
        ['tbl', ['Ratio', 'Formula', 'Reading'], [[`P/E`, `Price ÷ EPS`, `Years of profit to pay back the price; compare within sector`], [`P/B`, `Price ÷ book value/share`, `Useful for banks`], [`ROE`, `Net profit ÷ equity`, `> 15% good`], [`Debt/Equity`, `Debt ÷ equity`, `< 1 safer`], [`Dividend yield`, `Dividend ÷ price`, `Income`], [`EV/EBITDA`, `Enterprise value ÷ EBITDA`, `Capital-structure neutral`]]]],
      [`IPOs, dividends, splits, bonus`,
        ['ul', `**IPO:** apply through ASBA/UPI; read the DRHP; check what the money is used for (growth vs promoters' exit), valuation vs listed peers, lot size, grey market is unreliable.`, `**Dividends** are taxable at your slab (TDS 10% above ₹5,000/yr).`, `**Splits and bonuses** change the number of shares, not your value.`]],
      [`Tax (equity shares)`,
        ['ul', `Held ≤ 12 months → STCG 20%; > 12 months → LTCG 12.5% above ₹1.25 L a year.`, `Intraday/F&O profits are business income (speculative/non-speculative) — file ITR-3; keep a ledger and consider audit thresholds.`]],
      [`Risk control`,
        ['ul', `**Position size:** no more than 5% of your portfolio in a single stock; total direct equity ≤ 20–30% unless you're skilled.`, `**Diversify** across 15–25 businesses or use index funds.`, `**Stop-loss or thesis stop:** sell when the reason you bought is broken, not when the price merely dips.`, `**Never borrow** to buy shares or pledge long-term holdings for trading.`, `**Cash buffer:** keep 10–20% for buying dips.`]],
      [`The hard truth about trading`,
        `SEBI studies: ~90% of individual F&O traders lose money, with average net loss ≈ ₹1+ lakh after costs; 70% of intraday traders lose. If you want stock exposure, build it slowly, in businesses you understand, for 5+ years — or use index funds.`]
    ],
    advisor: [`Put **80–90%** of your equity money into index funds; keep **10–20%** for direct stocks as a learning portfolio.`, `Buy only businesses you can explain in two sentences; pay reasonable P/E; hold for years.`, `Never day-trade or trade F&O with money you need.`, `Record why you bought each stock; review that note yearly.`, `Avoid tips, Telegram groups, operator stocks, penny stocks.`],
    checklist: [`Demat with a SEBI-registered broker.`, `Costs and brokerage understood.`, `Each stock: business, ROE, debt, cash flow, valuation checked.`, `Max 5% per stock; total direct ≤ 20–30%.`, `No leverage, no tips.`, `Thesis note written.`, `Tax-loss/harvest reviewed before March.`],
    verify: [`SEBI — sebi.gov.in (brokers, investor education)`, `NSE/BSE — nseindia.com, bseindia.com (filings, results)`, `Screener/Trendlyne for ratios (cross-check with annual reports)`]
  });

  G({
    id: 'bonds', module: 'bonds', cat: 'Invest', read: '14 min read', title: 'Bonds and fixed income — yield, duration and safety',
    summary: `G-Secs, SDLs, T-bills, corporate bonds, NCDs, FDs, debt funds, RBI Floating Rate Bonds, how prices and yields move, credit ratings and taxes.`,
    calcs: ['bond', 'fd', 'absreturn'],
    sections: [
      [`Basics`, `A bond is a loan to a borrower (government or company) that pays **coupon** interest and returns **face value** at maturity. **YTM** (yield to maturity) is the true annual return if held to maturity. **Price moves opposite to yields:** if market rates rise, existing bond prices fall; the longer the maturity (duration), the larger the fall.`,
        ['ex', `Bond with 8% coupon, 10 years, ₹1,000 face. If market yields jump to 9%, its price drops to roughly ₹936. If yields fall to 7%, it rises to ~₹1,070.`]],
      [`Types`,
        ['tbl', ['Instrument', 'Issuer', 'Risk', 'Access'], [[`T-Bills (91–364 d), G-Secs, SDLs`, `Govt of India / states`, `No default risk`, `RBI Retail Direct, bank/broker`], [`RBI Floating Rate Savings Bonds`, `Govt`, `Rate resets (NSC + spread)`, `Bank/RBI`], [`Corporate bonds / NCDs`, `Companies`, `Credit risk by rating (AAA best)`, `Exchanges, platforms`], [`PSU bonds`, `PSUs`, `Low-mid`, `Secondary market`], [`Bank FDs`, `Banks`, `DICGC ₹5 L`, `Banks`], [`Debt mutual funds`, `Pooled`, `Duration + credit`, `AMCs`], [`Tax-free bonds`, `NHAI, REC etc.`, `Interest exempt`, `Secondary market only now`]]]],
      [`Ratings and risk`,
        ['ul', `**AAA/AA** = highest safety; A/BBB = speculative; below = junk. Ratings come from CRISIL, ICRA, CARE, India Ratings. Check the **outlook** (negative?) and the **rating history**.`, `Yield higher than peers = risk. 12–14% NCDs are almost always lower-rated — IL&FS, DHFL, Yes Bank AT1 wiped out investors.`, `**Liquidity risk:** many corporate bonds have thin markets. **Call option:** issuer can redeem early.`]],
      [`How to use bonds`,
        ['ul', `**Retail Direct** (rbiretaildirect.org.in) lets you buy G-Secs/T-bills with no commission.`, `**Target-maturity funds / bond ETFs** (Bharat Bond) hold to maturity, giving predictable YTM.`, `Match maturity to goal: 3-year goal → 3-year bond/target fund.`, `**Taxation:** interest at slab; capital gains: listed bonds held > 12 months → LTCG 12.5%; unlisted bonds → slab. Check yearly.`]]
    ],
    advisor: [`For safety use **G-Secs, PPF, EPF** and **AAA-rated** PSU bonds; avoid chasing yield.`, `Match duration to time horizon.`, `Do not put more than 5% of your money in any single corporate issuer.`, `Use target-maturity funds for 3–7-year goals.`],
    checklist: [`Issuer, rating, outlook, maturity, YTM noted.`, `Duration matches my horizon.`, `Liquidity and call option understood.`, `Tax treatment checked.`, `No single issuer above 5%.`],
    verify: [`RBI Retail Direct — rbiretaildirect.org.in`, `CRISIL/ICRA/CARE rating sites`, `SEBI — bond market investor guides`]
  });

  G({
    id: 'gold', module: 'gold', cat: 'Invest', read: '20 min read', title: 'Gold — buy, test and hold the right way',
    summary: `Jewellery vs coins vs ETFs vs digital gold vs Sovereign Gold Bonds, BIS hallmark (HUID) and karat purity, making charges, GST, tax, storage, and how much to hold.`,
    calcs: ['goldcalc', 'cagr'],
    sections: [
      [`Which form of gold?`,
        ['tbl', ['Form', 'Cost / charges', 'Purity assurance', 'Tax', 'Best for'], [
          [`Jewellery`, `Making 8–25% + 3% GST (+5% on making)`, `BIS hallmark + HUID`, `Capital gains on sale`, `Use, not investment`],
          [`Coins / bars`, `3–8% premium + GST`, `BIS hallmark; mint-sealed`, `Capital gains`, `Physical holding`],
          [`Gold ETF`, `~0.5% expense`, `99.5% purity, demat`, `Equity? No — gold ETFs are taxed as other assets (12.5% LTCG after 12 months)`, `Low-cost liquid exposure`],
          [`Gold mutual fund (FoF)`, `~0.5–1%`, `Backed by ETFs`, `Same as above`, `SIPs`],
          [`Sovereign Gold Bond (SGB)`, `No making; 2.5% yearly interest`, `Govt backed`, `**Redemption at maturity is tax-free** (8 years); new issues have paused — buy secondary`, `Best long-term`],
          [`Digital gold`, `2–3% spread + 3% GST`, `Vaulted by private vendors`, `Capital gains`, `Small, convenience; not regulated by SEBI`]]]],
      [`Purity, hallmark and HUID`,
        ['ul', `**Karat:** 24K = 99.9% (not for jewellery); **22K = 91.6%**; 18K = 75%; 14K = 58.3%. Price per gram depends on karat.`, `**BIS Hallmark** mark has: BIS logo, purity grade (e.g. **22K916**), and a **6-character alphanumeric HUID** (Hallmark Unique ID) laser-etched on each piece. Since 2021–2025, hallmarking with HUID is mandatory for 14/18/20/22/23/24K in notified districts.`, `**Verify:** use the **BIS Care app** → Verify HUID → shows jeweller, purity, weight. Check the invoice lists purity, weight, HUID, stone weight separately and making charges.`, `Hallmarking centre charge is only ₹45 per piece (+GST).`]],
      [`How to read a jewellery bill`,
        ['ul', `Gold value = net gold weight × rate of that karat.`, `**Making/wastage charge** (percent or per gram) — negotiate. Can be 8–25%, and it's lost on resale.`, `**Stone weight** is deducted; stones are priced separately and usually not bought back at the same value.`, `GST: 3% on gold value + 5% on making charges.`, `Resale: jewellers deduct 3–10% melting/wastage. Ask for the **buy-back policy** in writing.`],
        ['ex', `10 g 22K necklace at ₹7,000/g (illustrative): gold ₹70,000 + making 12% = ₹8,400 → ₹78,400 + GST (3% on gold ₹2,100 + 5% on making ₹420) = ₹80,920. You pay ~15.6% above gold value; you'd sell at maybe ₹66,000 — a **₹15,000 loss** on day one.`]],
      [`Taxes`,
        ['ul', `Physical gold/ETF/FoF: held > 12 months (after July 2024 rule) → LTCG 12.5% (no indexation); shorter → slab.`, `SGB: interest taxable at slab; maturity capital gains exempt; premature exit (from year 5 on the exchange) taxable per rules.`, `Keep invoices: gold inherited/gifted keeps the previous owner's cost basis. Holding limits in searches: 500 g per married woman, 250 g per unmarried woman, 100 g per man (seizure guidelines).`]],
      [`How much gold?`,
        `Gold is a **hedge**, not a growth engine: no cash flow, long flat periods (2012–2019). Hold **5–10%** of net worth. For jewellery you'll wear, treat the premium as consumption.`,
        ['tip', `Use SGB (secondary) or a gold ETF/FoF SIP for the investment part; buy jewellery only for use.`]],
      [`Storage and safety`,
        ['ul', `Bank locker (₹3–8k/yr) + home insurance for contents; never post photos; store invoices and HUID screenshots.`, `Avoid "gold schemes" that promise a free month unless the jeweller is reputable; prefer buying from brand stores with BIS registration.`]]
    ],
    advisor: [`Invest via **SGB (secondary) or gold ETF/FoF SIP**; cap gold at 5–10% of net worth.`, `For jewellery: insist on BIS **HUID**, verify on BIS Care, negotiate making charges, keep the invoice.`, `Avoid digital gold for large sums (not SEBI regulated).`, `Never buy gold with a loan/credit card.`],
    checklist: [`Decided investment vs jewellery.`, `HUID verified with the BIS Care app.`, `Invoice shows purity, net weight, stone weight, making charge.`, `Buy-back policy in writing.`, `Gold is 5–10% of net worth or less.`, `Storage and insurance arranged.`],
    verify: [`BIS — bis.gov.in; BIS Care app`, `RBI — SGB notifications`, `Income Tax — capital gains on gold`, `World Gold Council — gold.org`]
  });

  G({
    id: 'govt', module: 'govt', cat: 'Invest', read: '26 min read', title: 'Government savings schemes — PPF, EPF, NPS, SSY, SCSS, NSC, KVP, APY and more',
    summary: `What each scheme offers, its lock-in, limit, tax status and who should use it. Rates change every quarter — update them in Settings → Rates.`,
    calcs: ['ppf', 'nps', 'fd', 'rd'], tools: [['Scheme data', '#/tool/schemes']],
    sections: [
      [`Comparison`,
        ['tbl', ['Scheme', 'Rate (verify)', 'Lock-in', 'Limit', 'Tax', 'For'], [
          [`PPF`, `~7.1%`, `15 yrs (extend 5)`, `₹500–1.5 L/yr`, `EEE (old-regime 80C)`, `Safe long-term core`],
          [`EPF (salaried)`, `~8.25%`, `Till retirement/job gap`, `12% + 12%`, `Interest tax-free up to ₹2.5 L/yr contribution`, `Everyone employed`],
          [`VPF`, `same as EPF`, `Same`, `Up to 100% basic`, `Same as EPF`, `Safe high-rate debt`],
          [`NPS`, `Market-linked (E/C/G)`, `Till 60 (partial)`, `No limit`, `80CCD(1B) ₹50k extra; 80CCD(2) employer 14% new regime`, `Retirement`],
          [`SSY`, `~8.2%`, `21 yrs / 18 for education`, `₹250–1.5 L`, `EEE`, `Girl child`],
          [`SCSS`, `~8.2%`, `5 yrs (+3)`, `₹30 L`, `Interest taxable`, `60+`],
          [`NSC`, `~7.7%`, `5 yrs`, `None`, `Interest taxable; 80C on reinvested interest`, `Safe 5-yr`],
          [`KVP`, `~7.5%`, `115 months`, `None`, `Taxable`, `Doubling`],
          [`POMIS`, `~7.4%`, `5 yrs`, `₹9 L / ₹15 L joint`, `Taxable`, `Monthly income`],
          [`Post office TD / RD`, `6.9–7.5%`, `1–5 yrs`, `None`, `Taxable`, `FD alternative`],
          [`APY (Atal Pension)`, `Fixed pension ₹1–5k`, `Till 60`, `Age 18–40`, `Not tax-exempt now`, `Low-income workers`],
          [`SGB`, `2.5% + gold`, `8 yrs`, `4 kg`, `Maturity tax-free`, `Gold hedge`]]],
        ['tip', `Rates shown are the most recent I know and are **reset quarterly** by the Ministry of Finance. Use Settings → Rates / Data & Sources to update them each quarter.`]],
      [`PPF — in detail`,
        ['ul', `**Open** at a post office or bank with KYC; **deposit** between ₹500 and ₹1.5 L per year (max 12 deposits). Deposit by the **5th of the month** to earn that month's interest.`, `**Partial withdrawal** from year 7; **loan** between years 3–6; **premature closure** after 5 years for specified reasons (education, medical).`, `**Extension** in 5-year blocks with or without contributions.`, `**Minor's account:** guardian deposits count within the ₹1.5 L limit.`],
        ['ex', `₹1.5 L a year for 15 years at 7.1% → ≈ ₹40.7 L, all tax-free. Earning the same from an FD at 7% in the 30% slab gives ~₹30 L after tax.`]],
      [`EPF / VPF`,
        ['ul', `Employee 12% + employer 12% of basic (₹15,000 wage cap applies in some cases). Employer's share splits into EPF (3.67%) and EPS (8.33%, pension).`, `**UAN** is your lifetime ID; **link Aadhaar, bank, nominee** on the EPFO portal.`, `**Withdrawal:** full after 2 months unemployment (with rules); partial for home, medical, marriage, education; **transfer, don't withdraw**, when you change jobs.`, `**Pension (EPS)** needs 10 years' service; **Form 16-equivalent** = passbook.`, `**Tax:** interest on your contribution above ₹2.5 L a year is taxable; **withdrawal before 5 years of service** taxed (TDS 10%).`]],
      [`NPS`,
        ['ul', `Choose **Active** (E/C/G/A split, equity up to 75%) or **Auto** (life-cycle) choice. Tier I locked till 60 (withdraw 60% lump sum tax-free, **40% must buy annuity**); Tier II is flexible but no tax benefit.`, `**Costs:** very low fund charges; CRA charges small.`, `**Tax:** 80CCD(1) within 80C; **80CCD(1B) extra ₹50,000**; employer 10%/14% under 80CCD(2) even in the new regime.`, `Choose equity-heavy allocation when young; shift down near retirement.`]],
      [`SSY, SCSS, NSC, KVP, POMIS`,
        ['ul', `**SSY:** parent/guardian opens for a girl ≤ 10; 15 years of deposit; matures at 21; up to 50% withdrawal at 18 for education/marriage; EEE.`, `**SCSS:** 60+ (55+ for VRS/defence); quarterly interest; 5-year maturity, extendable 3 years; TDS applies above ₹1 lakh interest; best risk-free rate for seniors.`, `**NSC/KVP/TD:** fixed rate locked at purchase; interest taxable yearly (NSC) or at maturity (KVP).`, `**POMIS:** monthly payout; rate fixed for 5 years; max ₹9 L single, ₹15 L joint.`]],
      [`Which scheme for whom?`,
        ['tbl', ['Person', 'Use'], [[`Salaried, 25–40`, `EPF + VPF (if 8%+), PPF, NPS extra ₹50k, equity SIP`], [`Self-employed`, `PPF, NPS, SIP (no EPF)`], [`Parent of a girl`, `SSY + PPF + SIP`], [`Senior citizen`, `SCSS (₹30 L), POMIS, FD ladder, Bank Rates Book`], [`Low income, informal sector`, `PMJJBY, PMSBY, APY, PM-SYM`]]]]
    ],
    advisor: [`Make **EPF + PPF** the stable core of your debt allocation; they usually beat FDs after tax.`, `Use **NPS** only for the extra ₹50k and for employer contribution; it is mostly a tax play plus discipline.`, `Open **SSY** on the day a daughter is born (within 10 years).`, `Senior citizens: fill **SCSS** before FDs.`, `Update the rates in the app every April, July, October and January (quarterly reset).`],
    checklist: [`UAN linked (Aadhaar, bank, nominee).`, `PPF contribution scheduled before the 5th.`, `NPS allocation chosen (equity when young).`, `SSY/SCSS where eligible.`, `Scheme rates updated this quarter in the app.`, `All nominees updated.`],
    verify: [`Ministry of Finance / India Post — small savings notifications`, `EPFO — epfindia.gov.in`, `PFRDA — pfrda.org.in`, `Income Tax — 80C/80CCD`]
  });

  G({
    id: 'postoffice', module: 'postoffice', cat: 'Invest', read: '12 min read', title: 'Post Office schemes — accounts, deposits and how to use them',
    summary: `Savings account, RD, TD, MIS, SCSS, KVP, NSC, PPF, SSY, Mahila Samman: eligibility, limits, documents and India Post digital services.`,
    calcs: ['rd', 'fd', 'ppf'], tools: [['Scheme data', '#/tool/schemes']],
    sections: [
      [`Why consider the post office`, `Backed by the Government of India, present in villages and small towns, decent rates, and several unique products (SCSS, MIS, KVP). **IPPB** (India Post Payments Bank) gives digital banking.`],
      [`Products`,
        ['tbl', ['Product', 'Details'], [[`POSA – Savings`, `Interest ~4%; min ₹500; interest up to ₹10k (₹50k for seniors) is deductible 80TTA/TTB`], [`RD`, `5-year, ~6.7%; monthly from ₹100; quarterly compounding`], [`TD (1/2/3/5 years)`, `6.9–7.5%; 5-yr counts for 80C`], [`MIS`, `Monthly interest; ₹9 L (₹15 L joint)`], [`SCSS`, `60+; quarterly interest; ₹30 L`], [`NSC / KVP`, `Fixed rate; certificates`], [`PPF / SSY`, `Same as bank versions`], [`Mahila Samman Savings Certificate (ended Mar 2025)`, `Check for extension`]]]],
      [`Opening an account`,
        ['ol', `Visit the post office with **Aadhaar, PAN, photo, address proof**.`, `Fill the account form; choose **nominee** and operating mode (single/joint A or B).`, `Deposit cash/cheque; receive **passbook** and certificates. Register for **India Post Internet Banking** / IPPB app.`, `Keep certificates (NSC/KVP) safe — they are negotiable instruments; note the **certificate number**.`]],
      [`Points to remember`,
        ['ul', `Interest for **MIS/SCSS/TD** is taxable at slab; TDS applies above thresholds. Submit 15G/15H where eligible.`, `Mature accounts don't auto-renew; **renewal** needs an application within a window.`, `Keep a record of each account in the Records tool.`, `Beware of agents asking for money to "activate" schemes; deposit directly.`]]
    ],
    advisor: [`Use post-office products where they beat banks: **SCSS, MIS, KVP, SSY, PPF**.`, `For a senior couple: SCSS ₹30 L each + POMIS joint ₹15 L gives ≈ ₹60 L safely earning ~8%.`, `Open accounts in the post office nearest to home; set up net banking.`],
    checklist: [`KYC documents ready.`, `Nominee registered.`, `Passbook updated; digital access on.`, `Maturity dates in Reminders.`, `Limits respected (MIS/SCSS).`],
    verify: [`India Post — indiapost.gov.in`, `National Savings Institute — nsiindia.gov.in`]
  });

  G({
    id: 'crypto', module: 'crypto', cat: 'Invest', read: '14 min read', title: 'Crypto — what it is, the real risks, tax and safety',
    summary: `How Bitcoin and tokens work, India's tax rules (30% + 1% TDS), scams, custody, position sizing and what a sensible limit looks like.`,
    calcs: ['cryptoscen'],
    sections: [
      [`What it is`, `A crypto asset is a digital token on a blockchain. **Bitcoin** is scarce digital money; **Ethereum** is a platform for apps; thousands of other tokens are speculation. There are **no cash flows** — price comes only from what the next buyer pays. Unlike banks or shares, there is **no regulator-backed protection** in India.`],
      [`India's tax rules (verify)`,
        ['ul', `**30% flat** on gains from transfer of virtual digital assets; **no deduction** except cost; **no set-off** of losses against any other income.`, `**1% TDS** on each transfer above thresholds (₹10,000/₹50,000). Report on **Schedule VDA** in the ITR.`, `**4% cess**; gifts of crypto above ₹50,000 taxed in recipient's hands.`, `Crypto-to-crypto swaps are taxable events.`]],
      [`Risks`,
        ['ul', `**Price:** drawdowns of 70–85% have happened repeatedly (2018, 2022). Many tokens went to zero.`, `**Platform:** exchange collapses (FTX, WazirX hacks) freeze or lose customer funds.`, `**Custody:** lose your seed phrase = lose your money. No reset.`, `**Fraud:** rug pulls, fake airdrops, "guaranteed returns" staking, romance/pig-butchering scams, pump-and-dump groups.`, `**Regulatory:** rules can change quickly.`]],
      [`How to be safe if you still buy`,
        ['ol', `Only use platforms that are **registered with FIU-IND**, follow KYC and have proof-of-reserves.`, `Limit to **BTC/ETH**; ignore new tokens.`, `Enable 2FA (authenticator app), unique password, withdrawal whitelist.`, `For long-term holdings use a **hardware wallet**; write the seed phrase on paper (never in cloud/photo); keep two copies in separate places.`, `Buy via small SIPs; never borrow, never use leverage or futures.`, `Record every trade for tax.`]],
      [`Position sizing`,
        ['tbl', ['Portfolio', 'Max crypto'], [[`Conservative`, `0%`], [`Moderate`, `≤ 2%`], [`Aggressive, strong base`, `≤ 5%`]]],
        `Rule: invest only what you could lose entirely without changing your life.`]
    ],
    advisor: [`Treat crypto as a **lottery ticket**: cap at 0–5% of investable assets, only after emergency fund, insurance and retirement SIPs.`, `Use BTC/ETH only, through a registered Indian platform, with 2FA and small SIPs.`, `Never follow a tip, join a "signal" group or invest for a return promised by anyone.`, `Keep tax records; expect 30% + TDS.`],
    checklist: [`Core goals funded first.`, `Crypto ≤ 5% of investable assets.`, `Exchange is FIU-registered; 2FA on.`, `Seed phrase stored offline in two places.`, `No leverage or borrowing.`, `Trades recorded for Schedule VDA.`],
    verify: [`FIU-IND — fiuindia.gov.in`, `Income Tax — Schedule VDA; section 115BBH, 194S`, `RBI/SEBI investor-alert pages`]
  });
})();
