'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Truck, 
  Users, 
  Map, 
  Wrench, 
  Clock, 
  ArrowRight,
  Search,
  Bell,
  HelpCircle,
  Play,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DashboardIndex() {
  const { data: session } = useSession();
  const router = useRouter();
  const role = session?.user?.role;

  // Data States
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');

  const loadData = async () => {
    setLoading(true);
    try {
      const [vRes, dRes, tRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/drivers'),
        fetch('/api/trips')
      ]);
      
      if (vRes.ok) setVehicles(vRes.ok ? await vRes.json() : []);
      if (dRes.ok) setDrivers(dRes.ok ? await dRes.json() : []);
      if (tRes.ok) setTrips(tRes.ok ? await tRes.json() : []);
    } catch (e) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter computations
  const filteredTrips = trips.filter(trip => {
    // Type Filter (check vehicle type)
    if (typeFilter !== 'All') {
      const v = vehicles.find(veh => veh._id === (trip.vehicleId?._id || trip.vehicleId));
      if (!v || v.type !== typeFilter) return false;
    }
    // Status Filter
    if (statusFilter !== 'All' && trip.status !== statusFilter) {
      return false;
    }
    // Region Filter (source city contains selected region)
    if (regionFilter !== 'All') {
      const regionState = regionFilter.split(',')[1]?.trim();
      const tripState = trip.source.split(',')[1]?.trim();
      if (regionState !== tripState) return false;
    }
    return true;
  });

  // KPI Calculations
  const activeVehiclesCount = vehicles.filter(v => v.status === 'OnTrip').length;
  const availableVehiclesCount = vehicles.filter(v => v.status === 'Available').length;
  const maintenanceVehiclesCount = vehicles.filter(v => v.status === 'InShop').length;
  const activeTripsCount = trips.filter(t => t.status === 'Dispatched').length;
  const pendingTripsCount = trips.filter(t => t.status === 'Draft').length;
  const driversOnDutyCount = drivers.filter(d => d.status === 'Available' || d.status === 'OnTrip').length;

  // Vehicle Status Percentages
  const totalVehicles = vehicles.filter(v => v.status !== 'Retired').length || 1;
  const pctAvailable = Math.round((availableVehiclesCount / totalVehicles) * 100);
  const pctOnTrip = Math.round((activeVehiclesCount / totalVehicles) * 100);
  const pctInShop = Math.round((maintenanceVehiclesCount / totalVehicles) * 100);
  const pctRetired = Math.round((vehicles.filter(v => v.status === 'Retired').length / (vehicles.length || 1)) * 100);

  // Extract unique regions/states for the region filter dropdown
  const uniqueStates = Array.from(new Set(
    trips.map(t => {
      const parts = t.source.split(',');
      return parts.length > 1 ? parts[1].trim() : null;
    }).filter(Boolean)
  )) as string[];

  // Quick Action Buttons based on role
  const renderQuickActions = (trip: any) => {
    if (role === 'Dispatcher' && trip.status === 'Draft') {
      return (
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 border-primary/20 hover:bg-primary/10 text-primary text-xs"
          onClick={() => router.push('/trips')}
        >
          <Play className="w-3.5 h-3.5 mr-1" /> Dispatch
        </Button>
      );
    }
    if (role === 'Dispatcher' && trip.status === 'Dispatched') {
      return (
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 border-status-green/20 hover:bg-status-green/10 text-status-green text-xs"
          onClick={() => router.push('/trips')}
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete
        </Button>
      );
    }
    if (role === 'FinancialAnalyst' && trip.status === 'Completed') {
      return (
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 border-primary/20 hover:bg-primary/10 text-primary text-xs"
          onClick={() => router.push('/expenses')}
        >
          <FileText className="w-3.5 h-3.5 mr-1" /> Log Expense
        </Button>
      );
    }
    return <span className="text-muted-foreground text-xs">—</span>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Filters:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Vehicle Type Filter */}
          <div className="w-full sm:w-[150px]">
            <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || 'All')}>
              <SelectTrigger className="bg-background border-border text-xs"><SelectValue placeholder="Vehicle Type: All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Vehicle Type: All</SelectItem>
                <SelectItem value="Heavy Duty">Heavy Duty</SelectItem>
                <SelectItem value="Light Duty">Light Duty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-[150px]">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'All')}>
              <SelectTrigger className="bg-background border-border text-xs"><SelectValue placeholder="Status: All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Status: All</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Dispatched">Dispatched</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Region Filter */}
          <div className="w-full sm:w-[150px]">
            <Select value={regionFilter} onValueChange={(val) => setRegionFilter(val || 'All')}>
              <SelectTrigger className="bg-background border-border text-xs"><SelectValue placeholder="Region: All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Region: All</SelectItem>
                {uniqueStates.map(state => (
                  <SelectItem key={state} value={`State, ${state}`}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Active Vehicles */}
        <div className="bg-card border border-border border-l-4 border-l-status-orange p-5 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground leading-tight">Active<br />Vehicles</span>
            <Truck className="w-4 h-4 text-status-orange/70" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-foreground mt-4">
            {loading ? '...' : String(activeVehiclesCount).padStart(2, '0')}
          </span>
        </div>

        {/* Available Vehicles */}
        <div className="bg-card border border-border border-l-4 border-l-status-green p-5 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground leading-tight">Available<br />Vehicles</span>
            <CheckCircle2 className="w-4 h-4 text-status-green/70" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-foreground mt-4">
            {loading ? '...' : String(availableVehiclesCount).padStart(2, '0')}
          </span>
        </div>

        {/* Vehicles in Maintenance */}
        <div className="bg-card border border-border border-l-4 border-l-status-orange/60 p-5 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground leading-tight">Vehicles In<br />Maintenance</span>
            <Wrench className="w-4 h-4 text-status-orange/50" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-foreground mt-4">
            {loading ? '...' : String(maintenanceVehiclesCount).padStart(2, '0')}
          </span>
        </div>

        {/* Active Trips */}
        <div className="bg-card border border-border border-l-4 border-l-status-blue p-5 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground leading-tight">Active<br />Trips</span>
            <Map className="w-4 h-4 text-status-blue/70" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-foreground mt-4">
            {loading ? '...' : String(activeTripsCount).padStart(2, '0')}
          </span>
        </div>

        {/* Pending Trips */}
        <div className="bg-card border border-border border-l-4 border-l-status-gray p-5 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground leading-tight">Pending<br />Trips</span>
            <Clock className="w-4 h-4 text-status-gray/70" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-foreground mt-4">
            {loading ? '...' : String(pendingTripsCount).padStart(2, '0')}
          </span>
        </div>

        {/* Drivers on Duty */}
        <div className="bg-card border border-border border-l-4 border-l-primary/70 p-5 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground leading-tight">Drivers On<br />Duty</span>
            <Users className="w-4 h-4 text-primary/70" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-foreground mt-4">
            {loading ? '...' : String(driversOnDutyCount).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* 3. Main Data Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left Column: Recent Trips (7/10 width) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-xl flex flex-col overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border flex justify-between items-center bg-[#FAF7F0]/40">
            <h2 className="font-bold text-base text-foreground">Recent Trips</h2>
            <Button 
              variant="link" 
              size="sm" 
              className="text-primary hover:text-primary/80 font-semibold text-xs flex items-center p-0"
              onClick={() => router.push('/trips')}
            >
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#FAF7F0] border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  <th className="py-3 px-4 font-bold">Trip ID</th>
                  <th className="py-3 px-4 font-bold">Vehicle</th>
                  <th className="py-3 px-4 font-bold">Driver</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">ETA / Note</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  [1,2,3,4,5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="py-4 px-4 h-12 bg-muted/10"></td>
                    </tr>
                  ))
                ) : filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-muted-foreground text-sm">
                      No matching trips found.
                    </td>
                  </tr>
                ) : (
                  filteredTrips.slice(0, 7).map((trip) => (
                    <tr key={trip._id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">{trip.tripCode}</td>
                      <td className="py-3.5 px-4 font-medium text-foreground">{trip.vehicleId?.regNo || 'Unassigned'}</td>
                      <td className="py-3.5 px-4 text-foreground/90">{trip.driverId?.name || 'Unassigned'}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={trip.status} />
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground text-xs">
                        {trip.status === 'Completed' ? 'Completed' : 
                         trip.status === 'Cancelled' ? 'Weather blockage' : 
                         trip.status === 'Draft' ? 'Awaiting vehicle' : 
                         `${trip.etaMinutes} min`}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {renderQuickActions(trip)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Vehicle Status Distribution (3/10 width) */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-bold text-base text-foreground mb-6">Vehicle Status</h3>
            
            <div className="space-y-6">
              {/* Available */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Available</span>
                  <span className="text-foreground">{pctAvailable}%</span>
                </div>
                <div className="h-2 w-full bg-[#EDE7DE] rounded-full overflow-hidden">
                  <div className="h-full bg-status-green rounded-full" style={{ width: `${pctAvailable}%` }} />
                </div>
              </div>

              {/* On Trip */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">On Trip</span>
                  <span className="text-foreground">{pctOnTrip}%</span>
                </div>
                <div className="h-2 w-full bg-[#EDE7DE] rounded-full overflow-hidden">
                  <div className="h-full bg-status-blue rounded-full" style={{ width: `${pctOnTrip}%` }} />
                </div>
              </div>

              {/* In Shop */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">In Shop</span>
                  <span className="text-foreground">{pctInShop}%</span>
                </div>
                <div className="h-2 w-full bg-[#EDE7DE] rounded-full overflow-hidden">
                  <div className="h-full bg-status-orange rounded-full" style={{ width: `${pctInShop}%` }} />
                </div>
              </div>

              {/* Retired */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Retired</span>
                  <span className="text-foreground">{pctRetired}%</span>
                </div>
                <div className="h-2 w-full bg-[#EDE7DE] rounded-full overflow-hidden">
                  <div className="h-full bg-status-red rounded-full" style={{ width: `${pctRetired}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-border/60 bg-muted/10 p-3 rounded-lg text-center text-xs text-muted-foreground">
            Total Active Fleet: <strong>{totalVehicles}</strong> vehicles
          </div>
        </div>
      </div>
    </div>
  );
}
