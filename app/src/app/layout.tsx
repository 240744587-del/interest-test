import type { Metadata } from "next";
import { ResultProvider } from "@/components/assessment/ResultStore";
import "./globals.css";

export const metadata: Metadata = {
  title: "探路者 — 兴趣探索与职业方向启蒙测评",
  description: "基于霍兰德、荣格、加德纳、舒伯等理论，帮助你发现兴趣种子和能力倾向",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <ResultProvider>{children}</ResultProvider>
      </body>
    </html>
  );
}
