// file: app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Import Inter from next/font/google
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dell'Arte International Alumni",
  description: "Alumni Database and Network",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      {/* Apply the font class to the <html> or <body> tag */}
      <html lang="en" className={inter.className}>
        <body>
          {/* Your header and other layout components would go here */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}