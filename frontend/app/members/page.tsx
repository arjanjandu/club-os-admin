"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface Member {
  id: number; name: string; email: string; phone: string; status: string;
  tier: string; joinDate: string; subscriptionType: string; monthlyRate: number;
  Subscription?: { type: string; amount: number; status: string; nextBillingDate: string };
}

const statusBadge: Record<string, string> = {
  Active: "badge-active", Waitlist: "badge-waitlist", Frozen: "badge-frozen",
  Banned: "badge-banned", Pending_Approval: "badge-pending",
};

const tierColors: Record<string, string> = {
  Founding: "text-amber-400", Standard: "text-slate-300", Corporate: "text-blue-400", Medical_Only: "text-purple-400",
};

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", phone: "", tier: "Standard", status: "Waitlist", subscriptionType: "Monthly", monthlyRate: 350 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API}/members`);
      setMembers(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAdd = async () => {
    try {
      const res = await fetch(`${API}/members`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newMember) });
      if (res.ok) { setShowAddModal(false); setNewMember({ name: "", email: "", phone: "", tier: "Standard", status: "Waitlist", subscriptionType: "Monthly", monthlyRate: 350 }); fetchMembers(); }
    } catch (e) { console.error(e); }
  };

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="mb-8 pt-12 lg:pt-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Members</h1>
          <p className="text-slate-500 text-sm">{members.length} total • {members.filter(m => m.status === "Active").length} active</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
          + Add Member
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/30"
        />
        <div className="flex gap-2 overflow-x-auto">
          {["All", "Active", "Waitlist", "Frozen", "Banned"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${filterStatus === s ? "bg-blue-500/15 text-blue-400 border border-blue-500/20" : "text-slate-500 hover:text-slate-300 bg-white/[0.02] border border-white/[0.04]"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table / Cards */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Member</th>
                <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Tier</th>
                <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Subscription</th>
                <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Monthly</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="p-4">
                    <Link href={`/members/${m.id}`} className="block">
                      <p className="text-sm font-medium text-white">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.email}</p>
                    </Link>
                  </td>
                  <td className="p-4"><span className={`text-xs font-medium ${tierColors[m.tier] || "text-slate-400"}`}>{m.tier?.replace("_", " ")}</span></td>
                  <td className="p-4"><span className={`badge ${statusBadge[m.status] || "badge-pending"}`}>{m.status?.replace("_", " ")}</span></td>
                  <td className="p-4"><span className="text-xs text-slate-400">{m.subscriptionType}</span></td>
                  <td className="p-4 text-right"><span className="text-sm font-semibold text-white">£{Number(m.monthlyRate || 0).toFixed(0)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-white/[0.04]">
          {filtered.map(m => (
            <Link key={m.id} href={`/members/${m.id}`} className="block p-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-medium text-white">{m.name}</p>
                <span className={`badge ${statusBadge[m.status] || "badge-pending"}`}>{m.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${tierColors[m.tier] || "text-slate-400"}`}>{m.tier?.replace("_", " ")}</span>
                <span className="text-xs text-slate-500">£{Number(m.monthlyRate || 0).toFixed(0)}/mo</span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && <p className="p-8 text-center text-slate-600 text-sm">{loading ? "Loading…" : "No members found"}</p>}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h2 className="text-lg font-bold text-white mb-6">New Member</h2>
            <div className="space-y-4">
              {[
                { label: "Full Name", key: "name", type: "text", placeholder: "e.g. Victoria Ashworth" },
                { label: "Email", key: "email", type: "email", placeholder: "victoria@email.com" },
                { label: "Phone", key: "phone", type: "tel", placeholder: "+44 7700 000000" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">{f.label}</label>
                  <input type={f.type} value={(newMember as any)[f.key]} onChange={e => setNewMember({ ...newMember, [f.key]: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40" placeholder={f.placeholder} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Tier</label>
                  <select value={newMember.tier} onChange={e => setNewMember({ ...newMember, tier: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/40">
                    <option value="Standard">Standard</option><option value="Founding">Founding</option><option value="Corporate">Corporate</option><option value="Medical_Only">Medical Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Billing</label>
                  <select value={newMember.subscriptionType} onChange={e => setNewMember({ ...newMember, subscriptionType: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/40">
                    <option value="Monthly">Monthly</option><option value="Annual">Annual</option><option value="Pay_As_You_Go">Pay As You Go</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleAdd} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-colors">Create Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
