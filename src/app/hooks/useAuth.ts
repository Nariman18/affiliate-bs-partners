"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { authEndpoints } from "../lib/api";
import { toast } from "sonner";
import { setCredentials, logout } from "../store/slices/authSlice";

function setAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie = `auth_session=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }
}

function clearAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie =
      "auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

export function useLogin() {
  const dispatch = useDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authEndpoints.login,
    onSuccess: (data) => {
      // 1. Wipe every cached query so no stale data from a previous user bleeds through
      queryClient.clear();
      // 2. Persist token
      localStorage.setItem("token", data.token);
      // 3. Set session cookie so Next.js middleware can protect /dashboard/*
      setAuthCookie();
      // 4. Populate Redux immediately — dashboard renders the right user on first paint
      dispatch(setCredentials({ user: data.user, token: data.token }));

      toast.success("Authentication successful", {
        description: `Welcome back, ${data.user.displayName ?? data.user.email}`,
        style: { border: "1px solid rgba(251, 191, 36, 0.3)" },
      });
      router.replace("/dashboard");
    },
    onError: (error: any) => {
      toast.error("Authentication failed", {
        description: error.response?.data?.error || "Invalid credentials.",
        style: { border: "1px solid rgba(244, 63, 94, 0.3)" },
      });
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: authEndpoints.register,
    onSuccess: () => {
      toast.success("Account initialized", {
        description: "Your profile has been created. Please sign in.",
        style: { border: "1px solid rgba(251, 191, 36, 0.3)" },
      });
      router.push("/login");
    },
    onError: (error: any) => {
      toast.error("Registration failed", {
        description: error.response?.data?.error || "An error occurred.",
        style: { border: "1px solid rgba(244, 63, 94, 0.3)" },
      });
    },
  });
}

/** Clears React Query cache, token, cookie, Redux, then hard-redirects to /login */
export function useLogout() {
  const dispatch = useDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    // Order matters: clear everything before redirect
    dispatch(logout());
    queryClient.clear();
    localStorage.removeItem("token");
    clearAuthCookie();

    toast.info("Logged out", {
      description: "You have been securely signed out.",
    });
    // router.replace prevents the user going back to /dashboard with the browser button
    router.replace("/login");
  };
}
