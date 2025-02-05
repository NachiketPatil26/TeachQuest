import { useState, useEffect } from 'react';
import { useAuth } from './useAuth.tsx';

interface Duty {
  id: string;
  examId: string;
  teacherId: string;
  status: 'pending' | 'completed' | 'missed';
  remarks?: string;
  date: string;
  time: string;
  venue: string;
}

interface ApiError {
  message: string;
  status: number;
}

export const useDuties = (branchId?: string) => {
  const [duties, setDuties] = useState<Duty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const fetchDuties = async () => {
      try {
        const endpoint = user?.role === 'admin'
          ? `/api/exams?branch=${branchId}`
          : '/api/duties/my-duties';

        const response = await fetch(endpoint, {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData: ApiError = await response.json();
          throw new Error(errorData.message || 'Failed to fetch duties');
        }

        const data = await response.json();
        if (isMounted) {
          setDuties(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setDuties([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchDuties();
    } else {
      setLoading(false);
      setError('User not authenticated');
    }

    return () => {
      isMounted = false;
    };
  }, [branchId, user]);

  const updateDutyStatus = async (dutyId: string, status: Duty['status'], remarks?: string) => {
    try {
      const response = await fetch(`/api/duties/${dutyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status, remarks })
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message || 'Failed to update duty status');
      }

      const updatedDuty = await response.json();
      setDuties(prev => prev.map(duty =>
        duty.id === dutyId ? { ...duty, ...updatedDuty } : duty
      ));
      setError(null);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  };

  return {
    duties,
    loading,
    error,
    updateDutyStatus
  };
};