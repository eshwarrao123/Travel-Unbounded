import type { Metadata } from "next";
import "./globals.css";
import PublicShell from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "Travel Unbounded - Extraordinary Journeys Await",
  description: "Discover curated travel experiences crafted by experts. From Iceland to Patagonia, explore destinations that transform the way you see the world.",
  keywords: "travel, luxury travel, bespoke journeys, curated experiences, adventure travel, cultural immersion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#fafaf9] text-stone-900 antialiased selection:bg-[#0f4c3a]/15 selection:text-[#0f4c3a]">
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}
