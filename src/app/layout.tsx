import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flint Dashboard",
  description: "Dashboard for the Flint household",
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
