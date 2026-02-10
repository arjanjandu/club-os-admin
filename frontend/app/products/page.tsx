"use client";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface Product { id: number; name: string; category: string; price: number; stock: number; description: string; active: boolean; }

const catIcons: Record<string, string> = { Cafe: "☕", Retail: "🛍️", Supplement: "💊" };

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [edit, setEdit] = useState<Partial<Product>>({});
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProducts(); }, []);
  const fetchProducts = async () => { try { setProducts(await (await fetch(`${API}/products`)).json()); } catch (e) { console.error(e); } setLoading(false); };

  const handleSave = async () => {
    const url = isNew ? `${API}/products` : `${API}/products/${edit.id}`;
    try { const r = await fetch(url, { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(edit) }); if (r.ok) { setShowModal(false); fetchProducts(); } } catch (e) { console.error(e); }
  };
  const handleDelete = async (id: number) => { if (!confirm("Delete?")) return; await fetch(`${API}/products/${id}`, { method: "DELETE" }); fetchProducts(); };
  const openNew = () => { setEdit({ name: "", category: "Cafe", price: 0, stock: 50, description: "" }); setIsNew(true); setShowModal(true); };

  const filtered = filter === "All" ? products : products.filter(p => p.category === filter);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="mb-8 pt-12 lg:pt-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-3xl font-bold text-white tracking-tight">Café & Shop</h1><p className="text-slate-500 text-sm">{products.length} products listed</p></div>
        <button onClick={openNew} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">+ Add Product</button>
      </header>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {["All", "Cafe", "Retail", "Supplement"].map(c => (
          <button key={c} onClick={() => setFilter(c)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${filter === c ? "bg-blue-500/15 text-blue-400 border border-blue-500/20" : "text-slate-500 hover:text-slate-300 bg-white/[0.02] border border-white/[0.04]"}`}>
            {c === "All" ? "All" : `${catIcons[c] || ""} ${c}`}
          </button>
        ))}
      </div>

      {loading ? <p className="text-slate-600 text-sm">Loading…</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="glass rounded-2xl p-5 group hover:bg-white/[0.04] transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{catIcons[p.category] || "📦"}</span>
                  <h3 className="text-base font-semibold text-white">{p.name}</h3>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{p.description || "No description"}</p>
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div>
                  <p className="text-xl font-bold text-white">£{Number(p.price).toFixed(2)}</p>
                  <p className="text-[10px] text-slate-600">{p.stock} in stock</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEdit(p); setIsNew(false); setShowModal(true); }} className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h2 className="text-lg font-bold text-white mb-6">{isNew ? "New Product" : "Edit Product"}</h2>
            <div className="space-y-4">
              <div><label className="block text-xs text-slate-400 mb-1">Name</label><input value={edit.name || ""} onChange={e => setEdit({ ...edit, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600" placeholder="e.g. Matcha Smoothie" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-slate-400 mb-1">Category</label><select value={edit.category || "Cafe"} onChange={e => setEdit({ ...edit, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"><option value="Cafe">Café</option><option value="Retail">Retail</option><option value="Supplement">Supplement</option></select></div>
                <div><label className="block text-xs text-slate-400 mb-1">Price (£)</label><input type="number" step="0.01" value={edit.price || 0} onChange={e => setEdit({ ...edit, price: parseFloat(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white" /></div>
              </div>
              <div><label className="block text-xs text-slate-400 mb-1">Stock</label><input type="number" value={edit.stock || 0} onChange={e => setEdit({ ...edit, stock: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">Description</label><textarea value={edit.description || ""} onChange={e => setEdit({ ...edit, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white h-20 resize-none" /></div>
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
