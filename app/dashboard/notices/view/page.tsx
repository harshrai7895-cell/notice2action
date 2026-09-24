'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Notice, NoticeTarget, Action, Attachment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PriorityBadge, DeadlineBadge, StatusBadge } from '@/components/shared/badges';
import { formatDate } from '@/lib/constants';
import { ArrowLeft, FileText, Target, Calendar, User, Info, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

function NoticeDetailContent() {
  const id = useSearchParams().get('id');
  const router = useRouter();
  const { profile } = useAuth();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [targets, setTargets] = useState<NoticeTarget[]>([]);
  const [action, setAction] = useState<Action | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    const [noticeRes, targetsRes, actionRes, attachRes] = await Promise.all([
      supabase.from('notices').select('*, category:categories(*)').eq('id', id as string).maybeSingle(),
      supabase.from('notice_targets').select('*').eq('notice_id', id as string),
      profile ? supabase.from('actions').select('*').eq('notice_id', id as string).eq('user_id', profile.id).maybeSingle() : Promise.resolve({ data: null }),
      supabase.from('attachments').select('*').eq('notice_id', id as string),
    ]);

    setNotice(noticeRes.data as unknown as Notice || null);
    setTargets((targetsRes.data as unknown as NoticeTarget[]) || []);
    setAction((actionRes.data as unknown as Action) || null);
    setAttachments((attachRes.data as unknown as Attachment[]) || []);
    setLoading(false);
  }

  if (loading) {
    return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}</div>;
  }

  if (!notice) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm text-slate-500">Notice not found or you don&apos;t have access.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push('/dashboard/notices')}>
          Back to Notices
        </Button>
      </div>
    );
  }

  const targetText = targets.length > 0
    ? targets.map((t) => {
        if (t.is_all_students) return 'All Students';
        const parts: string[] = [];
        if (t.course) parts.push(t.course);
        if (t.department) parts.push(t.department);
        if (t.semester) parts.push(`Semester ${t.semester}`);
        if (t.section) parts.push(`Section ${t.section}`);
        return parts.join(' · ') || 'All Students';
      }).join(', ')
    : 'All Students';

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/dashboard/notices">
        <Button variant="ghost" size="sm" className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Notices
        </Button>
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <PriorityBadge priority={notice.priority} />
          {notice.category && <span className="text-sm text-slate-500">{notice.category.name}</span>}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{notice.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {formatDate(notice.notice_date)}</span>
          {notice.deadline && <DeadlineBadge deadline={notice.deadline} />}
          {notice.source && <span className="flex items-center gap-1"><Info className="h-4 w-4" /> {notice.source}</span>}
        </div>
      </div>

      {/* What You Need To Do - prominent action section */}
      <Card className="border-slate-300 dark:border-slate-700 shadow-md">
        <CardHeader className="bg-slate-50 dark:bg-slate-800/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            What You Need To Do
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm font-medium">{notice.required_action || 'No specific action required. Please read the notice carefully.'}</p>
          {action && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <StatusBadge status={action.status} />
              <span className="text-sm text-slate-600 dark:text-slate-400">Your task: {action.title}</span>
              <Link href="/dashboard/actions" className="ml-auto">
                <Button variant="outline" size="sm" className="text-xs">Go to Actions</Button>
              </Link>
            </div>
          )}
          {!action && profile?.role === 'student' && (
            <p className="mt-3 text-xs text-slate-400">No action has been generated for you yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Summary */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400">{notice.summary || 'No summary available.'}</p>
          </CardContent>
        </Card>

        {/* Target Audience */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" /> Target Audience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{targetText}</p>
            <div className="mt-3 rounded-lg bg-blue-50 p-2 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
              <Info className="inline h-3 w-3 mr-1" />
              You&apos;re seeing this because you match the targeting criteria.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Original Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" /> Original Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap text-slate-600 dark:text-slate-400">{notice.content}</p>
        </CardContent>
      </Card>

      {/* Attachments */}
      {attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attachments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {attachments.map((att) => (
              <a key={att.id} href={att.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                <FileText className="h-4 w-4 text-slate-500" />
                <span className="text-sm flex-1 truncate">{att.file_name}</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function NoticeDetailPage() {
  return (
    <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />}>
      <NoticeDetailContent />
    </Suspense>
  );
}
