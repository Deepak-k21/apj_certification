import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APJ Certification — Training & Registration",
  description: "Management systems, auditing and workplace safety training with APJ Certification.",
  icons: {
    icon: "/brand/favicon.svg",
    shortcut: "/brand/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
