// src/pages/tabs/socialPages/Groups.tsx
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
const mockGroups = [
    { id: "1", name: "Groupe Sport", avatar: "" },
    { id: "2", name: "Projet Dev", avatar: "" },
];

const Groups: React.FC = () => (
    <IonList>
        {mockGroups.map((group) => (
            <IonCard key={group.id} className="group-card">
                <IonCardContent
                    style={{ display: "flex", alignItems: "center" }}
                >
                    <IonAvatar>
                        <img
                            src={
                                group.avatar ||
                                "https://ui-avatars.com/api/?name=" + group.name
                            }
                            alt={group.name}
                        />
                    </IonAvatar>
                    <IonLabel style={{ flex: 1, marginLeft: 16 }}>
                        {group.name}
                    </IonLabel>
                    <IonButton
                        color="secondary"
                        size="small"
                        fill="outline"
                        style={{ marginLeft: "auto" }}
                        // onClick={() => ...}
                    >
                        Accéder
                    </IonButton>
                </IonCardContent>
            </IonCard>
        ))}
    </IonList>
);

export default Groups;
