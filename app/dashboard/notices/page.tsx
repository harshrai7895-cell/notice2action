'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import type { Notice, Category } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PriorityBadge, DeadlineBadge } from '@/components/shared/badges';
import { formatDate } from '@/lib/constants';
import { FileText, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function NoticesPage() {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [noticesRes, catRes] = await Promise.all([
      supabase.from('notices').select('*, category:categories(*)').eq('status', 'published').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setNotices((noticesRes.data as unknown as Notice[]) || []);
    setCategories((catRes.data as unknown as Category[]) || []);
    setLoading(false);
  }

  const filtered = notices.filter((n) => {
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || (n.content || '').toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === 'all' || n.priority === priorityFilter;
    const matchCategory = categoryFilter === 'all' || n.category_id === categoryFilter;
    return matchSearch && matchPriority && matchCategory;
  });

  if (loading) {
    return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Notices</h1>
        <p className="text-sm text-slate-500 mt-1">Notices targeted to you based on your department, semester, and section.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-40">
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
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notices */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No notices found. Try adjusting your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((notice) => (
            <Link key={notice.id} href={`/dashboard/notices/view?id=${notice.id}`}>
              <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <PriorityBadge priority={notice.priority} size="xs" />
                        {notice.category && (
                          <span className="text-xs text-slate-500">{notice.category.name}</span>
                        )}
                      </div>
                      <h3 className="font-medium text-sm">{notice.title}</h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{notice.summary || notice.content}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                        <span>{formatDate(notice.notice_date)}</span>
                        {notice.source && <span className="truncate">· {notice.source}</span>}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <DeadlineBadge deadline={notice.deadline} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
