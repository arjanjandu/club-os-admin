"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [stats, setStats] = useState({ members: 0, products: 0, invoices: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [mRes, pRes, iRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/members`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`)
        ]);
        const members: any[] = await mRes.json();
        const products: any[] = await pRes.json();
        const invoices: any[] = await iRes.json();
        setStats({
          members: members.length || 0,
          products: products.length || 0,
          invoices: invoices.length || 0
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">
          Dashboard
        </h1>
        <p className="text-slate-400">Overview of your club's performance.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Members Card */}
        <div className="glass p-8 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-9xl">👥</span>
          </div>
          <h2 className="text-sm font-medium text-blue-400 uppercase tracking-wider mb-1">Total Members</h2>
          <p className="text-5xl font-bold text-white mb-8">{stats.members}</p>
          <Link href="/members" className="inline-flex items-center text-sm text-slate-300 hover:text-white transition-colors group-hover:translate-x-1 duration-300">
            Manage Members <span className="ml-2">&rarr;</span>
          </Link>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent opacity-50" />
        </div>

        {/* Products Card */}
        <div className="glass p-8 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-9xl">💎</span>
          </div>
          <h2 className="text-sm font-medium text-emerald-400 uppercase tracking-wider mb-1">Active Services</h2>
          <p className="text-5xl font-bold text-white mb-8">{stats.products}</p>
          <Link href="/products" className="inline-flex items-center text-sm text-slate-300 hover:text-white transition-colors group-hover:translate-x-1 duration-300">
            Configure Services <span className="ml-2">&rarr;</span>
          </Link>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-50" />
        </div>

        {/* Invoices Card */}
        <div className="glass p-8 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-9xl">💳</span>
          </div>
          <h2 className="text-sm font-medium text-purple-400 uppercase tracking-wider mb-1">Invoices</h2>
          <p className="text-5xl font-bold text-white mb-8">{stats.invoices}</p>
          <Link href="/invoices" className="inline-flex items-center text-sm text-slate-300 hover:text-white transition-colors group-hover:translate-x-1 duration-300">
            View Billing <span className="ml-2">&rarr;</span>
          </Link>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-transparent opacity-50" />
        </div>
      </div>

      {/* Quick Actions / Activity Feed Placeholder */}
      <div className="mt-12 glass rounded-2xl p-8">
        <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              <div className="flex-1">
                <p className="text-sm text-slate-200">System check completed successfully.</p>
                <p className="text-xs text-slate-500">Just now</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
