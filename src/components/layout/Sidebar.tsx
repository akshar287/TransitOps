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
      <div className="p-6 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground font-sans">
          TransitOps
        </h1>
        <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mt-1">
          Fleet Management
        </p>
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto mt-4">
        {navItems.filter(item => !role || item.roles.includes(role)).map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-150 relative ${
                isActive 
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold' 
                  : 'text-muted-foreground hover:bg-sidebar-accent/30 hover:text-foreground'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-primary rounded-r" />
              )}
              <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground/80'}`} />
              <span className="text-[13px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
