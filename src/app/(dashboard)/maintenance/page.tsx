'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Settings, PenTool, Wrench, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';

export default function MaintenancePage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [vehicleId, setVehicleId] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Active');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [lRes, vRes] = await Promise.all([
        fetch('/api/maintenance'),
        fetch('/api/vehicles')
      ]);
      setLogs(await lRes.json());
      const allVehicles = await vRes.json();
      setVehicles(allVehicles);
    } catch (e) {
      toast.error('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          serviceType,
          cost: Number(cost),
          date,
          status
        })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      
      const savedVehicle = vehicles.find(v => v._id === vehicleId);
      if (status === 'Active') {
        toast.success(`Service record saved — ${savedVehicle?.regNo} is now In Shop`);
      } else {
        toast.success('Service record saved');
      }
      
      setVehicleId('');
      setServiceType('');
      setCost('');
      setStatus('Active');
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const markCompleted = async (logId: string) => {
    try {
      const res = await fetch('/api/maintenance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId, status: 'Completed' })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      
      toast.success('Maintenance completed. Vehicle is Available.');
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const isManager = session?.user?.role === 'FleetManager';

  const columns = [
    { header: 'Vehicle', accessorKey: 'vehicle', cell: (item: any) => <span className="font-semibold">{item.vehicleId?.regNo}</span> },
    { header: 'Service Type', accessorKey: 'serviceType' },
    { header: 'Cost', accessorKey: 'cost', cell: (item: any) => `₹${item.cost.toLocaleString()}` },
    { header: 'Date', accessorKey: 'date', cell: (item: any) => new Date(item.date).toLocaleDateString() },
    { header: 'Status', accessorKey: 'status', cell: (item: any) => (
      <div className="flex items-center gap-3">
        <StatusBadge status={item.status} />
        {item.status === 'Active' && isManager && (
          <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => markCompleted(item._id)}>
            Complete
          </Button>
        )}
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Maintenance & Workshop</h1>
        <p className="text-sm text-muted-foreground">Log service records and manage workshop status</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel */}
        {isManager && (
          <div className="w-full lg:w-[35%] bg-card border border-border rounded-lg p-6 shrink-0 h-fit">
            <h2 className="font-semibold mb-6 flex items-center gap-2"><PenTool className="w-5 h-5 text-primary"/> Log Service Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Vehicle</label>
                <Select value={vehicleId} onValueChange={(val) => setVehicleId(val || '')} required>
                  <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                  <SelectContent>
                    {vehicles.map(v => {
                      const disabled = v.status === 'OnTrip';
                      return (
                        <SelectItem key={v._id} value={v._id} disabled={disabled} title={disabled ? "Cannot start maintenance on a vehicle currently on an active trip" : ""}>
                          {v.regNo} {disabled ? '(On Trip - Blocked)' : ''}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Service Type</label>
                <Input required value={serviceType} onChange={(e) => setServiceType(e.target.value)} placeholder="e.g. Oil Change, Engine Repair" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Cost</label>
                <Input required type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Date</label>
                <Input required type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Initial Status</label>
                <Select value={status} onValueChange={(val) => setStatus(val || '')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground mt-2" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Record'}
              </Button>
            </form>
          </div>
        )}

        {/* Right Panel */}
        <div className="flex-1 space-y-6 overflow-hidden">
          <div className="bg-card border border-border rounded-lg p-6">
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-muted/50 rounded-md animate-pulse"></div>)}
              </div>
            ) : (
              <DataTable data={logs} columns={columns} emptyTitle="No maintenance records found" />
            )}
          </div>

          <div className="bg-muted/30 border border-border rounded-lg p-6 flex flex-col items-center justify-center space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">Automated Workflow</h3>
            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <span className="bg-status-green/10 text-status-green px-3 py-1 rounded-full border border-status-green/20">Available</span>
              <span className="text-xs">──(create Active record)──▶</span>
              <span className="bg-status-orange/10 text-status-orange px-3 py-1 rounded-full border border-status-orange/20">In Shop</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <span className="bg-status-orange/10 text-status-orange px-3 py-1 rounded-full border border-status-orange/20">In Shop</span>
              <span className="text-xs">──(complete record)──▶</span>
              <span className="bg-status-green/10 text-status-green px-3 py-1 rounded-full border border-status-green/20">Available</span>
            </div>
            <p className="text-[11px] text-muted-foreground/70 text-center max-w-md mt-4">
              In Shop vehicles are automatically removed from the Trip Dispatcher's vehicle pool until this maintenance record is marked Completed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
