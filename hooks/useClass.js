import { useEffect, useState } from "react";

export function useClass(classId) {
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await fetch(`/api/classes/${classId}`);
        const data = await res.json();
        if (data.success) {
          setClassData(data.class);
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    if (classId) {
      fetchClass();
    }
  }, [classId]);

  return { classData, loading, error };
}
