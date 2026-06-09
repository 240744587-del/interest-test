import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "探路者",
  description: "兴趣与方向探索工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
