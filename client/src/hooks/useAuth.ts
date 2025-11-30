import { useEffect, useState } from "react";
import type { User } from "@shared/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/trpc/auth.me");
        if (!response.ok) {
          setUser(null);
          return;
        }
        const data = await response.json();
        // tRPC returns data in a specific format
        setUser(data.result?.data || null);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, isLoading, error };
}
