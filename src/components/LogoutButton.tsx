import React from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { logOutOutline } from "ionicons/icons";
import { useAuth } from "../hooks/useAuth";
import { useIonRouter } from "@ionic/react";

const LogoutButton: React.FC = () => {
    const { logout } = useAuth();
    const router = useIonRouter();

    const handleLogout = async () => {
        try {
            await logout();
            // Redirection après déconnexion
            router.push("/login", "forward", "replace");
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <IonButton onClick={handleLogout} fill="clear">
            <IonIcon slot="icon-only" icon={logOutOutline} />
        </IonButton>
    );
};

export default LogoutButton;
