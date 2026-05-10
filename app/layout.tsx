import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import { ThemeProvider } from "@/lib/themeContext";

export const metadata: Metadata = {
  title: {
    default: "SudokuMind — The Intelligent Sudoku Platform",
    template: "%s | SudokuMind",
  },
  description:
    "Real-time multiplayer Sudoku with AI coaching, daily challenges, friend system, and global leaderboards. Play solo or co-op — the smartest Sudoku platform on the web.",
  keywords: ["sudoku", "multiplayer", "co-op", "puzzle", "brain training", "daily challenge", "leaderboard", "AI coach"],
  authors: [{ name: "SudokuMind" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "SudokuMind — Multiplayer Sudoku Platform",
    description: "Play together. Solve smarter. Compete globally.",
    siteName: "SudokuMind",
  },
  twitter: {
    card: "summary_large_image",
    title: "SudokuMind",
    description: "Sudoku. Multiplied.",
  },
  robots: { index: true, follow: true },
  themeColor: "#07070f",
  viewport: { width: "device-width", initialScale: 1, maximumScale: 1 },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem('sudokumind-theme');
              if (!t) t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
              document.documentElement.setAttribute('data-theme', t);
            } catch(e) {
              document.documentElement.setAttribute('data-theme', 'dark');
            }
          })();
        `}} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
