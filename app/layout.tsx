import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import { ClerkProvider } from "@clerk/nextjs";
import { Sidebar } from "@/components/sidebar";
import { Geist, Geist_Mono } from "next/font/google";
import { ConvexClientProvider } from "./convex-client-provider";
import { SidebarProvider } from "@/components/contexts/sidebar-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taskmate",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <SidebarProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                <Navbar />
                <ConvexClientProvider>
                  <main className="pl-2 md:pl-64 pt-14">{children}</main>
                </ConvexClientProvider>
              </div>
            </div>
          </body>
        </html>
      </SidebarProvider>
    </ClerkProvider>
  );
}
