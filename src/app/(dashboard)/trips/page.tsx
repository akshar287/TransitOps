'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { MapPin, Truck, User, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function TripsPage() {
  const { data: session } = useSession();
  const [trips, setTrips] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  
  // Create Form State
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');
  
  // Complete Form State
  const [finalOdometer, setFinalOdometer] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');

  // Cancel State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/trips');
      setTrips(await res.json());
    } catch (e) {
      toast.error('Failed to load trips');
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [vRes, dRes] = await Promise.all([
        fetch('/api/vehicles?status=Available'),
        fetch('/api/drivers?status=Available&licenseValid=true')
      ]);
      setVehicles(await vRes.json());
      setDrivers(await dRes.json());
    } catch (e) {
      toast.error('Failed to load available vehicles/drivers');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchTrips(), fetchDropdowns()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const clearForm = () => {
    setSelectedTrip(null);
    setSource('');
    setDestination('');
    setVehicleId('');
    setDriverId('');
    setCargoWeight('');
    setPlannedDistance('');
    setFinalOdometer('');
    setFuelConsumed('');
  };

  const selectedVehicle = vehicles.find(v => v._id === vehicleId);
  const capacityExceeded = selectedVehicle && Number(cargoWeight) > selectedVehicle.maxCapacityKg;

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (capacityExceeded) return;
    
    setSubmitting(true);
    try {
      // 1. Create Draft
      const draftRes = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          destination,
          vehicleId,
          driverId,
          cargoWeightKg: Number(cargoWeight),
          plannedDistanceKm: Number(plannedDistance)
        })
      });
      
      if (!draftRes.ok) throw new Error((await draftRes.json()).error);
      const draft = await draftRes.json();

      // 2. Dispatch
      const dispatchRes = await fetch(`/api/trips/${draft._id}/dispatch`, {
        method: 'PATCH',
      });

      if (!dispatchRes.ok) throw new Error((await dispatchRes.json()).error);

      toast.success(`Trip ${draft.tripCode} dispatched!`);
      clearForm();
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/trips/${selectedTrip._id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalOdometer: Number(finalOdometer),
          fuelConsumedLiters: Number(fuelConsumed)
        })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      
      toast.success('Trip completed successfully!');
      clearForm();
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason) return toast.error('Reason is required');
    setSubmitting(true);
    try {
      const res = await fetch(`/api/trips/${selectedTrip._id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancellationReason: cancelReason })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      
      toast.success('Trip cancelled');
      setIsCancelModalOpen(false);
      clearForm();
      loadData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isDispatcher = session?.user?.role === 'Dispatcher';
  
  // Lifecycle steps
  const steps = ['Draft', 'Dispatched', 'Completed'];
  const currentStep = selectedTrip?.status === 'Cancelled' ? 'Cancelled' : (selectedTrip?.status || 'Draft');

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">
      {/* Left Panel: Create / Complete Form */}
      <div className="w-full lg:w-[45%] bg-card border border-border rounded-lg flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="font-semibold text-lg">{selectedTrip ? `Manage Trip: ${selectedTrip.tripCode}` : 'Create New Trip'}</h2>
          
          {/* Stepper */}
          <div className="mt-6 flex items-center justify-between relative px-2">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-border -z-10" />
            {steps.map((step, idx) => {
              let color = 'bg-muted border-muted-foreground text-muted-foreground';
              if (currentStep === 'Cancelled') {
                if (step === 'Draft') color = 'bg-status-red border-status-red text-white';
              } else {
                const stepIdx = steps.indexOf(step);
                const currentIdx = steps.indexOf(currentStep);
                if (stepIdx < currentIdx) color = 'bg-status-green border-status-green text-white';
                else if (stepIdx === currentIdx) color = 'bg-status-blue border-status-blue text-white';
              }

              return (
                <div key={step} className="flex flex-col items-center gap-1.5 bg-card px-2">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${color}`}>
                    {idx + 1}
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wide">{step}</span>
                </div>
              );
            })}
          </div>
          {currentStep === 'Cancelled' && (
            <div className="mt-4 flex items-center gap-2 text-status-red bg-status-red/10 px-3 py-2 rounded text-xs font-medium border border-status-red/20">
              <XCircle className="w-4 h-4" /> Cancelled: {selectedTrip.cancellationReason}
            </div>
          )}
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {!isDispatcher ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3">
              <AlertCircle className="w-8 h-8 opacity-50" />
              <p>View only — Dispatcher access required to manage trips.</p>
            </div>
          ) : (
            <>
              {(!selectedTrip || selectedTrip.status === 'Draft') && (
                <form onSubmit={handleDispatch} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium">Source</label>
                      <Input required value={source} onChange={(e) => setSource(e.target.value)} placeholder="Origin address" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium">Destination</label>
                      <Input required value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination address" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium">Vehicle</label>
                    <Select value={vehicleId} onValueChange={(val) => setVehicleId(val || '')} required>
                      <SelectTrigger><SelectValue placeholder="Select available vehicle" /></SelectTrigger>
                      <SelectContent>
                        {vehicles.map(v => (
                          <SelectItem key={v._id} value={v._id}>
                            {v.regNo} ({v.nameModel}) — {v.maxCapacityKg} kg capacity
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium">Driver</label>
                    <Select value={driverId} onValueChange={(val) => setDriverId(val || '')} required>
                      <SelectTrigger><SelectValue placeholder="Select available driver" /></SelectTrigger>
                      <SelectContent>
                        {drivers.map(d => (
                          <SelectItem key={d._id} value={d._id}>
                            {d.name} ({d.licenseNo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium">Cargo Weight (kg)</label>
                      <Input required type="number" value={cargoWeight} onChange={(e) => setCargoWeight(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium">Planned Dist. (km)</label>
                      <Input required type="number" value={plannedDistance} onChange={(e) => setPlannedDistance(e.target.value)} />
                    </div>
                  </div>

                  {capacityExceeded && (
                    <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-[13px]">
                      <strong>Capacity Exceeded!</strong><br />
                      Vehicle Max: {selectedVehicle.maxCapacityKg} kg<br />
                      Cargo: {cargoWeight} kg<br />
                      <em>Dispatch blocked until resolved.</em>
                    </div>
                  )}

                  <div className="pt-4 flex gap-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={clearForm}>
                      Cancel / Clear
                    </Button>
                    <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={capacityExceeded || submitting}>
                      {submitting ? 'Dispatching...' : 'Dispatch Trip'}
                    </Button>
                  </div>
                </form>
              )}

              {selectedTrip?.status === 'Dispatched' && (
                <form onSubmit={handleComplete} className="space-y-4">
                  <div className="p-4 bg-muted/40 rounded border border-border mb-6">
                    <h3 className="text-sm font-semibold mb-2">Trip Details</h3>
                    <div className="text-[13px] text-muted-foreground space-y-1">
                      <p><strong>Route:</strong> {selectedTrip.source} → {selectedTrip.destination}</p>
                      <p><strong>Vehicle:</strong> {selectedTrip.vehicleId.regNo}</p>
                      <p><strong>Driver:</strong> {selectedTrip.driverId.name}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium">Final Odometer</label>
                    <Input required type="number" value={finalOdometer} onChange={(e) => setFinalOdometer(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium">Fuel Consumed (Liters)</label>
                    <Input required type="number" value={fuelConsumed} onChange={(e) => setFuelConsumed(e.target.value)} />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button type="button" variant="outline" className="border-status-red text-status-red hover:bg-status-red/10" onClick={() => setIsCancelModalOpen(true)}>
                      Cancel Trip
                    </Button>
                    <Button type="submit" className="flex-1 bg-status-green hover:bg-status-green/90 text-white" disabled={submitting}>
                      {submitting ? 'Completing...' : 'Complete Trip'}
                    </Button>
                  </div>
                </form>
              )}

              {(selectedTrip?.status === 'Completed' || selectedTrip?.status === 'Cancelled') && (
                <div className="text-center py-10 space-y-4">
                  <div className="inline-flex w-12 h-12 rounded-full bg-muted items-center justify-center">
                    {selectedTrip.status === 'Completed' ? <CheckCircle2 className="w-6 h-6 text-status-green" /> : <XCircle className="w-6 h-6 text-status-red" />}
                  </div>
                  <h3 className="text-lg font-medium">Trip {selectedTrip.status}</h3>
                  <Button variant="outline" onClick={clearForm}>Create New Trip</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel: Live Board */}
      <div className="flex-1 bg-card border border-border rounded-lg flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
          <h2 className="font-semibold text-lg">Live Board</h2>
          <Button variant="ghost" size="sm" onClick={loadData} disabled={loading}><Clock className="w-4 h-4 mr-2"/> Refresh</Button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {loading && !trips.length ? (
            [1,2,3].map(i => <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />)
          ) : trips.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No trips yet — create one on the left.
            </div>
          ) : (
            trips.map(trip => (
              <div 
                key={trip._id} 
                onClick={() => isDispatcher && setSelectedTrip(trip)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedTrip?._id === trip._id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30 bg-card'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-foreground">{trip.tripCode}</span>
                    <StatusBadge status={trip.status} />
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {trip.status === 'Dispatched' && 'Active'}
                    {trip.status === 'Cancelled' && <span className="text-status-red truncate max-w-[120px] inline-block">{trip.cancellationReason}</span>}
                    {trip.status === 'Completed' && 'Done'}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{trip.source} → {trip.destination}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground/80">
                  <div className="flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    {trip.vehicleId ? trip.vehicleId.regNo : 'Unassigned'}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {trip.driverId ? trip.driverId.name : 'Unassigned'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-3 border-t border-border bg-muted/10 text-center text-xs text-muted-foreground/70">
          On completion: odometer & fuel logged → vehicle & driver automatically return to Available
        </div>
      </div>

      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium">Cancellation Reason</label>
              <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Why is this trip being cancelled?" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)}>Back</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={submitting}>Confirm Cancellation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
