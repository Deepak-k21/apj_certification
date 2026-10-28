import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APJ Certification — Training & Registration",
  description: "Management systems, auditing and workplace safety training with APJ Certification.",
  icons: {
    icon: "/brand/apj-official-logo.jpg",
    shortcut: "/brand/apj-official-logo.jpg",
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
