import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stadium Tracker",
  description:
    "Tracke Stadionbesuche, historische Kapazitäten und deinen Fortschritt bei den größten Stadien der Welt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full bg-stone-100 text-slate-950">{children}</body>
    </html>
  );
}
