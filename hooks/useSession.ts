"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, SessionState } from "@/lib/types";

export default function useSession(): SessionState {
  console.log("[useSession] Hook rendered");

  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[useSession] useEffect executed");

    let cancelled = false;

    const fetchUser = async () => {
      console.log("[useSession] Starting fetch");

      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });

        console.log("[useSession] Response:", response.status);

        const result = await response.json();

        if (cancelled) return;

        if (response.status === 401) {
          localStorage.removeItem("user");
          alert("Unauthorized, you must login!");
          router.replace("/auth/login");
          return;
        }

        if (!response.ok) {
          throw new Error(result.message || "Failed to retrieve user.");
        }

        if (!result.success || !result.data) {
          throw new Error("Invalid authentication response.");
        }

        setUser(result.data);
        localStorage.setItem("user", JSON.stringify(result.data));

      } catch (err) {
        if (!cancelled) {
          console.error("[useSession] Error:", err);
          setError(
            err instanceof Error ? err.message : "Failed to retrieve user."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      console.log("[useSession] Cleanup");
      cancelled = true;
    };
  }, [router]);

  return { user, isLoading, error };
}