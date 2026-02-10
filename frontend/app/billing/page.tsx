"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface Order { id: number; total: number; status: string; items: string; paymentMethod: string; chargedAt: string; createdAt: string; Member?: { id: number; name: string }; }

export default function Billing() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetch(`${API}/orders`).then(r => r.json()).then(d => { setOrders(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

    const filtered = filter === "All" ? orders : orders.filter(o => o.status === filter);
    const tabTotal = orders.filter(o => o.status === "Tab").reduce((sum, o) => sum + Number(o.total), 0);
    const paidTotal = orders.filter(o => o.status === "Paid").reduce((sum, o) => sum + Number(o.total), 0);

    const statusBadge: Record<string, string> = { Paid: "badge-active", Tab: "badge-waitlist", Pending: "badge-pending" };
    const payMethodLabel: Record<string, string> = { Tab: "End-of-month tab", Card_Token: "Tokenised card", Cash: "Cash" };

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <header className="mb-8 pt-12 lg:pt-0">
                <h1 className="text-3xl font-bold text-white tracking-tight">Billing & Orders</h1>
                <p className="text-slate-500 text-sm">All transactions • Tokenised payments (no raw card data stored)</p>
            </header>

            {/* Revenue Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                <div className="glass rounded-2xl p-5 glow-purple">
                    <p className="text-xs text-purple-400 uppercase tracking-wider mb-1">Open Tabs</p>
                    <p className="text-2xl font-bold text-white">£{tabTotal.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-600 mt-1">{orders.filter(o => o.status === "Tab").length} pending charges</p>
                </div>
                <div className="glass rounded-2xl p-5 glow-emerald">
                    <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">Paid Today</p>
                    <p className="text-2xl font-bold text-white">£{paidTotal.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-600 mt-1">{orders.filter(o => o.status === "Paid").length} completed</p>
                </div>
                <div className="glass rounded-2xl p-5 glow-blue hidden sm:block">
                    <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-white">{orders.length}</p>
                    <p className="text-[10px] text-slate-600 mt-1">All time</p>
                </div>
            </div>

            {/* Charge Tabs CTA */}
            {tabTotal > 0 && (
                <div className="glass rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-purple-500/10">
                    <div>
                        <p className="text-sm text-white font-medium">£{tabTotal.toFixed(2)} in open tabs ready to charge</p>
                        <p className="text-xs text-slate-500">Charges will be processed against member payment tokens</p>
                    </div>
                    <button className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-purple-500/20 whitespace-nowrap">
                        Charge All Tabs (Demo)
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
                {["All", "Tab", "Paid", "Pending"].map(s => (
                    <button key={s} onClick={() => setFilter(s)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${filter === s ? "bg-blue-500/15 text-blue-400 border border-blue-500/20" : "text-slate-500 hover:text-slate-300 bg-white/[0.02] border border-white/[0.04]"}`}>
                        {s}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="border-b border-white/5">
                            <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Order</th>
                            <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Member</th>
                            <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Items</th>
                            <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Payment</th>
                            <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Amount</th>
                        </tr></thead>
                        <tbody>
                            {filtered.map(o => {
                                const items = JSON.parse(o.items || "[]");
                                return (
                                    <tr key={o.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 text-sm text-slate-400 font-mono">ORD-{String(o.id).padStart(4, "0")}</td>
                                        <td className="p-4"><Link href={`/members/${o.Member?.id}`} className="text-sm text-white hover:text-blue-400 transition-colors">{o.Member?.name || "Unknown"}</Link></td>
                                        <td className="p-4 text-xs text-slate-500 max-w-[200px] truncate">{items.map((i: any) => `${i.name} ×${i.qty}`).join(", ")}</td>
                                        <td className="p-4 text-xs text-slate-400">{payMethodLabel[o.paymentMethod] || o.paymentMethod}</td>
                                        <td className="p-4"><span className={`badge ${statusBadge[o.status] || "badge-pending"}`}>{o.status}</span></td>
                                        <td className="p-4 text-right text-sm font-semibold text-white">£{Number(o.total).toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-white/[0.04]">
                    {filtered.map(o => {
                        const items = JSON.parse(o.items || "[]");
                        return (
                            <div key={o.id} className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-white">{o.Member?.name || "Unknown"}</span>
                                    <span className="text-sm font-bold text-white">£{Number(o.total).toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-2 truncate">{items.map((i: any) => i.name).join(", ")}</p>
                                <div className="flex items-center justify-between">
                                    <span className={`badge ${statusBadge[o.status] || "badge-pending"}`}>{o.status}</span>
                                    <span className="text-[10px] text-slate-600">{payMethodLabel[o.paymentMethod] || ""}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {filtered.length === 0 && <p className="p-8 text-center text-slate-600 text-sm">{loading ? "Loading…" : "No orders found"}</p>}
            </div>

            <div className="mt-6 p-4 glass rounded-xl border border-blue-500/10">
                <p className="text-xs text-blue-400/70">🔒 All payments are tokenised through Stripe / GoCardless. No raw card data is stored in Club OS. PCI-DSS compliant.</p>
            </div>
        </div>
    );
}
