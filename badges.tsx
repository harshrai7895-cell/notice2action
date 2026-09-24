import { priorityConfig, statusConfig, getDeadlineStatus } from '@/lib/constants';
import type { Priority, ActionStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AlertCircle, ArrowUpCircle, MinusCircle, ArrowDownCircle, Clock, Calendar, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertCircle,
  ArrowUpCircle,
  MinusCircle,
  ArrowDownCircle,
};

export function PriorityBadge({ priority, size = 'sm' }: { priority: Priority; size?: 'sm' | 'xs' }) {
  const config = priorityConfig[priority];
  const Icon = iconMap[config.icon] || AlertCircle;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        config.bgClass,
        config.textClass,
        config.borderClass,
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-2 py-0.5 text-[10px]'
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-2.5 w-2.5'} />
      {config.label}
    </span>
  );
}

export function StatusBadge({ status, size = 'sm' }: { status: ActionStatus; size?: 'sm' | 'xs' }) {
  const config = statusConfig[status];
  const iconMap: Record<ActionStatus, React.ComponentType<{ className?: string }>> = {
    pending: Clock,
    in_progress: Loader2,
    completed: CheckCircle2,
    overdue: XCircle,
  };
  const Icon = iconMap[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        config.bgClass,
        config.textClass,
        config.borderClass,
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-2 py-0.5 text-[10px]'
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-2.5 w-2.5'} />
      {config.label}
    </span>
  );
}

export function DeadlineBadge({ deadline, status }: { deadline: string | null; status?: ActionStatus }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
        <CheckCircle2 className="h-3 w-3" />
        Completed
      </span>
    );
  }

  const ds = getDeadlineStatus(deadline);
  const colorClass = ds.isOverdue
    ? 'text-red-600 dark:text-red-400'
    : ds.isToday || ds.isTomorrow
    ? 'text-orange-600 dark:text-orange-400'
    : ds.daysRemaining <= 7
    ? 'text-yellow-600 dark:text-yellow-400'
    : 'text-slate-500 dark:text-slate-400';

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', colorClass)}>
      <Calendar className="h-3 w-3" />
      {ds.label}
    </span>
  );
}
