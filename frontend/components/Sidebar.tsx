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
    <aside className={`w-64 h-screen fixed top-0 left-0 flex flex-col p-6 border-r border-[var(--color-accent)]/10 bg-[var(--background)]/95 backdrop-blur-2xl z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)] border border-[var(--color-accent)]/20 flex items-center justify-center font-bold text-[var(--color-accent)] text-lg shadow-lg shadow-[var(--color-primary)]/20 font-[var(--font-display)]">
          T
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-accent)] tracking-wide font-[var(--font-display)]">Tramp Health</h1>
          <p className="text-[10px] text-[var(--color-accent-muted)] uppercase tracking-[0.2em] font-[var(--font-body)]">Club OS</p>
        </div>
      </div>

      <p className="text-[10px] text-[var(--color-accent-muted)]/60 uppercase tracking-[0.15em] font-medium mb-3 px-3 font-[var(--font-body)]">Operations</p>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname?.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group font-[var(--font-body)] ${isActive
                  ? "bg-[var(--color-primary)] text-[var(--color-accent)] border border-[var(--color-accent)]/20 shadow-lg shadow-[var(--color-primary)]/10"
                  : "text-[var(--color-accent-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/5"
                }`}
            >
              <span className={`text-base transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
                {link.icon} {/* Icons are emojis, which is fine, but maybe should be branded icons later */}
              </span>
              <span className="font-medium text-sm tracking-wide">{link.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-[var(--color-accent)]/10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)] text-xs font-bold font-[var(--font-body)]">
            JW
          </div>
          <div className="flex flex-col font-[var(--font-body)]">
            <span className="text-sm font-medium text-[var(--color-accent)]">James Whitfield</span>
            <span className="text-[10px] text-[var(--color-accent-muted)]">Manager • Full Access</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
