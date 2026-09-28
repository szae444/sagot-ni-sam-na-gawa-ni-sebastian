# Sagot ni Sam na gawa ni Sebastian

Interactive reviewer for **CEMAT104 – Differential Equations** (Long Test + Midterm, AY 2026–2027, 1st term).

## Open it
- **Easiest:** double-click `Buksan ang Sagot ni Sam.bat`. It opens http://localhost:3000 in your browser.
- Or in a terminal: `npm run serve`

## Edit it
- `npm run dev`: live-reload dev server
- `npm run build`: rebuilds the static site into `out/`
- Content lives in `src/lib/data/long-test.ts` and `src/lib/data/midterm.ts`
  (math is written as `$inline$` / `$$display$$` LaTeX).

## Put it online (optional)
`out/` is a plain static site. Upload it to Firebase Hosting, Netlify, Vercel or GitHub Pages.

## Stack
Next.js 16 (static export) · React 19 · TypeScript · Tailwind CSS v4 · KaTeX · lucide icons.
Progress, bookmarks and notes are saved in the browser (localStorage).
