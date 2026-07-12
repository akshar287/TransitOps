'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Map, 
  Wrench, 
  Fuel, 
  BarChart3, 
  Settings 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Fleet', href: '/fleet', icon: Truck },
  { name: 'Drivers', href: '/drivers', icon: Users },
  { name: 'Trips', href: '/trips', icon: Map },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Fuel & Expenses', href: '/expenses', icon: Fuel },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] border-r border-sidebar-border bg-sidebar h-screen sticky top-0 flex flex-col shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-primary">TransitOps</h1>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">Smart Transport</p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-150 ${
                isActive 
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-primary -ml-[2px]' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-[13px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
