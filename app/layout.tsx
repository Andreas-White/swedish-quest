import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Swedish Quest",
  description: "From 0 to 100 in Swedish — 20 chapters, strict progression, prototype scoring kept.",
};

// Set theme+mode before paint to avoid flash (defaults: abyss + auto).
const initScript = `(function(){try{var t=localStorage.getItem("sq-theme"),m=localStorage.getItem("sq-mode");var ok=["abyss","ember","lagoon","dawn"];if(ok.indexOf(t)<0)t="abyss";if(["light","dark","auto"].indexOf(m)<0)m="auto";var r=document.documentElement;r.dataset.theme=t;r.dataset.mode=m==="auto"?(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):m;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="abyss" data-mode="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
      </head>
      <body>
        <ThemeProvider>
          <main>
            <SiteHeader />
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
