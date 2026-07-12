'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (failedAttempts >= 5) {
      setError('Account locked after 5 failed attempts. Try again later.');
      return;
    }

    if (!email || !password) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setFailedAttempts(prev => prev + 1);
        setError('Invalid credentials');
      } else {
        router.push('/');
        router.refresh();
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
            <h2 className="text-lg font-medium text-foreground">One login, four roles:</h2>
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
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Sign in to your account</h2>
            <p className="text-sm text-muted-foreground mt-2">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
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
                    className={`bg-input/30 pr-10 ${error && (!password || error === 'Invalid credentials') ? 'border-destructive' : ''}`}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {error === 'Invalid credentials' && (
                  <div className="flex items-center gap-2 text-destructive text-xs mt-2 bg-destructive/10 p-2 rounded border border-destructive/20">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Invalid credentials</span>
                  </div>
                )}
              </div>


            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label htmlFor="remember" className="text-[13px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-[13px] text-primary hover:underline font-medium">Forgot password?</a>
            </div>

            {failedAttempts >= 5 && (
              <div className="text-destructive text-sm text-center font-medium bg-destructive/10 p-3 rounded border border-destructive/20">
                Account locked after 5 failed attempts.
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={loading || failedAttempts >= 5}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-[13px] text-muted-foreground">
            Don't have an account? <a href="/register" className="text-primary hover:underline font-medium">Sign up</a>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-4">Access is scoped by role after login</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between text-[13px]">
                <span className="text-foreground font-medium">Fleet Manager</span>
                <span className="text-muted-foreground flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Fleet, Maintenance</span>
              </li>
              <li className="flex items-center justify-between text-[13px]">
                <span className="text-foreground font-medium">Dispatcher</span>
                <span className="text-muted-foreground flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Dashboard, Trips</span>
              </li>
              <li className="flex items-center justify-between text-[13px]">
                <span className="text-foreground font-medium">Safety Officer</span>
                <span className="text-muted-foreground flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Drivers, Trips (view)</span>
              </li>
              <li className="flex items-center justify-between text-[13px]">
                <span className="text-foreground font-medium">Financial Analyst</span>
                <span className="text-muted-foreground flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Fuel & Exp, Analytics</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
