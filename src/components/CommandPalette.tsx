'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Truck,
  Users,
  Map,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
  Moon,
  Sun,
  Plus
} from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push('/'))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/fleet'))}>
            <Truck className="mr-2 h-4 w-4" />
            Fleet Registry
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/drivers'))}>
            <Users className="mr-2 h-4 w-4" />
            Drivers
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/trips'))}>
            <Map className="mr-2 h-4 w-4" />
            Trip Dispatcher
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/maintenance'))}>
            <Wrench className="mr-2 h-4 w-4" />
            Maintenance
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/expenses'))}>
            <Fuel className="mr-2 h-4 w-4" />
            Fuel & Expenses
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/analytics'))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => router.push('/fleet?add=true'))}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/drivers?add=true'))}>
            <Plus className="mr-2 h-4 w-4" />
            Add Driver
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/trips'))}>
            <Plus className="mr-2 h-4 w-4" />
            Create Trip
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
            <Sun className="mr-2 h-4 w-4" />
            Light Mode
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
            <Moon className="mr-2 h-4 w-4" />
            Dark Mode
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
