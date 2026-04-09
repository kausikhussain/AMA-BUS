"use client";

import type { AuthSession } from "@amaride/shared";

const SESSION_KEY = "amaride.session";

export const getSession = (): AuthSession | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
};

export const saveSession = (session: AuthSession) => {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  window.localStorage.removeItem(SESSION_KEY);
};
