'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
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

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['FleetManager', 'Dispatcher', 'SafetyOfficer', 'FinancialAnalyst'] },
    { name: 'Fleet', href: '/fleet', icon: Truck, roles: ['FleetManager', 'Dispatcher', 'FinancialAnalyst'] },
    { name: 'Drivers', href: '/drivers', icon: Users, roles: ['FleetManager', 'Dispatcher', 'SafetyOfficer'] },
    { name: 'Trips', href: '/trips', icon: Map, roles: ['Dispatcher', 'SafetyOfficer'] },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench, roles: ['FleetManager'] },
    { name: 'Fuel & Expenses', href: '/expenses', icon: Fuel, roles: ['FinancialAnalyst'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['FleetManager', 'FinancialAnalyst'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['FleetManager', 'Dispatcher', 'SafetyOfficer', 'FinancialAnalyst'] },
  ];

  return (
    <aside className="w-[220px] border-r border-sidebar-border bg-sidebar h-screen sticky top-0 flex flex-col shrink-0 z-20">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-[#E8A33D] to-[#D98C1F] flex items-center justify-center">
            <span className="text-[#0B0B0D] font-bold text-sm leading-none">T</span>
          </div>
          TransitOps
        </h1>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-2">Smart Transport</p>
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.filter(item => !role || item.roles.includes(role)).map((item) => {
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
