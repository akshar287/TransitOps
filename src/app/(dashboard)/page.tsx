'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Truck, Users, Map, Fuel, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardIndex() {
  const { data: session } = useSession();
  const router = useRouter();

  const role = session?.user?.role;

  const quickLinks = [
    { name: 'Vehicle Registry', href: '/fleet', icon: Truck, roles: ['FleetManager', 'Dispatcher', 'FinancialAnalyst'] },
    { name: 'Driver Profiles', href: '/drivers', icon: Users, roles: ['FleetManager', 'Dispatcher', 'SafetyOfficer'] },
    { name: 'Trip Dispatcher', href: '/trips', icon: Map, roles: ['Dispatcher', 'SafetyOfficer'] },
    { name: 'Fuel & Expenses', href: '/expenses', icon: Fuel, roles: ['FinancialAnalyst'] },
    { name: 'Analytics & Reports', href: '/analytics', icon: BarChart3, roles: ['FleetManager', 'FinancialAnalyst'] },
  ];

  const availableLinks = quickLinks.filter(l => l.roles.includes(role || ''));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session?.user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-muted-foreground mt-1">Here is your TransitOps command center.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableLinks.map((link) => (
          <div key={link.name} className="bg-card border border-border p-6 rounded-xl hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => router.push(link.href)}>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
              <link.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">{link.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">Access module →</p>
          </div>
        ))}
      </div>

      <div className="bg-muted/30 border border-border rounded-xl p-8 text-center max-w-2xl mx-auto mt-12">
        <h2 className="text-lg font-semibold mb-2">TransitOps Platform</h2>
        <p className="text-sm text-muted-foreground mb-6">
          You are currently logged in as a <strong>{role}</strong>. Your access and permissions across the platform are restricted according to strict RBAC policies.
        </p>
        <Button variant="outline" onClick={() => router.push('/settings')}>View Access Matrix</Button>
      </div>
    </div>
  );
}
