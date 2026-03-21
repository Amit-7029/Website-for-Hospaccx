"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import type { AdminUser } from "@/types";
import { getFirebaseServices, isFirebaseConfigured } from "@/lib/firebase/client";
import { useUiStore } from "@/store/ui-store";

interface SessionContextValue {
  sessionUser: AdminUser | null;
  firebaseUser: User | null;
  isCheckingAuth: boolean;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function AppProviders({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: AdminUser | null;
}) {
  const [sessionUser, setSessionUser] = useState(initialUser);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { theme, setTheme } = useUiStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("hospaccx-admin-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
  }, [setTheme]);

  useEffect(() => {
    window.localStorage.setItem("hospaccx-admin-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setIsCheckingAuth(false);
      return;
    }

    const { auth } = getFirebaseServices();
    const syncSession = async (user: User | null, forceRefresh = false) => {
      setFirebaseUser(user);

      if (!user) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const idToken = await user.getIdToken(forceRefresh);
        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        });

        if (response.ok) {
          const payload = (await response.json()) as { user?: AdminUser };
          if (payload.user) {
            setSessionUser(payload.user);
          }
        }
      } catch (error) {
        console.error("Unable to refresh admin session:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await syncSession(user);
    });

    const handleVisibilityRefresh = async () => {
      if (document.visibilityState === "visible" && auth.currentUser) {
        await syncSession(auth.currentUser, true);
      }
    };

    const handleWindowFocus = async () => {
      if (auth.currentUser) {
        await syncSession(auth.currentUser, true);
      }
    };

    const interval = window.setInterval(() => {
      if (auth.currentUser) {
        void syncSession(auth.currentUser, true);
      }
    }, 15000);

    document.addEventListener("visibilitychange", handleVisibilityRefresh);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      unsubscribe();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityRefresh);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      sessionUser,
      firebaseUser,
      isCheckingAuth,
      logout: async () => {
        if (isFirebaseConfigured()) {
          const { auth } = getFirebaseServices();
          await signOut(auth);
        }

        await fetch("/api/auth/session", {
          method: "DELETE",
        });

        window.location.href = "/login";
      },
    }),
    [firebaseUser, isCheckingAuth, sessionUser],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within AppProviders");
  }

  return context;
}
