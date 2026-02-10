"use client";

import { useEffect, useState } from "react";

interface ContentItem {
  id: number;
  title: string;
  category: string;
  url: string;
  description: string;
}

export default function Content() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content`);
      const data = await res.json();
      setContent(data as ContentItem[]);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    if (!editItem) return;
    try {
      const url = isNew 
        ? `${process.env.NEXT_PUBLIC_API_URL}/content`
        : `${process.env.NEXT_PUBLIC_API_URL}/content/${editItem.id}`;
      
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editItem)
      });
      if (res.ok) {
        setShowModal(false);
        fetchContent();
      } else {
        alert('Failed to save content');
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this content item?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content/${id}`, { method: 'DELETE' });
      if (res.ok) fetchContent();
    } catch (err) { console.error(err); }
  };

  const openNew = () => {
    setEditItem({ id: 0, title: '', category: 'Video', url: '', description: '' });
    setIsNew(true);
    setShowModal(true);
  };

  const openEdit = (item: ContentItem) => {
    setEditItem(item);
    setIsNew(false);
    setShowModal(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Content Manager</h1>
        <button 
          onClick={openNew}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 shadow-sm"
        >
          + Upload Content
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-lg shadow-md border hover:border-purple-500 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{item.title}</h3>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full uppercase tracking-wide shrink-0">
                {item.category}
              </span>
            </div>
            
            <div className="mb-4">
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline text-sm break-all block truncate"
              >
                {item.url}
              </a>
            </div>

            <p className="text-gray-600 text-sm mb-6 line-clamp-3 h-12 overflow-hidden">{item.description}</p>
            
            <div className="flex justify-end gap-2 border-t pt-4">
              <button 
                onClick={() => openEdit(item)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{isNew ? 'New Content Item' : 'Edit Content'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input 
                  type="text" 
                  value={editItem.title} 
                  onChange={(e) => setEditItem({...editItem, title: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="e.g. Welcome Video"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select 
                  value={editItem.category} 
                  onChange={(e) => setEditItem({...editItem, category: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="Video">Video</option>
                  <option value="PDF">PDF</option>
                  <option value="Image">Image</option>
                  <option value="Article">Article</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">URL</label>
                <input 
                  type="url" 
                  value={editItem.url} 
                  onChange={(e) => setEditItem({...editItem, url: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  value={editItem.description} 
                  onChange={(e) => setEditItem({...editItem, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                  placeholder="Brief description..."
                />
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
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                {isNew ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
