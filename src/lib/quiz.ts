import type { ExamId, Item, Method } from "./types";
import { allItems } from "./data";

export interface Question {
  key: string;
  item: Item;
  ask: string;
  choices: string[];
  correct: number;
  type: "answer" | "method";
}

const rand = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
export const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

function pack(item: Item, ask: string, correct: string, distractors: string[], type: Question["type"] = "answer"): Question {
  const uniq = Array.from(new Set(distractors.filter((d) => d !== correct)));
  const picks = shuffle(uniq).slice(0, 3);
  const choices = shuffle([correct, ...picks]);
  return { key: `${item.id}-${type}`, item, ask, choices, correct: choices.indexOf(correct), type };
}

function orderDistractors(short: string) {
  const pde = short.startsWith("PDE");
  const m = short.match(/Order (\d+), Degree (\d+)/)!;
  const o = +m[1], d = +m[2];
  const out: string[] = [];
  const fmt = (oo: number, dd: number, p = pde) => `${p ? "PDE, " : ""}Order ${oo}, Degree ${dd}`;
  out.push(fmt(d, o), fmt(o, d + 1), fmt(o + 1, d), fmt(Math.max(1, o - 1), d), fmt(o, Math.max(1, d * 2)));
  if (pde) out.push(fmt(o, d, false).replace(/^/, "ODE, "));
  return out.filter((x) => x !== short);
}

export function questionsFor(item: Item): Question[] {
  const same = allItems.filter((i) => i.kind === item.kind && i.id !== item.id).map((i) => i.short);
  switch (item.kind) {
    case "order":
      return [pack(item, "What is the order and degree?", item.short, orderDistractors(item.short))];
    case "linear": {
      const lin = item.short.startsWith("Linear");
      const choices = ["Linear", "Nonlinear"];
      return [{ key: item.id, item, ask: "Linear or nonlinear?", choices, correct: lin ? 0 : 1, type: "answer" }];
    }
    case "verify": {
      const yes = /^(Yes|Verified)/.test(item.short);
      const choices = ["Yes, it is a solution", "No, it is not a solution"];
      return [{ key: item.id, item, ask: "Is it a solution (as printed)?", choices, correct: yes ? 0 : 1, type: "answer" }];
    }
    case "terms":
      return [pack(item, `Which statement matches “${item.title}”?`, item.short, same)];
    case "eliminate":
      return [pack(item, "Which DE is obtained after eliminating the arbitrary constants?", item.short, same)];
    case "family":
      return [pack(item, "Which is the DE of this family of curves?", item.short, same)];
    case "solve": {
      const methods: Method[] = ["Separable", "Homogeneous", "Exact", "Linear", "Bernoulli"];
      return [
        pack(item, "Which method fits this DE best?", item.method!, methods.filter((m) => m !== item.method), "method"),
        pack(item, "Which is the solution?", item.short, same),
      ];
    }
  }
}

export function buildQuiz(exam: ExamId | "both", count: number, withMethod: boolean): Question[] {
  const pool = allItems
    .filter((i) => exam === "both" || i.exam === exam)
    .flatMap(questionsFor)
    .filter((q) => withMethod || q.type !== "method");
  return shuffle(pool).slice(0, count);
}

export const pick = rand;
