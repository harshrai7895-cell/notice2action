export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type ActionStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'overdue';

export type Action = {
  id: string;
  user_id: string;
  notice_id?: string | null;
  title: string;
  description?: string | null;
  priority: Priority;
  status: ActionStatus;
  deadline?: string | null;
  category?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type CalendarEvent = {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  all_day?: boolean;
  action_id?: string | null;
  created_at?: string;
};

export type Notice = {
  id: string;
  user_id: string;
  title: string;
  content?: string | null;
  source?: string | null;
  deadline?: string | null;
  created_at: string;
  updated_at?: string | null;
};
