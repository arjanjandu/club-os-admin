"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/members", label: "Members", icon: "👥" },
  { href: "/schedule", label: "Schedule", icon: "📅" },
  { href: "/services", label: "Services", icon: "💎" },
  { href: "/products", label: "Café & Shop", icon: "☕" },
  { href: "/billing", label: "Billing", icon: "💳" },
  { href: "/staff", label: "Staff", icon: "🏥" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`w-64 h-screen fixed top-0 left-0 flex flex-col p-6 border-r border-white/5 bg-[#0a0e1a]/95 backdrop-blur-2xl z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-blue-500/20">
          T
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Tramp Health</h1>
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em]">Club OS</p>
        </div>
      </div>

      <p className="text-[10px] text-slate-600 uppercase tracking-[0.15em] font-medium mb-3 px-3">Operations</p>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname?.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/15"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
            >
              <span className={`text-base transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
                {link.icon}
              </span>
              <span className="font-medium text-sm">{link.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            JW
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-300">James Whitfield</span>
            <span className="text-[10px] text-slate-600">Manager • Full Access</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
