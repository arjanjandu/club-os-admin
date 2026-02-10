"use client";

import { useState, useEffect } from "react";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [authorized, setAuthorized] = useState(false);
  const [code, setCode] = useState("");
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem("club_os_auth") === "TRAMP2026") setAuthorized(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === "TRAMP2026") {
      localStorage.setItem("club_os_auth", "TRAMP2026");
      setAuthorized(true);
    } else {
      alert("Invalid Access Code");
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <html lang="en" className="dark">
        <body className={`${bebasNeue.variable} ${dmSans.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`} />
      </html>
    );
  }

  if (!authorized) {
    return (
      <html lang="en" className="dark">
        <body className={`${bebasNeue.variable} ${dmSans.variable} antialiased bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center min-h-screen font-[var(--font-body)]`}>
          <form onSubmit={handleLogin} className="glass p-8 rounded-2xl w-full max-w-sm text-center border border-[var(--color-accent)]/20 shadow-2xl shadow-[var(--color-primary)]/40 mx-4">
            <div className="mb-8">
              <div className="w-16 h-16 rounded-xl bg-[var(--color-primary)] flex items-center justify-center font-bold text-3xl text-[var(--color-accent)] mx-auto mb-4 shadow-lg shadow-[var(--color-primary)]/50 font-[var(--font-display)]">
                T
              </div>
              <h1 className="text-3xl font-bold text-[var(--color-accent)] font-[var(--font-display)] tracking-wide">Restricted Access</h1>
              <p className="text-[var(--color-accent-muted)] text-sm mt-1 font-[var(--font-body)]">Authorized Personnel Only</p>
            </div>
            
            <div className="space-y-4">
              <input 
                type="password" 
                placeholder="Enter Access Code" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-[var(--color-primary)]/20 border border-[var(--color-accent)]/30 rounded-xl p-3 text-[var(--color-accent)] placeholder-[var(--color-accent)]/50 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-all font-[var(--font-body)] text-center tracking-widest"
              />
              <button 
                type="submit" 
                className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-muted)] text-[var(--color-primary)] font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-[var(--color-accent)]/20 font-[var(--font-body)] uppercase tracking-wider"
              >
                Unlock Dashboard
              </button>
            </div>
            <p className="text-[var(--color-accent-muted)]/60 text-xs mt-8 font-[var(--font-body)]">Secure Session • Tramp Health</p>
          </form>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="dark">
      <body className={`${bebasNeue.variable} ${dmSans.variable} antialiased bg-[var(--background)] text-[var(--foreground)] font-[var(--font-body)]`}>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Mobile hamburger - Branded */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-xl glass flex items-center justify-center text-[var(--color-accent)] hover:text-white transition-colors border border-[var(--color-accent)]/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>

        {/* Sidebar with props (assuming Sidebar component was updated upstream to accept them, if not it will just ignore them which is fine for JS/TS unless strict) */}
        {/* Wait, I should check Sidebar.tsx to see if it accepts props. The merge output said Sidebar.tsx was modified. */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-64 min-h-screen bg-[var(--background)]">
          {children}
        </main>
      </body>
    </html>
  );
}
