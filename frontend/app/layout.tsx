"use client";

import { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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

  useEffect(() => {
    setMounted(true);
    const auth = localStorage.getItem("club_os_auth");
    if (auth === "TRAMP2026") setAuthorized(true);
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

  if (!mounted) return null; // Avoid hydration mismatch

  if (!authorized) {
    return (
      <html lang="en" className="dark">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0f172a] text-slate-50 flex items-center justify-center min-h-screen`}>
          <form onSubmit={handleLogin} className="glass p-8 rounded-2xl w-full max-w-sm text-center border border-white/10 shadow-2xl shadow-blue-900/20">
            <div className="mb-8">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-3xl text-white mx-auto mb-4 shadow-lg shadow-blue-500/20">
                C
              </div>
              <h1 className="text-2xl font-bold text-white">Restricted Access</h1>
              <p className="text-slate-400 text-sm mt-1">Authorized Personnel Only</p>
            </div>
            
            <div className="space-y-4">
              <input 
                type="password" 
                placeholder="Enter Access Code" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20"
              >
                Unlock Dashboard
              </button>
            </div>
          </form>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0f172a] text-slate-50 flex overflow-hidden`}>
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black">
          {children}
        </main>
      </body>
    </html>
  );
}
