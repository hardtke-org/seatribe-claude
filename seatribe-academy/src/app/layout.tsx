import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SeaTribe Academy - Online Segelkurse",
  description: "Lerne Segeln mit unseren Online-Kursen. Live-Sessions und Video-Kurse von erfahrenen Seglern.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
