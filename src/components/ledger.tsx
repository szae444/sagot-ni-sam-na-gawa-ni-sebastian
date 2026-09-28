"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dices, History } from "lucide-react";
import { allItems, exams, itemHref, itemLabel, itemsByExam } from "@/lib/data";
import { useProgress } from "@/lib/progress";
import type { ExamId } from "@/lib/types";

export function Ledger() {
  const p = useProgress();
  const router = useRouter();
  const last = allItems.find((i) => i.id === p.lastVisited);
  const bookmarks = Object.keys(p.bookmarks).length;
  const notes = Object.keys(p.notes).length;
  const lastMock = p.mockHistory[p.mockHistory.length - 1];

  const surprise = () => {
    const pool = allItems.filter((i) => p.status[i.id] !== "mastered");
    const list = pool.length ? pool : allItems;
    const it = list[Math.floor(Math.random() * list.length)];
    router.push(itemHref(it));
  };

  return (
    <div className="rounded-3xl border border-line bg-paper-raised p-6 sm:p-7">
      <div className="flex items-baseline justify-between">
        <h2 className="display text-3xl text-ink">Your ledger</h2>
        <span className="eyebrow text-ink-faint">saved on this device</span>
      </div>

      <div className="mt-6 space-y-6">
        {(["lt", "me"] as ExamId[]).map((e) => {
          const list = itemsByExam(e);
          const m = list.filter((i) => p.status[i.id] === "mastered").length;
          const r = list.filter((i) => p.status[i.id] === "review").length;
          return (
            <Link key={e} href={`/${exams[e].slug}/`} className="group block">
              <div className="flex items-end justify-between gap-4">
                <span className="text-ink group-hover:text-red transition-colors font-medium">{exams[e].name}</span>
                <span className="display text-4xl leading-none tabular-nums text-ink">
                  {m}<span className="text-xl text-ink-faint">/{list.length}</span>
                </span>
              </div>
              <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-line">
                <div className="bg-sage transition-[width] duration-700" style={{ width: `${(m / list.length) * 100}%` }} />
                <div className="bg-red transition-[width] duration-700" style={{ width: `${(r / list.length) * 100}%` }} />
              </div>
              <div className="mt-1.5 flex gap-4 text-xs text-ink-faint">
                <span><i className="inline-block size-2 rounded-full bg-sage mr-1" />{m} got it</span>
                <span><i className="inline-block size-2 rounded-full bg-red mr-1" />{r} to review</span>
                <span>{list.length - m - r} not yet</span>
              </div>
            </Link>
          );
        })}
      </div>

      <dl className="mt-7 grid grid-cols-3 border-t border-line pt-5 text-center">
        <div><dt className="eyebrow !text-[10px] text-ink-faint">Bookmarks</dt><dd className="display text-3xl text-ink">{bookmarks}</dd></div>
        <div className="border-x border-line"><dt className="eyebrow !text-[10px] text-ink-faint">Best quiz</dt><dd className="display text-3xl text-ink">{p.quizBest === null ? "—" : `${p.quizBest}%`}</dd></div>
        <div><dt className="eyebrow !text-[10px] text-ink-faint">Notes</dt><dd className="display text-3xl text-ink">{notes}</dd></div>
      </dl>
      {lastMock && (
        <p className="mt-4 text-center text-xs text-ink-faint">Last mock exam: {lastMock.score}/{lastMock.total} ({lastMock.exam}) · {lastMock.date}</p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {last && (
          <Link href={itemHref(last)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-red-deep">
            <History size={15} /> Continue {itemLabel(last)}
          </Link>
        )}
        <button onClick={surprise} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-line-strong px-4 py-2.5 text-sm font-medium text-ink transition hover:border-red hover:text-red">
          <Dices size={15} /> Surprise me
        </button>
      </div>
    </div>
  );
}
