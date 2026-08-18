import type { Metadata } from "next";
import HomeContent from "@/components/home/HomeContent";

export const metadata: Metadata = {
  title: "Ciszuko Antony | HOME",
  description: "Official portfolio of Ciszuko Antony (Francisco Garcia Antonio M. / y8) — Innovation, development and technology.",
};

export default function Home() {
  return <HomeContent />;
}