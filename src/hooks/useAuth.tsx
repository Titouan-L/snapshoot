import React, { useState, useEffect, createContext, useContext } from "react";
import { Preferences } from "@capacitor/preferences";

interface UpdateUserData {
    username?: string;
    email?: string;
    profilePicture?: string | null;
}

interface AuthContextType {
    authToken: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (
        username: string,
        email: string,
        password: string
    ) => Promise<void>;
    logout: () => Promise<void>;
    updateUserProfile?: (data: UpdateUserData) => Promise<any>;
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
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const loadStoredToken = async (): Promise<void> => {
            try {
                const storedToken = await Preferences.get({ key: "authToken" });
                if (storedToken.value) {
                    setAuthToken(storedToken.value);
                }
            } catch (error) {
                console.error("Error loading stored token:", error);
            } finally {
                setLoading(false);
            }
        };

        loadStoredToken();
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        setIsLoading(true);
        try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({ email, password });

            const requestOptions: RequestInit = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow",
            };

            const response = await fetch(
                "http://localhost/api/auth/login",
                requestOptions
            );
            const token = await response.text();

            if (!response.ok) {
                throw new Error("Login failed");
            }

            await Preferences.set({
                key: "authToken",
                value: token,
            });
            setAuthToken(token);
        } catch (error: any) {
            console.error("Login error:", error);
            throw new Error("Login failed: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (
        username: string,
        email: string,
        password: string
    ): Promise<void> => {
        setIsLoading(true);
        try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({ username, email, password });

            const requestOptions: RequestInit = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow",
            };

            const response = await fetch(
                "http://localhost/api/auth/register",
                requestOptions
            );
            const token = await response.text();

            if (!response.ok) {
                throw new Error("Registration failed");
            }

            await Preferences.set({
                key: "authToken",
                value: token,
            });
            setAuthToken(token);
        } catch (error: any) {
            console.error("Registration error:", error);
            throw new Error("Registration failed: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await Preferences.remove({ key: "authToken" });
            setAuthToken(null);
        } catch (error) {
            console.error("Error during logout:", error);
            throw new Error("Error during logout");
        }
    };

    const updateUserProfile = async (data: UpdateUserData): Promise<any> => {
        setIsLoading(true);
        try {
            if (!authToken) {
                throw new Error("No auth token found");
            }

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("Authorization", `Bearer ${authToken}`);

            const raw = JSON.stringify(data);

            const requestOptions: RequestInit = {
                method: "PUT",
                headers: myHeaders,
                body: raw,
                redirect: "follow",
            };

            const response = await fetch(
                "http://localhost/api/user/profile",
                requestOptions
            );
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Profile update failed");
            }

            // If the API returns the updated user data, you can return it.
            // Otherwise, you might need to re-fetch user details based on the token.
            return result;
        } catch (error: any) {
            console.error("Profile update error:", error);
            throw new Error("Profile update failed: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const value: AuthContextType = {
        authToken,
        login,
        register,
        logout,
        updateUserProfile,
        isAuthenticated: !!authToken,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
