'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/services/auth';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  return { user, loading };
};
