"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";
import { Rich } from "./rich";
import { allItems, exams, itemHref } from "@/lib/data";
import type { ExamId } from "@/lib/types";

/* ───────── Roots → DE builder ───────── */
type Mode = "distinct" | "repeated" | "complex";

const num = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""));

function term(coef: number, sym: string, first = false) {
  if (Math.abs(coef) < 1e-9) return "";
  const sign = coef < 0 ? "-" : first ? "" : "+";
  const mag = Math.abs(coef) === 1 && sym ? "" : num(Math.abs(coef));
  return `${sign}${mag}${sym}`;
}

function expTerm(c: string, r: number) {
  if (r === 0) return c;
  return `${c}e^{${r === 1 ? "" : r === -1 ? "-" : num(r)}x}`;
}

export function DeBuilder() {
  const [mode, setMode] = useState<Mode>("complex");
  const [a, setA] = useState(3);
  const [b, setB] = useState(2);

  let sum = 0, prod = 0, sol = "";
  if (mode === "distinct") {
    sum = a + b; prod = a * b;
    sol = `${expTerm("A", a)}+${expTerm("B", b)}`;
  } else if (mode === "repeated") {
    sum = 2 * a; prod = a * a;
    sol = `(A+Bx)${a === 0 ? "" : `e^{${num(a)}x}`}`;
  } else {
    sum = 2 * a; prod = a * a + b * b;
    sol = `${a === 0 ? "" : `e^{${num(a)}x}`}\\left(A\\cos ${b === 1 ? "" : num(b)}x+B\\sin ${b === 1 ? "" : num(b)}x\\right)`;
  }
  const de = `y''${term(-sum, "y'")}${term(prod, "y")}=0`;
  const roots = mode === "distinct" ? `r=${num(a)},\\;${num(b)}` : mode === "repeated" ? `r=${num(a)},\\;${num(a)}\\;(\\text{double})` : `r=${num(a)}\\pm ${num(b)}i`;

  const slider = (label: string, v: number, set: (n: number) => void, min: number) => (
    <label className="block">
      <span className="flex justify-between text-sm"><span className="text-ink-muted">{label}</span><span className="font-mono text-ink">{v}</span></span>
      <input type="range" min={min} max={6} step={1} value={v} onChange={(e) => set(+e.target.value)} className="mt-1 w-full" />
    </label>
  );

  return (
    <div className="rounded-2xl border border-red/25 bg-blush p-5 sm:p-6">
      <p className="eyebrow text-red">Try it · Roots → DE builder</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {([["distinct", "Two real roots"], ["repeated", "Repeated root"], ["complex", "Complex α ± βi"]] as [Mode, string][]).map(([m, l]) => (
          <button key={m} onClick={() => setMode(m)} className={clsx("rounded-full px-3 py-1.5 text-sm transition", mode === m ? "bg-red text-paper" : "bg-paper-raised text-ink-muted hover:text-ink")}>{l}</button>
        ))}
      </div>
      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          {mode === "distinct" && <>{slider("r₁", a, setA, -6)}{slider("r₂", b, setB, -6)}</>}
          {mode === "repeated" && slider("r", a, setA, -6)}
          {mode === "complex" && <>{slider("α (real part)", a, setA, -6)}{slider("β (imaginary part)", b, (n) => setB(Math.max(1, n)), 1)}</>}
        </div>
        <div className="space-y-2 rounded-xl bg-paper-raised p-4">
          <p className="text-sm text-ink-muted">Solution <Rich text={`$y=${sol}$`} /></p>
          <p className="text-sm text-ink-muted">Roots <Rich text={`$${roots}$`} /></p>
          <div className="border-t border-line pt-2 text-lg text-ink"><Rich text={`$$${de}$$`} /></div>
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-muted">Set α = 3, β = 2 to get Long Test #20; repeated r = 4 gives LT #18.</p>
    </div>
  );
}

/* ───────── Answer key (self-test) ───────── */
export function AnswerKey() {
  const [hidden, setHidden] = useState(false);
  const [peek, setPeek] = useState<Record<string, boolean>>({});
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button onClick={() => { setHidden((h) => !h); setPeek({}); }} className={clsx("inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition", hidden ? "bg-red text-paper" : "border border-line-strong text-ink hover:border-red hover:text-red")}>
          {hidden ? <EyeOff size={15} /> : <Eye size={15} />} {hidden ? "Self-test ON: tap a row to peek" : "Self-test: hide the answers"}
        </button>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {(["lt", "me"] as ExamId[]).map((e) => (
          <div key={e}>
            <h3 className="display text-3xl text-ink">{exams[e].name}</h3>
            <table className="mt-3 w-full text-sm">
              <tbody className="divide-y divide-line">
                {allItems.filter((i) => i.exam === e).map((i) => {
                  const show = !hidden || peek[i.id];
                  return (
                    <tr key={i.id} onClick={() => hidden && setPeek((p) => ({ ...p, [i.id]: !p[i.id] }))} className={clsx(hidden && "cursor-pointer hover:bg-blush")}>
                      <td className="w-14 py-2 pr-2 align-top font-mono text-xs text-red"><Link href={itemHref(i)} onClick={(ev) => ev.stopPropagation()} className="hover:underline">#{i.no}</Link></td>
                      <td className="py-2 text-ink">
                        {show ? <span className="rise">{i.short}</span> : <span className="inline-block h-3 w-40 rounded bg-line align-middle" />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
