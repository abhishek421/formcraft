import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "FormCraft",
  description: "AI-native form builder for modern teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        {/* Prevent flash: set theme before paint */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var el = document.documentElement;
            var t  = localStorage.getItem('fc-theme')   || 'lavender';
            var m  = localStorage.getItem('fc-mode')    || 'dark';
            var r  = localStorage.getItem('fc-radius')  || '';
            var d  = localStorage.getItem('fc-density') || '';
            var mo = localStorage.getItem('fc-motion');
            el.setAttribute('data-theme',   t + '-' + m);
            if (r && r !== 'sharp')   el.setAttribute('data-radius',  r);
            if (d && d !== 'default') el.setAttribute('data-density', d);
            if (mo === 'false')       el.setAttribute('data-motion',  'off');
          })()
        `}} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
