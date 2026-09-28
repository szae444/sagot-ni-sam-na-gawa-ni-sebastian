import type { Metadata } from "next";
import Link from "next/link";
import { Rich } from "@/components/rich";
import { AnswerKey, DeBuilder } from "@/components/review-tools";

export const metadata: Metadata = { title: "Quick Review · Sagot ni Sam" };

const r = String.raw;

const toc = [
  ["order", "Order & degree"],
  ["linear", "Linear or not"],
  ["verify", "Verifying"],
  ["eliminate", "Eliminating constants"],
  ["family", "Families of curves"],
  ["methods", "Solving methods"],
  ["key", "Answer key"],
];

function Block({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line py-12 first:border-t-0 first:pt-0">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-sm text-red">{String(n).padStart(2, "0")}</span>
        <h2 className="display text-4xl text-ink sm:text-5xl">{title}</h2>
      </div>
      <div className="mt-6 space-y-4 leading-relaxed text-ink">{children}</div>
    </section>
  );
}

const Flag = ({ t }: { t: string }) => (
  <li className="flex gap-3"><span className="mt-2.5 h-px w-4 shrink-0 bg-red" /><Rich text={t} /></li>
);

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
      <header className="grid gap-6 pb-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="eyebrow text-red">Read this first</p>
          <h1 className="display mt-3 text-6xl text-ink sm:text-7xl">Quick Review</h1>
        </div>
        <p className="self-end text-ink-muted leading-relaxed lg:col-span-4">Every rule and shortcut the two exams use, on one page. If you only have ten minutes before the exam, this is the page.</p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[180px_minmax(0,1fr)]">
        <nav className="hidden lg:block">
          <ol className="sticky top-8 space-y-2 border-l border-line pl-4">
            {toc.map(([id, label], k) => (
              <li key={id}><a href={`#${id}`} className="group flex gap-2 text-sm text-ink-muted hover:text-red"><span className="font-mono text-xs text-ink-faint group-hover:text-red">{String(k + 1).padStart(2, "0")}</span>{label}</a></li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 max-w-3xl">
          <Block id="order" n={1} title="Order & Degree">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-paper-raised p-5">
                <p className="display text-3xl text-red-deep">Order</p>
                <p className="mt-1 text-ink-muted">The <b className="text-ink">highest derivative</b> that appears.</p>
              </div>
              <div className="rounded-2xl border border-line bg-paper-raised p-5">
                <p className="display text-3xl text-red-deep">Degree</p>
                <p className="mt-1 text-ink-muted">The <b className="text-ink">power of that highest derivative</b>, once the DE is a polynomial in its derivatives.</p>
              </div>
            </div>
            <p className="font-semibold">Before reading the degree, clean the equation up:</p>
            <ul className="space-y-2">
              <Flag t={r`**Radicals or fractional powers:** raise both sides to a power (the LCD of the denominators). Example: $(y''')^{2/3}=\sqrt{1+y''}\to(y''')^4=(1+y'')^3$.`} />
              <Flag t={r`**Negative powers:** multiply through. Example: $(y'')^{-1}+\dots\to$ multiply by $y''$.`} />
              <Flag t={r`**Derivative inside ln, sin, e:** isolate it and invert. Example: $\ln y''=u\Rightarrow y''=e^{u}$, and $\sin y'=x\Rightarrow y'=\sin^{-1}x$.`} />
              <Flag t={r`**Careful:** a big power on a **lower** derivative does not count. Only the highest one matters.`} />
            </ul>
          </Block>

          <Block id="linear" n={2} title="Linear or Nonlinear?">
            <p><Rich text={r`A DE is **linear** in $y$ when it can be written as`} /></p>
            <div className="rounded-2xl bg-paper-sunken px-4 py-2"><Rich text={r`$$a_n(x)\,y^{(n)}+\dots+a_1(x)\,y'+a_0(x)\,y=f(x)$$`} /></div>
            <p><Rich text={r`Look only at the parts with $y$. It is **nonlinear** if you see:`} /></p>
            <ul className="grid gap-2 sm:grid-cols-2">
              <Flag t={r`a power other than 1: $y^2$, $(y')^3$, $\sqrt{y'}$`} />
              <Flag t={r`a product: $y\,y'$, $y\,y''$`} />
              <Flag t={r`$y$ inside a function: $\sin y$, $e^{y}$, $\cos(x+y)$`} />
              <Flag t={r`$y$ in a denominator: $\dfrac{1}{x+y}$`} />
            </ul>
            <p className="text-ink-muted"><Rich text={r`Coefficients can be any function of $x$, such as $e^x$, $x^2$ or $\sin x$. That's still linear.`} /></p>
          </Block>

          <Block id="verify" n={3} title="Verifying a Solution">
            <ol className="list-decimal space-y-1 pl-5 marker:text-red">
              <li>Differentiate the proposed solution as many times as the DE needs.</li>
              <li>Substitute everything into the DE.</li>
              <li><Rich text={r`Simplify. If LHS = RHS for all $x$, it's a solution. If not, say so and show why.`} /></li>
            </ol>
            <p className="text-ink-muted"><Rich text={r`**Implicit solutions** ($F(x,y)=C$): take the differential of both sides ($dC=0$) and show you get the DE back.`} /></p>
          </Block>

          <Block id="eliminate" n={4} title="Eliminating Constants">
            <p><Rich text={r`**Rule:** $n$ arbitrary constants → differentiate $n$ times → a DE of order $n$.`} /></p>
            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full text-sm">
                <thead className="bg-paper-sunken text-left"><tr><th className="px-4 py-2 font-medium">Solution looks like</th><th className="px-4 py-2 font-medium">Roots</th><th className="px-4 py-2 font-medium">DE</th></tr></thead>
                <tbody className="divide-y divide-line">
                  <tr><td className="px-4 py-2"><Rich text={r`$Ae^{r_1x}+Be^{r_2x}$`} /></td><td className="px-4 py-2"><Rich text={r`$r_1,\,r_2$`} /></td><td className="px-4 py-2"><Rich text={r`$y''-(r_1+r_2)y'+r_1r_2\,y=0$`} /></td></tr>
                  <tr><td className="px-4 py-2"><Rich text={r`$(A+Bx)e^{rx}$`} /></td><td className="px-4 py-2"><Rich text={r`$r,\,r$`} /></td><td className="px-4 py-2"><Rich text={r`$y''-2ry'+r^2y=0$`} /></td></tr>
                  <tr><td className="px-4 py-2"><Rich text={r`$e^{\alpha x}(A\cos\beta x+B\sin\beta x)$`} /></td><td className="px-4 py-2"><Rich text={r`$\alpha\pm\beta i$`} /></td><td className="px-4 py-2"><Rich text={r`$y''-2\alpha y'+(\alpha^2+\beta^2)y=0$`} /></td></tr>
                </tbody>
              </table>
            </div>
            <DeBuilder />
            <p className="text-ink-muted"><Rich text={r`**Mixed types** like $c_1x^2+c_2e^{kx}$: use the **determinant (Wronskian)**. Put $y, y', y''$ in the first column and the two functions and their derivatives in the other columns, then set the determinant to 0 (see LT #21, ME #24).`} /></p>
          </Block>

          <Block id="family" n={5} title="DE of a Family of Curves">
            <ol className="list-decimal space-y-1 pl-5 marker:text-red">
              <li>Write the equation of the family.</li>
              <li>Sort the constants: <span className="rounded bg-rose px-1.5 font-mono text-xs text-red-ink">arbitrary</span> (changes from curve to curve) vs. <span className="rounded bg-gold-soft px-1.5 font-mono text-xs text-gold">fixed</span> (given: r, a, Q, k, α).</li>
              <li>Differentiate once per <b>arbitrary</b> constant.</li>
              <li>Eliminate the arbitrary constants. The fixed ones stay in the answer.</li>
            </ol>
            <p className="text-ink-muted">Want to see it? Every family is live in the <Link href="/graph-lab/" className="text-red underline underline-offset-4">Graph Lab</Link>.</p>
          </Block>

          <Block id="methods" n={6} title="Which Solving Method?">
            <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
              {[
                ["Separable", r`Can be arranged as $f(x)\,dx+g(y)\,dy=0$`, r`Integrate each side: $\int f\,dx+\int g\,dy=C$`, "ME 31, 32, 37, 38"],
                ["Homogeneous", r`$M$, $N$ homogeneous of the same degree (depends only on $y/x$)`, r`Let $y=vx$, $dy=v\,dx+x\,dv$, then separate`, "ME 33, 39"],
                ["Exact", r`$\dfrac{\partial M}{\partial y}=\dfrac{\partial N}{\partial x}$`, r`$F=\int M\,dx+g(y)$; find $g$ from $F_y=N$`, "ME 35, 41"],
                ["Linear", r`$y'+P(x)\,y=Q(x)$`, r`IF $=e^{\int P\,dx}$; $\;y\cdot\text{IF}=\int Q\cdot\text{IF}\,dx+C$`, "ME 34, 40"],
                ["Bernoulli", r`$y'+P(x)\,y=Q(x)\,y^n$`, r`Let $v=y^{1-n}$; it becomes linear in $v$`, "ME 36, 42"],
              ].map(([m, rec, how, ex]) => (
                <div key={m} className="grid gap-2 bg-paper-raised p-4 sm:grid-cols-[8rem_1fr_1fr]">
                  <div><p className="display text-2xl text-red-deep">{m}</p><p className="font-mono text-[11px] text-ink-faint">{ex}</p></div>
                  <div className="text-sm"><p className="eyebrow !text-[10px] text-ink-faint">Recognize</p><Rich text={rec} /></div>
                  <div className="text-sm"><p className="eyebrow !text-[10px] text-ink-faint">Do</p><Rich text={how} /></div>
                </div>
              ))}
            </div>
            <p className="text-ink-muted"><Rich text={r`**With a condition** (e.g. “when x = 0, y = 1”): plug it into the general solution to get $C$, which gives the particular solution.`} /></p>
          </Block>

          <Block id="key" n={7} title="Answer Key at a Glance">
            <AnswerKey />
          </Block>
        </div>
      </div>
    </div>
  );
}
