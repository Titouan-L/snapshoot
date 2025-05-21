// src/pages/tabs/socialPages/Friends.tsx
import React, { useState } from "react";
import {
    IonSearchbar,
    IonList,
    IonAvatar,
    IonLabel,
    IonButton,
    IonBadge,
    IonCard,
    IonCardContent,
    IonIcon,
} from "@ionic/react";
import { sendOutline, ellipse } from "ionicons/icons";
import { useIonRouter } from "@ionic/react";

// Mock data
const mockFriends = [
    { id: "1", username: "Alice", avatar: "", online: true },
    { id: "2", username: "Bob", avatar: "", online: false },
    { id: "3", username: "Charlie", avatar: "", online: true },
];

const Friends: React.FC = () => {
    const [search, setSearch] = useState("");
    const router = useIonRouter();

    const filteredFriends = mockFriends.filter((f) =>
        f.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <IonSearchbar
                value={search}
                onIonChange={(e) => setSearch(e.detail.value!)}
                placeholder="Rechercher un ami"
            />
            <div style={{ height: 1, background: "#ccc", margin: "8px 0" }} />
            <IonList>
                {filteredFriends.map((friend) => (
                    <IonCard key={friend.id} className="friend-card">
                        <IonCardContent
                            style={{ display: "flex", alignItems: "center" }}
                        >
                            <div style={{ position: "relative" }}>
                                <IonAvatar>
                                    <img
                                        src={
                                            friend.avatar ||
                                            "https://ui-avatars.com/api/?name=" +
                                                friend.username
                                        }
                                        alt={friend.username}
                                    />
                                </IonAvatar>
                                {/* Pastille de statut */}
                                <IonBadge
                                    color={friend.online ? "success" : "medium"}
                                    style={{
                                        position: "absolute",
                                        bottom: 0,
                                        right: 0,
                                        borderRadius: "50%",
                                        width: 16,
                                        height: 16,
                                        border: "2px solid white",
                                    }}
                                >
                                    <IonIcon
                                        icon={ellipse}
                                        style={{ fontSize: 12 }}
                                    />
                                </IonBadge>
                            </div>
                            <IonLabel style={{ flex: 1, marginLeft: 16 }}>
                                {friend.username}
                            </IonLabel>
                            <IonButton
                                color="primary"
                                size="small"
                                fill="outline"
                                style={{ marginLeft: "auto" }}
                                onClick={() =>
                                    router.push(
                                        `/tabs/social/private/${friend.id}`,
                                        'forward',
                                        'push'
                                    )
                                }
                            >
                                <IonIcon icon={sendOutline} slot="icon-only" />
                            </IonButton>
                        </IonCardContent>
                    </IonCard>
                ))}
            </IonList>
        </>
    );
};

export default Friends;
