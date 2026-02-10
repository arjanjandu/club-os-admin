"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [stats, setStats] = useState({ members: 0, products: 0, invoices: 0 });

  useEffect(() => {
    // In a real app, fetch these from /api/stats
    // For now, mock or fetch lists and count
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
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Members Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold text-gray-700">Total Members</h2>
          <p className="text-4xl font-bold mt-2 text-blue-600">{stats.members}</p>
          <Link href="/members" className="text-sm text-blue-500 hover:underline mt-4 block">Manage Members &rarr;</Link>
        </div>

        {/* Products Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h2 className="text-xl font-semibold text-gray-700">Active Services</h2>
          <p className="text-4xl font-bold mt-2 text-green-600">{stats.products}</p>
          <Link href="/products" className="text-sm text-green-500 hover:underline mt-4 block">Configure Services &rarr;</Link>
        </div>

        {/* Invoices Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h2 className="text-xl font-semibold text-gray-700">Invoices</h2>
          <p className="text-4xl font-bold mt-2 text-purple-600">{stats.invoices}</p>
          <Link href="/invoices" className="text-sm text-purple-500 hover:underline mt-4 block">View Billing &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
