import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ideamgmt.app";

export const metadata: Metadata = {
  title: {
    default: "Idea Management — Organize Ideas, Projects & Schemas",
    template: "%s | Idea Management",
  },
  description: "All-in-one idea management app with AI chat, kanban boards, whiteboards, schema planners, and project dashboards. Built for teams and solo creators.",
  keywords: ["idea management", "project management", "kanban", "whiteboard", "schema planner", "AI chat", "brainstorming"],
  authors: [{ name: "Idea Management Team" }],
  creator: "Idea Management",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Idea Management",
    title: "Idea Management — Organize Ideas, Projects & Schemas",
    description: "All-in-one idea management app with AI chat, kanban boards, whiteboards, schema planners, and project dashboards.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Idea Management",
    description: "Organize ideas, projects, and schemas with AI-powered tools.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Idea Management",
              description: "All-in-one idea management app with AI chat, kanban boards, whiteboards, schema planners, and project dashboards.",
              url: siteUrl,
              applicationCategory: "ProductivityApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "Free tier available with Local AI",
              },
            }),
          }}
        />
      </head>
      <body className="bg-creamy-milk text-signal-black font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
