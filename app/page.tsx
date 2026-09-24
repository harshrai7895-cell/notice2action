'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Bell,
  ArrowRight,
  CheckCircle2,
  CalendarClock,
  Target,
  Zap,
  FileText,
  Users,
  BarChart3,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  ListChecks,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 font-bold text-white dark:bg-white dark:text-slate-900">
              N2
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-none">N2A</span>
              <span className="text-[10px] text-slate-500 leading-none mt-0.5">Notice2Action</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              Built for colleges that care about student outcomes
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
              Never Miss What Matters.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Turn college notices into clear, personalized actions before deadlines pass.
              Don&apos;t just read the notice — know what to do next.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-base">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  View Demo
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Demo accounts available on the login page
            </p>
          </div>

          {/* Hero cards */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-slate-200 shadow-lg dark:border-slate-800">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40">
                      <FileText className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Raw Notice</CardTitle>
                      <CardDescription className="text-xs">What students see today</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    &ldquo;B.Tech CSE Sem 5 students are required to submit their examination form through ERP before 28 September 2026.&rdquo;
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-lg dark:border-slate-800">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/40">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">N2A Action</CardTitle>
                      <CardDescription className="text-xs">What N2A turns it into</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Fill Examination Form</span>
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">High</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Deadline: 28 Sep 2026</span>
                      <span className="text-orange-600 font-medium">Due in 4 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="border-t border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">The Problem</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Students receive hundreds of messages across WhatsApp groups, ERP portals, emails, and notice boards.
              Important deadlines get buried in the noise.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-4xl grid gap-4 sm:grid-cols-3">
            {[
              { icon: AlertTriangle, title: 'Missed Deadlines', desc: 'Students miss critical deadlines buried in long WhatsApp messages.' },
              { icon: Bell, title: 'Information Overload', desc: 'Hundreds of notices with no priority or personalization.' },
              { icon: FileText, title: 'No Action Items', desc: 'Notices tell you what happened, not what to do.' },
            ].map((item) => (
              <Card key={item.title} className="border-slate-200 dark:border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40">
                    <item.icon className="h-5 w-5 text-red-500" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How N2A Works */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">How N2A Works</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Every notice follows a structured pipeline from raw text to completed action.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-4xl">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: FileText, title: 'Notice', desc: 'Admin creates or pastes a notice' },
                { icon: Zap, title: 'Understand', desc: 'N2A analyzes the notice text' },
                { icon: Target, title: 'Extract', desc: 'Deadline, priority, and category detected' },
                { icon: Users, title: 'Personalize', desc: 'Targeted to the right students' },
                { icon: CheckCircle2, title: 'Action', desc: 'A clear task is generated' },
                { icon: CalendarClock, title: 'Reminder', desc: 'Students get deadline reminders' },
                { icon: ListChecks, title: 'Complete', desc: 'Students mark tasks done' },
                { icon: BarChart3, title: 'Track', desc: 'Admins monitor engagement' },
              ].map((step, i) => (
                <div key={step.title} className="relative">
                  <Card className="h-full border-slate-200 dark:border-slate-800">
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold dark:bg-white dark:text-slate-900">
                          {i + 1}
                        </div>
                        <step.icon className="h-4 w-4 text-slate-500" />
                      </div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{step.title}</h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{step.desc}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="border-t border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Key Features</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Everything a college needs to make notices actionable.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-5xl grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Zap, title: 'Smart Notice Processing', desc: 'Automatic extraction of deadlines, priorities, and actions from raw notice text.' },
              { icon: Target, title: 'Personalized Targeting', desc: 'Students only see notices relevant to their department, semester, and section.' },
              { icon: CalendarClock, title: 'Deadline Engine', desc: 'Dynamic countdowns show exactly how much time is left for each task.' },
              { icon: CheckCircle2, title: 'Action Management', desc: 'Track pending, in-progress, completed, and overdue tasks in one place.' },
              { icon: Bell, title: 'Notification Center', desc: 'Get alerted for new notices, approaching deadlines, and overdue tasks.' },
              { icon: BarChart3, title: 'Analytics', desc: 'Admins track engagement, completion rates, and overdue percentages.' },
            ].map((f) => (
              <Card key={f.title} className="border-slate-200 dark:border-slate-800">
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
                    <f.icon className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-slate-900 dark:text-white" />
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Don&apos;t just read the notice. Know what to do next.
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Try the N2A demo with pre-loaded Vidya University data.
            </p>
            <Link href="/login" className="mt-6 inline-block">
              <Button size="lg" className="h-12 px-8 text-base">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold dark:bg-white dark:text-slate-900">
                N2
              </div>
              <span className="text-sm font-medium">N2A – Notice2Action</span>
            </div>
            <p className="text-xs text-slate-500">Never Miss What Matters.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
