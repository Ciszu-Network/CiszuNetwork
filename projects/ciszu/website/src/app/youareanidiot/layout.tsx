import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "You are an idiot",
  robots: { index: false, follow: false, nocache: true },
};

export default function YouAreAnIdiotLayout({ children }: { children: React.ReactNode }) {
  return children;
}