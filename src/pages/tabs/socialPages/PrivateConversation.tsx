// PrivateConversation.tsx
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
    IonInput,
    IonButton,
    IonButtons,
    IonBackButton,
    useIonViewWillEnter,
} from "@ionic/react";
import { useParams, useLocation } from "react-router-dom";
import "./Conversations.css";

interface RouteParams {
    friendId: string;
}

interface LocationState {
    friendId: string;
    friendUsername: string;
}

const PrivateConversation: React.FC = () => {
    // Récupération de l'ID ami depuis l'URL
    const { friendId } = useParams<RouteParams>();
    const location = useLocation<LocationState>();

    // État pour stocker les données de la conversation
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [friendUsername, setFriendUsername] = useState("");

    // Pour simuler l'affichage des messages avec le bon ami
    useIonViewWillEnter(() => {
        // Récupérer le nom de l'utilisateur depuis l'état de navigation si disponible
        if (location.state && location.state.friendUsername) {
            setFriendUsername(location.state.friendUsername);
        }

        // Charger les messages en fonction de l'ID de l'ami
        loadMessages(friendId);
    });

    // Simulation du chargement des messages
    const loadMessages = (friendId: string) => {
        console.log(
            `Chargement des messages pour l'ami avec l'ID: ${friendId}`
        );

        // Mock data basé sur l'ID de l'ami
        let mockMessages;

        switch (friendId) {
            case "1": // Alice
                mockMessages = [
                    {
                        id: 1,
                        sender: "Alice",
                        text: "Salut, ça va ?",
                        timestamp: "10:00",
                    },
                    {
                        id: 2,
                        sender: "moi",
                        text: "Super et toi ?",
                        timestamp: "10:01",
                    },
                    {
                        id: 3,
                        sender: "Alice",
                        text: "Très bien, merci !",
                        timestamp: "10:02",
                    },
                ];
                break;
            case "2": // Bob
                mockMessages = [
                    {
                        id: 1,
                        sender: "Bob",
                        text: "Hey, quoi de neuf ?",
                        timestamp: "09:45",
                    },
                    {
                        id: 2,
                        sender: "moi",
                        text: "Pas grand chose, et toi ?",
                        timestamp: "09:46",
                    },
                ];
                break;
            case "3": // Charlie
                mockMessages = [
                    {
                        id: 1,
                        sender: "Charlie",
                        text: "On se retrouve où demain ?",
                        timestamp: "12:30",
                    },
                    {
                        id: 2,
                        sender: "moi",
                        text: "Au café habituel à 14h ?",
                        timestamp: "12:35",
                    },
                    {
                        id: 3,
                        sender: "Charlie",
                        text: "Parfait, à demain !",
                        timestamp: "12:36",
                    },
                ];
                break;
            default:
                mockMessages = [
                    {
                        id: 1,
                        sender: "Contact",
                        text: "Bonjour",
                        timestamp: "08:00",
                    },
                    {
                        id: 2,
                        sender: "moi",
                        text: "Bonjour",
                        timestamp: "08:01",
                    },
                ];
        }

        setMessages(mockMessages);
    };

    const sendMessage = () => {
        if (newMessage.trim() === "") return;

        // Créer un nouveau message
        const newMsg = {
            id: messages.length + 1,
            sender: "moi",
            text: newMessage,
            timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        // Ajouter le message à la liste
        setMessages([...messages, newMsg]);

        // Réinitialiser le champ de saisie
        setNewMessage("");

        console.log(`Message envoyé à l'utilisateur avec l'ID: ${friendId}`);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/tabs/social" />
                    </IonButtons>
                    <IonTitle>
                        {friendUsername || `Conversation ${friendId}`}
                    </IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonList lines="none">
                    {messages.map((msg) => (
                        <IonItem
                            key={msg.id}
                            className={
                                msg.sender === "moi"
                                    ? "message-sent"
                                    : "message-received"
                            }
                        >
                            <IonLabel className="message-bubble">
                                <p className="message-text">{msg.text}</p>
                                <span className="message-time">
                                    {msg.timestamp}
                                </span>
                            </IonLabel>
                        </IonItem>
                    ))}
                </IonList>

                <div className="message-input-container">
                    <IonInput
                        placeholder="Écrire un message..."
                        className="message-input"
                        value={newMessage}
                        onIonChange={(e) => setNewMessage(e.detail.value || "")}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <IonButton
                        fill="clear"
                        className="send-button"
                        onClick={sendMessage}
                    >
                        Envoyer
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default PrivateConversation;
