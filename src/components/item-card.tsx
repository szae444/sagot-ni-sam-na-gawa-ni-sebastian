"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Bookmark, Check, ChevronRight, Eye, EyeOff, Link2, Lightbulb, NotebookPen, RotateCcw, TriangleAlert } from "lucide-react";
import type { Item } from "@/lib/types";
import { Rich } from "./rich";
import { FamilyGraph } from "./family-graph";
import { setNote, setStatus, setVisited, toggleBookmark, useProgress } from "@/lib/progress";
import { sectionOf } from "@/lib/data";

export function ItemCard({ item, revealAll = false }: { item: Item; revealAll?: boolean }) {
  const progress = useProgress();
  const total = item.steps.length;
  const isTerms = item.kind === "terms";
  const [shown, setShown] = useState(revealAll ? total : 0);
  const [answer, setAnswer] = useState(revealAll);
  const [noteOpen, setNoteOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShown(revealAll ? total : 0);
    setAnswer(revealAll);
  }, [revealAll, total]);

  const status = progress.status[item.id];
  const bookmarked = !!progress.bookmarks[item.id];
  const note = progress.notes[item.id] ?? "";
  const open = answer || shown > 0;

  const touch = () => setVisited(item.id);
  const next = () => {
    touch();
    if (shown < total) setShown(shown + 1);
    if (shown + 1 >= total) setAnswer(true);
  };
  const showAll = () => { touch(); setShown(total); setAnswer(true); };
  const hide = () => { setShown(0); setAnswer(false); };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}#${item.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch { /* ignore */ }
  };

  const sec = sectionOf(item);

  return (
    <article
      id={item.id}
      className={clsx(
        "group relative scroll-mt-24 rounded-2xl border bg-paper-raised transition-colors",
        status === "mastered" ? "border-sage/40" : status === "review" ? "border-red/40" : "border-line",
      )}
    >
      {/* header */}
      <header className="flex items-start gap-4 px-5 pt-5 sm:px-7 sm:pt-6">
        <div className="display text-[2.6rem] sm:text-5xl text-red leading-none tabular-nums min-w-[2.2ch]">{item.no}</div>
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 eyebrow text-ink-faint">
            <span>{sec.letter} · {sec.title}</span>
            {item.method && <span className="rounded-full bg-rose text-red-ink px-2 py-0.5 !tracking-wider">{item.method}</span>}
            {status === "mastered" && <span className="rounded-full bg-sage-soft text-sage px-2 py-0.5">Got it</span>}
            {status === "review" && <span className="rounded-full bg-rose text-red-ink px-2 py-0.5">Review</span>}
          </div>
          <h3 className="mt-1 font-semibold text-ink leading-snug">{item.title}</h3>
        </div>
        <button
          onClick={() => toggleBookmark(item.id)}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
          className={clsx("p-2 -m-1 rounded-full transition-colors", bookmarked ? "text-red" : "text-ink-faint hover:text-ink")}
        >
          <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
        </button>
      </header>

      <div className="px-5 pb-5 sm:px-7 sm:pb-6">
        {/* prompt */}
        <div className="mt-4 rounded-xl bg-paper-sunken/70 px-4 py-3 text-[1.02rem] text-ink">
          <Rich text={item.prompt} />
        </div>

        {item.note && (
          <p className="mt-3 flex gap-2 text-sm text-ink-muted">
            <TriangleAlert size={16} className="mt-0.5 shrink-0 text-gold" />
            <span><span className="font-semibold text-gold">Typo in the paper. </span><Rich text={item.note} /></span>
          </p>
        )}

        {item.graph && (
          <div className="mt-5 rounded-xl border border-dashed border-line-strong p-4">
            <p className="eyebrow text-ink-faint mb-3">Graph · drag the sliders</p>
            <FamilyGraph id={item.graph} />
          </div>
        )}

        {/* controls */}
        <div className="no-print mt-5 flex flex-wrap items-center gap-2">
          {!isTerms && total > 0 && shown < total && (
            <button onClick={next} className="inline-flex items-center gap-1.5 rounded-full bg-red px-4 py-2 text-sm font-medium text-paper transition hover:bg-red-deep active:scale-[0.98]">
              {shown === 0 ? "Start solution" : "Next step"} <span className="font-mono text-xs opacity-80">{shown}/{total}</span>
              <ChevronRight size={15} />
            </button>
          )}
          {!(shown === total && answer) && (
            <button onClick={showAll} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-sm text-ink transition hover:border-red hover:text-red">
              <Eye size={15} /> {isTerms ? "Reveal comparison" : "Show everything"}
            </button>
          )}
          {!answer && !isTerms && (
            <button onClick={() => { touch(); setAnswer(true); }} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-ink-muted hover:text-red transition">
              Answer only
            </button>
          )}
          {open && (
            <button onClick={hide} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-ink-muted hover:text-ink transition">
              <EyeOff size={15} /> Hide
            </button>
          )}
        </div>

        {/* compare table */}
        {isTerms && item.compare && answer && (
          <div className="rise mt-5">
            <div className={clsx("grid gap-3", item.compare.cols.length === 3 ? "md:grid-cols-3" : "sm:grid-cols-2")}>
              {item.compare.cols.map((c, ci) => (
                <div key={c.title} className={clsx("rounded-xl border p-4", ci === 0 ? "border-red/30 bg-blush" : "border-line bg-paper")}>
                  <h4 className="display text-2xl text-red-deep">{c.title}</h4>
                  <ul className="mt-2 space-y-2 text-sm leading-relaxed">
                    {c.points.map((pt, i) => (
                      <li key={i} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-red" /><Rich text={pt} /></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed"><span className="eyebrow text-red mr-2">Example</span><Rich text={item.compare.example} /></p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted"><span className="eyebrow text-gold mr-2">Similarity</span><Rich text={item.compare.similarity} /></p>
          </div>
        )}

        {/* steps */}
        {shown > 0 && (
          <ol className="mt-5 space-y-0">
            {item.steps.slice(0, shown).map((s, i) => (
              <li key={i} className="rise relative flex gap-4 pb-4 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-red/40 font-mono text-xs text-red">{i + 1}</span>
                  {i < shown - 1 && <span className="mt-1 w-px flex-1 bg-line-strong" />}
                </div>
                <div className="min-w-0 flex-1 pt-0.5 leading-relaxed"><Rich text={s} /></div>
              </li>
            ))}
          </ol>
        )}

        {/* answer */}
        {answer && !isTerms && (
          <div className="rise mt-5 rounded-xl border-l-4 border-red bg-blush px-4 py-3">
            <p className="eyebrow text-red mb-1">Final answer</p>
            <div className="text-ink leading-relaxed"><Rich text={item.answer} /></div>
          </div>
        )}
        {answer && isTerms && (
          <div className="rise mt-4 rounded-xl border-l-4 border-red bg-blush px-4 py-3 text-sm">
            <p className="eyebrow text-red mb-1">In one line</p>
            <Rich text={item.answer} />
          </div>
        )}

        {answer && item.tip && (
          <div className="rise mt-3 flex gap-3 rounded-xl bg-gold-soft px-4 py-3 text-sm leading-relaxed">
            <Lightbulb size={17} className="mt-0.5 shrink-0 text-gold" />
            <div><span className="font-semibold text-gold">In simple words. </span><Rich text={item.tip} /></div>
          </div>
        )}

        {/* footer actions */}
        <footer className="no-print mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <button
            onClick={() => setStatus(item.id, "mastered")}
            className={clsx("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition",
              status === "mastered" ? "bg-sage text-paper" : "bg-sage-soft text-sage hover:bg-sage hover:text-paper")}
          >
            <Check size={15} /> Got it
          </button>
          <button
            onClick={() => setStatus(item.id, "review")}
            className={clsx("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition",
              status === "review" ? "bg-red text-paper" : "bg-rose text-red-ink hover:bg-red hover:text-paper")}
          >
            <RotateCcw size={15} /> Review again
          </button>
          <span className="flex-1" />
          <button onClick={() => setNoteOpen((v) => !v)} className={clsx("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition", note ? "text-gold" : "text-ink-muted hover:text-ink")}>
            <NotebookPen size={15} /> {note ? "My note" : "Add note"}
          </button>
          <button onClick={copyLink} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink-muted hover:text-ink transition">
            <Link2 size={15} /> {copied ? "Copied!" : "Link"}
          </button>
        </footer>
        {(noteOpen || (note && noteOpen)) && (
          <textarea
            autoFocus
            defaultValue={note}
            onBlur={(e) => setNote(item.id, e.target.value)}
            placeholder="Write your own reminder, e.g. 'Don't forget the chain rule here.' It's saved in this browser."
            className="rise mt-3 w-full min-h-24 rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-red"
          />
        )}
        {note && !noteOpen && (
          <p className="mt-3 rounded-lg bg-gold-soft/60 px-3 py-2 text-sm text-ink-muted whitespace-pre-wrap"><span className="font-semibold text-gold">Note: </span>{note}</p>
        )}
      </div>
    </article>
  );
}
