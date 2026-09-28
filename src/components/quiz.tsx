"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { ArrowRight, Check, RotateCcw, Trophy, X } from "lucide-react";
import { buildQuiz, type Question } from "@/lib/quiz";
import { exams, itemHref, itemLabel, sectionOf } from "@/lib/data";
import { update, useProgress } from "@/lib/progress";
import type { ExamId } from "@/lib/types";
import { Rich } from "./rich";

const L = ["A", "B", "C", "D"];

export function Quiz() {
  const p = useProgress();
  const [exam, setExam] = useState<ExamId | "both">("both");
  const [count, setCount] = useState(10);
  const [withMethod, setWithMethod] = useState(true);
  const [qs, setQs] = useState<Question[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const start = (list?: Question[]) => {
    setQs(list ?? buildQuiz(exam, count, withMethod));
    setI(0); setPicked(null); setAnswers([]);
  };

  const q = qs?.[i];
  const done = qs && i >= qs.length;

  const choose = (c: number) => {
    if (!q || picked !== null) return;
    setPicked(c);
    setAnswers((a) => [...a, c === q.correct]);
  };
  const next = () => { setPicked(null); setI((n) => n + 1); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!q) return;
      const k = e.key.toUpperCase();
      const idx = L.indexOf(k);
      if (idx >= 0 && idx < q.choices.length) choose(idx);
      if (e.key === "Enter" && picked !== null) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    if (done && qs) {
      const pct = Math.round((answers.filter(Boolean).length / qs.length) * 100);
      update((s) => ({ ...s, quizBest: Math.max(s.quizBest ?? 0, pct) }));
    }
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── setup screen ──
  if (!qs) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="eyebrow text-red">Multiple choice</p>
            <h1 className="display mt-3 text-6xl text-ink sm:text-7xl">Quiz</h1>
            <p className="mt-4 max-w-md text-ink-muted leading-relaxed">
              Questions are generated from the actual exam items: order &amp; degree, linear or not, is it a solution, which DE, and a <b className="text-ink">“Which method?”</b> drill for the solving part. Wrong choices are real answers from other items, so you can't guess from the look of them.
            </p>
            {p.quizBest !== null && <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-soft px-4 py-2 text-sm text-gold"><Trophy size={15} /> Best score so far: {p.quizBest}%</p>}
          </div>
          <div className="lg:col-span-6 rounded-3xl border border-line bg-paper-raised p-7">
            <div className="space-y-6">
              <fieldset>
                <legend className="eyebrow text-ink-faint mb-2">From</legend>
                <div className="flex gap-1.5">
                  {(["both", "lt", "me"] as const).map((e) => (
                    <button key={e} onClick={() => setExam(e)} className={clsx("rounded-full px-3.5 py-1.5 text-sm transition", exam === e ? "bg-ink text-paper" : "border border-line text-ink-muted hover:text-ink")}>{e === "both" ? "Both exams" : exams[e].name}</button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="eyebrow text-ink-faint mb-2">Questions</legend>
                <div className="flex gap-1.5">
                  {[10, 20, 40].map((n) => (
                    <button key={n} onClick={() => setCount(n)} className={clsx("rounded-full px-3.5 py-1.5 text-sm font-mono transition", count === n ? "bg-red text-paper" : "border border-line text-ink-muted hover:text-ink")}>{n}</button>
                  ))}
                </div>
              </fieldset>
              <label className="flex items-center gap-2 text-sm text-ink-muted">
                <input type="checkbox" checked={withMethod} onChange={(e) => setWithMethod(e.target.checked)} className="size-4 accent-[var(--red)]" />
                Include “Which method?” questions
              </label>
              <button onClick={() => start()} className="w-full rounded-full bg-red px-6 py-3 font-medium text-paper transition hover:bg-red-deep active:scale-[0.99]">Start quiz</button>
              <p className="text-center text-xs text-ink-faint">Keys: A–D to answer, Enter for next</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── results ──
  if (done) {
    const score = answers.filter(Boolean).length;
    const pct = Math.round((score / qs.length) * 100);
    const missed = qs.filter((_, k) => !answers[k]);
    return (
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <p className="eyebrow text-red">Result</p>
        <h1 className="display mt-3 text-[6rem] leading-none text-ink">{pct}<span className="text-5xl text-ink-faint">%</span></h1>
        <p className="mt-2 text-lg text-ink-muted">{score} of {qs.length} correct. {pct >= 90 ? "Ang galing! Ready ka na." : pct >= 70 ? "Solid. Review the misses below." : "Okay lang. Open each missed item and walk through the steps."}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => start()} className="inline-flex items-center gap-1.5 rounded-full bg-red px-5 py-2.5 text-sm font-medium text-paper hover:bg-red-deep"><RotateCcw size={15} /> New quiz</button>
          {missed.length > 0 && <button onClick={() => start(missed)} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-5 py-2.5 text-sm text-ink hover:border-red hover:text-red">Retry the {missed.length} I missed</button>}
          <button onClick={() => setQs(null)} className="rounded-full px-4 py-2.5 text-sm text-ink-muted hover:text-ink">Change settings</button>
        </div>
        {missed.length > 0 && (
          <div className="mt-12">
            <h2 className="display text-4xl text-ink">Review these</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {missed.map((m) => (
                <li key={m.key} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4">
                  <span className="font-mono text-sm text-red w-16">{itemLabel(m.item)}</span>
                  <span className="flex-1 min-w-[12rem] text-ink">{m.ask} <span className="text-ink-muted">→ {m.choices[m.correct]}</span></span>
                  <Link href={itemHref(m.item)} className="text-sm text-ink-muted underline underline-offset-4 hover:text-red">Solution</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // ── question ──
  const right = answers.filter(Boolean).length;
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <div className="flex items-center gap-4">
        <span className="font-mono text-sm tabular-nums text-ink-muted">{i + 1}/{qs.length}</span>
        <div className="flex flex-1 gap-1">
          {qs.map((_, k) => (
            <span key={k} className={clsx("h-1.5 flex-1 rounded-full", k < answers.length ? (answers[k] ? "bg-sage" : "bg-red") : k === i ? "bg-ink-faint" : "bg-line")} />
          ))}
        </div>
        <span className="font-mono text-sm text-sage">{right} ✓</span>
      </div>

      <div key={q!.key + i} className="rise mt-8">
        <p className="eyebrow text-red">{itemLabel(q!.item)} · {q!.type === "method" ? "Which method?" : sectionOf(q!.item).title}</p>
        <h2 className="display mt-2 text-4xl text-ink">{q!.ask}</h2>
        <div className="mt-5 rounded-2xl border border-line bg-paper-raised px-5 py-4 text-lg text-ink"><Rich text={q!.item.prompt} /></div>

        <div className="mt-6 grid gap-2.5">
          {q!.choices.map((c, k) => {
            const state = picked === null ? "idle" : k === q!.correct ? "right" : k === picked ? "wrong" : "dim";
            return (
              <button
                key={k}
                onClick={() => choose(k)}
                disabled={picked !== null}
                className={clsx(
                  "group flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition",
                  state === "idle" && "border-line bg-paper-raised hover:border-red hover:bg-blush",
                  state === "right" && "border-sage bg-sage-soft",
                  state === "wrong" && "border-red bg-rose",
                  state === "dim" && "border-line opacity-50",
                )}
              >
                <span className={clsx("grid size-8 shrink-0 place-items-center rounded-full border font-mono text-sm",
                  state === "right" ? "border-sage bg-sage text-paper" : state === "wrong" ? "border-red bg-red text-paper" : "border-line-strong text-ink-muted group-hover:border-red group-hover:text-red")}>
                  {state === "right" ? <Check size={15} /> : state === "wrong" ? <X size={15} /> : L[k]}
                </span>
                <span className="text-ink">{c}</span>
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div className="rise mt-6 rounded-2xl border-l-4 border-red bg-blush px-5 py-4">
            <p className="eyebrow text-red mb-1">{picked === q!.correct ? "Correct!" : "Not quite. Here's the answer"}</p>
            <div className="text-ink leading-relaxed"><Rich text={q!.type === "method" ? `**${q!.item.method}**. ${q!.item.steps[0] ?? ""}` : q!.item.answer} /></div>
            {q!.item.tip && <p className="mt-3 text-sm text-ink-muted"><Rich text={q!.item.tip} /></p>}
            <div className="mt-4 flex items-center justify-between gap-3">
              <Link href={itemHref(q!.item)} target="_blank" className="text-sm text-ink-muted underline underline-offset-4 hover:text-red">Full solution ↗</Link>
              <button onClick={next} className="inline-flex items-center gap-1.5 rounded-full bg-red px-5 py-2.5 text-sm font-medium text-paper hover:bg-red-deep">
                {i + 1 === qs.length ? "See result" : "Next"} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
