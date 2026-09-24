/*
# N2A - Notice2Action: Core Database Schema (Part 1 — Tables Only)

Creates all tables first. Policies added in a second migration after all tables exist,
so cross-table policy references (notices → notice_targets) resolve.
*/

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  enrollment_number text,
  department text,
  course text,
  semester integer,
  section text,
  academic_year text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- is_admin() must exist before any policy references it
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text DEFAULT 'blue',
  icon text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- NOTICES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  summary text,
  required_action text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  deadline date,
  notice_date date NOT NULL DEFAULT CURRENT_DATE,
  source text,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notices_status ON public.notices(status);
CREATE INDEX IF NOT EXISTS idx_notices_priority ON public.notices(priority);
CREATE INDEX IF NOT EXISTS idx_notices_deadline ON public.notices(deadline);
CREATE INDEX IF NOT EXISTS idx_notices_category ON public.notices(category_id);

-- ============================================================
-- NOTICE_TARGETS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notice_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id uuid NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
  department text,
  course text,
  semester integer,
  section text,
  academic_year text,
  is_all_students boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notice_targets_notice ON public.notice_targets(notice_id);

-- ============================================================
-- ACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id uuid REFERENCES public.notices(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  deadline date,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  notes text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_actions_user ON public.actions(user_id);
CREATE INDEX IF NOT EXISTS idx_actions_status ON public.actions(status);
CREATE INDEX IF NOT EXISTS idx_actions_deadline ON public.actions(deadline);
CREATE INDEX IF NOT EXISTS idx_actions_notice ON public.actions(notice_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('new_notice', 'deadline_approaching', 'task_overdue', 'task_assigned', 'notice_updated')),
  title text NOT NULL,
  message text,
  related_id uuid,
  related_type text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);

-- ============================================================
-- ATTACHMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id uuid NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size bigint,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attachments_notice ON public.attachments(notice_id);

-- ============================================================
-- REMINDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id uuid NOT NULL REFERENCES public.actions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  remind_at timestamptz NOT NULL,
  is_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_action ON public.reminders(action_id);

-- ============================================================
-- ACTIVITY_LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notice_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS notices_updated_at ON public.notices;
CREATE TRIGGER notices_updated_at BEFORE UPDATE ON public.notices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS actions_updated_at ON public.actions;
CREATE TRIGGER actions_updated_at BEFORE UPDATE ON public.actions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
