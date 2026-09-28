"use client";

import { useState } from "react";
import clsx from "clsx";
import { asset } from "@/lib/asset";
import { Download, ExternalLink } from "lucide-react";

const docs = [
  { key: "lt", name: "Long Test", file: asset("/papers/long-test.pdf"), desc: "Questionnaire · 25 items · 2 pages" },
  { key: "me", name: "Midterm Exam", file: asset("/papers/midterm.pdf"), desc: "Questionnaire · 42 items · 2 pages" },
  { key: "ans", name: "Sagot (answer PDF)", file: asset("/papers/sagot-sa-bagong-reviewer-ni-sam.pdf"), desc: "Printable full solutions · 25 pages" },
];

export function Papers() {
  const [sel, setSel] = useState(docs[0]);
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <p className="eyebrow text-red">Source files</p>
          <h1 className="display mt-3 text-6xl text-ink">Papers</h1>
          <p className="mt-4 text-ink-muted leading-relaxed">The original questionnaires and the printable answer PDF. Print the answer PDF if you like reviewing on paper.</p>
          <ul className="mt-8 space-y-2">
            {docs.map((d) => (
              <li key={d.key}>
                <button onClick={() => setSel(d)} className={clsx("w-full rounded-xl border px-4 py-3 text-left transition", sel.key === d.key ? "border-red bg-blush" : "border-line hover:border-line-strong")}>
                  <span className={clsx("display block text-2xl", sel.key === d.key ? "text-red-deep" : "text-ink")}>{d.name}</span>
                  <span className="text-xs text-ink-faint">{d.desc}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex gap-2">
            <a href={sel.file} target="_blank" className="inline-flex items-center gap-1.5 rounded-full bg-red px-4 py-2 text-sm text-paper hover:bg-red-deep"><ExternalLink size={14} /> Open</a>
            <a href={sel.file} download className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-sm text-ink hover:border-red hover:text-red"><Download size={14} /> Download</a>
          </div>
        </div>
        <div className="lg:col-span-9">
          <iframe key={sel.file} src={sel.file} title={sel.name} className="h-[80vh] w-full rounded-2xl border border-line bg-paper-raised" />
        </div>
      </div>
    </div>
  );
}
