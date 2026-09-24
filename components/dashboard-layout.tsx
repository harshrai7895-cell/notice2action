'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Calendar,
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  PlusCircle,
  BarChart3,
  Settings,
  ClipboardList,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const studentNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Notices', href: '/dashboard/notices', icon: FileText },
  { label: 'My Actions', href: '/dashboard/actions', icon: CheckSquare },
  { label: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { label: 'Search', href: '/dashboard/search', icon: Search },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Create Notice', href: '/dashboard/create-notice', icon: PlusCircle },
  { label: 'Manage Notices', href: '/dashboard/notices', icon: ClipboardList },
  { label: 'Categories', href: '/dashboard/categories', icon: Settings },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !profile) {
      router.push('/login');
    }
  }, [loading, profile, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  if (!profile) return null;

  const navItems = profile.role === 'admin' ? adminNav : studentNav;
  const initials = profile.full_name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm dark:bg-white dark:text-slate-900">
            N2
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-none">N2A</span>
            <span className="text-[10px] text-slate-500 leading-none mt-0.5">Notice2Action</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-slate-200 text-xs font-semibold dark:bg-slate-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile.full_name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{profile.role}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-8 w-8" title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 sm:max-w-64">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {SidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold dark:bg-white dark:text-slate-900">
              N2
            </div>
            <span className="font-bold text-sm">N2A</span>
          </Link>
          <ThemeToggle />
        </header>

        {/* Desktop top bar */}
        <header className="hidden h-14 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900 lg:flex">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {navItems.find((n) => pathname === n.href || (n.href !== '/dashboard' && pathname.startsWith(n.href)))?.label || 'Dashboard'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/dashboard/notifications">
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback className="bg-slate-200 text-xs font-semibold dark:bg-slate-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
