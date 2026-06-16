import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loop Engineering Demo",
  description: "Autonomous loop builds this feature until TASK.md is satisfied.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
