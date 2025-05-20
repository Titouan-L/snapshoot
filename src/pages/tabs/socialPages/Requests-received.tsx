// src/pages/tabs/socialPages/Requests-received.tsx
import React from "react";
import {
    IonList,
    IonCard,
    IonCardContent,
    IonAvatar,
    IonLabel,
    IonButton,
    IonButtons,
} from "@ionic/react";

// Mock data
const mockReceived = [
    { id: "1", username: "Lucas", avatar: "" },
    { id: "2", username: "Sophie", avatar: "" },
];

const RequestsReceived: React.FC = () => (
    <IonList>
        {mockReceived.map((user) => (
            <IonCard key={user.id} className="received-card">
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
                    <IonButtons>
                        <IonButton
                            color="danger"
                            size="small"
                            fill="outline"
                            // onClick={() => ...}
                        >
                            ❌
                        </IonButton>
                        <IonButton
                            color="success"
                            size="small"
                            fill="outline"
                            // onClick={() => ...}
                        >
                            ✔️
                        </IonButton>
                    </IonButtons>
                </IonCardContent>
            </IonCard>
        ))}
    </IonList>
);

export default RequestsReceived;
