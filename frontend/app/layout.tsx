"use client";

import { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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

  if (!mounted) return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0e1a] text-slate-50`} />
    </html>
  );

  if (!authorized) {
    return (
      <html lang="en" className="dark">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0e1a] text-slate-50 flex items-center justify-center min-h-screen`}>
          <form onSubmit={handleLogin} className="glass p-10 rounded-3xl w-full max-w-sm text-center mx-4">
            <div className="mb-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center font-bold text-4xl text-white mx-auto mb-5 shadow-lg shadow-blue-500/30">
                T
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Tramp Health</h1>
              <p className="text-slate-500 text-sm mt-1">Club Operations System</p>
            </div>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Enter Access Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all text-center tracking-[0.3em] font-mono"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20"
              >
                Unlock Dashboard
              </button>
            </div>
            <p className="text-slate-600 text-xs mt-8">Authorised Personnel Only • Encrypted Session</p>
          </form>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0e1a] text-slate-50`}>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="lg:ml-64 min-h-screen bg-[#0a0e1a]">
          {children}
        </main>
      </body>
    </html>
  );
}
