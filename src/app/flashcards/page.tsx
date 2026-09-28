import type { Metadata } from "next";
import { Flashcards } from "@/components/flashcards";

export const metadata: Metadata = { title: "Flashcards · Sagot ni Sam" };

export default function Page() {
  return <Flashcards />;
}
