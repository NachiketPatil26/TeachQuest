import { useState, useEffect } from 'react';

interface User {
  id: string;
  role: 'admin' | 'teacher';
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: { email: string; password: string; role: 'admin' | 'teacher' }) => {
    try {
      // Admin credentials check
      if (credentials.role === 'admin' && 
          credentials.email === 'admin@gmail.com' && 
          credentials.password === 'admin123') {
        const adminUser = {
          id: 'admin-1',
          role: 'admin' as const,
          name: 'Admin'
        };
        localStorage.setItem('user', JSON.stringify(adminUser));
        setUser(adminUser);
        return { success: true };
      }
      
      // Teacher credentials check
      if (credentials.role === 'teacher' && 
          credentials.email === 'teacher@gmail.com' && 
          credentials.password === 'teacher123') {
        const teacherUser = {
          id: 'teacher-1',
          role: 'teacher' as const,
          name: 'John Smith'
        };
        localStorage.setItem('user', JSON.stringify(teacherUser));
        setUser(teacherUser);
        return { success: true };
      }
      
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return { user, isLoading, login, logout };
} 