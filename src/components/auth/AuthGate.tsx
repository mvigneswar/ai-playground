"use client";

import { useEffect, useState } from "react";

type User = {
  name: string;
  email: string;
};

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="p-6">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-24 linear-card p-6 space-y-4">
        <div className="space-y-1">
          <div className="linear-section-title">Sign In</div>
          <p className="text-sm text-muted">
            Use a magic link to sign in. No password required.
          </p>
        </div>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const fd = new FormData(form);
            const email = String(fd.get("email") ?? "");
            await fetch("/api/auth/magic-link", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email })
            });
            // Immediately load session
            const me = await fetch("/api/auth/me");
            if (me.ok) {
              const data = await me.json();
              setUser(data.user ?? null);
            }
          }}
        >
          <div className="space-y-1">
            <label className="linear-label">Email</label>
            <input name="email" type="email" required className="linear-input w-full" placeholder="you@example.com" />
          </div>
          <button className="linear-button w-full" type="submit">Send magic link</button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}

