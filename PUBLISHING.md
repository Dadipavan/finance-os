# Publishing Finance OS (free) and keeping your data safe

## 1. Put the site online with GitHub Pages (free, no expiry)

1. Create a free GitHub account → **New repository** → name it (e.g. `finance-os`) → **Public**.
   (GitHub Pages on a *private* repository needs a paid plan. Public is fine: the repo holds only code — **no personal data**.)
2. Upload the *contents* of this folder (`index.html`, `css/`, `js/`, `README.md`, …). You may leave out `tests/` and `investment_and_business_guide.md`.
   **Never upload an export file** (`finance-os-data*.json`) — that is your personal data.
3. Repository → **Settings → Pages** → Source: *Deploy from a branch* → branch `main`, folder `/ (root)` → Save.
4. After a minute your site is at `https://<username>.github.io/<repo>/`.

Everyone who opens that address gets their own empty copy; data stays in *their* browser. Yours stays in yours (and your Drive).

> Browser data belongs to the exact web address. **Export a backup before you ever change the address**, then import it at the new one.

## 2. Turn on Google Drive auto-sync (free, your own Drive)

Do this on the published `https://…github.io` address (sync does not work from a double-clicked file).

1. <https://console.cloud.google.com> → create a project.
2. **APIs & Services → Library** → enable **Google Drive API**.
3. **OAuth consent screen** → *External* → app name + your email → add scope `…/auth/drive.appdata` → **Test users** → add your own Gmail.
4. **Credentials → Create credentials → OAuth client ID → Web application** → *Authorised JavaScript origins*: `https://<username>.github.io` (origin only, no `/repo`).
5. Copy the client ID → Finance OS → **Settings → Google Drive auto-sync** → paste → **Connect & sync**.

What is stored: one file `finance-os-data.json` plus `archive-YYYY-MM.json` (one copy per month) in a hidden app folder only this app can open. A typical user's file is well under 1 MB.
Once per browser session press **Sync now** (Google requires a click to sign in); after that, changes upload a few seconds after you make them.
On a new device: connect, then choose to load the Drive copy.

## 3. Lock it (only you can open it)

**Settings → Password lock & encryption.** Your data is stored encrypted (AES-256-GCM, key from your passphrase via PBKDF2-SHA256, 250,000 rounds) in the browser and in Drive, and the app asks for the passphrase on every open (optional idle auto-lock).
A forgotten passphrase cannot be recovered — keep a plain export somewhere safe too. Turning the lock on runs an encrypt-decrypt self-test first and aborts if it fails.

## 4. Habits that keep the history complete

- Once a month: **Month-End Close** (income received, expenses, balances → snapshot). Download the recurring calendar reminder there; a website cannot message you while it is closed, but the app also reminds you when you open it.
- Once a year after the Budget: **Data & Sources → Update tax rules** (the app nudges you).
- Keep two copies of your data: Drive sync *and* an occasional export on another device.
