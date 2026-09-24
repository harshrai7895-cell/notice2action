'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Notice, Action, Category } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PriorityBadge, StatusBadge, DeadlineBadge } from '@/components/shared/badges';
import { formatDate } from '@/lib/constants';
import { Search, FileText, CheckCircle2, Filter } from 'lucide-react';

export default function SearchPage() {
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState('all');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [noticeResults, setNoticeResults] = useState<Notice[]>([]);
  const [actionResults, setActionResults] = useState<Action[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories((data as unknown as Category[]) || []);
    });
  }, []);

  async function handleSearch() {
    setSearched(true);
    let noticeQuery = supabase.from('notices').select('*, category:categories(*)').eq('status', 'published');
    let actionQuery = supabase.from('actions').select('*, notice:notices(*)').eq('user_id', profile!.id);

    if (query) {
      noticeQuery = noticeQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
      actionQuery = actionQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }
    if (priority !== 'all') {
      noticeQuery = noticeQuery.eq('priority', priority);
      actionQuery = actionQuery.eq('priority', priority);
    }
    if (category !== 'all') {
      noticeQuery = noticeQuery.eq('category_id', category);
    }
    if (status !== 'all') {
      actionQuery = actionQuery.eq('status', status);
    }

    const [nRes, aRes] = await Promise.all([
      noticeQuery.order('created_at', { ascending: false }).limit(20),
      actionQuery.order('created_at', { ascending: false }).limit(20),
    ]);

    setNoticeResults((nRes.data as unknown as Notice[]) || []);
    setActionResults((aRes.data as unknown as Action[]) || []);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="text-sm text-slate-500 mt-1">Search across notices and actions with filters.</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by title, content, or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Filter className="h-4 w-4 text-slate-400 mt-2" />
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {searched && (
        <div className="space-y-6">
          {/* Notice results */}
          <div>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Notices ({noticeResults.length})
            </h2>
            {noticeResults.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No notices found.</p>
            ) : (
              <div className="space-y-2">
                {noticeResults.map((n) => (
                  <Link key={n.id} href={`/dashboard/notices/view?id=${n.id}`}>
                    <Card className="hover:border-slate-300 dark:hover:border-slate-700">
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{formatDate(n.notice_date)} · {n.category?.name}</p>
                          </div>
                          <PriorityBadge priority={n.priority} size="xs" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Action results */}
          <div>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Actions ({actionResults.length})
            </h2>
            {actionResults.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No actions found.</p>
            ) : (
              <div className="space-y-2">
                {actionResults.map((a) => (
                  <Link key={a.id} href="/dashboard/actions">
                    <Card className="hover:border-slate-300 dark:hover:border-slate-700">
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{a.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{formatDate(a.deadline)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <PriorityBadge priority={a.priority} size="xs" />
                            <StatusBadge status={a.status} size="xs" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
