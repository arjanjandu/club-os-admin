"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
      const data = await res.json();
      setProducts(data as Product[]);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    if (!editProduct) return;
    try {
      const url = isNew 
        ? `${process.env.NEXT_PUBLIC_API_URL}/products`
        : `${process.env.NEXT_PUBLIC_API_URL}/products/${editProduct.id}`;
      
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProduct)
      });
      if (res.ok) {
        setShowModal(false);
        fetchProducts();
      } else {
        alert('Failed to save product');
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProducts();
    } catch (err) { console.error(err); }
  };

  const openNew = () => {
    setEditProduct({ id: 0, name: '', price: 0, category: 'Service', description: '' });
    setIsNew(true);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setIsNew(false);
    setShowModal(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Services & Products</h1>
        <button 
          onClick={openNew}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow-sm"
        >
          + Add New Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-6 rounded-lg shadow-md border hover:border-green-500 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full uppercase tracking-wide">
                {product.category}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-4">${product.price}</p>
            <p className="text-gray-600 text-sm mb-6 line-clamp-3">{product.description}</p>
            <div className="flex justify-end gap-2 border-t pt-4">
              <button 
                onClick={() => openEdit(product)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(product.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && editProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{isNew ? 'Create New Service' : 'Edit Service'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Name</label>
                <input 
                  type="text" 
                  value={editProduct.name} 
                  onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="e.g. PT Session"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                <input 
                  type="number" 
                  value={editProduct.price} 
                  onChange={(e) => setEditProduct({...editProduct, price: parseFloat(e.target.value) || 0})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="50.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select 
                  value={editProduct.category} 
                  onChange={(e) => setEditProduct({...editProduct, category: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="Service">Service</option>
                  <option value="Product">Physical Product</option>
                  <option value="Subscription">Subscription</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  value={editProduct.description} 
                  onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                  placeholder="Describe the service..."
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
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
