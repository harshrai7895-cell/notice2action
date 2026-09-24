'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Action } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PriorityBadge, StatusBadge, DeadlineBadge } from '@/components/shared/badges';
import { getDeadlineStatus, formatDate } from '@/lib/constants';
import { toast } from 'sonner';
import {
  CheckCircle2, Clock, Loader2, XCircle, ListChecks, Link2, MessageSquare,
  Bell, ChevronDown, ChevronUp, RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

export default function ActionsPage() {
  const { profile } = useAuth();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (profile) fetchActions();
  }, [profile]);

  async function fetchActions() {
    setLoading(true);
    const { data } = await supabase
      .from('actions')
      .select('*, notice:notices(*)')
      .eq('user_id', profile!.id)
      .order('deadline', { ascending: true, nullsFirst: false });
    setActions((data as unknown as Action[]) || []);
    setLoading(false);
  }

  async function updateStatus(actionId: string, status: Action['status']) {
    const updates: Record<string, unknown> = { status };
    if (status === 'completed') updates.completed_at = new Date().toISOString();
    else updates.completed_at = null;

    const { error } = await supabase.from('actions').update(updates).eq('id', actionId);
    if (error) {
      toast.error('Failed to update task');
    } else {
      toast.success(status === 'completed' ? 'Task marked as completed!' : `Task moved to ${status.replace('_', ' ')}`);
      fetchActions();
    }
  }

  async function saveNote(actionId: string) {
    const { error } = await supabase.from('actions').update({ notes: noteText }).eq('id', actionId);
    if (error) {
      toast.error('Failed to save note');
    } else {
      toast.success('Note saved');
      fetchActions();
      setExpandedId(null);
    }
  }

  async function setReminder(actionId: string) {
    const remindAt = new Date();
    remindAt.setDate(remindAt.getDate() + 1);
    const { error } = await supabase.from('reminders').insert({
      action_id: actionId,
      user_id: profile!.id,
      remind_at: remindAt.toISOString(),
    });
    if (error) {
      toast.error('Failed to set reminder');
    } else {
      toast.success('Reminder set for tomorrow');
    }
  }

  const filtered = actions.filter((a) => statusFilter === 'all' || a.status === statusFilter);
  const pending = actions.filter((a) => a.status === 'pending' || a.status === 'in_progress');
  const completed = actions.filter((a) => a.status === 'completed');
  const overdue = actions.filter((a) => a.status === 'overdue');

  if (loading) {
    return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Actions</h1>
        <p className="text-sm text-slate-500 mt-1">Tasks generated from notices. Complete them before deadlines pass.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold text-orange-500">{pending.length}</p><p className="text-xs text-slate-500">Pending</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold text-green-500">{completed.length}</p><p className="text-xs text-slate-500">Completed</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-2xl font-bold text-red-500">{overdue.length}</p><p className="text-xs text-slate-500">Overdue</p></CardContent></Card>
      </div>

      {/* Filter */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tasks</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
        </SelectContent>
      </Select>

      {/* Actions list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ListChecks className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No tasks found. You&apos;re all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((action) => {
            const isExpanded = expandedId === action.id;
            const ds = getDeadlineStatus(action.deadline);
            return (
              <Card key={action.id} className={action.status === 'overdue' ? 'border-red-200 dark:border-red-800' : ''}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{action.title}</h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{action.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <PriorityBadge priority={action.priority} size="xs" />
                        <StatusBadge status={action.status} size="xs" />
                        <DeadlineBadge deadline={action.deadline} status={action.status} />
                        {action.notice && (
                          <Link href={`/dashboard/notices/view?id=${action.notice.id}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400">
                            <Link2 className="h-3 w-3" /> View Notice
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {action.status !== 'completed' && (
                      <>
                        <Button size="sm" variant="default" className="h-8 text-xs gap-1" onClick={() => updateStatus(action.id, 'completed')}>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Mark Complete
                        </Button>
                        {action.status === 'pending' && (
                          <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => updateStatus(action.id, 'in_progress')}>
                            <Loader2 className="h-3.5 w-3.5" /> Start
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-8 text-xs gap-1" onClick={() => setReminder(action.id)}>
                          <Bell className="h-3.5 w-3.5" /> Remind Me
                        </Button>
                      </>
                    )}
                    {action.status === 'completed' && (
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => updateStatus(action.id, 'pending')}>
                        <RotateCcw className="h-3.5 w-3.5" /> Reopen
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-8 text-xs gap-1" onClick={() => { setExpandedId(isExpanded ? null : action.id); setNoteText(action.notes || ''); }}>
                      <MessageSquare className="h-3.5 w-3.5" /> Notes
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </div>

                  {/* Notes section */}
                  {isExpanded && (
                    <div className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                      <Textarea
                        placeholder="Add a personal note..."
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="min-h-[60px] text-sm"
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setExpandedId(null)}>Cancel</Button>
                        <Button size="sm" className="h-8 text-xs" onClick={() => saveNote(action.id)}>Save Note</Button>
                      </div>
                      {action.notes && !noteText && (
                        <p className="text-xs text-slate-500 mt-2">Current note: {action.notes}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
