"use client";

import { useEffect, useState } from "react";

interface Member {
  id: number;
  name: string;
  email: string;
  status: string;
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/members`);
      const data = await res.json();
      setMembers(data as Member[]);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    if (!editMember) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/members/${editMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editMember)
      });
      if (res.ok) {
        setShowModal(false);
        fetchMembers();
      } else {
        alert('Failed to update member');
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Members</h1>
      
      {/* Search/Filter (Mock) */}
      <div className="mb-4 flex gap-2">
        <input type="text" placeholder="Search members..." className="border p-2 rounded w-full max-w-sm" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Search</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-4 text-sm font-semibold text-gray-600">ID</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Name</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Email</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-800">#{member.id}</td>
                <td className="p-4 font-medium text-gray-900">{member.name}</td>
                <td className="p-4 text-gray-600">{member.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    member.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    member.status === 'Banned' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => { setEditMember(member); setShowModal(true); }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showModal && editMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Member</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input 
                  type="text" 
                  value={editMember.name} 
                  onChange={(e) => setEditMember({...editMember, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  type="email" 
                  value={editMember.email} 
                  onChange={(e) => setEditMember({...editMember, email: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select 
                  value={editMember.status} 
                  onChange={(e) => setEditMember({...editMember, status: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Banned">Banned</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
