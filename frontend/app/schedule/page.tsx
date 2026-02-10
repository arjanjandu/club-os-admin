"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface Appt {
    id: number; startTime: string; endTime: string; status: string; notes: string;
    Member?: { id: number; name: string }; Service?: { name: string; type: string }; Staff?: { name: string };
}

export default function Schedule() {
    const [schedule, setSchedule] = useState<Record<string, Appt[]>>({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetch(`${API}/schedule`).then(r => r.json()).then(d => { setSchedule(d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const fmt = (d: string) => new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const statusColor: Record<string, string> = { Booked: "bg-blue-500", Completed: "bg-emerald-500", Cancelled: "bg-red-500", NoShow: "bg-amber-500" };
    const resources = Object.keys(schedule);

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <header className="mb-8 pt-12 lg:pt-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Schedule</h1>
                    <p className="text-slate-500 text-sm">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
                </div>
                <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                    + New Booking
                </button>
            </header>

            {loading ? <p className="text-slate-600 text-sm">Loading…</p> : resources.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center"><p className="text-slate-500">No appointments scheduled today</p></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {resources.map(resource => (
                        <div key={resource} className="glass rounded-2xl overflow-hidden">
                            <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <h3 className="text-sm font-semibold text-white">{resource}</h3>
                                <span className="text-[10px] text-slate-600 ml-auto">{schedule[resource].length} bookings</span>
                            </div>
                            <div className="divide-y divide-white/[0.03]">
                                {schedule[resource].map(a => (
                                    <div key={a.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`w-1.5 h-8 rounded-full ${statusColor[a.status] || "bg-slate-500"}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{a.Service?.name}</p>
                                                <p className="text-xs text-slate-500">{a.Member?.name}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-mono text-white">{fmt(a.startTime)}</p>
                                                <p className="text-[10px] text-slate-600">{fmt(a.endTime)}</p>
                                            </div>
                                        </div>
                                        {a.Staff && <p className="text-[11px] text-slate-500 ml-[18px]">with {a.Staff.name}</p>}
                                        {a.notes && <p className="text-[11px] text-slate-600 italic ml-[18px] mt-1">{a.notes}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4">
                {Object.entries(statusColor).map(([s, c]) => (
                    <div key={s} className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${c}`} /><span className="text-xs text-slate-500">{s}</span></div>
                ))}
            </div>

            {/* New Booking Modal (placeholder) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-2xl p-6 w-full max-w-md border border-white/10">
                        <h2 className="text-lg font-bold text-white mb-4">New Booking</h2>
                        <p className="text-sm text-slate-400 mb-6">Booking creation will be wired to the Service and Member APIs. Select a service, member, staff, and time slot.</p>
                        <div className="space-y-3 mb-6">
                            <div><label className="block text-xs text-slate-500 mb-1">Service</label><select className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"><option>Morning Reformer Pilates</option><option>HIIT Circuit</option><option>Whole Body Cryotherapy</option><option>Sports Massage</option><option>GP Consultation</option></select></div>
                            <div><label className="block text-xs text-slate-500 mb-1">Date & Time</label><input type="datetime-local" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white" /></div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
                            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl">Book</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
