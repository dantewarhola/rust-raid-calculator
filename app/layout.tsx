import type { Metadata, Viewport } from "next";
import { Oswald, Roboto_Condensed } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "600", "700"],
});

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-condensed",
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Rust Raid Calculator",
  description:
    "Plan raids, calculate explosive costs, and optimize sulfur efficiency for the game Rust. Raid cost calculator, explosive crafting optimizer, and soft-side raiding reference.",
};

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${robotoCondensed.variable}`}>
      <body>
        <div className="noise-overlay" aria-hidden />
        {children}
      </body>
    </html>
  );
}
