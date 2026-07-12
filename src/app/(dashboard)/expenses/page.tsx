'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Plus, Fuel, IndianRupee, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ExpensesPage() {
  const { data: session } = useSession();
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Fuel Form
  const [vehicleId, setVehicleId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [liters, setLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');

  // Expense Form
  const [tripId, setTripId] = useState('');
  const [toll, setToll] = useState('');
  const [other, setOther] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fRes, eRes, vRes, tRes] = await Promise.all([
        fetch('/api/fuel-logs'),
        fetch('/api/expenses'),
        fetch('/api/vehicles'),
        fetch('/api/trips')
      ]);
      const fData = await fRes.json();
      setFuelLogs(fData.fuelLogs);
      setSummary(fData.summary);
      setExpenses(await eRes.json());
      setVehicles(await vRes.json());
      setTrips(await tRes.json());
    } catch (e) {
      toast.error('Failed to load financials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(liters) <= 0 || Number(fuelCost) <= 0) return toast.error('Values must be positive');
    setSubmitting(true);
    try {
      const res = await fetch('/api/fuel-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, date, liters: Number(liters), cost: Number(fuelCost) })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Fuel logged');
      setIsFuelModalOpen(false);
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedTrip = trips.find(t => t._id === tripId);
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tripId, 
          vehicleId: selectedTrip?.vehicleId?._id || selectedTrip?.vehicleId, 
          toll: Number(toll), 
          other: Number(other) 
        })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Expense recorded');
      setIsExpenseModalOpen(false);
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isFinance = session?.user?.role === 'FinancialAnalyst';

  const fuelColumns = [
    { header: 'Vehicle', accessorKey: 'vehicle', cell: (item: any) => <span className="font-medium">{item.vehicleId?.regNo}</span> },
    { header: 'Date', accessorKey: 'date', cell: (item: any) => new Date(item.date).toLocaleDateString() },
    { header: 'Liters', accessorKey: 'liters', cell: (item: any) => `${item.liters} L` },
    { header: 'Fuel Cost', accessorKey: 'cost', cell: (item: any) => <span className="font-bold text-status-orange">₹{item.cost.toLocaleString()}</span> }
  ];

  const expenseColumns = [
    { header: 'Trip', accessorKey: 'trip', cell: (item: any) => <span className="font-medium">{item.tripId?.tripCode}</span> },
    { header: 'Vehicle', accessorKey: 'vehicle', cell: (item: any) => <span>{item.vehicleId?.regNo}</span> },
    { header: 'Toll', accessorKey: 'toll', cell: (item: any) => `₹${item.toll.toLocaleString()}` },
    { header: 'Other', accessorKey: 'other', cell: (item: any) => `₹${item.other.toLocaleString()}` },
    { header: 'Total', accessorKey: 'total', cell: (item: any) => <span className="font-bold">₹{(item.toll + item.other).toLocaleString()}</span> }
  ];

  const totalExpensePreview = Number(toll || 0) + Number(other || 0);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><IndianRupee className="w-6 h-6 text-primary"/> Fuel & Expense Management</h1>
          <p className="text-sm text-muted-foreground">Track operational costs</p>
        </div>
        {isFinance && (
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setIsFuelModalOpen(true)}>
              <Fuel className="w-4 h-4 mr-2" /> Log Fuel
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsExpenseModalOpen(true)}>
              <Receipt className="w-4 h-4 mr-2" /> Add Expense
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Logs */}
        <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col max-h-[500px]">
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="font-semibold">Fuel Logs</h2>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="animate-pulse space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted/50 rounded" />)}</div>
            ) : (
              <DataTable data={fuelLogs} columns={fuelColumns} emptyTitle="No fuel logs found" />
            )}
          </div>
        </div>

        {/* Other Expenses */}
        <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col max-h-[500px]">
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="font-semibold">Other Expenses (Toll / Misc)</h2>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="animate-pulse space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted/50 rounded" />)}</div>
            ) : (
              <DataTable data={expenses} columns={expenseColumns} emptyTitle="No other expenses found" />
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 lg:left-[220px] right-0 bg-card border-t border-border p-4 flex justify-end items-center px-6 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.2)] z-10">
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Total Operational Cost (Auto)</p>
            <p className="text-xs text-muted-foreground mt-0.5">Fuel (₹{summary?.fuelCost?.toLocaleString()}) + Maint (₹{summary?.maintenanceCost?.toLocaleString()}) + Misc (₹{(summary?.tollCost + summary?.otherCost)?.toLocaleString()})</p>
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            ₹{summary?.totalOperationalCost?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      <Dialog open={isFuelModalOpen} onOpenChange={setIsFuelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Fuel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFuelSubmit} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Vehicle</label>
              <Select value={vehicleId} onValueChange={(val) => setVehicleId(val || '')} required>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  {vehicles.map(v => <SelectItem key={v._id} value={v._id}>{v.regNo}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Date</label>
              <Input required type="date" value={date} onChange={(e) => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Liters</label>
              <Input required type="number" step="0.1" value={liters} onChange={(e) => setLiters(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Total Cost</label>
              <Input required type="number" step="0.01" value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} />
            </div>
            <Button type="submit" className="w-full bg-primary" disabled={submitting}>Save Fuel Log</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleExpenseSubmit} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Trip</label>
              <Select value={tripId} onValueChange={(val) => setTripId(val || '')} required>
                <SelectTrigger><SelectValue placeholder="Select trip" /></SelectTrigger>
                <SelectContent>
                  {trips.map(t => <SelectItem key={t._id} value={t._id}>{t.tripCode} ({t.status})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Toll Cost</label>
              <Input type="number" step="0.01" value={toll} onChange={(e) => setToll(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Other Misc Cost</label>
              <Input type="number" step="0.01" value={other} onChange={(e) => setOther(e.target.value)} />
            </div>
            
            <div className="bg-muted/50 p-3 rounded flex justify-between items-center text-sm font-medium border border-border mt-4">
              <span className="text-muted-foreground">Calculated Total</span>
              <span className="text-lg">₹{totalExpensePreview.toLocaleString()}</span>
            </div>

            <Button type="submit" className="w-full bg-primary" disabled={submitting}>Save Expense</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
