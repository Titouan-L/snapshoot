// PrivateConversation.tsx
import React from "react";
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
} from "@ionic/react";
import "./Conversations.css";

const PrivateConversation: React.FC = () => {
    // Mock data
    const messages = [
        { id: 1, sender: "Alice", text: "Salut, ça va ?", timestamp: "10:00" },
        { id: 2, sender: "moi", text: "Super et toi ?", timestamp: "10:01" },
    ];

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/tabs/messages" />
                    </IonButtons>
                    <IonTitle>Alice</IonTitle>
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
                    />
                    <IonButton fill="clear" className="send-button">
                        Envoyer
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default PrivateConversation;
