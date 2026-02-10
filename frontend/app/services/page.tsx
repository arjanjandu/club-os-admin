"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface Service { id: number; name: string; type: string; durationMinutes: number; price: number; capacity: number; resourceRequired: string; description: string; active: boolean; }

const typeColors: Record<string, string> = { Class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", Treatment: "bg-purple-500/10 text-purple-400 border-purple-500/20", Consultation: "bg-amber-500/10 text-amber-400 border-amber-500/20" };

export default function Services() {
    const [services, setServices] = useState<Service[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [edit, setEdit] = useState<Partial<Service>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchServices(); }, []);
    const fetchServices = async () => { try { setServices(await (await fetch(`${API}/services`)).json()); } catch (e) { console.error(e); } setLoading(false); };

    const handleSave = async () => {
        const url = isNew ? `${API}/services` : `${API}/services/${edit.id}`;
        try {
            const res = await fetch(url, { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(edit) });
            if (res.ok) { setShowModal(false); fetchServices(); }
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id: number) => { if (!confirm("Delete this service?")) return; try { await fetch(`${API}/services/${id}`, { method: "DELETE" }); fetchServices(); } catch (e) { console.error(e); } };

    const openNew = () => { setEdit({ name: "", type: "Class", durationMinutes: 60, price: 0, capacity: 12, resourceRequired: "", description: "" }); setIsNew(true); setShowModal(true); };
    const openEdit = (s: Service) => { setEdit(s); setIsNew(false); setShowModal(true); };

    const grouped = { Class: services.filter(s => s.type === "Class"), Treatment: services.filter(s => s.type === "Treatment"), Consultation: services.filter(s => s.type === "Consultation") };

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <header className="mb-8 pt-12 lg:pt-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><h1 className="text-3xl font-bold text-white tracking-tight">Services Catalog</h1><p className="text-slate-500 text-sm">{services.length} services configured</p></div>
                <button onClick={openNew} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">+ Add Service</button>
            </header>

            {loading ? <p className="text-slate-600 text-sm">Loading…</p> : Object.entries(grouped).map(([type, items]) => items.length > 0 && (
                <div key={type} className="mb-8">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">{type === "Class" ? "📅 Classes" : type === "Treatment" ? "💆 Treatments" : "🩺 Consultations"}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {items.map(s => (
                            <div key={s.id} className="glass rounded-2xl p-5 hover:bg-white/[0.04] transition-all group">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-base font-semibold text-white">{s.name}</h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColors[s.type]}`}>{s.type}</span>
                                </div>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{s.description || "No description"}</p>
                                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                                    <span>⏱ {s.durationMinutes}min</span>
                                    <span>👥 {s.capacity} {s.capacity === 1 ? "slot" : "slots"}</span>
                                    <span>📍 {s.resourceRequired || "TBC"}</span>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                    <p className="text-xl font-bold text-white">£{Number(s.price).toFixed(0)}</p>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(s)} className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                                        <button onClick={() => handleDelete(s.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-2xl p-6 w-full max-w-md border border-white/10 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold text-white mb-6">{isNew ? "New Service" : "Edit Service"}</h2>
                        <div className="space-y-4">
                            <div><label className="block text-xs text-slate-400 mb-1">Name</label><input value={edit.name || ""} onChange={e => setEdit({ ...edit, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40" placeholder="e.g. Morning Yoga" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-xs text-slate-400 mb-1">Type</label><select value={edit.type || "Class"} onChange={e => setEdit({ ...edit, type: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"><option value="Class">Class</option><option value="Treatment">Treatment</option><option value="Consultation">Consultation</option></select></div>
                                <div><label className="block text-xs text-slate-400 mb-1">Duration (min)</label><input type="number" value={edit.durationMinutes || 60} onChange={e => setEdit({ ...edit, durationMinutes: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-xs text-slate-400 mb-1">Price (£)</label><input type="number" value={edit.price || 0} onChange={e => setEdit({ ...edit, price: parseFloat(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white" /></div>
                                <div><label className="block text-xs text-slate-400 mb-1">Capacity</label><input type="number" value={edit.capacity || 1} onChange={e => setEdit({ ...edit, capacity: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white" /></div>
                            </div>
                            <div><label className="block text-xs text-slate-400 mb-1">Room / Resource</label><input value={edit.resourceRequired || ""} onChange={e => setEdit({ ...edit, resourceRequired: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600" placeholder="e.g. Studio A" /></div>
                            <div><label className="block text-xs text-slate-400 mb-1">Description</label><textarea value={edit.description || ""} onChange={e => setEdit({ ...edit, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 h-20 resize-none" /></div>
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
