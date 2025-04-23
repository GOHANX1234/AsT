import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  role: "admin" | "reseller";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (role: "admin" | "reseller", username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, password: string, referralToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  
  // Get the current session
  const { data, isLoading } = useQuery({ 
    queryKey: ['/api/auth/session'],
    refetchOnWindowFocus: true
  });
  
  const isAuthenticated = data?.isAuthenticated || false;
  const user = data?.user || null;
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ 
      role, 
      username, 
      password 
    }: { 
      role: "admin" | "reseller"; 
      username: string; 
      password: string;
    }) => {
      const response = await apiRequest('POST', `/api/auth/${role}/login`, { username, password });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/session'] });
    }
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/logout', {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/session'] });
      navigate('/');
    }
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async ({ 
      username, 
      password, 
      referralToken 
    }: { 
      username: string; 
      password: string; 
      referralToken: string;
    }) => {
      const response = await apiRequest('POST', '/api/auth/reseller/register', { 
        username, 
        password, 
        referralToken 
      });
      return response.json();
    },
    onSuccess: () => {
      navigate('/');
    }
  });
  
  // Redirect based on auth state
  useEffect(() => {
    if (isLoading) return;
    
    const publicPaths = ['/', '/register'];
    const adminPaths = ['/admin', '/admin/resellers', '/admin/tokens', '/admin/api'];
    const resellerPaths = ['/reseller', '/reseller/generate', '/reseller/keys', '/reseller/api'];
    
    // If authenticated, redirect from public pages to dashboard
    if (isAuthenticated && publicPaths.includes(location)) {
      if (user?.role === 'admin') {
        navigate('/admin');
      } else if (user?.role === 'reseller') {
        navigate('/reseller');
      }
    }
    
    // If not authenticated, redirect to login
    if (!isAuthenticated && ![...publicPaths].includes(location)) {
      navigate('/');
    }
    
    // If authenticated but wrong role, redirect to appropriate dashboard
    if (isAuthenticated) {
      if (user?.role === 'admin' && resellerPaths.some(path => location.startsWith(path))) {
        navigate('/admin');
      } else if (user?.role === 'reseller' && adminPaths.some(path => location.startsWith(path))) {
        navigate('/reseller');
      }
    }
  }, [isAuthenticated, location, isLoading, user]);
  
  // Auth methods
  const login = async (role: "admin" | "reseller", username: string, password: string) => {
    await loginMutation.mutateAsync({ role, username, password });
  };
  
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };
  
  const register = async (username: string, password: string, referralToken: string) => {
    await registerMutation.mutateAsync({ username, password, referralToken });
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
