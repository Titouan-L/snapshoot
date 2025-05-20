import React, { useState, useEffect, createContext, useContext } from "react";
import { Preferences } from "@capacitor/preferences";

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
    register: (
        username: string,
        email: string,
        password: string
    ) => Promise<User>;
    logout: () => Promise<void>;
    updateUserProfile?: (data: UpdateUserData) => Promise<User>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Charger les données de l'utilisateur stockées au démarrage de l'application
    useEffect(() => {
        const loadStoredUser = async (): Promise<void> => {
            try {
                const storedUser = await Preferences.get({
                    key: "currentUser",
                });
                const storedToken = await Preferences.get({ key: "authToken" });

                if (storedUser.value && storedToken.value) {
                    setCurrentUser(JSON.parse(storedUser.value));
                }
            } catch (error) {
                console.error("Error loading stored user data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadStoredUser();
    }, []);

    // Fonction de simulation de connexion (à remplacer par un appel API réel en production)
    const login = async (email: string, password: string): Promise<User> => {
        setIsLoading(true);
        return new Promise<User>((resolve, reject) => {
            setTimeout(async () => {
                try {
                    // Simuler une connexion réussie
                    const user: User = {
                        id: "123456",
                        email,
                        username: email.split("@")[0],
                    };

                    const token = "mock-jwt-token";

                    // Stocker les données de l'utilisateur et le token
                    await Preferences.set({
                        key: "currentUser",
                        value: JSON.stringify(user),
                    });

                    await Preferences.set({
                        key: "authToken",
                        value: token,
                    });

                    setCurrentUser(user);
                    setIsLoading(false);
                    // On ne manipule plus le router directement ici
                    resolve(user);
                } catch (error) {
                    setIsLoading(false);
                    console.error("Erreur lors de la connexion:", error);
                    reject(
                        new Error(
                            "Erreur lors de la connexion: " + error.message
                        )
                    );
                }
            }, 1000); // Simuler un délai réseau
        });
    };

    // Fonction de simulation d'inscription (à remplacer par un appel API réel en production)
    const register = async (
        username: string,
        email: string,
        password: string
    ): Promise<User> => {
        setIsLoading(true);
        return new Promise<User>((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Simuler une inscription réussie
                    const user: User = {
                        id: "654321",
                        email,
                        username,
                    };
                    setIsLoading(false);
                    resolve(user);
                } catch (error) {
                    setIsLoading(false);
                    reject(new Error("Erreur lors de l'inscription"));
                }
            }, 1000); // Simuler un délai réseau
        });
    };

    // Fonction de déconnexion
    const logout = async (): Promise<void> => {
        try {
            // Supprimer les données de l'utilisateur et le token stockés
            await Preferences.remove({ key: "currentUser" });
            await Preferences.remove({ key: "authToken" });

            setCurrentUser(null);
        } catch (error) {
            console.error("Error during logout:", error);
            throw new Error("Erreur lors de la déconnexion");
        }
    };

    // Fonction de mise à jour du profil utilisateur
    const updateUserProfile = async (data: UpdateUserData): Promise<User> => {
        setIsLoading(true);
        return new Promise<User>((resolve, reject) => {
            setTimeout(async () => {
                try {
                    if (currentUser) {
                        // Créer un nouvel objet utilisateur avec les données mises à jour
                        const updatedUser: User = {
                            ...currentUser,
                            username: data.username || currentUser.username,
                            email: data.email || currentUser.email,
                            profilePicture:
                                data.profilePicture !== undefined
                                    ? data.profilePicture
                                    : currentUser.profilePicture,
                        };

                        // Enregistrer les données mises à jour
                        await Preferences.set({
                            key: "currentUser",
                            value: JSON.stringify(updatedUser),
                        });

                        // Mettre à jour l'état
                        setCurrentUser(updatedUser);
                        setIsLoading(false);
                        resolve(updatedUser);
                    } else {
                        setIsLoading(false);
                        reject(new Error("Aucun utilisateur connecté"));
                    }
                } catch (error) {
                    setIsLoading(false);
                    reject(
                        new Error("Erreur lors de la mise à jour du profil")
                    );
                }
            }, 1000); // Simuler un délai réseau
        });
    };

    // Objet de valeur à fournir aux composants consommateurs
    const value: AuthContextType = {
        currentUser,
        login,
        register,
        logout,
        updateUserProfile,
        isAuthenticated: !!currentUser,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
