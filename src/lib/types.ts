export type ExamId = "lt" | "me";

export type Kind =
  | "order"
  | "linear"
  | "verify"
  | "eliminate"
  | "family"
  | "terms"
  | "solve";

export type Method = "Separable" | "Homogeneous" | "Exact" | "Linear" | "Bernoulli";

export type GraphId =
  | "lt22"
  | "lt23"
  | "lt24"
  | "lt25"
  | "me25"
  | "me26"
  | "me27"
  | "me28"
  | "me29"
  | "me30";

export interface Compare {
  cols: { title: string; points: string[] }[];
  example: string;
  similarity: string;
}

/**
 * All text fields are "rich" strings:
 *   $...$   inline math     $$...$$ display math
 *   **bold**   *italic*
 */
export interface Item {
  id: string;
  exam: ExamId;
  no: string;
  section: string;
  kind: Kind;
  method?: Method;
  /** plain-language title used in lists and search */
  title: string;
  prompt: string;
  note?: string;
  steps: string[];
  answer: string;
  /** one-line answer used by flashcards, quiz and answer key */
  short: string;
  tip?: string;
  graph?: GraphId;
  compare?: Compare;
}

export interface Section {
  exam: ExamId;
  letter: string;
  title: string;
  blurb: string;
}
