import type { Metadata } from "next";
import Link from "next/link";
import { allItems, itemHref, itemLabel } from "@/lib/data";
import { FamilyGraph } from "@/components/family-graph";
import { Rich } from "@/components/rich";

export const metadata: Metadata = { title: "Graph Lab · Sagot ni Sam" };

export default function Page() {
  const fam = allItems.filter((i) => i.graph);
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
      <header className="grid gap-6 border-b border-line pb-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow text-red">Families of curves · live</p>
          <h1 className="display mt-3 text-6xl text-ink sm:text-7xl">Graph Lab</h1>
        </div>
        <div className="lg:col-span-5 self-end space-y-3 text-ink-muted leading-relaxed">
          <p>Every “obtain the DE of the family” item, drawn live. The faint red curves are other members of the family; the bold one is yours to move.</p>
          <p className="text-sm">
            <span className="rounded bg-rose px-1.5 py-0.5 font-mono text-[11px] text-red-ink">arbitrary</span> sliders are the constants you <b className="text-ink">eliminate</b>.{" "}
            <span className="rounded bg-gold-soft px-1.5 py-0.5 font-mono text-[11px] text-gold">fixed</span> sliders are given values that <b className="text-ink">stay</b> in the DE.
            The number of arbitrary sliders = the order of the DE.
          </p>
        </div>
      </header>

      <div className="divide-y divide-line">
        {fam.map((it) => (
          <section key={it.id} className="grid gap-8 py-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="font-mono text-sm text-red">{itemLabel(it)}</p>
              <h2 className="display mt-2 text-4xl text-ink">{it.title}</h2>
              <div className="mt-3 text-ink-muted"><Rich text={it.prompt} /></div>
              <div className="mt-5 rounded-xl border-l-4 border-red bg-blush px-4 py-3">
                <p className="eyebrow text-red mb-1">The DE</p>
                <Rich text={it.answer} />
              </div>
              <Link href={itemHref(it)} className="mt-4 inline-block text-sm text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-red">See the derivation →</Link>
            </div>
            <div className="lg:col-span-8">
              <FamilyGraph id={it.graph!} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
