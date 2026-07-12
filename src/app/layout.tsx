import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TransitOps — Smart Transport Operations Platform",
  description: "Enterprise ERP for transport operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex min-h-screen antialiased selection:bg-primary/30`}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-6 overflow-auto bg-background/50">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
