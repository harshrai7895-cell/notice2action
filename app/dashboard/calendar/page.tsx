'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Action } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PriorityBadge } from '@/components/shared/badges';
import { formatDate } from '@/lib/constants';
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function CalendarPage() {
  const { profile } = useAuth();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (profile) fetchActions();
  }, [profile]);

  async function fetchActions() {
    setLoading(true);
    const { data } = await supabase
      .from('actions')
      .select('*, notice:notices(*)')
      .eq('user_id', profile!.id)
      .order('deadline', { ascending: true });
    setActions((data as unknown as Action[]) || []);
    setLoading(false);
  }

  const filtered = actions.filter((a) => priorityFilter === 'all' || a.priority === priorityFilter);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const actionsByDate: Record<string, Action[]> = {};
  filtered.forEach((a) => {
    if (a.deadline) {
      const key = a.deadline;
      if (!actionsByDate[key]) actionsByDate[key] = [];
      actionsByDate[key].push(a);
    }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const selectedActions = selectedDate ? actionsByDate[selectedDate] || [] : [];

  if (loading) {
    return <div className="h-96 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-sm text-slate-500 mt-1">All your action deadlines in one view.</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="font-semibold text-lg min-w-[140px] text-center">{monthNames[month]} {year}</span>
          <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar grid */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-slate-500 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {[...Array(startDayOfWeek)].map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayActions = actionsByDate[dateStr] || [];
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      'aspect-square rounded-lg border p-1 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800',
                      isToday ? 'border-slate-900 dark:border-white' : 'border-slate-200 dark:border-slate-800',
                      isSelected && 'ring-2 ring-blue-500',
                      dayActions.length > 0 && 'bg-slate-50 dark:bg-slate-800/50'
                    )}
                  >
                    <span className={cn('text-xs', isToday && 'font-bold')}>{day}</span>
                    {dayActions.length > 0 && (
                      <div className="mt-0.5 flex flex-wrap gap-0.5">
                        {dayActions.slice(0, 3).map((a) => (
                          <div key={a.id} className={cn('h-1.5 w-1.5 rounded-full', a.priority === 'urgent' ? 'bg-red-500' : a.priority === 'high' ? 'bg-orange-500' : a.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500')} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected date actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalIcon className="h-4 w-4" />
              {selectedDate ? formatDate(selectedDate) : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedActions.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                {selectedDate ? 'No tasks due on this date.' : 'Click a date to see tasks.'}
              </p>
            ) : (
              selectedActions.map((a) => (
                <Link key={a.id} href="/dashboard/actions" className="block">
                  <div className="rounded-lg border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <PriorityBadge priority={a.priority} size="xs" />
                      {a.status === 'completed' && <span className="text-xs text-green-600">Completed</span>}
                    </div>
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
