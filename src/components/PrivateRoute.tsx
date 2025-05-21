// components/PrivateRoute.tsx
import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { IonLoading } from "@ionic/react";

interface PrivateRouteProps extends RouteProps {
    children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, ...rest }) => {
    const { isAuthenticated, loading } = useAuth();

    // Afficher un indicateur de chargement pendant la vérification de l'authentification
    if (loading) {
        return (
            <IonLoading
                isOpen={true}
                message="Vérification de l'authentification..."
            />
        );
    }

    return (
        <Route
            {...rest}
            render={({ location }) =>
                isAuthenticated ? (
                    children
                ) : (
                    <Redirect
                        to={{
                            pathname: "/login",
                            state: { from: location },
                        }}
                    />
                )
            }
        />
    );
};

export default PrivateRoute;
