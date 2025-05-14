import React, { useState, useEffect, createContext, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// Définition des types
export interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const history = useHistory();

  // Load stored user data when the app starts
  useEffect(() => {
    const loadStoredUser = async (): Promise<void> => {
      try {
        const storedUser = await Preferences.get({ key: 'currentUser' });
        const storedToken = await Preferences.get({ key: 'authToken' });

        if (storedUser.value && storedToken.value) {
          setCurrentUser(JSON.parse(storedUser.value));
        }
      } catch (error) {
        console.error('Error loading stored user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  // Simulate login function (replace with actual API call in production)
  const login = async (email: string, password: string): Promise<User> => {
    // In a real app, this would be an API call
    return new Promise<User>((resolve, reject) => {
      setTimeout(async () => {
        try {
          // Simulate successful login
          const user: User = {
            id: '123456',
            email,
            username: email.split('@')[0]
          };

          const token = 'mock-jwt-token';

          // Store user data and token
          await Preferences.set({
            key: 'currentUser',
            value: JSON.stringify(user)
          });

          await Preferences.set({
            key: 'authToken',
            value: token
          });

          setCurrentUser(user);
          resolve(user);
        } catch (error) {
          reject(error);
        }
      }, 1000); // Simulate network delay
    });
  };

  // Simulate register function (replace with actual API call in production)
  const register = async (username: string, email: string, password: string): Promise<User> => {
    // In a real app, this would be an API call
    return new Promise<User>((resolve, reject) => {
      setTimeout(() => {
        try {
          // Simulate successful registration
          const user: User = {
            id: '654321',
            email,
            username
          };

          resolve(user);
        } catch (error) {
          reject(error);
        }
      }, 1000); // Simulate network delay
    });
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Remove stored user data and token
      await Preferences.remove({ key: 'currentUser' });
      await Preferences.remove({ key: 'authToken' });

      setCurrentUser(null);
      history.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Value object to be provided to consuming components
  const value: AuthContextType = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;