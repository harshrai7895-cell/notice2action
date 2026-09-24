import type { Priority, ActionStatus } from '@/lib/types';

export const priorityConfig: Record<
  Priority,
  { label: string; color: string; bgClass: string; textClass: string; borderClass: string; dotClass: string; icon: string }
> = {
  urgent: {
    label: 'Urgent',
    color: 'red',
    bgClass: 'bg-red-50 dark:bg-red-950/40',
    textClass: 'text-red-700 dark:text-red-400',
    borderClass: 'border-red-200 dark:border-red-800',
    dotClass: 'bg-red-500',
    icon: 'AlertCircle',
  },
  high: {
    label: 'High',
    color: 'orange',
    bgClass: 'bg-orange-50 dark:bg-orange-950/40',
    textClass: 'text-orange-700 dark:text-orange-400',
    borderClass: 'border-orange-200 dark:border-orange-800',
    dotClass: 'bg-orange-500',
    icon: 'ArrowUpCircle',
  },
  medium: {
    label: 'Medium',
    color: 'yellow',
    bgClass: 'bg-yellow-50 dark:bg-yellow-950/40',
    textClass: 'text-yellow-700 dark:text-yellow-400',
    borderClass: 'border-yellow-200 dark:border-yellow-800',
    dotClass: 'bg-yellow-500',
    icon: 'MinusCircle',
  },
  low: {
    label: 'Low',
    color: 'green',
    bgClass: 'bg-green-50 dark:bg-green-950/40',
    textClass: 'text-green-700 dark:text-green-400',
    borderClass: 'border-green-200 dark:border-green-800',
    dotClass: 'bg-green-500',
    icon: 'ArrowDownCircle',
  },
};

export const statusConfig: Record<
  ActionStatus,
  { label: string; bgClass: string; textClass: string; borderClass: string }
> = {
  pending: {
    label: 'Pending',
    bgClass: 'bg-slate-100 dark:bg-slate-800',
    textClass: 'text-slate-700 dark:text-slate-300',
    borderClass: 'border-slate-200 dark:border-slate-700',
  },
  in_progress: {
    label: 'In Progress',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
    textClass: 'text-blue-700 dark:text-blue-400',
    borderClass: 'border-blue-200 dark:border-blue-800',
  },
  completed: {
    label: 'Completed',
    bgClass: 'bg-green-50 dark:bg-green-950/40',
    textClass: 'text-green-700 dark:text-green-400',
    borderClass: 'border-green-200 dark:border-green-800',
  },
  overdue: {
    label: 'Overdue',
    bgClass: 'bg-red-50 dark:bg-red-950/40',
    textClass: 'text-red-700 dark:text-red-400',
    borderClass: 'border-red-200 dark:border-red-800',
  },
};

export function getDeadlineStatus(deadline: string | null) {
  if (!deadline) {
    return {
      label: 'No deadline',
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
      daysRemaining: Infinity,
    };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const due = new Date(deadline);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Overdue by ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'}`,
      isOverdue: true,
      isToday: false,
      isTomorrow: false,
      daysRemaining: diffDays,
    };
  }

  if (diffDays === 0) {
    return {
      label: 'Due today',
      isOverdue: false,
      isToday: true,
      isTomorrow: false,
      daysRemaining: 0,
    };
  }

  if (diffDays === 1) {
    return {
      label: 'Due tomorrow',
      isOverdue: false,
      isToday: false,
      isTomorrow: true,
      daysRemaining: 1,
    };
  }

  return {
    label: `Due in ${diffDays} days`,
    isOverdue: false,
    isToday: false,
    isTomorrow: false,
    daysRemaining: diffDays,
  };
}

export function formatDate(date: string | null) {
  if (!date) return 'N/A';

  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | null) {
  if (!date) return 'N/A';

  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string) {
  const now = new Date();
  const past = new Date(date);

  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(date);
}
