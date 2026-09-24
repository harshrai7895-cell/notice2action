'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Notification } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/constants';
import { Bell, BellOff, Check, AlertCircle, Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  new_notice: { icon: Bell, color: 'text-blue-500' },
  deadline_approaching: { icon: Clock, color: 'text-orange-500' },
  task_overdue: { icon: AlertCircle, color: 'text-red-500' },
  task_assigned: { icon: Check, color: 'text-green-500' },
  notice_updated: { icon: Info, color: 'text-slate-500' },
};

export default function NotificationsPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) fetchNotifications();
  }, [profile]);

  async function fetchNotifications() {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile!.id)
      .order('created_at', { ascending: false });
    setNotifications((data as unknown as Notification[]) || []);
    setLoading(false);
  }

  async function markRead(id: string) {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (!error) {
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    }
  }

  async function markAllRead() {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', profile!.id).eq('is_read', false);
    if (error) {
      toast.error('Failed to mark all as read');
    } else {
      toast.success('All notifications marked as read');
      fetchNotifications();
    }
  }

  if (loading) {
    return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}</div>;
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1">
            <Check className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BellOff className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No notifications yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const config = typeConfig[notif.type] || typeConfig.notice_updated;
            const Icon = config.icon;
            return (
              <Card key={notif.id} className={cn(!notif.is_read && 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30')}>
                <CardContent className="py-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                      <Icon className={cn('h-4 w-4', config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{notif.title}</p>
                        <span className="text-xs text-slate-400 flex-shrink-0">{formatRelativeTime(notif.created_at)}</span>
                      </div>
                      {notif.message && <p className="mt-0.5 text-xs text-slate-500">{notif.message}</p>}
                      <div className="mt-2 flex items-center gap-2">
                        {!notif.is_read ? (
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markRead(notif.id)}>
                            <Check className="h-3 w-3 mr-1" /> Mark read
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400">Read</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
