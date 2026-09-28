"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  CircleHelp, FileStack, FileText, House, Keyboard, Layers, Library, Menu, Moon, ScrollText, Search, Spline, Sun, Timer, X,
} from "lucide-react";
import { allItems, exams, itemHref, itemLabel, sectionOf } from "@/lib/data";
import { useProgress } from "@/lib/progress";

export const nav = [
  { href: "/", label: "Index", icon: House, hint: "Home & progress" },
  { href: "/quick-review/", label: "Quick Review", icon: ScrollText, hint: "All rules on one page" },
  { href: "/long-test/", label: "Long Test", icon: FileText, hint: "25 items, solved" },
  { href: "/midterm/", label: "Midterm", icon: FileStack, hint: "42 items, solved" },
  { href: "/flashcards/", label: "Flashcards", icon: Layers, hint: "Flip & self-check" },
  { href: "/quiz/", label: "Quiz", icon: CircleHelp, hint: "Multiple choice drill" },
  { href: "/mock-exam/", label: "Mock Exam", icon: Timer, hint: "Timed practice" },
  { href: "/graph-lab/", label: "Graph Lab", icon: Spline, hint: "Play with the curves" },
  { href: "/papers/", label: "Papers", icon: Library, hint: "Original PDFs" },
];

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch { /* ignore */ }
    setDark(next);
  };
  return { dark, toggle };
}

function isActive(path: string, href: string) {
  if (href === "/") return path === "/";
  return path.startsWith(href.replace(/\/$/, ""));
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [help, setHelp] = useState(false);
  const { dark, toggle } = useTheme();
  const progress = useProgress();
  const mastered = Object.values(progress.status).filter((s) => s === "mastered").length;

  useEffect(() => setDrawer(false), [path]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement)?.tagName ?? "");
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((v) => !v); return; }
      if (typing) return;
      if (e.key === "/") { e.preventDefault(); setPalette(true); }
      else if (e.key === "?") setHelp((v) => !v);
      else if (e.key === "Escape") { setPalette(false); setHelp(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const Sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/" className="block px-6 pt-7 pb-6">
        <span className="display italic text-[2.35rem] text-red-deep block">Sagot ni Sam</span>
        <span className="eyebrow text-ink-faint">na gawa ni Sebastian</span>
      </Link>

      <button
        onClick={() => setPalette(true)}
        className="mx-4 mb-4 flex items-center gap-2 rounded-lg border border-line bg-paper-raised px-3 py-2 text-sm text-ink-faint hover:border-line-strong hover:text-ink-muted transition"
      >
        <Search size={15} /> Search items…
        <kbd className="ml-auto font-mono text-[10px] rounded border border-line px-1.5 py-0.5">Ctrl K</kbd>
      </button>

      <nav className="flex-1 overflow-y-auto px-3">
        {nav.map(({ href, label, icon: Icon, hint }, i) => {
          const active = isActive(path, href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-[0.94rem] transition-colors",
                active ? "bg-rose text-red-deep" : "text-ink-muted hover:bg-paper-sunken hover:text-ink",
                i === 2 && "mt-4", i === 4 && "mt-4", i === 8 && "mt-4",
              )}
            >
              <Icon size={17} className={clsx(active ? "text-red" : "text-ink-faint group-hover:text-ink-muted")} />
              <span className="flex-1">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line px-6 py-5">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-ink-muted">Mastered</span>
          <span className="font-mono tabular-nums text-ink">{mastered}<span className="text-ink-faint">/{allItems.length}</span></span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-line overflow-hidden">
          <div className="h-full bg-red transition-[width] duration-700" style={{ width: `${(mastered / allItems.length) * 100}%` }} />
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={toggle} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-line px-2 py-1.5 text-xs text-ink-muted hover:text-ink hover:border-line-strong transition" aria-label="Toggle theme">
            {dark ? <Sun size={14} /> : <Moon size={14} />} {dark ? "Light" : "Dark"}
          </button>
          <button onClick={() => setHelp(true)} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-line px-2 py-1.5 text-xs text-ink-muted hover:text-ink hover:border-line-strong transition">
            <Keyboard size={14} /> Keys
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-paper lg:block">{Sidebar}</aside>

      {/* mobile top bar */}
      <header className="topbar sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-paper/90 backdrop-blur px-4 py-3 lg:hidden">
        <button onClick={() => setDrawer(true)} aria-label="Open menu" className="p-1.5 -ml-1.5 text-ink"><Menu size={20} /></button>
        <Link href="/" className="display italic text-2xl text-red-deep">Sagot ni Sam</Link>
        <span className="flex-1" />
        <button onClick={() => setPalette(true)} aria-label="Search" className="p-1.5 text-ink-muted"><Search size={19} /></button>
        <button onClick={toggle} aria-label="Toggle theme" className="p-1.5 text-ink-muted">{dark ? <Sun size={19} /> : <Moon size={19} />}</button>
      </header>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawer(false)} />
          <div className="rise absolute inset-y-0 left-0 w-72 bg-paper border-r border-line">
            <button onClick={() => setDrawer(false)} className="absolute right-3 top-3 p-2 text-ink-muted" aria-label="Close menu"><X size={18} /></button>
            {Sidebar}
          </div>
        </div>
      )}

      <main className="lg:pl-64">{children}</main>

      {palette && <Palette onClose={() => setPalette(false)} />}
      {help && <Help onClose={() => setHelp(false)} />}
    </div>
  );
}

/* ───────── Command palette ───────── */
function Palette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const pages = nav.map((n) => ({ key: n.href, href: n.href, label: n.label, sub: n.hint, kind: "Page" as const }));
    const items = allItems.map((it) => ({
      key: it.id,
      href: itemHref(it),
      label: `${itemLabel(it)} · ${it.title}`,
      sub: `${sectionOf(it).title}${it.method ? ` · ${it.method}` : ""} — ${it.short}`,
      kind: exams[it.exam].name,
    }));
    const all = [...pages, ...items];
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return all.slice(0, 12);
    return all
      .filter((r) => {
        const hay = `${r.label} ${r.sub} ${r.kind}`.toLowerCase().replace(/#/g, "# ");
        return terms.every((t) => hay.includes(t.replace(/^#/, "")));
      })
      .slice(0, 30);
  }, [q]);

  const go = useCallback((href: string) => {
    onClose();
    router.push(href);
    const hash = href.split("#")[1];
    if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" }), 350);
  }, [onClose, router]);

  useEffect(() => setSel(0), [q]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-i="${sel}"]`)?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/35 p-4 pt-[12vh]" onClick={onClose}>
      <div className="rise w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={17} className="text-ink-faint" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
              if (e.key === "Enter" && results[sel]) go(results[sel].href);
              if (e.key === "Escape") onClose();
            }}
            placeholder='Try "bernoulli", "ME 39", "circles", "degree"…'
            className="w-full bg-transparent py-4 text-ink outline-none placeholder:text-ink-faint"
          />
        </div>
        <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 && <p className="px-3 py-6 text-center text-sm text-ink-faint">Nothing found. Try another word.</p>}
          {results.map((r, i) => (
            <button
              key={r.key}
              data-i={i}
              onMouseEnter={() => setSel(i)}
              onClick={() => go(r.href)}
              className={clsx("flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left", i === sel ? "bg-rose" : "")}
            >
              <span className="eyebrow mt-0.5 w-16 shrink-0 !text-[10px] text-ink-faint">{r.kind === "Page" ? "Page" : r.kind === "Long Test" ? "LT" : "ME"}</span>
              <span className="min-w-0">
                <span className={clsx("block truncate text-sm", i === sel ? "text-red-deep" : "text-ink")}>{r.label}</span>
                <span className="block truncate text-xs text-ink-faint">{r.sub}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-4 border-t border-line px-4 py-2 text-[11px] text-ink-faint font-mono">
          <span>↑↓ move</span><span>↵ open</span><span>esc close</span>
        </div>
      </div>
    </div>
  );
}

function Help({ onClose }: { onClose: () => void }) {
  const rows: [string, string][] = [
    ["Ctrl K  or  /", "Search every item and page"],
    ["?", "Show / hide this help"],
    ["Esc", "Close pop-ups"],
    ["← →", "Previous / next item (Focus mode, Flashcards)"],
    ["Space", "Flip a flashcard"],
    ["1 / 2", "Flashcards: “Again” / “Got it”"],
    ["A B C D", "Quiz: choose an answer"],
  ];
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/35 p-4" onClick={onClose}>
      <div className="rise w-full max-w-md rounded-2xl border border-line bg-paper-raised p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="display text-3xl text-red-deep">Keyboard shortcuts</h2>
        <dl className="mt-4 divide-y divide-line">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 py-2.5 text-sm">
              <dt className="font-mono text-xs text-red">{k}</dt>
              <dd className="text-ink-muted text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
