"use client";

import { useEffect, useState } from "react";

interface Invoice {
  id: number;
  customerName: string;
  amount: number;
  status: string;
  date: string;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices`);
      const data = await res.json();
      setInvoices(data as Invoice[]);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Billing & Invoices</h1>
      
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-4 text-sm font-semibold text-gray-600">Invoice #</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Customer</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Amount</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-800 font-mono">INV-{inv.id.toString().padStart(4, '0')}</td>
                <td className="p-4 text-gray-900 font-medium">{inv.customerName}</td>
                <td className="p-4 text-gray-600">{new Date(inv.date).toLocaleDateString()}</td>
                <td className="p-4 text-gray-900 font-bold">${inv.amount}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    inv.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No invoices found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
