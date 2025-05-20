// src/pages/tabs/socialPages/Requests-sent.tsx
import React from "react";
import {
    IonList,
    IonCard,
    IonCardContent,
    IonAvatar,
    IonLabel,
    IonButton,
} from "@ionic/react";

// Mock data
const mockSent = [
    { id: "1", username: "David", avatar: "" },
    { id: "2", username: "Emma", avatar: "" },
];

const RequestsSent: React.FC = () => (
    <IonList>
        {mockSent.map((user) => (
            <IonCard key={user.id} className="sent-card">
                <IonCardContent
                    style={{ display: "flex", alignItems: "center" }}
                >
                    <IonAvatar>
                        <img
                            src={
                                user.avatar ||
                                "https://ui-avatars.com/api/?name=" +
                                    user.username
                            }
                            alt={user.username}
                        />
                    </IonAvatar>
                    <IonLabel style={{ flex: 1, marginLeft: 16 }}>
                        {user.username}
                    </IonLabel>
                    <IonButton
                        color="danger"
                        size="small"
                        fill="outline"
                        style={{ marginLeft: "auto" }}
                        // onClick={() => ...}
                    >
                        Annuler
                    </IonButton>
                </IonCardContent>
            </IonCard>
        ))}
    </IonList>
);

export default RequestsSent;
