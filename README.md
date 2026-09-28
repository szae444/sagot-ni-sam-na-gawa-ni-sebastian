# Sagot ni Sam na gawa ni Sebastian

**Live site:** https://szae444.github.io/sagot-ni-sam-na-gawa-ni-sebastian/


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

## Update the live site (GitHub Pages)
Run in Git Bash from this folder after changing anything:

```bash
MSYS_NO_PATHCONV=1 BASE_PATH=/sagot-ni-sam-na-gawa-ni-sebastian npm run build
touch out/.nojekyll
cd out && git init -q -b gh-pages && git add -A && git commit -qm "Deploy" \
  && git push -f https://github.com/szae444/sagot-ni-sam-na-gawa-ni-sebastian.git gh-pages
cd .. && rm -rf out/.git && npm run build   # rebuild the local (no base path) copy
```
