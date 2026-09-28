import type { Metadata } from "next";
import { ExamView } from "@/components/exam-view";

export const metadata: Metadata = { title: "Long Test · Sagot ni Sam" };

export default function Page() {
  return <ExamView exam="lt" />;
}
