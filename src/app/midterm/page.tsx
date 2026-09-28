import type { Metadata } from "next";
import { ExamView } from "@/components/exam-view";

export const metadata: Metadata = { title: "Midterm · Sagot ni Sam" };

export default function Page() {
  return <ExamView exam="me" />;
}
