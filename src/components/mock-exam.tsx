"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { AlarmClock, Check, Flag, X } from "lucide-react";
import { exams, itemHref, itemsByExam, sectionOf } from "@/lib/data";
import { setStatus, update, useProgress } from "@/lib/progress";
import { shuffle } from "@/lib/quiz";
import type { ExamId, Item } from "@/lib/types";
import { Rich } from "./rich";

type Phase = "setup" | "exam" | "check" | "done";

export function MockExam() {
  const p = useProgress();
  const [exam, setExam] = useState<ExamId>("lt");
  const [size, setSize] = useState<number | "full">(10);
  const [perItem, setPerItem] = useState(3);
  const [phase, setPhase] = useState<Phase>("setup");
  const [items, setItems] = useState<Item[]>([]);
  const [left, setLeft] = useState(0);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [grades, setGrades] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const start = () => {
    const pool = itemsByExam(exam).filter((i) => i.kind !== "terms" || size === "full");
    const chosen = size === "full" ? itemsByExam(exam) : shuffle(pool).slice(0, size);
    // keep paper order for realism
    const ordered = itemsByExam(exam).filter((i) => chosen.includes(i));
    setItems(ordered);
    setLeft(ordered.length * perItem * 60);
    setFlags({}); setGrades({}); setOpen({});
    setPhase("exam");
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    if (phase !== "exam") return;
    const t = setInterval(() => setLeft((s) => {
      if (s <= 1) { clearInterval(t); setPhase("check"); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const graded = Object.keys(grades).length;
  const score = Object.values(grades).filter(Boolean).length;

  const finish = () => {
    items.forEach((i) => { if (grades[i.id] === false) setStatus(i.id, "review"); });
    update((s) => ({
      ...s,
      mockHistory: [...s.mockHistory, { date: new Date().toLocaleDateString(), exam: exams[exam].short, score, total: items.length }].slice(-20),
    }));
    setPhase("done");
    window.scrollTo({ top: 0 });
  };

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const history = useMemo(() => [...p.mockHistory].reverse().slice(0, 5), [p.mockHistory]);

  if (phase === "setup") {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="eyebrow text-red">Exam simulation</p>
            <h1 className="display mt-3 text-6xl text-ink sm:text-7xl">Mock Exam</h1>
            <p className="mt-4 max-w-md text-ink-muted leading-relaxed">
              Same rules as the real exam: no calculator, no notes, no peeking. Get bond paper and a pen, solve under time pressure, then check each item and grade yourself honestly. Items you miss are marked “review” automatically.
            </p>
            {history.length > 0 && (
              <div className="mt-8">
                <p className="eyebrow text-ink-faint">Recent attempts</p>
                <ul className="mt-2 divide-y divide-line border-y border-line text-sm">
                  {history.map((h, k) => (
                    <li key={k} className="flex justify-between py-2"><span className="text-ink-muted">{h.date} · {h.exam}</span><span className="font-mono text-ink">{h.score}/{h.total}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="lg:col-span-6 rounded-3xl border border-line bg-paper-raised p-7 space-y-6">
            <fieldset>
              <legend className="eyebrow text-ink-faint mb-2">Exam</legend>
              <div className="flex gap-1.5">
                {(["lt", "me"] as ExamId[]).map((e) => (
                  <button key={e} onClick={() => setExam(e)} className={clsx("rounded-full px-3.5 py-1.5 text-sm transition", exam === e ? "bg-ink text-paper" : "border border-line text-ink-muted hover:text-ink")}>{exams[e].name}</button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="eyebrow text-ink-faint mb-2">Items</legend>
              <div className="flex gap-1.5">
                {([5, 10, 15, "full"] as const).map((n) => (
                  <button key={n} onClick={() => setSize(n)} className={clsx("rounded-full px-3.5 py-1.5 text-sm font-mono transition", size === n ? "bg-red text-paper" : "border border-line text-ink-muted hover:text-ink")}>{n === "full" ? "Full paper" : n}</button>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className="flex justify-between text-sm"><span className="eyebrow text-ink-faint">Minutes per item</span><span className="font-mono text-ink">{perItem}</span></span>
              <input type="range" min={1} max={8} value={perItem} onChange={(e) => setPerItem(+e.target.value)} className="mt-2 w-full" />
            </label>
            <button onClick={start} className="w-full rounded-full bg-red px-6 py-3 font-medium text-paper transition hover:bg-red-deep">Begin. Good luck, Sam!</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    const pct = Math.round((score / items.length) * 100);
    return (
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <p className="eyebrow text-red">Mock exam · {exams[exam].name}</p>
        <h1 className="display mt-3 text-[6rem] leading-none text-ink">{score}<span className="text-5xl text-ink-faint">/{items.length}</span></h1>
        <p className="mt-2 text-lg text-ink-muted">{pct}%. {pct >= 80 ? "Pasado! Keep it up." : "The missed items are now marked “review” so you can find them quickly."}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => setPhase("setup")} className="rounded-full bg-red px-5 py-2.5 text-sm font-medium text-paper hover:bg-red-deep">Another mock exam</button>
          <Link href={`/${exams[exam].slug}/`} className="rounded-full border border-line-strong px-5 py-2.5 text-sm text-ink hover:border-red hover:text-red">Go to {exams[exam].name} solutions</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
      <div className="sticky top-[57px] lg:top-0 z-20 -mx-5 flex items-center gap-4 border-b border-line bg-paper/92 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        {phase === "exam" ? (
          <>
            <span className={clsx("inline-flex items-center gap-2 font-mono text-2xl tabular-nums", left < 60 ? "text-red" : "text-ink")}><AlarmClock size={20} /> {mm}:{ss}</span>
            <span className="text-sm text-ink-muted">{items.length} items · answer on paper</span>
            <span className="flex-1" />
            <button onClick={() => setPhase("check")} className="rounded-full bg-red px-4 py-2 text-sm font-medium text-paper hover:bg-red-deep">Finish & check</button>
          </>
        ) : (
          <>
            <span className="text-sm text-ink-muted">Checking: <b className="text-ink">{graded}/{items.length}</b> graded · <b className="text-sage">{score} correct</b></span>
            <span className="flex-1" />
            <button disabled={graded < items.length} onClick={finish} className="rounded-full bg-red px-4 py-2 text-sm font-medium text-paper hover:bg-red-deep disabled:opacity-40">See score</button>
          </>
        )}
      </div>

      <header className="pt-8 pb-4">
        <p className="eyebrow text-red">{exams[exam].name} · Mock</p>
        <h1 className="display mt-2 text-5xl text-ink">{phase === "exam" ? "Solve on paper." : "Now check yourself."}</h1>
        {phase === "check" && <p className="mt-2 text-ink-muted">Open each answer, compare it with your work, then mark it.</p>}
      </header>

      <ol className="space-y-4">
        {items.map((it) => (
          <li key={it.id} className={clsx("rounded-2xl border bg-paper-raised p-5",
            grades[it.id] === true ? "border-sage/50" : grades[it.id] === false ? "border-red/50" : "border-line")}>
            <div className="flex items-start gap-4">
              <span className="display text-4xl leading-none text-red tabular-nums min-w-[2ch]">{it.no}</span>
              <div className="min-w-0 flex-1">
                <p className="eyebrow text-ink-faint">{sectionOf(it).title}</p>
                <div className="mt-2 text-ink"><Rich text={it.prompt} /></div>
              </div>
              {phase === "exam" && (
                <button onClick={() => setFlags((f) => ({ ...f, [it.id]: !f[it.id] }))} className={clsx("p-1.5", flags[it.id] ? "text-red" : "text-ink-faint hover:text-ink")} aria-label="Flag"><Flag size={16} fill={flags[it.id] ? "currentColor" : "none"} /></button>
              )}
            </div>
            {phase === "check" && (
              <div className="mt-4 border-t border-line pt-4">
                {open[it.id] ? (
                  <div className="rise rounded-xl bg-blush px-4 py-3"><Rich text={it.answer} /></div>
                ) : (
                  <button onClick={() => setOpen((o) => ({ ...o, [it.id]: true }))} className="text-sm text-red underline underline-offset-4">Show answer</button>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button onClick={() => setGrades((g) => ({ ...g, [it.id]: true }))} className={clsx("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm", grades[it.id] === true ? "bg-sage text-paper" : "bg-sage-soft text-sage")}><Check size={14} /> I got it</button>
                  <button onClick={() => setGrades((g) => ({ ...g, [it.id]: false }))} className={clsx("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm", grades[it.id] === false ? "bg-red text-paper" : "bg-rose text-red-ink")}><X size={14} /> I missed it</button>
                  {flags[it.id] && <span className="text-xs text-red">flagged during the exam</span>}
                  <span className="flex-1" />
                  <Link href={itemHref(it)} target="_blank" className="text-sm text-ink-muted hover:text-red">Solution ↗</Link>
                </div>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
