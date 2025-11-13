import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QOTE Middleware",
  description: "Central nervous system for QOTE-aware applications",
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
