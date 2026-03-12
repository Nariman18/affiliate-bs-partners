import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./components/Providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "CasAffiliate | iGaming Affiliate Management",
  description: "Minimalist affiliate management system for iGaming partners.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}

          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "rgba(24, 24, 27, 0.8)", // bg-zinc-900/80
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#fff",
                borderRadius: "1rem",
              },
              className: "tracking-tight shadow-2xl",
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
