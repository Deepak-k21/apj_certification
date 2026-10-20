import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APJ Certification — Training & Registration",
  description: "Management systems, auditing and workplace safety training with APJ Certification.",
  icons: {
    icon: "/wp-content/uploads/2022/12/favicon.png",
    shortcut: "/wp-content/uploads/2022/12/favicon.png",
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
