'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Activity, PieChart, TrendingUp, DollarSign, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics/summary');
        if (!res.ok) throw new Error();
        setData(await res.json());
      } catch (e) {
        toast.error('Failed to load analytics dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted/50 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[400px] bg-muted/50 rounded-xl" />
          <div className="h-[400px] bg-muted/50 rounded-xl" />
        </div>
      </div>
    );
  }

  const { kpis, charts } = data;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-lg shadow-xl text-sm">
          <p className="font-medium text-foreground mb-1">{label}</p>
          <p className="text-primary font-bold">
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics & Reports</h1>
        <p className="text-sm text-muted-foreground">Key performance indicators across the fleet</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3 text-muted-foreground mb-4 relative z-10">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider">Fuel Efficiency</span>
          </div>
          <p className="text-3xl font-bold text-status-green relative z-10">{kpis.fuelEfficiency} <span className="text-lg text-muted-foreground font-medium">km/l</span></p>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-status-green/5 rounded-full blur-2xl group-hover:bg-status-green/10 transition-colors" />
        </div>

        <div className="bg-card border border-border p-5 rounded-xl shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3 text-muted-foreground mb-4 relative z-10">
            <PieChart className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider">Fleet Utilization</span>
          </div>
          <p className="text-3xl font-bold text-status-green relative z-10">{kpis.fleetUtilization}%</p>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-status-green/5 rounded-full blur-2xl group-hover:bg-status-green/10 transition-colors" />
        </div>

        <div className="bg-card border border-border p-5 rounded-xl shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3 text-muted-foreground mb-4 relative z-10">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider">Operational Cost</span>
          </div>
          <p className="text-3xl font-bold text-status-orange relative z-10">${kpis.operationalCost.toLocaleString()}</p>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-status-orange/5 rounded-full blur-2xl group-hover:bg-status-orange/10 transition-colors" />
        </div>

        <div className="bg-card border border-border p-5 rounded-xl shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3 text-muted-foreground mb-4 relative z-10">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider">Vehicle ROI</span>
          </div>
          <p className="text-3xl font-bold text-status-green relative z-10">{kpis.roi}%</p>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-status-green/5 rounded-full blur-2xl group-hover:bg-status-green/10 transition-colors" />
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground font-mono">ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost</p>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-status-blue" /> Monthly Revenue</h3>
            <p className="text-xs text-muted-foreground">Estimated revenue from completed trips</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6B6B70" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#6B6B70" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="revenue" fill="#4C8DFF" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Costliest Vehicles Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-status-orange" /> Top Costliest Vehicles</h3>
            <p className="text-xs text-muted-foreground">Combined fuel and maintenance expenses</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.costliestVehicles} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#6B6B70" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <YAxis dataKey="name" type="category" stroke="#6B6B70" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="cost" fill="#E8A33D" radius={[0, 4, 4, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
