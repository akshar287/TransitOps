'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

export default function DriversPage() {
  const { data: session } = useSession();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '', licenseNo: '', licenseCategory: '', licenseExpiry: '', contactNumber: '', status: 'Available'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/drivers`);
      const data = await res.json();
      setDrivers(data);
    } catch (e) {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add driver');
      }
      toast.success('Driver added successfully');
      setIsDrawerOpen(false);
      fetchDrivers();
      setFormData({ name: '', licenseNo: '', licenseCategory: '', licenseExpiry: '', contactNumber: '', status: 'Available' });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (driverId: string, newStatus: string) => {
    if (newStatus === 'OnTrip') {
      toast.error('On Trip status is set automatically when a trip is dispatched.');
      return;
    }
    
    // Optimistic update
    const previousDrivers = [...drivers];
    setDrivers(drivers.map(d => d._id === driverId ? { ...d, status: newStatus } : d));

    try {
      const res = await fetch(`/api/drivers/${driverId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update status');
      }
      toast.success('Status updated');
    } catch (e: any) {
      toast.error(e.message);
      setDrivers(previousDrivers); // revert
    }
  };

  const canEdit = session?.user?.role === 'SafetyOfficer';
  const now = new Date();

  const expiredDrivers = drivers.filter(d => new Date(d.licenseExpiry) < now);

  const filteredDrivers = drivers.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.licenseNo.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { header: 'Driver', accessorKey: 'name', cell: (item: any) => <span className="font-semibold">{item.name}</span> },
    { header: 'License No.', accessorKey: 'licenseNo', cell: (item: any) => <span className="font-mono text-xs">{item.licenseNo}</span> },
    { header: 'Category', accessorKey: 'licenseCategory' },
    { header: 'Expiry', accessorKey: 'licenseExpiry', cell: (item: any) => {
        const isExpired = new Date(item.licenseExpiry) < now;
        return (
          <div className="flex items-center gap-2">
            <span className={isExpired ? 'text-status-red font-medium' : ''}>
              {new Date(item.licenseExpiry).toLocaleDateString()}
            </span>
            {isExpired && <span className="bg-status-red text-white text-[10px] px-1.5 py-0.5 rounded font-bold">EXPIRED</span>}
          </div>
        );
      }
    },
    { header: 'Contact', accessorKey: 'contactNumber' },
    { header: 'Trip Completion', accessorKey: 'tripCompletionPct', cell: (item: any) => (
        <div className="flex items-center gap-2 w-24">
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${item.tripCompletionPct}%` }} />
          </div>
          <span className="text-xs">{item.tripCompletionPct}%</span>
        </div>
      )
    },
    { header: 'Safety Score', accessorKey: 'safetyScore', cell: (item: any) => {
        const score = item.safetyScore;
        let colorClass = 'bg-status-green/20 text-status-green border-status-green/30';
        if (score < 90 && score >= 70) colorClass = 'bg-status-orange/20 text-status-orange border-status-orange/30';
        if (score < 70) colorClass = 'bg-status-red/20 text-status-red border-status-red/30';
        return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>{score}</span>
      }
    },
    { header: 'Status', accessorKey: 'status', cell: (item: any) => (
        <div className="flex flex-col gap-2">
          <StatusBadge status={item.status} />
          {canEdit && (
            <div className="flex flex-wrap gap-1 mt-1">
              {['Available', 'OffDuty', 'Suspended'].map(s => (
                <button 
                  key={s} 
                  disabled={item.status === s || item.status === 'OnTrip'}
                  onClick={() => handleStatusUpdate(item._id, s)}
                  className="text-[10px] px-1.5 py-0.5 bg-muted hover:bg-muted-foreground/20 rounded disabled:opacity-50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      ) 
    },
  ];

  return (
    <div className="space-y-6">
      {expiredDrivers.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            ⚠️ {expiredDrivers.length} driver{expiredDrivers.length > 1 ? 's have' : ' has an'} expired license and cannot be dispatched.
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Drivers & Safety Profiles</h1>
          <p className="text-sm text-muted-foreground">Manage driver roster and compliance</p>
        </div>
        {canEdit && (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsDrawerOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Driver
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-lg border border-border">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search driver name or license..." 
            className="pl-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border border-border inline-block">
        <strong>Business Rule:</strong> A driver with an expired license or Suspended status is automatically blocked from trip assignment in the Trip Dispatcher.
      </div>

      {loading ? (
        <div className="space-y-4">
           {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted/50 rounded-md animate-pulse"></div>)}
        </div>
      ) : (
        <DataTable data={filteredDrivers} columns={columns} emptyTitle="No drivers found" />
      )}

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>Add Driver</SheetTitle>
            <SheetDescription>Register a new driver profile.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Full Name</label>
              <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">License Number</label>
              <Input required value={formData.licenseNo} onChange={(e) => setFormData({...formData, licenseNo: e.target.value})} placeholder="e.g. DL-99382" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">License Category</label>
              <Select value={formData.licenseCategory} onValueChange={(val) => setFormData({...formData, licenseCategory: val || ''})}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="C">C (Rigid)</SelectItem>
                  <SelectItem value="CE">CE (Articulated)</SelectItem>
                  <SelectItem value="D">D (Passenger)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">License Expiry Date</label>
              <Input required type="date" value={formData.licenseExpiry} onChange={(e) => setFormData({...formData, licenseExpiry: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Contact Number</label>
              <Input required type="tel" value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} placeholder="+1-555-0101" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Initial Status</label>
              <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val || ''})}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="OffDuty">Off Duty</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground mt-4" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Driver'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
