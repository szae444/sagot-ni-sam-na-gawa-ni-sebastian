"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { GraphId } from "@/lib/types";

type Pt = [number, number];
type Curve = Pt[];
type P = Record<string, number>;

interface Param {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  init: number;
  role: "arbitrary" | "fixed";
}

interface Spec {
  x: [number, number];
  y: [number, number];
  params: Param[];
  /** faint background family */
  family: (p: P) => Curve[];
  /** the curve being controlled */
  main: (p: P) => Curve[];
  guides?: (p: P) => Curve[];
  dots?: (p: P) => Pt[];
  equation: (p: P) => string;
  lesson: string;
}

const N = 180;
const sample = (f: (t: number) => Pt, t0: number, t1: number, n = N): Curve =>
  Array.from({ length: n + 1 }, (_, i) => f(t0 + ((t1 - t0) * i) / n));
const circle = (h: number, k: number, r: number) => sample((t) => [h + r * Math.cos(t), k + r * Math.sin(t)], 0, Math.PI * 2);
const line = (p: Pt, d: Pt): Curve => [
  [p[0] - 40 * d[0], p[1] - 40 * d[1]],
  [p[0] + 40 * d[0], p[1] + 40 * d[1]],
];
const range = (a: number, b: number, n: number) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
const f = (v: number, d = 1) => {
  const s = Math.abs(v) < 1e-9 ? "0" : v.toFixed(d);
  return s.replace(/\.0+$/, "");
};
const sgn = (v: number, d = 1) => (v < 0 ? ` + ${f(-v, d)}` : ` − ${f(v, d)}`);
const sideParab = (h: number, k: number, a: number) => sample((t) => [h + (t * t) / (4 * a), k + t], -7, 7);
const upParab = (h: number, v: number, k: number) => sample((t) => [t, v + ((t - h) * (t - h)) / (4 * k)], -8, 8);

const specs: Record<GraphId, Spec> = {
  lt22: {
    x: [-5, 5], y: [-5, 5],
    params: [
      { key: "Q", label: "Q (distance)", min: 0.5, max: 4, step: 0.1, init: 2, role: "fixed" },
      { key: "t", label: "angle of the normal", min: 0, max: 360, step: 1, init: 35, role: "arbitrary" },
    ],
    family: ({ Q }) => range(0, 330, 12).map((deg) => {
      const a = (deg * Math.PI) / 180;
      return line([Q * Math.cos(a), Q * Math.sin(a)], [-Math.sin(a), Math.cos(a)]);
    }),
    main: ({ Q, t }) => {
      const a = (t * Math.PI) / 180;
      return [line([Q * Math.cos(a), Q * Math.sin(a)], [-Math.sin(a), Math.cos(a)])];
    },
    guides: ({ Q }) => [circle(0, 0, Q)],
    dots: ({ Q, t }) => [[Q * Math.cos((t * Math.PI) / 180), Q * Math.sin((t * Math.PI) / 180)]],
    equation: ({ Q, t }) => `x·cos ${f(t, 0)}° + y·sin ${f(t, 0)}° = ${f(Q)}`,
    lesson: "Every line is tangent to the dashed circle of radius Q.",
  },
  lt23: {
    x: [-5, 5], y: [-5, 5],
    params: [
      { key: "r", label: "r (radius)", min: 0.4, max: 2.5, step: 0.1, init: 1.3, role: "fixed" },
      { key: "k", label: "k (center height)", min: -4, max: 4, step: 0.1, init: 1, role: "arbitrary" },
    ],
    family: ({ r }) => range(-4, 4, 6).flatMap((k) => [circle(r, k, r), circle(-r, k, r)]),
    main: ({ r, k }) => [circle(r, k, r)],
    dots: ({ r, k }) => [[r, k], [0, k]],
    equation: ({ r, k }) => `(x − ${f(r)})² + (y${sgn(k)})² = ${f(r * r, 2)}`,
    lesson: "Same radius; each circle just touches the y-axis.",
  },
  lt24: {
    x: [-5, 5], y: [-5, 5],
    params: [
      { key: "h", label: "h (center x)", min: -4, max: 4, step: 0.1, init: 0.5, role: "arbitrary" },
      { key: "k", label: "k (center y)", min: -4, max: 4, step: 0.1, init: 0.5, role: "arbitrary" },
    ],
    family: () => [[-3, 3], [0, 3], [3, 3], [-3, 0], [3, 0], [-3, -3], [0, -3], [3, -3]].map(([h, k]) => circle(h, k, 1)),
    main: ({ h, k }) => [circle(h, k, 1)],
    dots: ({ h, k }) => [[h, k]],
    equation: ({ h, k }) => `(x${sgn(h)})² + (y${sgn(k)})² = 1`,
    lesson: "The radius is locked at 1. Only the center moves (2 constants, so 2nd order).",
  },
  lt25: {
    x: [-5, 5], y: [-5, 5],
    params: [
      { key: "a", label: "a (vertex → focus)", min: 0.15, max: 2, step: 0.05, init: 0.5, role: "fixed" },
      { key: "h", label: "h (vertex x)", min: -4, max: 4, step: 0.1, init: -1, role: "arbitrary" },
      { key: "k", label: "k (vertex y)", min: -4, max: 4, step: 0.1, init: 0.5, role: "arbitrary" },
    ],
    family: ({ a }) => [[-4, -3], [-2, 3], [1, -1.5], [2.5, 2]].map(([h, k]) => sideParab(h, k, a)),
    main: ({ a, h, k }) => [sideParab(h, k, a)],
    dots: ({ a, h, k }) => [[h, k], [h + a, k]],
    equation: ({ a, h, k }) => `(y${sgn(k)})² = ${f(4 * a, 2)}(x${sgn(h)})`,
    lesson: "Same shape (same a), only the vertex moves. The 2nd dot is the focus.",
  },
  me25: {
    x: [-5, 9], y: [-5, 9],
    params: [
      { key: "al", label: "α (sum of intercepts)", min: 1, max: 8, step: 0.5, init: 4, role: "fixed" },
      { key: "a", label: "a (x-intercept)", min: -4, max: 8, step: 0.1, init: 1.5, role: "arbitrary" },
    ],
    family: ({ al }) => [-3, -1.5, 0.7, 2.2, 5, 6.5].filter((a) => Math.abs(a - al) > 0.3).map((a) => line([a, 0], [-a, al - a])),
    main: ({ al, a }) => (Math.abs(a) < 0.05 || Math.abs(al - a) < 0.05 ? [] : [line([a, 0], [-a, al - a])]),
    dots: ({ al, a }) => [[a, 0], [0, al - a]],
    equation: ({ al, a }) => `x/${f(a)} + y/${f(al - a)} = 1   (${f(a)} + ${f(al - a)} = ${f(al)})`,
    lesson: "x-intercept + y-intercept always adds up to α.",
  },
  me26: {
    x: [-5, 5], y: [-5, 5],
    params: [
      { key: "h", label: "h (center x)", min: -3, max: 3, step: 0.1, init: 0, role: "arbitrary" },
      { key: "k", label: "k (center y)", min: -3, max: 3, step: 0.1, init: 0, role: "arbitrary" },
      { key: "r", label: "r (radius)", min: 0.3, max: 4, step: 0.1, init: 2, role: "arbitrary" },
    ],
    family: () => [[1.5, 1.5, 1], [-2, 1.8, 1.8], [2, -2.2, 1.5], [-2.5, -2.5, 0.8], [0, 0, 3.8]].map(([h, k, r]) => circle(h, k, r)),
    main: ({ h, k, r }) => [circle(h, k, r)],
    dots: ({ h, k }) => [[h, k]],
    equation: ({ h, k, r }) => `(x${sgn(h)})² + (y${sgn(k)})² = ${f(r * r, 2)}`,
    lesson: "Three free constants (h, k, r), so 3rd order.",
  },
  me27: {
    x: [-5, 5], y: [-5, 5],
    params: [
      { key: "h", label: "vertex x", min: -3, max: 3, step: 0.1, init: 0, role: "arbitrary" },
      { key: "k", label: "vertex y", min: -3, max: 3, step: 0.1, init: -1, role: "arbitrary" },
      { key: "c", label: "width factor", min: 0.1, max: 2, step: 0.05, init: 0.5, role: "arbitrary" },
      { key: "th", label: "rotation (°)", min: 0, max: 360, step: 1, init: 0, role: "arbitrary" },
    ],
    family: () => [[1.5, 3, 180, 0.35], [-3, 0, 270, 0.4], [2, -1, 45, 0.6], [-1.5, 1.5, 137, 1.2]].map(([h, k, th, c]) => rotParab(h, k, c, th)),
    main: ({ h, k, c, th }) => [rotParab(h, k, c, th)],
    dots: ({ h, k }) => [[h, k]],
    equation: ({ c, th }) => `parabola · width ${f(c, 2)} · rotated ${f(th, 0)}°`,
    lesson: "Position (2), width (1) and direction (1) make 4 constants, so 4th order.",
  },
  me28: {
    x: [-5, 5], y: [-5, 5],
    params: [
      { key: "kk", label: "k (vertex → focus)", min: 0.15, max: 2, step: 0.05, init: 0.5, role: "fixed" },
      { key: "h", label: "h (vertex x)", min: -4, max: 4, step: 0.1, init: 0, role: "arbitrary" },
      { key: "v", label: "v (vertex y)", min: -4, max: 4, step: 0.1, init: -1, role: "arbitrary" },
    ],
    family: ({ kk }) => [[-3, -4], [2, 1], [-1.5, 2], [3.5, -3]].map(([h, v]) => upParab(h, v, kk)),
    main: ({ kk, h, v }) => [upParab(h, v, kk)],
    dots: ({ kk, h, v }) => [[h, v], [h, v + kk]],
    equation: ({ kk, h, v }) => `(x${sgn(h)})² = ${f(4 * kk, 2)}(y${sgn(v)})`,
    lesson: "Same opening for every curve, so y'' = 1/(2k) is the same constant for all of them.",
  },
  me29: {
    x: [-5, 5], y: [-5, 5],
    params: [
      { key: "a", label: "a (fixed point x < 0)", min: -4, max: -0.5, step: 0.1, init: -2, role: "fixed" },
      { key: "b", label: "b (fixed point y < 0)", min: -4, max: -0.5, step: 0.1, init: -1.5, role: "fixed" },
      { key: "t", label: "slope angle (°)", min: -89, max: 89, step: 1, init: 30, role: "arbitrary" },
    ],
    family: ({ a, b }) => range(-80, 80, 9).map((deg) => line([a, b], [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)])),
    main: ({ a, b, t }) => [line([a, b], [Math.cos((t * Math.PI) / 180), Math.sin((t * Math.PI) / 180)])],
    dots: ({ a, b }) => [[a, b]],
    equation: ({ a, b, t }) => `y${sgn(b)} = ${f(Math.tan((t * Math.PI) / 180), 2)}(x${sgn(a)})`,
    lesson: "A 'star' of lines: the point is fixed, only the slope m changes.",
  },
  me30: {
    x: [-5, 5], y: [-5, 5],
    params: [
      { key: "h", label: "h (vertex x)", min: -4, max: 4, step: 0.1, init: 0, role: "arbitrary" },
      { key: "k", label: "k (vertex y)", min: -4, max: 4, step: 0.1, init: 0, role: "arbitrary" },
      { key: "A", label: "a (focal length, ±)", min: -2, max: 2, step: 0.05, init: 0.5, role: "arbitrary" },
    ],
    family: () => [[-3, 1, 0.25], [1, 2, 0.1], [3, -1, -0.4], [2, 3, -1.2], [-2, -3, 0.8]].map(([h, k, A]) => sideParab(h, k, A)),
    main: ({ h, k, A }) => (Math.abs(A) < 0.03 ? [] : [sideParab(h, k, A)]),
    dots: ({ h, k }) => [[h, k]],
    equation: ({ h, k, A }) => `(y${sgn(k)})² = ${f(4 * A, 2)}(x${sgn(h)})`,
    lesson: "Now the width is free too, so there are 3 constants and the DE is 3rd order.",
  },
};

function rotParab(h: number, k: number, c: number, deg: number): Curve {
  const th = (deg * Math.PI) / 180;
  return sample((t) => {
    const X = t, Y = c * t * t;
    return [h + X * Math.cos(th) - Y * Math.sin(th), k + X * Math.sin(th) + Y * Math.cos(th)];
  }, -9, 9);
}

const W = 320;

export function FamilyGraph({ id, compact = false }: { id: GraphId; compact?: boolean }) {
  const spec = specs[id];
  const initial = useMemo(() => Object.fromEntries(spec.params.map((p) => [p.key, p.init])), [spec]);
  const [p, setP] = useState<P>(initial);
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);
  const sweep = spec.params.find((q) => q.role === "arbitrary")!;

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    let dir = 1;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setP((prev) => {
        let v = prev[sweep.key] + dir * dt * (sweep.max - sweep.min) * 0.18;
        if (v > sweep.max) { v = sweep.max; dir = -1; }
        if (v < sweep.min) { v = sweep.min; dir = 1; }
        return { ...prev, [sweep.key]: v };
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [playing, sweep]);

  const [x0, x1] = spec.x, [y0, y1] = spec.y;
  const sx = (v: number) => ((v - x0) / (x1 - x0)) * W;
  const sy = (v: number) => W - ((v - y0) / (y1 - y0)) * W;
  const d = (c: Curve) =>
    c.filter(([a, b]) => isFinite(a) && isFinite(b)).map(([a, b], i) => `${i ? "L" : "M"}${sx(a).toFixed(1)} ${sy(b).toFixed(1)}`).join(" ");

  const clipId = `clip-${id}`;
  const ticks = (a: number, b: number) => Array.from({ length: Math.floor(b) - Math.ceil(a) + 1 }, (_, i) => Math.ceil(a) + i);

  return (
    <div className={compact ? "" : "grid gap-5 sm:grid-cols-[minmax(0,320px)_1fr] items-start"}>
      <figure className="m-0">
        <svg viewBox={`0 0 ${W} ${W}`} className="w-full h-auto rounded-xl border border-line bg-paper-raised" role="img" aria-label="Interactive family of curves">
          <defs><clipPath id={clipId}><rect width={W} height={W} rx="12" /></clipPath></defs>
          <g clipPath={`url(#${clipId})`}>
            {ticks(x0, x1).map((t) => <line key={"x" + t} x1={sx(t)} x2={sx(t)} y1={0} y2={W} stroke="var(--line)" strokeWidth={t === 0 ? 0 : 0.6} />)}
            {ticks(y0, y1).map((t) => <line key={"y" + t} y1={sy(t)} y2={sy(t)} x1={0} x2={W} stroke="var(--line)" strokeWidth={t === 0 ? 0 : 0.6} />)}
            <line x1={0} x2={W} y1={sy(0)} y2={sy(0)} stroke="var(--ink-faint)" strokeWidth={1.2} />
            <line y1={0} y2={W} x1={sx(0)} x2={sx(0)} stroke="var(--ink-faint)" strokeWidth={1.2} />
            <text x={W - 12} y={sy(0) - 6} fontSize="11" fill="var(--ink-faint)" fontStyle="italic">x</text>
            <text x={sx(0) + 6} y={13} fontSize="11" fill="var(--ink-faint)" fontStyle="italic">y</text>
            {spec.guides?.(p).map((c, i) => <path key={"g" + i} d={d(c)} fill="none" stroke="var(--ink-faint)" strokeDasharray="4 4" strokeWidth={1.2} />)}
            {spec.family(p).map((c, i) => <path key={"f" + i} d={d(c)} fill="none" stroke="var(--red)" strokeOpacity={0.22} strokeWidth={1.4} />)}
            {spec.main(p).map((c, i) => <path key={"m" + i} d={d(c)} fill="none" stroke="var(--red)" strokeWidth={2.6} strokeLinecap="round" />)}
            {spec.dots?.(p).map(([a, b], i) => <circle key={"d" + i} cx={sx(a)} cy={sy(b)} r={4} fill={i === 0 ? "var(--red-deep)" : "var(--gold)"} stroke="var(--paper-raised)" strokeWidth={1.5} />)}
          </g>
        </svg>
        <figcaption className="mt-2 font-mono text-[11px] text-ink-muted break-words">{spec.equation(p)}</figcaption>
      </figure>

      {!compact && (
        <div className="space-y-4">
          <p className="text-sm text-ink-muted leading-relaxed">{spec.lesson}</p>
          {spec.params.map((q) => (
            <label key={q.key} className="block">
              <span className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-ink">{q.label}</span>
                <span className="flex items-center gap-2">
                  <span className={`eyebrow !text-[10px] px-1.5 py-0.5 rounded ${q.role === "fixed" ? "bg-gold-soft text-gold" : "bg-rose text-red-ink"}`}>
                    {q.role === "fixed" ? "fixed · stays in DE" : "arbitrary · eliminated"}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-ink-muted w-10 text-right">{f(p[q.key], q.step < 1 ? 2 : 0)}</span>
                </span>
              </span>
              <input
                type="range" min={q.min} max={q.max} step={q.step} value={p[q.key]}
                onChange={(e) => { setPlaying(false); setP({ ...p, [q.key]: Number(e.target.value) }); }}
                className="w-full mt-1.5"
              />
            </label>
          ))}
          <div className="flex gap-2">
            <button onClick={() => setPlaying((v) => !v)} className="inline-flex items-center gap-1.5 rounded-full bg-red text-paper px-3.5 py-1.5 text-sm font-medium hover:bg-red-deep transition-colors">
              {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "Pause" : `Animate ${sweep.label.split(" (")[0]}`}
            </button>
            <button onClick={() => { setPlaying(false); setP(initial); }} className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-1.5 text-sm text-ink-muted hover:text-ink hover:border-ink-faint transition-colors">
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
