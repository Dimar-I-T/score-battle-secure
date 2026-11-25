"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Admin {
  username: string;
  role: string;
}

interface AdminSessionState {
  admin: Admin | null;
  isLoading: boolean;
  error: string | null;
}

export default function useAdminSession(): AdminSessionState {
  const router = useRouter();

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchAdmin = async () => {
      try {
        const response = await fetch("/api/admin/auth/me", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });

        const result = await response.json();

        if (cancelled) return;

        if (response.status === 401) {
          setAdmin(null);
          router.replace("/admin/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to retrieve admin session."
          );
        }

        if (!result.success || !result.data) {
          throw new Error("Invalid admin session response.");
        }

        if (result.data.role !== "admin") {
          setAdmin(null);
          router.replace("/admin/login");
          return;
        }

        setAdmin(result.data);

      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to retrieve admin session."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchAdmin();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return { admin, isLoading, error };
}