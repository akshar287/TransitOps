'use client';

import { Search, Moon, Sun, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 sticky top-0 z-10 shrink-0">
      <div className="w-1/3 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search... (Cmd+K)" 
          className="pl-9 h-9 bg-input/50 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-md"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground border border-border px-1.5 py-0.5 rounded bg-background shadow-sm">
          ⌘K
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-muted-foreground"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {session?.user && (
          <>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[13px] font-medium leading-none">{session.user.name}</p>
              </div>
              <div className="bg-status-blue/20 text-status-blue text-[11px] font-semibold px-2 py-0.5 rounded-full border border-status-blue/30">
                {session.user.role}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => signOut()} className="text-muted-foreground ml-2" title="Log out">
              <LogOut className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
