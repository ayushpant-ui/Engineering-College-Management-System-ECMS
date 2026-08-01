import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import ThemeProvider from "@/providers/themeproviders";
import Footer from "@/components/modules/footer/Footer";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

import AppSidebar from "@/components/sidebar/AppSidebar";
import Navbar from "@/components/modules/navbar/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Engineering College Management System",
  description: "School of Engineering Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <ThemeProvider>

          <SidebarProvider>

            <AppSidebar />

            <SidebarInset>

              <Navbar />

              <main className="flex-1 p-6">
                {children}
              </main>
              <Footer />
            </SidebarInset>

          </SidebarProvider>

        </ThemeProvider>
      </body>
    </html>
  );
}