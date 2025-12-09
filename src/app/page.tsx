// app/page.tsx
'use client';

import Link from 'next/link';
import { ArrowRight, Hash, Sparkles } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo size={32} />
          <span className="text-xl font-bold">Seal</span>
        </div>
        <Link
          href="/login"
          className="px-4 py-2 rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition text-sm font-medium">
          Log in
        </Link>
      </header>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-28 grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-5">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Share what’s on your&nbsp;mind.
          </h1>
          <p className="text-lg text-muted-foreground">
            Seal is a lightweight, ad-free space to post quick thoughts,
            discover trends, and connect with friends—no clutter, no tracking.
          </p>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition">
            Create account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Phone mockup */}
        <div className="relative hidden md:block">
          <div className="absolute inset-0 -rotate-3 translate-x-4 translate-y-4 rounded-2xl bg-muted border border-border/50" />
          <div className="absolute inset-0 rotate-2 -translate-x-4 translate-y-4 rounded-2xl bg-muted border border-border/50" />
          <div className="relative rounded-2xl border border-border bg-card p-6 space-y-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 grid place-content-center">
                <Logo size={28} className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">J1</p>
                <p className="text-xs text-muted-foreground">Just now</p>
              </div>
            </div>
            <p className="text-sm">Hola, bienvenidos a Seal</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3" /> 211
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 42
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-5xl mx-auto px-6 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Seal · Built with Next.js & Supabase
      </footer>
    </div>
  );
}
