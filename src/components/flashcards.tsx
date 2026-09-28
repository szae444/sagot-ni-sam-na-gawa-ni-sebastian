"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Shuffle } from "lucide-react";
import { allItems, exams, itemHref, itemLabel, sectionOf } from "@/lib/data";
import type { ExamId, Item, Kind } from "@/lib/types";
import { update, useProgress } from "@/lib/progress";
import { Rich } from "./rich";

const kinds: { key: Kind | "all"; label: string }[] = [
  { key: "all", label: "Everything" },
  { key: "order", label: "Order & degree" },
  { key: "linear", label: "Linear?" },
  { key: "verify", label: "Verify" },
  { key: "eliminate", label: "Eliminate" },
  { key: "family", label: "Families" },
  { key: "terms", label: "Terms" },
  { key: "solve", label: "Solve" },
];

const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

export function Flashcards() {
  const p = useProgress();
  const [exam, setExam] = useState<ExamId | "both">("both");
  const [kind, setKind] = useState<Kind | "all">("all");
  const [hideKnown, setHideKnown] = useState(false);
  const [seed, setSeed] = useState(0);
  const [order, setOrder] = useState<string[]>([]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionDone, setSessionDone] = useState(0);

  const pool = useMemo(
    () => allItems.filter((it) => (exam === "both" || it.exam === exam) && (kind === "all" || it.kind === kind)),
    [exam, kind],
  );

  // Build the deck: lower boxes first (the ones you keep missing), shuffled within a box.
  useEffect(() => {
    const boxes = p.boxes;
    const list = pool.filter((it) => !hideKnown || (boxes[it.id] ?? 0) < 3);
    const byBox = [0, 1, 2, 3, 4, 5].flatMap((b) => shuffle(list.filter((it) => Math.min(boxes[it.id] ?? 0, 5) === b)));
    setOrder(byBox.map((it) => it.id));
    setI(0);
    setFlipped(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, hideKnown, seed]);

  const card: Item | undefined = allItems.find((it) => it.id === order[i]);
  const box = card ? p.boxes[card.id] ?? 0 : 0;

  const grade = useCallback((ok: boolean) => {
    if (!card) return;
    update((s) => ({ ...s, boxes: { ...s.boxes, [card.id]: ok ? Math.min((s.boxes[card.id] ?? 0) + 1, 5) : 1 } }));
    setSessionDone((n) => n + 1);
    setFlipped(false);
    if (!ok) {
      // missed cards come back 3 cards later
      setOrder((o) => {
        const copy = [...o];
        copy.splice(Math.min(i + 4, copy.length), 0, card.id);
        return copy;
      });
    }
    setTimeout(() => setI((n) => n + 1), 120);
  }, [card, i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/INPUT|TEXTAREA/.test((e.target as HTMLElement).tagName)) return;
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped((f) => !f); }
      if (e.key === "ArrowRight") { setFlipped(false); setI((n) => Math.min(n + 1, order.length)); }
      if (e.key === "ArrowLeft") { setFlipped(false); setI((n) => Math.max(n - 1, 0)); }
      if (e.key === "1" && flipped) grade(false);
      if (e.key === "2" && flipped) grade(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, grade, order.length]);

  const known = pool.filter((it) => (p.boxes[it.id] ?? 0) >= 3).length;

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-12">
        <header className="lg:col-span-4">
          <p className="eyebrow text-red">Active recall</p>
          <h1 className="display mt-3 text-6xl text-ink">Flashcards</h1>
          <p className="mt-4 text-ink-muted leading-relaxed">
            Read the question, answer it <em>in your head or on paper</em>, then flip. Be honest: cards you miss come back sooner, and cards you know move to a higher box.
          </p>

          <div className="mt-8 space-y-5">
            <fieldset>
              <legend className="eyebrow text-ink-faint mb-2">Exam</legend>
              <div className="flex gap-1.5">
                {(["both", "lt", "me"] as const).map((e) => (
                  <button key={e} onClick={() => setExam(e)} className={clsx("rounded-full px-3 py-1.5 text-sm transition", exam === e ? "bg-ink text-paper" : "border border-line text-ink-muted hover:text-ink")}>
                    {e === "both" ? "Both" : exams[e].name}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="eyebrow text-ink-faint mb-2">Topic</legend>
              <div className="flex flex-wrap gap-1.5">
                {kinds.map((k) => (
                  <button key={k.key} onClick={() => setKind(k.key)} className={clsx("rounded-full px-3 py-1.5 text-sm transition", kind === k.key ? "bg-red text-paper" : "border border-line text-ink-muted hover:text-ink")}>
                    {k.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              <input type="checkbox" checked={hideKnown} onChange={(e) => setHideKnown(e.target.checked)} className="accent-[var(--red)] size-4" />
              Skip cards I already know (box 3+)
            </label>
            <button onClick={() => setSeed((s) => s + 1)} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-1.5 text-sm text-ink hover:border-red hover:text-red transition">
              <Shuffle size={14} /> Shuffle & restart
            </button>
          </div>

          <dl className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line text-center">
            <div className="bg-paper-raised py-3"><dt className="eyebrow !text-[10px] text-ink-faint">In deck</dt><dd className="display text-3xl">{order.length}</dd></div>
            <div className="bg-paper-raised py-3"><dt className="eyebrow !text-[10px] text-ink-faint">Known</dt><dd className="display text-3xl text-sage">{known}</dd></div>
            <div className="bg-paper-raised py-3"><dt className="eyebrow !text-[10px] text-ink-faint">This session</dt><dd className="display text-3xl text-red">{sessionDone}</dd></div>
          </dl>
        </header>

        <div className="lg:col-span-8">
          {card ? (
            <>
              <div className="mb-3 flex items-center justify-between text-sm text-ink-muted">
                <span className="font-mono tabular-nums">Card {i + 1} of {order.length}</span>
                <span className="flex items-center gap-1" title="Leitner box">
                  {[1, 2, 3, 4, 5].map((b) => <span key={b} className={clsx("h-1.5 w-5 rounded-full", b <= box ? "bg-red" : "bg-line")} />)}
                </span>
              </div>

              <button onClick={() => setFlipped((f) => !f)} className="block w-full text-left [perspective:1600px]" aria-label="Flip card">
                <div className={clsx("grid transition-transform duration-500 [transform-style:preserve-3d] ease-[cubic-bezier(0.16,1,0.3,1)]", flipped && "[transform:rotateY(180deg)]")}>
                  {/* front */}
                  <div className="col-start-1 row-start-1 flex min-h-[22rem] flex-col rounded-3xl border border-line bg-paper-raised p-7 [backface-visibility:hidden] sm:p-9">
                    <div className="flex items-baseline justify-between">
                      <span className="eyebrow text-red">{itemLabel(card)} · {sectionOf(card).title}</span>
                      <span className="eyebrow text-ink-faint">Front</span>
                    </div>
                    <p className="mt-3 font-medium text-ink-muted">{card.title}</p>
                    <div className="my-auto py-6 text-lg text-ink"><Rich text={card.prompt} /></div>
                    <p className="text-center text-sm text-ink-faint">Tap or press <kbd className="font-mono">Space</kbd> to flip</p>
                  </div>
                  {/* back */}
                  <div className="col-start-1 row-start-1 flex min-h-[22rem] flex-col rounded-3xl border border-red/30 bg-blush p-7 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-9">
                    <div className="flex items-baseline justify-between">
                      <span className="eyebrow text-red">{itemLabel(card)} · Answer</span>
                      <span className="eyebrow text-ink-faint">Back</span>
                    </div>
                    <div className="my-auto py-6 text-lg text-ink"><Rich text={card.answer} /></div>
                    {card.tip && <p className="rounded-xl bg-gold-soft px-4 py-3 text-sm leading-relaxed text-ink-muted"><Rich text={card.tip} /></p>}
                  </div>
                </div>
              </button>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <button onClick={() => { setFlipped(false); setI(Math.max(i - 1, 0)); }} className="rounded-full border border-line p-2.5 text-ink-muted hover:text-ink" aria-label="Previous"><ArrowLeft size={16} /></button>
                {flipped ? (
                  <>
                    <button onClick={() => grade(false)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-rose px-4 py-2.5 text-sm font-medium text-red-ink hover:bg-red hover:text-paper transition"><RotateCcw size={15} /> Again <kbd className="font-mono text-xs opacity-60">1</kbd></button>
                    <button onClick={() => grade(true)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-sage px-4 py-2.5 text-sm font-medium text-paper hover:opacity-90 transition"><Check size={15} /> Got it <kbd className="font-mono text-xs opacity-60">2</kbd></button>
                  </>
                ) : (
                  <button onClick={() => setFlipped(true)} className="flex-1 rounded-full bg-red px-4 py-2.5 text-sm font-medium text-paper hover:bg-red-deep transition">Show answer</button>
                )}
                <button onClick={() => { setFlipped(false); setI(i + 1); }} className="rounded-full border border-line p-2.5 text-ink-muted hover:text-ink" aria-label="Skip"><ArrowRight size={16} /></button>
              </div>
              <p className="mt-4 text-center text-sm">
                <Link href={itemHref(card)} className="text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-red">Open the full step-by-step solution →</Link>
              </p>
            </>
          ) : (
            <div className="grid min-h-[22rem] place-items-center rounded-3xl border border-dashed border-line-strong p-10 text-center">
              <div>
                <p className="display text-5xl text-ink">{order.length ? "Deck finished!" : "No cards here"}</p>
                <p className="mt-3 text-ink-muted">{order.length ? `You went through ${sessionDone} cards. Shuffle to go again, or pick another topic.` : "Try another topic, or untick “skip cards I know”."}</p>
                <button onClick={() => setSeed((s) => s + 1)} className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-red px-5 py-2.5 text-sm font-medium text-paper hover:bg-red-deep"><Shuffle size={15} /> Shuffle & restart</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
