/*
# N2A - RLS Policies for all tables

All tables already exist and have RLS enabled. This migration adds the ownership-based
policies for every table. Cross-table references (notices → notice_targets) now resolve.
*/

-- ============================================================
-- PROFILES
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- CATEGORIES
-- ============================================================
DROP POLICY IF EXISTS "categories_select_all" ON public.categories;
CREATE POLICY "categories_select_all" ON public.categories
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "categories_insert_admin" ON public.categories;
CREATE POLICY "categories_insert_admin" ON public.categories
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "categories_update_admin" ON public.categories;
CREATE POLICY "categories_update_admin" ON public.categories
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "categories_delete_admin" ON public.categories;
CREATE POLICY "categories_delete_admin" ON public.categories
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- NOTICES
-- ============================================================
DROP POLICY IF EXISTS "notices_select_targeted_or_admin" ON public.notices;
CREATE POLICY "notices_select_targeted_or_admin" ON public.notices
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR (status = 'published' AND EXISTS (
      SELECT 1 FROM public.notice_targets nt
      WHERE nt.notice_id = notices.id
      AND (
        nt.is_all_students = true
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid()
          AND (nt.department IS NULL OR nt.department = p.department)
          AND (nt.course IS NULL OR nt.course = p.course)
          AND (nt.semester IS NULL OR nt.semester = p.semester)
          AND (nt.section IS NULL OR nt.section = p.section)
          AND (nt.academic_year IS NULL OR nt.academic_year = p.academic_year)
        )
      )
    ))
  );

DROP POLICY IF EXISTS "notices_insert_admin" ON public.notices;
CREATE POLICY "notices_insert_admin" ON public.notices
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "notices_update_admin" ON public.notices;
CREATE POLICY "notices_update_admin" ON public.notices
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "notices_delete_admin" ON public.notices;
CREATE POLICY "notices_delete_admin" ON public.notices
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- NOTICE_TARGETS
-- ============================================================
DROP POLICY IF EXISTS "notice_targets_select_or_admin" ON public.notice_targets;
CREATE POLICY "notice_targets_select_or_admin" ON public.notice_targets
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.notices n WHERE n.id = notice_targets.notice_id AND n.status = 'published'
    )
  );

DROP POLICY IF EXISTS "notice_targets_insert_admin" ON public.notice_targets;
CREATE POLICY "notice_targets_insert_admin" ON public.notice_targets
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "notice_targets_update_admin" ON public.notice_targets;
CREATE POLICY "notice_targets_update_admin" ON public.notice_targets
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "notice_targets_delete_admin" ON public.notice_targets;
CREATE POLICY "notice_targets_delete_admin" ON public.notice_targets
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- ACTIONS
-- ============================================================
DROP POLICY IF EXISTS "actions_select_own_or_admin" ON public.actions;
CREATE POLICY "actions_select_own_or_admin" ON public.actions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "actions_insert_own_or_admin" ON public.actions;
CREATE POLICY "actions_insert_own_or_admin" ON public.actions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "actions_update_own_or_admin" ON public.actions;
CREATE POLICY "actions_update_own_or_admin" ON public.actions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "actions_delete_own_or_admin" ON public.actions;
CREATE POLICY "actions_delete_own_or_admin" ON public.actions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_own_or_admin" ON public.notifications;
CREATE POLICY "notifications_insert_own_or_admin" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- ATTACHMENTS
-- ============================================================
DROP POLICY IF EXISTS "attachments_select_or_admin" ON public.attachments;
CREATE POLICY "attachments_select_or_admin" ON public.attachments
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (SELECT 1 FROM public.notices n WHERE n.id = attachments.notice_id AND n.status = 'published')
  );

DROP POLICY IF EXISTS "attachments_insert_admin" ON public.attachments;
CREATE POLICY "attachments_insert_admin" ON public.attachments
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "attachments_delete_admin" ON public.attachments;
CREATE POLICY "attachments_delete_admin" ON public.attachments
  FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- REMINDERS
-- ============================================================
DROP POLICY IF EXISTS "reminders_select_own" ON public.reminders;
CREATE POLICY "reminders_select_own" ON public.reminders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reminders_insert_own" ON public.reminders;
CREATE POLICY "reminders_insert_own" ON public.reminders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reminders_update_own" ON public.reminders;
CREATE POLICY "reminders_update_own" ON public.reminders
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reminders_delete_own" ON public.reminders;
CREATE POLICY "reminders_delete_own" ON public.reminders
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- ACTIVITY_LOGS
-- ============================================================
DROP POLICY IF EXISTS "activity_logs_select_own_or_admin" ON public.activity_logs;
CREATE POLICY "activity_logs_select_own_or_admin" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "activity_logs_insert_own" ON public.activity_logs;
CREATE POLICY "activity_logs_insert_own" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());
