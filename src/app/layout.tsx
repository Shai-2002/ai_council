import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Roles Workspace",
  description: "Your boardroom. Five executives. Zero yes-men.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value || 'system';
  const isDark = theme === 'dark';

  return (
    <html lang="en" className={isDark ? 'dark' : ''}>
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
        {/* Prevent theme flash — runs before any rendering */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var t = document.cookie.match(/theme=([^;]+)/);
            var theme = t ? t[1] : localStorage.getItem('theme') || 'system';
            if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          })();
        `}} />
      </head>
      <body className={`${inter.className} min-h-screen antialiased bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50`}>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
