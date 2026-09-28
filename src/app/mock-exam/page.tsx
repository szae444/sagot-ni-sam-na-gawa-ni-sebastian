import type { Metadata } from "next";
import { MockExam } from "@/components/mock-exam";

export const metadata: Metadata = { title: "Mock Exam · Sagot ni Sam" };

export default function Page() {
  return <MockExam />;
}
