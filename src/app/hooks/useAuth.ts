// src/hooks/useAuth.ts
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { authEndpoints } from "../lib/api";
import { toast } from "sonner"; // Import toast
import { setCredentials } from "../store/slices/authSlice";

export function useLogin() {
  const dispatch = useDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: authEndpoints.login,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      dispatch(setCredentials({ user: data.user, token: data.token }));

      // Fire the success toast
      toast.success("Authentication successful", {
        description: `Welcome back, ${data.user.email}`,
        style: { border: "1px solid rgba(251, 191, 36, 0.3)" }, // Subtle amber border
      });

      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error("Authentication failed", {
        description:
          error.response?.data?.error || "Invalid credentials provided.",
        style: { border: "1px solid rgba(244, 63, 94, 0.3)" }, // Subtle rose border
      });
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: authEndpoints.register,
    onSuccess: () => {
      // Fire the success toast
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
