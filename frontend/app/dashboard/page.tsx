"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface Insights {
  activeMembers: number;
  waitlist: number;
  frozenMembers: number;
  dailyBookings: number;
  completedToday: number;
  openTabsRevenue: number;
  paidRevenue: number;
  totalMembers: number;
  totalStaff: number;
}

interface Appointment {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  notes: string;
  Member?: { name: string };
  Service?: { name: string; type: string; resourceRequired: string };
  Staff?: { name: string };
}

export default function Dashboard() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/insights`).then(r => r.json()).catch(() => null),
      fetch(`${API}/appointments`).then(r => r.json()).catch(() => []),
    ]).then(([ins, appts]) => {
      setInsights(ins);
      setAppointments(appts);
      setLoading(false);
    });
  }, []);

  const stats = [
    { label: "Active Members", value: insights?.activeMembers ?? "—", icon: "👥", color: "blue", glow: "glow-blue" },
    { label: "Today's Bookings", value: insights?.dailyBookings ?? "—", icon: "📅", color: "emerald", glow: "glow-emerald" },
    { label: "Open Tabs", value: insights?.openTabsRevenue ? `£${Number(insights.openTabsRevenue).toLocaleString()}` : "—", icon: "💳", color: "purple", glow: "glow-purple" },
    { label: "Waitlist", value: insights?.waitlist ?? "—", icon: "⏳", color: "amber", glow: "glow-amber" },
  ];

  const fmt = (d: string) => new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const upcomingAppts = appointments
    .filter(a => a.status === "Booked")
    .slice(0, 6);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="mb-10 pt-12 lg:pt-0">
        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-1">Dashboard</h1>
        <p className="text-slate-500 text-sm">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
        {stats.map((s, i) => (
          <div key={s.label} className={`glass ${s.glow} rounded-2xl p-5 lg:p-6 relative overflow-hidden animate-fade-in-up delay-${i + 1}`}>
            <div className="absolute -top-2 -right-2 text-5xl lg:text-6xl opacity-[0.06]">{s.icon}</div>
            <p className={`text-xs font-medium uppercase tracking-wider text-${s.color}-400 mb-1`}>{s.label}</p>
            <p className="text-3xl lg:text-4xl font-bold text-white">{loading ? "…" : s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 animate-fade-in-up delay-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-white">Today&apos;s Schedule</h3>
            <Link href="/schedule" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View All →</Link>
          </div>
          {loading ? (
            <div className="text-slate-600 text-sm py-8 text-center">Loading schedule…</div>
          ) : upcomingAppts.length === 0 ? (
            <div className="text-slate-600 text-sm py-8 text-center">No upcoming bookings today</div>
          ) : (
            <div className="space-y-3">
              {upcomingAppts.map((a) => (
                <div key={a.id} className="flex items-center gap-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] transition-colors">
                  <div className="text-center min-w-[52px]">
                    <p className="text-sm font-semibold text-white font-mono">{fmt(a.startTime)}</p>
                    <p className="text-[10px] text-slate-600">{fmt(a.endTime)}</p>
                  </div>
                  <div className="w-px h-8 bg-gradient-to-b from-blue-500/50 to-transparent" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{a.Service?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{a.Member?.name} • {a.Staff?.name}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hidden sm:inline">
                    {a.Service?.resourceRequired}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6 animate-fade-in-up delay-3">
            <h3 className="text-base font-semibold text-white mb-4">Revenue Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Paid Today</span>
                <span className="text-sm font-semibold text-emerald-400">£{insights?.paidRevenue ? Number(insights.paidRevenue).toLocaleString() : "0"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Open Tabs</span>
                <span className="text-sm font-semibold text-purple-400">£{insights?.openTabsRevenue ? Number(insights.openTabsRevenue).toLocaleString() : "0"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Completed Appts</span>
                <span className="text-sm font-semibold text-blue-400">{insights?.completedToday ?? 0}</span>
              </div>
              <div className="h-px bg-white/5 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Total Staff</span>
                <span className="text-sm font-semibold text-white">{insights?.totalStaff ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Frozen Members</span>
                <span className="text-sm font-semibold text-blue-400">{insights?.frozenMembers ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 animate-fade-in-up delay-4">
            <h3 className="text-base font-semibold text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/members" className="block w-full text-left text-sm text-slate-400 hover:text-white hover:bg-white/5 p-2.5 rounded-lg transition-all">+ New Member</Link>
              <Link href="/schedule" className="block w-full text-left text-sm text-slate-400 hover:text-white hover:bg-white/5 p-2.5 rounded-lg transition-all">+ New Booking</Link>
              <Link href="/billing" className="block w-full text-left text-sm text-slate-400 hover:text-white hover:bg-white/5 p-2.5 rounded-lg transition-all">+ POS Order</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
