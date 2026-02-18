import { useEffect, useState } from "react";

export function useSession(sessionId) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        const data = await res.json();
        if (data.success) {
          setSession(data.session);
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  return { session, loading, error };
}
