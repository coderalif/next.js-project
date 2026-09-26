import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitLog | Train with intent",
  description: "A focused workout library and daily training log.",
};

// The root layout provides global styles and the document shell for every route.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}