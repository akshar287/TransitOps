'use client';

import { Search, Moon, Sun, LogOut, Bell, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10 shrink-0">
      <div className="w-1/3 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search..." 
          className="pl-9 h-9 bg-background border border-border focus-visible:ring-1 focus-visible:ring-primary rounded-md"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground"
          title="Help & Documentation"
        >
          <HelpCircle className="w-4 h-4" />
        </Button>

        <div className="h-4 w-[1px] bg-border mx-1" />

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {session?.user && (
          <>
            <div className="h-4 w-[1px] bg-border mx-1" />
            <div className="flex items-center gap-3 pl-1">
              <div className="text-right">
                <p className="text-[13px] font-medium leading-none text-foreground">{session.user.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">{session.user.role}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => signOut()} className="text-muted-foreground hover:text-destructive ml-1" title="Log out">
              <LogOut className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
