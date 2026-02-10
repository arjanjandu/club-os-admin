"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/members', label: 'Members' },
    { href: '/products', label: 'Products' },
    { href: '/content', label: 'Content' },
    { href: '/invoices', label: 'Invoices' },
  ];

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4 fixed top-0 left-0">
      <h1 className="text-2xl font-bold mb-8 text-blue-400">Club OS</h1>
      <nav className="flex-1 space-y-2">
        {links.map((link) => (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`block px-4 py-2 rounded-lg transition-colors ${
              pathname === link.href ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t border-gray-700 pt-4 text-sm text-gray-500">
        Admin Panel
      </div>
    </div>
  );
}
