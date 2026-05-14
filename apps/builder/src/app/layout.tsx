import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const BASE_URL = "https://forms.stayclever.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "CleverForms — Self-Optimizing Form Builder That Improves Completion Rates",
    template: "%s | CleverForms",
  },
  description:
    "CleverForms automatically tests question variants, detects drop-offs, and optimizes forms in real time to improve completion rates and reduce friction.",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "CleverForms",
    title: "CleverForms — Self-Optimizing Form Builder That Improves Completion Rates",
    description:
      "CleverForms automatically tests question variants, detects drop-offs, and optimizes forms in real time to improve completion rates and reduce friction.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CleverForms — Self-Optimizing Forms",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CleverForms — Self-Optimizing Form Builder That Improves Completion Rates",
    description:
      "CleverForms automatically tests question variants, detects drop-offs, and optimizes forms in real time to improve completion rates and reduce friction.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="GxG2RlbW8nKjmaSW60eNRM6OYOL_3coqLy-sL7NNswY" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap&font-display=swap"
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
