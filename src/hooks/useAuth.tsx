import React, { useState, useEffect, createContext, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// Définition des types
export interface User {
  id: string;
  email: string;
  username: string;
  profilePicture?: string | null;
}

interface UpdateUserData {
  username?: string;
  email?: string;
  profilePicture?: string | null;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUserProfile?: (data: UpdateUserData) => Promise<User>;
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
          history.push('/tabs/camera'); // Redirection vers la page de caméra après connexion
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

  // Update user profile function
  const updateUserProfile = async (data: UpdateUserData): Promise<User> => {
    return new Promise<User>((resolve, reject) => {
      setTimeout(async () => {
        try {
          // Si nous avons un utilisateur connecté
          if (currentUser) {
            // Créer un nouvel objet utilisateur avec les données mises à jour
            const updatedUser: User = {
              ...currentUser,
              username: data.username || currentUser.username,
              email: data.email || currentUser.email,
              profilePicture: data.profilePicture !== undefined ? data.profilePicture : currentUser.profilePicture
            };

            // Enregistrer les données mises à jour
            await Preferences.set({
              key: 'currentUser',
              value: JSON.stringify(updatedUser)
            });

            // Mettre à jour l'état
            setCurrentUser(updatedUser);
            resolve(updatedUser);
          } else {
            reject(new Error("Aucun utilisateur connecté"));
          }
        } catch (error) {
          reject(error);
        }
      }, 1000); // Simuler un délai réseau
    });
  };

  // Value object to be provided to consuming components
  const value: AuthContextType = {
    currentUser,
    login,
    register,
    logout,
    updateUserProfile,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;