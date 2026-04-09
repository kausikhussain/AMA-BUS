"use client";

import { startTransition, useEffect, useState } from "react";
import type { AuthSession, InAppNotification } from "@amaride/shared";
import { api } from "../../../lib/api";
import { clearSession, getSession, saveSession } from "../../../lib/session";
import { SectionCard } from "../../../components/ui/section-card";

export default function ProfilePage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "passenger@amaride.in",
    password: "Password@123",
    phone: ""
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const existingSession = getSession();

    if (existingSession) {
      setSession(existingSession);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!session) {
        return;
      }

      const [loadedProfile, loadedNotifications] = await Promise.all([
        api.profile(session),
        api.notifications(session)
      ]);

      setProfile(loadedProfile);
      setNotifications(loadedNotifications);
    };

    void load();
  }, [session]);

  const submit = async () => {
    setMessage(null);

    try {
      const nextSession =
        mode === "login"
          ? await api.login({ email: form.email, password: form.password })
          : await api.register({
              name: form.name,
              email: form.email,
              password: form.password,
              phone: form.phone
            });

      startTransition(() => {
        saveSession(nextSession);
        setSession(nextSession);
        setMessage("Authentication successful.");
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    }
  };

  const logout = () => {
    clearSession();
    setSession(null);
    setProfile(null);
    setNotifications([]);
    setMessage("Signed out.");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[0.8fr,1.2fr]">
      <SectionCard title="Identity" description="Register a new passenger account or sign in to load ticket and notification data.">
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === "login" ? "bg-teal-600 text-white" : "border border-slate-300 dark:border-slate-700"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === "register" ? "bg-orange-500 text-slate-950" : "border border-slate-300 dark:border-slate-700"}`}
            >
              Register
            </button>
          </div>

          {mode === "register" ? (
            <input
              placeholder="Full name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
            />
          ) : null}
          <input
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
          />
          {mode === "register" ? (
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className="w-full rounded-2xl border border-slate-300 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80"
            />
          ) : null}
          <button
            type="button"
            onClick={submit}
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
          >
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
          {session ? (
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold dark:border-slate-700"
            >
              Sign Out
            </button>
          ) : null}
          {message ? <p className="text-sm text-teal-700 dark:text-teal-300">{message}</p> : null}
        </div>
      </SectionCard>

      <div className="space-y-4">
        <SectionCard title="Profile snapshot" description="Current authenticated user details loaded from the backend.">
          {profile ? (
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(profile).map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-700">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    {key}
                  </p>
                  <p className="mt-2 font-semibold">{String(value)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300">Sign in to view profile data.</p>
          )}
        </SectionCard>

        <SectionCard title="Notifications" description="In-app alerts for arrivals, ticket validity, and system events.">
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={String(notification.id)} className="rounded-[1.5rem] border border-slate-200/80 p-4 dark:border-slate-700">
                <p className="font-semibold">{String(notification.title)}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {String(notification.message)}
                </p>
              </div>
            ))}
            {!notifications.length ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">No notifications loaded yet.</p>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
