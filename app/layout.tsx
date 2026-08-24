import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";

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
      <body className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}

