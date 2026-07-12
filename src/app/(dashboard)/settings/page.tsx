'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Check, Minus, Settings, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    depotName: '',
    currency: '',
    distanceUnit: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        setFormData(await res.json());
      } catch (e) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Settings saved');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isManager = session?.user?.role === 'FleetManager';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings & Access Control</h1>
        <p className="text-sm text-muted-foreground">Manage global configuration and view RBAC rules</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left: General Settings */}
        <div className="w-full lg:w-[40%] bg-card border border-border rounded-lg p-6 shrink-0 h-fit">
          <h2 className="font-semibold mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-primary"/> General Configuration</h2>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted/50 rounded" />
              <div className="h-10 bg-muted/50 rounded" />
              <div className="h-10 bg-muted/50 rounded" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Depot Name</label>
                <Input 
                  required 
                  value={formData.depotName} 
                  onChange={(e) => setFormData({...formData, depotName: e.target.value})} 
                  disabled={!isManager}
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Currency</label>
                <Select value={formData.currency} onValueChange={(val) => setFormData({...formData, currency: val || ''})} disabled={!isManager}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR (₹)">INR (₹)</SelectItem>
                    <SelectItem value="USD ($)">USD ($)</SelectItem>
                    <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">Distance Unit</label>
                <Select value={formData.distanceUnit} onValueChange={(val) => setFormData({...formData, distanceUnit: val || ''})} disabled={!isManager}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kilometers">Kilometers</SelectItem>
                    <SelectItem value="Miles">Miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white" 
                disabled={submitting || !isManager}
              >
                {submitting ? 'Saving...' : 'Save changes'}
              </Button>
            </form>
          )}
        </div>

        {/* Right: RBAC Matrix */}
        <div className="flex-1 bg-card border border-border rounded-lg p-6 overflow-x-auto">
          <div className="mb-6">
            <h2 className="font-semibold text-lg flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-status-orange" /> Role-Based Access Control (RBAC)</h2>
            <p className="text-xs text-muted-foreground mt-1">Access is enforced automatically based on the role selected at login.</p>
          </div>

          <div className="min-w-[600px]">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="py-3 px-4 font-medium">Role</th>
                  <th className="py-3 px-4 font-medium text-center">Fleet</th>
                  <th className="py-3 px-4 font-medium text-center">Drivers</th>
                  <th className="py-3 px-4 font-medium text-center">Trips</th>
                  <th className="py-3 px-4 font-medium text-center">Fuel/Exp.</th>
                  <th className="py-3 px-4 font-medium text-center">Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr className="hover:bg-muted/30">
                  <td className="py-4 px-4 font-medium">Fleet Manager</td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-status-green mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-status-green mx-auto" /></td>
                  <td className="py-4 px-4 text-center text-muted-foreground"><Minus className="w-4 h-4 mx-auto opacity-50" /></td>
                  <td className="py-4 px-4 text-center text-muted-foreground"><Minus className="w-4 h-4 mx-auto opacity-50" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-status-green mx-auto" /></td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-4 px-4 font-medium">Dispatcher</td>
                  <td className="py-4 px-4 text-center text-muted-foreground">view</td>
                  <td className="py-4 px-4 text-center text-muted-foreground"><Minus className="w-4 h-4 mx-auto opacity-50" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-status-green mx-auto" /></td>
                  <td className="py-4 px-4 text-center text-muted-foreground"><Minus className="w-4 h-4 mx-auto opacity-50" /></td>
                  <td className="py-4 px-4 text-center text-muted-foreground"><Minus className="w-4 h-4 mx-auto opacity-50" /></td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-4 px-4 font-medium">Safety Officer</td>
                  <td className="py-4 px-4 text-center text-muted-foreground"><Minus className="w-4 h-4 mx-auto opacity-50" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-status-green mx-auto" /></td>
                  <td className="py-4 px-4 text-center text-muted-foreground">view</td>
                  <td className="py-4 px-4 text-center text-muted-foreground"><Minus className="w-4 h-4 mx-auto opacity-50" /></td>
                  <td className="py-4 px-4 text-center text-muted-foreground"><Minus className="w-4 h-4 mx-auto opacity-50" /></td>
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-4 px-4 font-medium">Financial Analyst</td>
                  <td className="py-4 px-4 text-center text-muted-foreground">view</td>
                  <td className="py-4 px-4 text-center text-muted-foreground"><Minus className="w-4 h-4 mx-auto opacity-50" /></td>
                  <td className="py-4 px-4 text-center text-muted-foreground"><Minus className="w-4 h-4 mx-auto opacity-50" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-status-green mx-auto" /></td>
                  <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-status-green mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
