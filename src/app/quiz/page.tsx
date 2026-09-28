import type { Metadata } from "next";
import { Quiz } from "@/components/quiz";

export const metadata: Metadata = { title: "Quiz · Sagot ni Sam" };

export default function Page() {
  return <Quiz />;
}
