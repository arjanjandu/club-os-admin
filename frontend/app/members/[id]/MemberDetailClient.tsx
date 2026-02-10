"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface MemberDetail {
    id: number; name: string; email: string; phone: string; status: string;
    tier: string; joinDate: string; subscriptionType: string; monthlyRate: number;
    emergencyContact: string; notes: string;
    stripe_customer_id: string; gocardless_mandate_id: string;
    Appointments: any[]; Orders: any[]; MedicalRecords: any[]; MemberNotes: any[];
    Subscription: { type: string; amount: number; status: string; nextBillingDate: string } | null;
}

const statusBadge: Record<string, string> = { Active: "badge-active", Waitlist: "badge-waitlist", Frozen: "badge-frozen", Banned: "badge-banned", Pending_Approval: "badge-pending" };
const catColors: Record<string, string> = { General: "bg-slate-500/10 text-slate-400 border-slate-500/20", Medical: "bg-red-500/10 text-red-400 border-red-500/20", Billing: "bg-purple-500/10 text-purple-400 border-purple-500/20", Behaviour: "bg-amber-500/10 text-amber-400 border-amber-500/20", Follow_Up: "bg-blue-500/10 text-blue-400 border-blue-500/20" };

export default function MemberDetailClient() {
    const params = useParams();
    const [member, setMember] = useState<MemberDetail | null>(null);
    const [tab, setTab] = useState<"bookings" | "orders" | "medical" | "notes">("bookings");
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState("");
    const [noteCategory, setNoteCategory] = useState("General");
    const [noteAuthor, setNoteAuthor] = useState("James Whitfield");
    const [addingNote, setAddingNote] = useState(false);

    const fetchMember = () => {
        fetch(`${API}/members/${params.id}`).then(r => r.json()).then(d => { setMember(d); setLoading(false); }).catch(() => setLoading(false));
    };

    useEffect(() => { fetchMember(); }, [params.id]);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        setAddingNote(true);
        try {
            const r = await fetch(`${API}/members/${params.id}/notes`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newNote, createdBy: noteAuthor, category: noteCategory })
            });
            if (r.ok) { setNewNote(""); fetchMember(); }
        } catch (e) { console.error(e); }
        setAddingNote(false);
    };

    const handleDeleteNote = async (noteId: number) => {
        if (!confirm("Delete this note?")) return;
        await fetch(`${API}/members/${params.id}/notes/${noteId}`, { method: "DELETE" });
        fetchMember();
    };

    if (loading) return <div className="p-8 pt-16 lg:pt-8 text-slate-500 text-sm">Loading…</div>;
    if (!member) return <div className="p-8 pt-16 lg:pt-8 text-slate-500 text-sm">Member not found</div>;

    const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const fmtTime = (d: string) => new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const fmtFull = (d: string) => {
        const dt = new Date(d);
        return `${dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} at ${dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
    };
    const timeAgo = (d: string) => {
        const diff = Date.now() - new Date(d).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            <Link href="/members" className="text-xs text-slate-500 hover:text-slate-300 transition-colors mb-6 inline-block pt-12 lg:pt-0">← Back to Members</Link>

            {/* Profile Header */}
            <div className="glass rounded-2xl p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                        {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold text-white">{member.name}</h1>
                            <span className={`badge ${statusBadge[member.status] || "badge-pending"}`}>{member.status?.replace("_", " ")}</span>
                        </div>
                        <p className="text-sm text-slate-500">{member.tier?.replace("_", " ")} Member • Joined {fmt(member.joinDate)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-white">£{Number(member.monthlyRate || 0).toFixed(0)}<span className="text-sm text-slate-500 font-normal">/mo</span></p>
                        <p className="text-xs text-slate-500">{member.subscriptionType} billing</p>
                    </div>
                </div>
            </div>

            {/* Contact & Billing Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="glass rounded-xl p-4">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Contact</p>
                    <p className="text-sm text-white">{member.email}</p>
                    <p className="text-sm text-slate-400">{member.phone || "No phone"}</p>
                </div>
                <div className="glass rounded-xl p-4">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Payment Token</p>
                    <p className="text-sm text-white font-mono">{member.stripe_customer_id ? `${member.stripe_customer_id.slice(0, 12)}…` : "Not linked"}</p>
                    <p className="text-xs text-slate-500 mt-1">{member.stripe_customer_id ? "Stripe Tokenised ✓" : member.gocardless_mandate_id ? "GoCardless DD ✓" : "Awaiting setup"}</p>
                </div>
                <div className="glass rounded-xl p-4">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Subscription</p>
                    {member.Subscription ? (
                        <>
                            <p className="text-sm text-white">{member.Subscription.type} — <span className={member.Subscription.status === "Active" ? "text-emerald-400" : "text-amber-400"}>{member.Subscription.status}</span></p>
                            <p className="text-xs text-slate-500 mt-1">Next billing: {member.Subscription.nextBillingDate ? fmt(member.Subscription.nextBillingDate) : "—"}</p>
                        </>
                    ) : <p className="text-sm text-slate-500">No subscription</p>}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 overflow-x-auto">
                {(["bookings", "orders", "medical", "notes"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${tab === t ? "bg-blue-500/15 text-blue-400 border border-blue-500/20" : "text-slate-500 hover:text-white"}`}>
                        {t === "bookings" ? `Bookings (${member.Appointments?.length || 0})` : t === "orders" ? `Orders (${member.Orders?.length || 0})` : t === "medical" ? `Medical (${member.MedicalRecords?.length || 0})` : `Notes (${member.MemberNotes?.length || 0})`}
                    </button>
                ))}
            </div>

            <div className="glass rounded-2xl overflow-hidden">
                {tab === "bookings" && (
                    <div className="divide-y divide-white/[0.04]">
                        {(member.Appointments || []).length === 0 ? <p className="p-6 text-slate-600 text-sm text-center">No bookings</p> : member.Appointments.map((a: any) => (
                            <div key={a.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                                <div className="min-w-[60px] text-center">
                                    <p className="text-sm font-semibold text-white font-mono">{fmtTime(a.startTime)}</p>
                                    <p className="text-[10px] text-slate-600">{fmt(a.startTime)}</p>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{a.Service?.name || "Unknown Service"}</p>
                                    <p className="text-xs text-slate-500">{a.Staff?.name || "Unassigned"} • {a.Service?.resourceRequired}</p>
                                </div>
                                <span className={`badge ${a.status === "Completed" ? "badge-active" : a.status === "Cancelled" ? "badge-banned" : "badge-waitlist"}`}>{a.status}</span>
                            </div>
                        ))}
                    </div>
                )}
                {tab === "orders" && (
                    <div className="divide-y divide-white/[0.04]">
                        {(member.Orders || []).length === 0 ? <p className="p-6 text-slate-600 text-sm text-center">No orders</p> : member.Orders.map((o: any) => {
                            const items = JSON.parse(o.items || "[]");
                            return (
                                <div key={o.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`badge ${o.status === "Paid" ? "badge-active" : "badge-waitlist"}`}>{o.status}</span>
                                        <span className="text-sm font-semibold text-white">£{Number(o.total).toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-slate-500">{items.map((i: any) => `${i.name} ×${i.qty}`).join(" • ")}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
                {tab === "medical" && (
                    <div className="divide-y divide-white/[0.04]">
                        {(member.MedicalRecords || []).length === 0 ? <p className="p-6 text-slate-600 text-sm text-center">No medical records</p> : member.MedicalRecords.map((r: any) => (
                            <div key={r.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-white">{r.recordType}</p>
                                    <p className="text-xs text-slate-500">{fmt(r.visitDate)}</p>
                                </div>
                                <p className="text-sm text-slate-400">{r.summary}</p>
                                <p className="text-xs text-slate-600 mt-1">{r.doctorName}</p>
                            </div>
                        ))}
                        <div className="p-4 bg-amber-500/5 border-t border-amber-500/10">
                            <p className="text-xs text-amber-400/80">🔒 Medical records are encrypted at rest. Full GDPR audit trail enabled.</p>
                        </div>
                    </div>
                )}
                {tab === "notes" && (
                    <div>
                        {/* Add Note Form */}
                        <div className="p-4 border-b border-white/5">
                            <textarea
                                value={newNote}
                                onChange={e => setNewNote(e.target.value)}
                                placeholder="Add a note about this member…"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 resize-none h-20"
                            />
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-3">
                                <div className="flex gap-2 flex-1">
                                    <select value={noteCategory} onChange={e => setNoteCategory(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
                                        <option value="General">📝 General</option>
                                        <option value="Medical">🏥 Medical</option>
                                        <option value="Billing">💳 Billing</option>
                                        <option value="Behaviour">⚠️ Behaviour</option>
                                        <option value="Follow_Up">📌 Follow Up</option>
                                    </select>
                                    <select value={noteAuthor} onChange={e => setNoteAuthor(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white flex-1">
                                        <option value="James Whitfield">James Whitfield</option>
                                        <option value="Dr. Eleanor Voss">Dr. Eleanor Voss</option>
                                        <option value="Marcus Chen">Marcus Chen</option>
                                        <option value="Sophie Laurent">Sophie Laurent</option>
                                        <option value="Amara Osei">Amara Osei</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleAddNote}
                                    disabled={addingNote || !newNote.trim()}
                                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                                >
                                    {addingNote ? "Saving…" : "Add Note"}
                                </button>
                            </div>
                        </div>

                        {/* Notes List */}
                        <div className="divide-y divide-white/[0.04]">
                            {(member.MemberNotes || []).length === 0 ? <p className="p-6 text-slate-600 text-sm text-center">No notes yet</p> : member.MemberNotes.map((n: any) => (
                                <div key={n.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0 mt-0.5">
                                            {n.createdBy.split(" ").map((w: string) => w[0]).join("")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                <p className="text-sm font-medium text-white">{n.createdBy}</p>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${catColors[n.category] || catColors.General}`}>{n.category?.replace("_", " ")}</span>
                                                <span className="text-[10px] text-slate-600 ml-auto" title={fmtFull(n.createdAt)}>{timeAgo(n.createdAt)}</span>
                                            </div>
                                            <p className="text-sm text-slate-400 leading-relaxed">{n.content}</p>
                                            <p className="text-[10px] text-slate-700 mt-2">{fmtFull(n.createdAt)}</p>
                                        </div>
                                        <button onClick={() => handleDeleteNote(n.id)} className="text-[10px] text-red-400/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1" title="Delete note">
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
