import type { Metadata } from "next";
import { Papers } from "@/components/papers";

export const metadata: Metadata = { title: "Papers · Sagot ni Sam" };

export default function Page() {
  return <Papers />;
}
