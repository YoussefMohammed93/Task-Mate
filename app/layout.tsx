import "./globals.css";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarProvider } from "@/components/contexts/sidebar-context";
import { ConvexClientProvider } from "@/components/providers/convex-provider";

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
    <ConvexClientProvider>
      <SidebarProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                <Navbar />
                <main className="md:pl-80 pt-16">{children}</main>
              </div>
            </div>
            <Toaster position="bottom-right" />
          </body>
        </html>
      </SidebarProvider>
    </ConvexClientProvider>
  );
}
