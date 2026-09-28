import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Ledger } from "@/components/ledger";
import { allItems } from "@/lib/data";

const modes = [
  { href: "/quick-review/", name: "Quick Review", desc: "Every rule, shortcut and method from both exams on one page, with a small DE builder you can play with.", tag: "10 min" },
  { href: "/long-test/", name: "Long Test, solved", desc: "All 25 items with step-by-step reveals. Try it first, then open one step at a time.", tag: "25 items" },
  { href: "/midterm/", name: "Midterm, solved", desc: "All 42 items: terminologies, order & degree, verifying, eliminating constants, families, and six solving methods.", tag: "42 items" },
  { href: "/flashcards/", name: "Flashcards", desc: "Question on the front, answer on the back. Cards you miss come back more often.", tag: "Spaced" },
  { href: "/quiz/", name: "Quiz", desc: "Auto-generated multiple choice, including a “Which method?” drill for the solving part.", tag: "Scored" },
  { href: "/mock-exam/", name: "Mock Exam", desc: "Timed, no peeking. Solve on paper, then check each item and grade yourself.", tag: "Timed" },
  { href: "/graph-lab/", name: "Graph Lab", desc: "All ten families of curves, live. Drag the arbitrary constants and watch the family appear.", tag: "Interactive" },
  { href: "/papers/", name: "Original Papers", desc: "The Long Test and Midterm questionnaires, plus the printable answer PDF.", tag: "3 PDFs" },
];

const typos = [
  { id: "lt-15", href: "/long-test/#lt-15", label: "LT #15", text: "“4′” read as 4y′" },
  { id: "lt-19", href: "/long-test/#lt-19", label: "LT #19", text: "c₃ cos ωt repeats c₁ cos ωt" },
  { id: "lt-13", href: "/long-test/#lt-13", label: "LT #13", text: "only works with “−”, not “+”" },
  { id: "me-25", href: "/midterm/#me-25", label: "ME #25", text: "the value of α is blank" },
  { id: "me-33", href: "/midterm/#me-33", label: "ME #33", text: "second dx should be dy" },
];

export default function Home() {
  return (
    <div className="grain">
      <section className="mx-auto max-w-6xl px-5 pt-12 pb-16 sm:px-8 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="eyebrow text-red">CEMAT104 · Differential Equations · 1st Term, AY 2026–2027</p>
            <h1 className="display mt-6 text-[4.2rem] leading-[0.88] text-ink sm:text-[6.5rem] xl:text-[7.6rem]">
              Sagot<br />ni Sam
            </h1>
            <p className="display italic mt-3 text-3xl text-red sm:text-4xl">na gawa ni Sebastian</p>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-ink-muted">
              Every item from the Long Test and the Midterm, solved step by step and explained in plain words, so reviewing feels less like guessing and more like
              <span className="text-ink"> “ah, gets ko na.”</span>
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/quick-review/" className="rounded-full bg-red px-6 py-3 font-medium text-paper transition hover:bg-red-deep active:scale-[0.98]">
                Start with the Quick Review
              </Link>
              <Link href="/long-test/" className="group inline-flex items-center gap-1.5 px-2 py-3 font-medium text-ink">
                <span className="border-b border-ink/30 group-hover:border-red group-hover:text-red transition-colors">Jump into the solutions</span>
                <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-red" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 lg:pt-8">
            <Ledger />
          </div>
        </div>
      </section>

      {/* modes — editorial index, not a card grid */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-ink-faint">Contents</p>
            <h2 className="display mt-3 text-5xl text-ink">Eight ways<br />to review</h2>
            <p className="mt-4 max-w-xs text-ink-muted leading-relaxed">
              Pick based on how much time you have. Night before the exam? Quick Review, then Flashcards.
            </p>
          </div>
          <ol className="lg:col-span-8 divide-y divide-line border-y border-line">
            {modes.map((m, i) => (
              <li key={m.href}>
                <Link href={m.href} className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-5 transition-colors hover:bg-blush sm:px-3">
                  <span className="font-mono text-sm text-ink-faint group-hover:text-red">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="display block text-3xl text-ink group-hover:text-red-deep transition-colors">{m.name}</span>
                    <span className="mt-1 block max-w-xl text-sm leading-relaxed text-ink-muted">{m.desc}</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-2 eyebrow text-ink-faint">
                    {m.tag}
                    <ArrowUpRight size={16} className="text-red opacity-0 -translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* heads up */}
      <section className="bg-red-deep text-paper dark:bg-rose dark:text-ink">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow opacity-70">Heads-up</p>
            <h2 className="display mt-3 text-5xl">Five spots in the papers look mistyped.</h2>
            <p className="mt-4 max-w-sm opacity-80 leading-relaxed">Each one is flagged on its item and solved using the most likely intended version. Know these before you compare answers with classmates.</p>
          </div>
          <ul className="lg:col-span-7 grid gap-px self-end overflow-hidden rounded-2xl bg-paper/15 dark:bg-ink/10 sm:grid-cols-2">
            {typos.map((t) => (
              <li key={t.id}>
                <Link href={t.href} className="flex h-full flex-col gap-1 bg-red-deep px-5 py-4 transition hover:bg-red dark:bg-rose dark:hover:bg-blush">
                  <span className="font-mono text-xs opacity-70">{t.label}</span>
                  <span className="text-[0.95rem]">{t.text}</span>
                </Link>
              </li>
            ))}
            <li className="flex items-center bg-red-deep px-5 py-4 text-sm opacity-80 dark:bg-rose">
              {allItems.length} items total · all checked by substituting back.
            </li>
          </ul>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-10 text-sm text-ink-faint sm:px-8">
        <span className="display italic text-xl text-ink-muted">Kaya mo ’yan, Sam.</span>
        <span>Made by Sebastian · CEMAT104 reviewer · progress is saved in this browser</span>
      </footer>
    </div>
  );
}
