'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase/client';
import type { Action, Notice, Notification } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PriorityBadge, StatusBadge, DeadlineBadge } from '@/components/shared/badges';
import { getDeadlineStatus, formatDate } from '@/lib/constants';
import { FileText, CheckCircle2, Clock, AlertTriangle, CalendarClock, ArrowRight, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [actions, setActions] = useState<Action[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    fetchData();
  }, [profile]);

  async function fetchData() {
    setLoading(true);
    const [actionsRes, noticesRes, notifRes] = await Promise.all([
      supabase.from('actions').select('*, notice:notices(*)').eq('user_id', profile!.id).order('deadline', { ascending: true }),
      supabase.from('notices').select('*, category:categories(*)').order('created_at', { ascending: false }).limit(5),
      supabase.from('notifications').select('*').eq('user_id', profile!.id).order('created_at', { ascending: false }).limit(5),
    ]);

    setActions((actionsRes.data as unknown as Action[]) || []);
    setNotices((noticesRes.data as unknown as Notice[]) || []);
    setNotifications((notifRes.data as unknown as Notification[]) || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  const pendingActions = actions.filter((a) => a.status === 'pending' || a.status === 'in_progress');
  const completedActions = actions.filter((a) => a.status === 'completed');
  const overdueActions = actions.filter((a) => a.status === 'overdue');
  const upcomingActions = actions
    .filter((a) => a.deadline && a.status !== 'completed' && getDeadlineStatus(a.deadline).daysRemaining >= 0)
    .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''));
  const urgentActions = actions.filter((a) => (a.priority === 'urgent' || a.priority === 'high') && a.status !== 'completed');
  const todayActions = actions.filter((a) => a.deadline && getDeadlineStatus(a.deadline).isToday && a.status !== 'completed');
  const completionRate = actions.length > 0 ? Math.round((completedActions.length / actions.length) * 100) : 0;

  const stats = [
    { label: 'Total Notices', value: notices.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Pending Actions', value: pendingActions.length, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40' },
    { label: 'Completed', value: completedActions.length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/40' },
    { label: 'Overdue', value: overdueActions.length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/40' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {profile?.full_name.split(' ')[0]}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {profile?.department} · {profile?.course} · Semester {profile?.semester} · Section {profile?.section}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Your Progress
            </CardTitle>
            <span className="text-2xl font-bold">{completionRate}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={completionRate} className="h-3" />
          <div className="mt-3 flex justify-between text-xs text-slate-500">
            <span>{completedActions.length} completed</span>
            <span>{pendingActions.length} pending</span>
            <span>{overdueActions.length} overdue</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Urgent Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Urgent Actions
              </CardTitle>
              <Link href="/dashboard/actions">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentActions.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No urgent actions. You&apos;re all caught up!</p>
            ) : (
              urgentActions.slice(0, 4).map((action) => (
                <Link key={action.id} href="/dashboard/actions" className="block">
                  <div className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{action.title}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <PriorityBadge priority={action.priority} size="xs" />
                        <DeadlineBadge deadline={action.deadline} status={action.status} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-orange-500" />
                Today&apos;s Tasks
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayActions.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No tasks due today.</p>
            ) : (
              todayActions.map((action) => (
                <Link key={action.id} href="/dashboard/actions" className="block">
                  <div className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{action.title}</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Due today</p>
                    </div>
                    <PriorityBadge priority={action.priority} size="xs" />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-blue-500" />
                Upcoming Deadlines
              </CardTitle>
              <Link href="/dashboard/calendar">
                <Button variant="ghost" size="sm" className="text-xs">
                  Calendar <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingActions.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No upcoming deadlines.</p>
            ) : (
              upcomingActions.slice(0, 4).map((action) => (
                <Link key={action.id} href="/dashboard/actions" className="block">
                  <div className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{action.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{formatDate(action.deadline)}</p>
                    </div>
                    <DeadlineBadge deadline={action.deadline} status={action.status} />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Notices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                Recent Notices
              </CardTitle>
              <Link href="/dashboard/notices">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {notices.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No notices yet.</p>
            ) : (
              notices.map((notice) => (
                <Link key={notice.id} href={`/dashboard/notices/view?id=${notice.id}`} className="block">
                  <div className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{notice.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{formatDate(notice.notice_date)}</p>
                    </div>
                    <PriorityBadge priority={notice.priority} size="xs" />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
