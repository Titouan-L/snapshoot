// GroupConversation.tsx
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
    IonAvatar,
    IonInput,
    IonButton,
    IonBackButton,
    IonButtons,
} from "@ionic/react";
import "./Conversations.css";

const GroupConversation: React.FC = () => {
    // Mock data
    const group = {
        name: "Dev Team",
        members: ["Alice", "Bob", "Charlie"],
        messages: [
            {
                id: 1,
                sender: "Alice",
                text: "On fait le point ?",
                timestamp: "09:30",
            },
            {
                id: 2,
                sender: "Bob",
                text: "Oui, je suis dispo",
                timestamp: "09:31",
            },
        ],
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/tabs/messages" />
                    </IonButtons>
                    <IonTitle>{group.name}</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonList lines="none">
                    {group.messages.map((msg) => (
                        <IonItem key={msg.id}>
                            <IonAvatar slot="start">
                                <img
                                    src={`https://i.pravatar.cc/40?u=${msg.sender}`}
                                    alt="avatar"
                                />
                            </IonAvatar>
                            <IonLabel className="message-bubble">
                                <h3>{msg.sender}</h3>
                                <p>{msg.text}</p>
                                <span>{msg.timestamp}</span>
                            </IonLabel>
                        </IonItem>
                    ))}
                </IonList>

                <div className="message-input-container">
                    <IonInput placeholder="Écrire au groupe..." />
                    <IonButton fill="clear">Envoyer</IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default GroupConversation;
