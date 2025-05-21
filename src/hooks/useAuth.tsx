import React, { useState, useEffect, createContext, useContext } from "react";
import { Preferences } from "@capacitor/preferences";

// Définition des types
export interface User {
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

    // Fonction de connexion (à remplacer par un appel API réel en production)
    const login = async (email: string, password: string): Promise<User> => {
        setIsLoading(true);
        return new Promise<User>((resolve, reject) => {
            // Ici, vous feriez normalement un appel API à votre backend
            setTimeout(async () => {
                try {
                    // Simuler une vérification d'authentification (à remplacer par votre API)
                    // Dans un vrai cas d'utilisation, vous récupéreriez ces données depuis votre API

                    // Créer un objet utilisateur avec les données du formulaire
                    const user: User = {
                        email: email,
                        username: email.split("@")[0], // Par défaut, utilisez la partie locale de l'email comme nom d'utilisateur
                        profilePicture: null, // Pas d'image de profil par défaut
                    };

                    // Générer un token (à remplacer par le token JWT de votre API)
                    const token = `auth-token-${Date.now()}`;

                    // Stocker les données de l'utilisateur dans les préférences
                    await Preferences.set({
                        key: "currentUser",
                        value: JSON.stringify(user),
                    });

                    // Stocker le token d'authentification
                    await Preferences.set({
                        key: "authToken",
                        value: token,
                    });

                    // Stocker d'autres informations qui pourraient être utiles
                    await Preferences.set({
                        key: "lastLogin",
                        value: new Date().toISOString(),
                    });

                    // Mettre à jour l'état de l'application
                    setCurrentUser(user);
                    setIsLoading(false);

                    console.log("Utilisateur connecté et stocké:", user);
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

    // Fonction d'inscription (à remplacer par un appel API réel en production)
    const register = async (
        username: string,
        email: string,
        password: string
    ): Promise<User> => {
        setIsLoading(true);
        return new Promise<User>((resolve, reject) => {
            setTimeout(async () => {
                try {
                    // Créer un objet utilisateur complet avec les données du formulaire
                    const newUser: User = {
                        id: `user-${Date.now()}`, // Générer un ID unique (à remplacer par l'ID réel de votre API)
                        email,
                        username,
                        profilePicture: null, // Pas d'image de profil par défaut
                    };

                    // Générer un token (à remplacer par le token JWT de votre API)
                    const token = `auth-token-${Date.now()}`;

                    // Stocker l'objet utilisateur dans les préférences
                    await Preferences.set({
                        key: "currentUser",
                        value: JSON.stringify(newUser),
                    });

                    // Stocker le token d'authentification
                    await Preferences.set({
                        key: "authToken",
                        value: token,
                    });

                    // Stocker d'autres informations qui pourraient être utiles
                    await Preferences.set({
                        key: "registrationDate",
                        value: new Date().toISOString(),
                    });

                    // Mettre à jour l'état de l'application
                    setCurrentUser(newUser);
                    setIsLoading(false);

                    console.log("Nouvel utilisateur créé et stocké:", newUser);
                    resolve(newUser);
                } catch (error) {
                    setIsLoading(false);
                    console.error("Erreur lors de l'inscription:", error);
                    reject(
                        new Error(
                            "Erreur lors de l'inscription: " + error.message
                        )
                    );
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
