'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !role) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to register');
      } else {
        router.push('/login');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Panel */}
      <div className="w-full md:w-[40%] bg-[#FAF7F0] border-r border-border p-8 md:p-12 flex flex-col relative overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E8A33D] to-[#D98C1F] flex items-center justify-center shadow-lg">
              <span className="text-[#0B0B0D] font-bold text-xl">T</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">TransitOps</h1>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">Smart Transport Operations Platform</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-medium text-foreground">Create an account for:</h2>
            <ul className="space-y-4">
              {['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'].map((r) => (
                <li key={r} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="relative z-10 mt-auto pt-12">
          <p className="text-xs text-muted-foreground/60">TransitOps © 2026 · RBAC Enabled</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Create an account</h2>
            <p className="text-sm text-muted-foreground mt-2">Sign up to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-foreground">Full Name</label>
                <Input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="John Doe"
                  className={`bg-input/30 ${error && !name ? 'border-destructive' : ''}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-foreground">Email</label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@transitops.com"
                  className={`bg-input/30 ${error && !email ? 'border-destructive' : ''}`}
                />
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-[13px] font-medium text-foreground">Password</label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••"
                    className={`bg-input/30 pr-10 ${error && !password ? 'border-destructive' : ''}`}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-foreground">Role</label>
                <Select value={role} onValueChange={(val) => setRole(val || '')}>
                  <SelectTrigger className={`bg-input/30 ${error && !role ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FleetManager">Fleet Manager</SelectItem>
                    <SelectItem value="Dispatcher">Dispatcher</SelectItem>
                    <SelectItem value="SafetyOfficer">Safety Officer</SelectItem>
                    <SelectItem value="FinancialAnalyst">Financial Analyst</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 text-destructive text-xs mt-2 bg-destructive/10 p-2 rounded border border-destructive/20">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-[13px] text-muted-foreground">
            Already have an account? <a href="/login" className="text-primary hover:underline font-medium">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
