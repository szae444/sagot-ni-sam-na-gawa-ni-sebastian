"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Eye, EyeOff, FileDown, LayoutList, Maximize2, Printer } from "lucide-react";
import type { ExamId, Item } from "@/lib/types";
import { exams, itemsByExam, sections } from "@/lib/data";
import { useProgress } from "@/lib/progress";
import { ItemCard } from "./item-card";

type Filter = "all" | "todo" | "review" | "mastered" | "bookmarked";

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "todo", label: "Not yet" },
  { key: "review", label: "To review" },
  { key: "mastered", label: "Got it" },
  { key: "bookmarked", label: "Bookmarked" },
];

export function ExamView({ exam }: { exam: ExamId }) {
  const meta = exams[exam];
  const items = itemsByExam(exam);
  const secs = sections.filter((s) => s.exam === exam);
  const p = useProgress();

  const [filter, setFilter] = useState<Filter>("all");
  const [sec, setSec] = useState<string | null>(null);
  const [revealAll, setRevealAll] = useState(false);
  const [focus, setFocus] = useState(false);
  const [idx, setIdx] = useState(0);

  const pass = (i: Item) => {
    if (sec && i.section !== sec) return false;
    const s = p.status[i.id];
    switch (filter) {
      case "todo": return !s;
      case "review": return s === "review";
      case "mastered": return s === "mastered";
      case "bookmarked": return !!p.bookmarks[i.id];
      default: return true;
    }
  };
  const visible = useMemo(() => items.filter(pass), [items, filter, sec, p]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (idx >= visible.length) setIdx(Math.max(0, visible.length - 1)); }, [visible.length, idx]);

  useEffect(() => {
    if (!focus) return;
    const onKey = (e: KeyboardEvent) => {
      if (/INPUT|TEXTAREA/.test((e.target as HTMLElement).tagName)) return;
      if (e.key === "ArrowRight") setIdx((i) => Math.min(i + 1, visible.length - 1));
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focus, visible.length]);

  const mastered = items.filter((i) => p.status[i.id] === "mastered").length;
  const dot = (i: Item) =>
    p.status[i.id] === "mastered" ? "bg-sage text-paper border-sage" :
    p.status[i.id] === "review" ? "bg-red text-paper border-red" :
    "border-line-strong text-ink-muted hover:border-red hover:text-red";

  const current = visible[idx];

  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      {/* heading */}
      <header className="grid gap-6 border-b border-line pt-10 pb-8 lg:grid-cols-12 lg:pt-14">
        <div className="lg:col-span-8">
          <p className="eyebrow text-red">CEMAT104 · Complete solutions</p>
          <h1 className="display mt-3 text-6xl text-ink sm:text-7xl">{meta.name}</h1>
          <p className="mt-3 max-w-xl text-ink-muted leading-relaxed">{meta.blurb} Try each item yourself first, then reveal one step at a time.</p>
        </div>
        <div className="flex flex-col justify-end gap-3 lg:col-span-4 lg:items-end">
          <p className="display text-5xl tabular-nums text-ink">{mastered}<span className="text-2xl text-ink-faint">/{items.length} got it</span></p>
          <div className="flex gap-2">
            <a href={meta.paper} target="_blank" className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-1.5 text-sm text-ink-muted hover:border-red hover:text-red transition"><FileDown size={15} /> Question paper</a>
            <button onClick={() => { setRevealAll(true); setTimeout(() => window.print(), 300); }} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-1.5 text-sm text-ink-muted hover:border-red hover:text-red transition"><Printer size={15} /> Print</button>
          </div>
        </div>
      </header>

      {/* toolbar */}
      <div className="no-print sticky top-[57px] lg:top-0 z-20 -mx-5 flex flex-wrap items-center gap-2 border-b border-line bg-paper/92 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex rounded-full border border-line p-0.5">
          <button onClick={() => setFocus(false)} className={clsx("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition", !focus ? "bg-ink text-paper" : "text-ink-muted hover:text-ink")}><LayoutList size={14} /> List</button>
          <button onClick={() => { setFocus(true); setIdx(0); window.scrollTo({ top: 0 }); }} className={clsx("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition", focus ? "bg-ink text-paper" : "text-ink-muted hover:text-ink")}><Maximize2 size={14} /> Focus</button>
        </div>
        <button onClick={() => setRevealAll((v) => !v)} className={clsx("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition", revealAll ? "border-red bg-rose text-red-deep" : "border-line text-ink-muted hover:text-ink")}>
          {revealAll ? <Eye size={14} /> : <EyeOff size={14} />} {revealAll ? "Answers open" : "Try-first mode"}
        </button>
        <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
        <div className="flex flex-wrap gap-1">
          {filters.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={clsx("rounded-full px-2.5 py-1 text-xs transition", filter === f.key ? "bg-red text-paper" : "text-ink-muted hover:bg-paper-sunken hover:text-ink")}>{f.label}</button>
          ))}
        </div>
        <span className="flex-1" />
        <div className="flex gap-1">
          <button onClick={() => setSec(null)} className={clsx("rounded-md px-2 py-1 font-mono text-xs transition", !sec ? "bg-ink text-paper" : "text-ink-muted hover:text-ink")}>All</button>
          {secs.map((s) => (
            <button key={s.letter} title={s.title} onClick={() => setSec(sec === s.letter ? null : s.letter)} className={clsx("rounded-md px-2 py-1 font-mono text-xs transition", sec === s.letter ? "bg-ink text-paper" : "text-ink-muted hover:text-ink")}>{s.letter}</button>
          ))}
        </div>
      </div>

      {visible.length === 0 && (
        <p className="py-24 text-center text-ink-muted">No items match this filter yet. <button className="text-red underline" onClick={() => { setFilter("all"); setSec(null); }}>Show all</button></p>
      )}

      {focus && current ? (
        <div className="mx-auto max-w-3xl py-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="font-mono text-sm text-ink-muted tabular-nums">{idx + 1} / {visible.length}</span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-line"><div className="h-full bg-red transition-[width] duration-500" style={{ width: `${((idx + 1) / visible.length) * 100}%` }} /></div>
          </div>
          <ItemCard key={current.id} item={current} revealAll={revealAll} />
          <div className="mt-5 flex justify-between">
            <button disabled={idx === 0} onClick={() => setIdx(idx - 1)} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-sm text-ink disabled:opacity-30 hover:border-red hover:text-red transition"><ArrowLeft size={15} /> Previous</button>
            <span className="hidden sm:block self-center text-xs text-ink-faint">Use ← → keys</span>
            <button disabled={idx >= visible.length - 1} onClick={() => setIdx(idx + 1)} className="inline-flex items-center gap-1.5 rounded-full bg-red px-4 py-2 text-sm text-paper disabled:opacity-30 hover:bg-red-deep transition">Next <ArrowRight size={15} /></button>
          </div>
        </div>
      ) : (
        <div className="grid gap-10 py-10 lg:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(0,1fr)]">
          {/* index */}
          <nav className="no-print hidden lg:block">
            <div className="sticky top-20 space-y-5">
              {secs.map((s) => {
                const list = items.filter((i) => i.section === s.letter);
                return (
                  <div key={s.letter}>
                    <a href={`#sec-${s.letter}`} className="eyebrow block text-ink-faint hover:text-red">{s.letter} · {s.title}</a>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {list.map((i) => (
                        <a key={i.id} href={`#${i.id}`} title={i.title} className={clsx("grid h-7 min-w-7 place-items-center rounded-full border px-1.5 font-mono text-[11px] transition", dot(i))}>
                          {i.no.split("–")[0]}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </nav>

          <div className="min-w-0 space-y-14">
            {secs.map((s) => {
              const list = visible.filter((i) => i.section === s.letter);
              if (!list.length) return null;
              return (
                <section key={s.letter} id={`sec-${s.letter}`} className="scroll-mt-20">
                  <div className="mb-6 flex items-end gap-5 border-b border-line pb-4">
                    <span className="display text-7xl leading-[0.8] text-red/80">{s.letter}</span>
                    <div>
                      <h2 className="display text-3xl text-ink sm:text-4xl">{s.title}</h2>
                      <p className="text-sm text-ink-muted">{s.blurb}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {list.map((i) => <ItemCard key={i.id} item={i} revealAll={revealAll} />)}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
