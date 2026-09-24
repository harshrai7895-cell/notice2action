'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Action, Profile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { User, Mail, Hash, Building2, GraduationCap, BookOpen, Calendar, CheckCircle2, Clock, AlertTriangle, Save } from 'lucide-react';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [section, setSection] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchActions();
      setFullName(profile.full_name);
      setEnrollmentNumber(profile.enrollment_number || '');
      setSection(profile.section || '');
    }
  }, [profile]);

  async function fetchActions() {
    setLoading(true);
    const { data } = await supabase.from('actions').select('*').eq('user_id', profile!.id);
    setActions((data as unknown as Action[]) || []);
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      enrollment_number: enrollmentNumber,
      section,
    }).eq('id', profile!.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated');
      await refreshProfile();
      setEditing(false);
    }
    setSaving(false);
  }

  if (!profile) return null;

  const completed = actions.filter((a) => a.status === 'completed').length;
  const pending = actions.filter((a) => a.status === 'pending' || a.status === 'in_progress').length;
  const overdue = actions.filter((a) => a.status === 'overdue').length;
  const completionRate = actions.length > 0 ? Math.round((completed / actions.length) * 100) : 0;

  const infoItems = [
    { icon: Mail, label: 'Email', value: profile.email },
    { icon: Hash, label: 'Enrollment Number', value: profile.enrollment_number },
    { icon: Building2, label: 'Department', value: profile.department },
    { icon: GraduationCap, label: 'Course', value: profile.course },
    { icon: BookOpen, label: 'Semester', value: profile.semester ? `Semester ${profile.semester}` : null },
    { icon: Calendar, label: 'Academic Year', value: profile.academic_year },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Your account and academic information.</p>
      </div>

      {/* Profile header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-xl font-bold dark:bg-slate-700">
              {profile.full_name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{profile.full_name}</h2>
              <p className="text-sm text-slate-500">{profile.email}</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <User className="h-3 w-3" /> {profile.role}
              </span>
            </div>
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Editable fields */}
      {editing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrollment">Enrollment Number</Label>
              <Input id="enrollment" value={enrollmentNumber} onChange={(e) => setEnrollmentNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Input id="section" value={section} onChange={(e) => setSection(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="gap-1">
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Academic info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Academic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  <item.icon className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="text-sm font-medium">{item.value || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Action Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Completion Rate</span>
              <span className="text-lg font-bold">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-3" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-200 p-3 text-center dark:border-slate-800">
              <CheckCircle2 className="mx-auto h-5 w-5 text-green-500" />
              <p className="mt-1 text-xl font-bold">{completed}</p>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 text-center dark:border-slate-800">
              <Clock className="mx-auto h-5 w-5 text-orange-500" />
              <p className="mt-1 text-xl font-bold">{pending}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 text-center dark:border-slate-800">
              <AlertTriangle className="mx-auto h-5 w-5 text-red-500" />
              <p className="mt-1 text-xl font-bold">{overdue}</p>
              <p className="text-xs text-slate-500">Overdue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
