import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Idea Management",
  description: "Manage ideas, projects, kanban boards, whiteboards, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
