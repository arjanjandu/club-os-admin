"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface StaffMember { id: number; name: string; email: string; phone: string; role: string; speciality: string; bio: string; active: boolean; }

const roleColors: Record<string, string> = {
    Super_Admin: "bg-red-500/10 text-red-400 border-red-500/20",
    Manager: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Practitioner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Front_Desk: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function Staff() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [edit, setEdit] = useState<Partial<StaffMember>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchStaff(); }, []);
    const fetchStaff = async () => { try { setStaff(await (await fetch(`${API}/staff`)).json()); } catch (e) { console.error(e); } setLoading(false); };

    const handleSave = async () => {
        const url = isNew ? `${API}/staff` : `${API}/staff/${edit.id}`;
        try { const r = await fetch(url, { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(edit) }); if (r.ok) { setShowModal(false); fetchStaff(); } } catch (e) { console.error(e); }
    };
    const handleDelete = async (id: number) => { if (!confirm("Remove this staff member?")) return; await fetch(`${API}/staff/${id}`, { method: "DELETE" }); fetchStaff(); };
    const openNew = () => { setEdit({ name: "", email: "", phone: "", role: "Practitioner", speciality: "", bio: "" }); setIsNew(true); setShowModal(true); };

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <header className="mb-8 pt-12 lg:pt-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><h1 className="text-3xl font-bold text-white tracking-tight">Staff</h1><p className="text-slate-500 text-sm">{staff.length} team members</p></div>
                <button onClick={openNew} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">+ Add Staff</button>
            </header>

            {loading ? <p className="text-slate-600 text-sm">Loading…</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {staff.map(s => (
                        <div key={s.id} className="glass rounded-2xl p-5 group hover:bg-white/[0.04] transition-all">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                    {s.name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-white">{s.name}</h3>
                                    <p className="text-xs text-slate-500">{s.speciality || "General"}</p>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap ${roleColors[s.role] || "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>{s.role?.replace("_", " ")}</span>
                            </div>
                            {s.bio && <p className="text-sm text-slate-500 mb-4 line-clamp-2">{s.bio}</p>}
                            <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                                <span>{s.email}</span>
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEdit(s); setIsNew(false); setShowModal(true); }} className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                                <button onClick={() => handleDelete(s.id)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-2xl p-6 w-full max-w-md border border-white/10 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold text-white mb-6">{isNew ? "New Staff Member" : "Edit Staff"}</h2>
                        <div className="space-y-4">
                            <div><label className="block text-xs text-slate-400 mb-1">Full Name</label><input value={edit.name || ""} onChange={e => setEdit({ ...edit, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white" placeholder="Dr. Jane Smith" /></div>
                            <div><label className="block text-xs text-slate-400 mb-1">Email</label><input type="email" value={edit.email || ""} onChange={e => setEdit({ ...edit, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white" /></div>
                            <div><label className="block text-xs text-slate-400 mb-1">Phone</label><input value={edit.phone || ""} onChange={e => setEdit({ ...edit, phone: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-xs text-slate-400 mb-1">Role</label><select value={edit.role || "Practitioner"} onChange={e => setEdit({ ...edit, role: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"><option value="Super_Admin">Super Admin</option><option value="Manager">Manager</option><option value="Practitioner">Practitioner</option><option value="Front_Desk">Front Desk</option></select></div>
                                <div><label className="block text-xs text-slate-400 mb-1">Speciality</label><input value={edit.speciality || ""} onChange={e => setEdit({ ...edit, speciality: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white" placeholder="e.g. GP" /></div>
                            </div>
                            <div><label className="block text-xs text-slate-400 mb-1">Bio</label><textarea value={edit.bio || ""} onChange={e => setEdit({ ...edit, bio: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white h-20 resize-none" /></div>
                        </div>
                        <div className="mt-6 flex gap-3 justify-end">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
                            <button onClick={handleSave} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl">{isNew ? "Create" : "Save"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
