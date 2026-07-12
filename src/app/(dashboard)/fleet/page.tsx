'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

export default function FleetPage() {
  const { data: session } = useSession();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Form state
  const [formData, setFormData] = useState({
    regNo: '', nameModel: '', type: '', maxCapacityKg: '', odometer: '0', acquisitionCost: '', status: 'Available'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vehicles?q=${search}&status=${statusFilter}&type=${typeFilter}`);
      const data = await res.json();
      setVehicles(data);
    } catch (e) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search, statusFilter, typeFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxCapacityKg: Number(formData.maxCapacityKg),
          odometer: Number(formData.odometer),
          acquisitionCost: Number(formData.acquisitionCost)
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add vehicle');
      }

      toast.success('Vehicle added successfully');
      setIsDrawerOpen(false);
      fetchVehicles();
      setFormData({ regNo: '', nameModel: '', type: '', maxCapacityKg: '', odometer: '0', acquisitionCost: '', status: 'Available' });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'Reg. No', accessorKey: 'regNo', cell: (item: any) => <span className="font-mono">{item.regNo}</span> },
    { header: 'Name/Model', accessorKey: 'nameModel' },
    { header: 'Type', accessorKey: 'type' },
    { header: 'Capacity (kg)', accessorKey: 'maxCapacityKg' },
    { header: 'Odometer', accessorKey: 'odometer' },
    { header: 'Cost', accessorKey: 'acquisitionCost', cell: (item: any) => `₹${item.acquisitionCost.toLocaleString()}` },
    { header: 'Status', accessorKey: 'status', cell: (item: any) => <StatusBadge status={item.status} /> },
  ];

  const canAdd = session?.user?.role === 'FleetManager';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicle Registry</h1>
          <p className="text-sm text-muted-foreground">Manage your transport fleet</p>
        </div>
        {canAdd && (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsDrawerOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Vehicle
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-lg border border-border">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search reg. no or model..." 
            className="pl-9" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || '')}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Status: All</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="OnTrip">On Trip</SelectItem>
            <SelectItem value="InShop">In Shop</SelectItem>
            <SelectItem value="Retired">Retired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || '')}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Type: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Type: All</SelectItem>
            <SelectItem value="Heavy Duty">Heavy Duty</SelectItem>
            <SelectItem value="Light Duty">Light Duty</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">
           {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted/50 rounded-md animate-pulse"></div>)}
        </div>
      ) : (
        <DataTable data={vehicles} columns={columns} emptyTitle="No vehicles found" />
      )}

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>Add Vehicle</SheetTitle>
            <SheetDescription>Register a new vehicle in the fleet.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Registration Number</label>
              <Input required value={formData.regNo} onChange={(e) => setFormData({...formData, regNo: e.target.value})} placeholder="e.g. TRK-1001" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Name / Model</label>
              <Input required value={formData.nameModel} onChange={(e) => setFormData({...formData, nameModel: e.target.value})} placeholder="e.g. Volvo FH16" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Type</label>
              <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val || ''})}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Heavy Duty">Heavy Duty</SelectItem>
                  <SelectItem value="Light Duty">Light Duty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Max Capacity (kg)</label>
              <Input required type="number" value={formData.maxCapacityKg} onChange={(e) => setFormData({...formData, maxCapacityKg: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Odometer</label>
              <Input required type="number" value={formData.odometer} onChange={(e) => setFormData({...formData, odometer: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Acquisition Cost</label>
              <Input required type="number" value={formData.acquisitionCost} onChange={(e) => setFormData({...formData, acquisitionCost: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Initial Status</label>
              <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val || ''})}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="InShop">In Shop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground mt-4" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Vehicle'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
