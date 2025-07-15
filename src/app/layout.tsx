"use client";
import { Inter } from "next/font/google";
import "./global.css"; // Consider using CSS modules for better performance
import { SoundProvider } from "@/hooks/useSounds";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <SoundProvider>
          {children}
        </SoundProvider>
      </body>
    </html>
  );
}