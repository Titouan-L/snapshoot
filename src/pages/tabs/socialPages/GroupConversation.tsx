// GroupConversation.tsx
import React, { useState, useEffect } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonInput,
    IonButton,
    IonBackButton,
    IonButtons,
    useIonViewWillEnter,
    IonSpinner,
} from "@ionic/react";
import { useParams, useLocation } from "react-router-dom";
import "./Conversations.css";

// Définition des types
interface GroupMessage {
    id: string | number;
    sender: string;
    text: string;
    timestamp: string;
}

interface Group {
    id: string;
    name: string;
    groupPicture?: string;
    members: string[];
    messages: GroupMessage[];
}

interface RouteParams {
    id: string;
}

interface LocationState {
    groupName?: string;
    groupId?: string;
}

// Mock data pour les groupes
const mockGroupsData: Record<string, Group> = {
    "1": {
        id: "1",
        name: "Groupe Sport",
        groupPicture: "",
        members: ["Alice", "Bob", "David"],
        messages: [
            {
                id: 1,
                sender: "Alice",
                text: "Entraînement ce soir ?",
                timestamp: "14:30",
            },
            {
                id: 2,
                sender: "Bob",
                text: "Oui, je serai là",
                timestamp: "14:35",
            },
            {
                id: 3,
                sender: "David",
                text: "Moi aussi, à quelle heure ?",
                timestamp: "14:37",
            },
        ],
    },
    "2": {
        id: "2",
        name: "Projet Dev",
        groupPicture: "",
        members: ["Alice", "Charlie", "Emma"],
        messages: [
            {
                id: 1,
                sender: "Alice",
                text: "On fait le point sur le sprint ?",
                timestamp: "09:30",
            },
            {
                id: 2,
                sender: "Charlie",
                text: "Oui, je suis dispo",
                timestamp: "09:31",
            },
            {
                id: 3,
                sender: "Emma",
                text: "J'ai terminé la fonctionnalité de chat",
                timestamp: "09:35",
            },
        ],
    },
};

const GroupConversation: React.FC = () => {
    const { id } = useParams<RouteParams>();
    const location = useLocation<LocationState>();
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");

    // Récupérer le nom du groupe depuis la location state si disponible
    const groupNameFromState = location.state?.groupName;

    // Charger les données du groupe
    useIonViewWillEnter(() => {
        // Simuler une récupération de données depuis une API
        setTimeout(() => {
            const groupData = mockGroupsData[id];
            if (groupData) {
                setGroup(groupData);
            }
            setLoading(false);
        }, 500);
    });

    // Envoyer un message
    const sendMessage = () => {
        if (!newMessage.trim() || !group) return;

        const message: GroupMessage = {
            id: Date.now(),
            sender: "Vous", // En situation réelle, on utiliserait l'utilisateur connecté
            text: newMessage,
            timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        // Mettre à jour l'état local
        setGroup({
            ...group,
            messages: [...group.messages, message],
        });

        // Réinitialiser le champ de saisie
        setNewMessage("");
    };

    // Gérer la touche Entrée pour envoyer le message
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    if (loading) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref="/tabs/social" />
                        </IonButtons>
                        <IonTitle>{groupNameFromState || "Groupe"}</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <div className="loading-container">
                        <IonSpinner name="crescent" />
                        <p>Chargement du groupe...</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (!group) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref="/tabs/social" />
                        </IonButtons>
                        <IonTitle>Groupe introuvable</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    <p>Le groupe demandé n'existe pas ou a été supprimé.</p>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/tabs/social" />
                    </IonButtons>
                    <IonTitle>{group.name}</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonList lines="none">
                    {group.messages.map((msg) => (
                        <IonItem
                            key={msg.id}
                            className={
                                msg.sender === "Vous" ? "my-message" : ""
                            }
                        >
                            <IonAvatar
                                slot="start"
                                className={
                                    msg.sender === "Vous" ? "hidden-avatar" : ""
                                }
                            >
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        msg.sender
                                    )}`}
                                    alt="avatar"
                                />
                            </IonAvatar>
                            <IonLabel
                                className={`message-bubble ${
                                    msg.sender === "Vous"
                                        ? "my-message-bubble"
                                        : ""
                                }`}
                            >
                                <h3>{msg.sender}</h3>
                                <p>{msg.text}</p>
                                <span className="message-timestamp">
                                    {msg.timestamp}
                                </span>
                            </IonLabel>
                        </IonItem>
                    ))}
                </IonList>
            </IonContent>

            <div className="message-input-container">
                <IonInput
                    value={newMessage}
                    placeholder="Écrire au groupe..."
                    onIonChange={(e) => setNewMessage(e.detail.value || "")}
                    onKeyDown={handleKeyDown}
                />
                <IonButton
                    fill="clear"
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                >
                    Envoyer
                </IonButton>
            </div>
        </IonPage>
    );
};

export default GroupConversation;
