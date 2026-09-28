import type { ExamId, Item, Section } from "../types";
import { asset } from "../asset";
import { longTest } from "./long-test";
import { midterm } from "./midterm";

export const exams: Record<ExamId, { id: ExamId; slug: string; name: string; short: string; paper: string; blurb: string }> = {
  lt: {
    id: "lt",
    slug: "long-test",
    name: "Long Test",
    short: "LT",
    paper: asset("/papers/long-test.pdf"),
    blurb: "Order & degree, linearity, verifying solutions, eliminating constants, families of curves.",
  },
  me: {
    id: "me",
    slug: "midterm",
    name: "Midterm Exam",
    short: "ME",
    paper: asset("/papers/midterm.pdf"),
    blurb: "Everything in the long test, plus terminologies and solving first-order DEs.",
  },
};

export const sections: Section[] = [
  { exam: "lt", letter: "A", title: "Order & Degree", blurb: "Identify the order and degree (solve, if applicable)." },
  { exam: "lt", letter: "B", title: "Linear or Nonlinear", blurb: "State the reason for nonlinearity." },
  { exam: "lt", letter: "C", title: "Verify the Solutions", blurb: "Substitute and show LHS = RHS." },
  { exam: "lt", letter: "D", title: "Eliminate the Constants", blurb: "n constants → differentiate n times." },
  { exam: "lt", letter: "E", title: "Families of Curves", blurb: "Obtain the DE, with graphs." },
  { exam: "me", letter: "A", title: "DE Terminologies", blurb: "Compare and contrast, with examples." },
  { exam: "me", letter: "B", title: "Order & Degree", blurb: "Identify the order and degree (solve, if applicable)." },
  { exam: "me", letter: "C", title: "Verify the Solutions", blurb: "Laplace's equation and Bessel's function." },
  { exam: "me", letter: "D", title: "Eliminate the Constants", blurb: "n constants → differentiate n times." },
  { exam: "me", letter: "E", title: "Families of Curves", blurb: "Obtain the DE, with graphs." },
  { exam: "me", letter: "F", title: "Solve the DEs", blurb: "Separable, homogeneous, exact, linear, Bernoulli." },
];

export const allItems: Item[] = [...longTest, ...midterm];

export const itemsByExam = (exam: ExamId) => allItems.filter((i) => i.exam === exam);

export const sectionOf = (item: Item) =>
  sections.find((s) => s.exam === item.exam && s.letter === item.section)!;

export const itemLabel = (item: Item) => `${exams[item.exam].short} #${item.no}`;

export const itemHref = (item: Item) => `/${exams[item.exam].slug}/#${item.id}`;

export const examBySlug = (slug: string) => Object.values(exams).find((e) => e.slug === slug);
