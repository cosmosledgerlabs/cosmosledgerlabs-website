# COSMOS Ledger Labs — Website

Workflow Infrastructure for Digital Asset Operations  
Built on Solana | Toronto, Canada

---

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: CSS Modules + Global CSS
- **Fonts**: Orbitron + Exo 2 (Google Fonts)
- **Hosting**: Vercel

---

## Project Structure

```
cosmos-ledger-labs/
├── pages/
│   ├── _app.js          ← Global app wrapper
│   └── index.js         ← Main page (all 11 sections)
├── components/
│   ├── Nav.js           ← Navigation bar
│   ├── Nav.module.css
│   ├── Hero.js          ← Section 1: Hero with aurora rings
│   ├── Hero.module.css
│   ├── Architecture.js  ← Section 4: Platform architecture diagram
│   ├── Architecture.module.css
│   ├── Sections.js      ← Sections 2,3,5,6,7,8,9,10,11
│   ├── Sections.module.css
│   ├── Footer.js
│   └── Footer.module.css
├── styles/
│   └── globals.css      ← Global styles, grid bg, scan line
├── public/
│   └── favicon.ico      ← Add your logo here
├── package.json
├── next.config.js
└── README.md
```

---

## How to Add the One Pager PDF

1. Name the file: `onepager.pdf`
2. Place it in the `/public/` folder
3. Open `components/Sections.js`
4. Find this line: `<a href="#" className={styles.btnDl}>`
5. Change `href="#"` to `href="/onepager.pdf"`
6. Commit and push — Vercel will auto-update

---

## Deploy to Vercel

1. Push this folder to GitHub repository: `cosmosledgerlabs-website`
2. Log in to vercel.com → Add New Project → Import from GitHub
3. Framework: Next.js (auto-detected)
4. Click Deploy
5. Add domain: cosmosledgerlabs.com in Vercel Settings → Domains

---

## Contact

info@cosmosledgerlabs.com  
Toronto, Canada
