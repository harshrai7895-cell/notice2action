'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, GraduationCap, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error);
      setLoading(false);
    } else {
      toast.success('Welcome back!');
      router.push('/dashboard');
    }
  };

  const fillDemo = (type: 'student' | 'admin') => {
    if (type === 'student') {
      setEmail('student@n2a.edu');
      setPassword('N2Astudent2026!');
    } else {
      setEmail('admin@n2a.edu');
      setPassword('N2Aadmin2026!');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              N2
            </div>
            <CardTitle className="text-2xl">Welcome to N2A</CardTitle>
            <CardDescription>Sign in to your Notice2Action account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@n2a.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 border-t pt-4">
              <p className="text-center text-xs text-slate-500 mb-3">Quick demo access</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => fillDemo('student')} className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Student Demo
                </Button>
                <Button variant="outline" size="sm" onClick={() => fillDemo('admin')} className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin Demo
                </Button>
              </div>
              <p className="mt-3 text-center text-[11px] text-slate-400">
                Click a demo button to auto-fill credentials, then Sign In
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
