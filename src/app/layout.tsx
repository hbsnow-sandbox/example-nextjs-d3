import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "example-nextjs-d3",
  description: "Next.jsとD3のサンプル",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
