
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'agent' | 'manager';
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  updateUserProfile: (data: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'password',
    name: 'Admin User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: 'admin' as const
  },
  {
    id: '2',
    email: 'agent@example.com',
    password: 'password',
    name: 'Support Agent',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=agent',
    role: 'agent' as const
  },
  {
    id: '3',
    email: 'demo@example.com',
    password: 'demo123',
    name: 'Demo User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    role: 'agent' as const
  }
];

// Helper to get users from localStorage or initial mock data
const getUsersFromStorage = () => {
  const storedUsers = localStorage.getItem('mockUsers');
  if (storedUsers) {
    try {
      return JSON.parse(storedUsers);
    } catch (error) {
      console.error('Error parsing stored users:', error);
      return MOCK_USERS;
    }
  }
  // Initialize localStorage with mock users if it doesn't exist
  localStorage.setItem('mockUsers', JSON.stringify(MOCK_USERS));
  return MOCK_USERS;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('authUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('authUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Get users from localStorage
    const users = getUsersFromStorage();
    
    // Find user by email (mock authentication)
    const foundUser = users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('authUser', JSON.stringify(userWithoutPassword));
      toast.success(`Welcome back, ${userWithoutPassword.name}!`);
    } else {
      toast.error('Invalid email or password');
    }
    
    setIsLoading(false);
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Get existing users
    const users = getUsersFromStorage();
    
    // Check if user already exists
    const existingUser = users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingUser) {
      toast.error('User with this email already exists');
      setIsLoading(false);
      return false;
    }
    
    // Create new user
    const newUser = {
      id: `${users.length + 1}`,
      email,
      password,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      role: 'agent' as const
    };
    
    // Add to users array
    const updatedUsers = [...users, newUser];
    localStorage.setItem('mockUsers', JSON.stringify(updatedUsers));
    
    // Auto-login the user
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('authUser', JSON.stringify(userWithoutPassword));
    
    toast.success(`Welcome, ${name}! Your account has been created.`);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    toast.info('You have been logged out');
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      
      // Also update in the mock users array
      const users = getUsersFromStorage();
      const updatedUsers = users.map((u: any) => {
        if (u.id === user.id) {
          return { ...u, ...data, password: u.password };
        }
        return u;
      });
      localStorage.setItem('mockUsers', JSON.stringify(updatedUsers));
      
      toast.success('Profile updated successfully');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout,
      register,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
