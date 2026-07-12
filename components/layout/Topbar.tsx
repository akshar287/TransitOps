import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Topbar() {
  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 sticky top-0 z-10 shrink-0">
      <div className="w-1/3 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Global search..." 
          className="pl-9 h-9 bg-input/50 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-md"
        />
      </div>
      
      <div className="flex items-center gap-4">
        {/* Placeholder for User Profile until NextAuth is fully integrated visually */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[13px] font-medium leading-none">Ravi K.</p>
          </div>
          <div className="bg-[#4C8DFF]/20 text-[#4C8DFF] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#4C8DFF]/30">
            Dispatcher
          </div>
        </div>
      </div>
    </header>
  );
}
