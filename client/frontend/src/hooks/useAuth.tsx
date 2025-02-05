import { useState, useEffect } from 'react';

interface User {
  id: string;
  role: 'admin' | 'teacher';
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = async (credentials: { email: string; password: string; role: 'admin' | 'teacher' }) => {
    // Simplified login that always succeeds
    const mockUser: User = {
      id: '1',
      role: credentials.role,
      name: 'Test User'
    };
    // Generate a mock token
    const mockToken = 'mock_jwt_token_' + Date.now();
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', mockToken);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return { user, isLoading, login, logout };
}