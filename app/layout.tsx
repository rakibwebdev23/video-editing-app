import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import StateSyncProvider from "@/components/providers/StateSyncProvider";

export const metadata: Metadata = {
  title: "Video Creator — Professional Video Editor",
  description: "Create stunning videos with drag-and-drop media, animations, and real-time timeline editing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }} suppressHydrationWarning>
        <ReduxProvider>
          <StateSyncProvider>
            {children}
          </StateSyncProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
