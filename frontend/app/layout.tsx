import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeInvest — Get roasted before you get rejected",
  description:
    "AI boardroom for Pakistan's next generation of founders. Four agents tear into your startup idea and deliver an Aura Score out of 1000.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg-base text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
