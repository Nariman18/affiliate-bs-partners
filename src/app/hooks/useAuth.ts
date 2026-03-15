// src/hooks/useAuth.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { authEndpoints } from "../lib/api";
import { toast } from "sonner";
import { setCredentials, logout } from "../store/slices/authSlice";

export function useLogin() {
  const dispatch = useDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: authEndpoints.login,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      dispatch(setCredentials({ user: data.user, token: data.token }));

      toast.success("Authentication successful", {
        description: `Welcome back, ${data.user.email}`,
        style: { border: "1px solid rgba(251, 191, 36, 0.3)" },
      });

      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error("Authentication failed", {
        description:
          error.response?.data?.error || "Invalid credentials provided.",
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
        description: "Your network profile has been created. Please sign in.",
        style: { border: "1px solid rgba(251, 191, 36, 0.3)" },
      });

      router.push("/login");
    },
    onError: (error: any) => {
      toast.error("Registration failed", {
        description:
          error.response?.data?.error ||
          "An error occurred during initialization.",
        style: { border: "1px solid rgba(244, 63, 94, 0.3)" },
      });
    },
  });
}

// THE FIX: A dedicated logout hook to clear all caches
export function useLogout() {
  const dispatch = useDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    // 1. Clear Redux state & LocalStorage
    dispatch(logout());

    // 2. Clear React Query Cache (This stops the "ghosting" of old user data)
    queryClient.clear();

    // 3. Redirect to login
    router.push("/login");

    toast.info("Logged out", {
      description: "You have been securely signed out.",
    });
  };
}
