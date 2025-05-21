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

// Mock data - conservé tel quel
const mockFriends = [
    { id: "1", username: "Alice", profilePicture: "", userStatus: "ONLINE" },
    { id: "2", username: "Bob", profilePicture: "", userStatus: "OFFLINE" },
    { id: "3", username: "Charlie", profilePicture: "", userStatus: "ONLINE" },
];

const Friends: React.FC = () => {
    const [search, setSearch] = useState("");
    const router = useIonRouter();

    const filteredFriends = mockFriends.filter((f) =>
        f.username.toLowerCase().includes(search.toLowerCase())
    );

    // Fonction pour naviguer vers la conversation avec l'ami sélectionné
    const navigateToConversation = (friendId: string, friendUsername: string) => {
        // Passage à la fois de l'ID dans l'URL et du nom en state
        router.push({
            pathname: `/tabs/social/private/${friendId}`,
            state: { 
                friendId: friendId,
                friendUsername: friendUsername
            }
        });
    };

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
                    <IonCard 
                        key={friend.id} 
                        className="friend-card"
                        onClick={() => navigateToConversation(friend.id, friend.username)}
                    >
                        <IonCardContent
                            style={{ display: "flex", alignItems: "center" }}
                        >
                            <div style={{ position: "relative" }}>
                                <IonAvatar>
                                    <img
                                        src={
                                            friend.profilePicture ||
                                            "https://ui-avatars.com/api/?name=" +
                                                friend.username
                                        }
                                        alt={friend.username}
                                    />
                                </IonAvatar>
                                {/* Pastille de statut */}
                                <IonBadge
                                    color={friend.userStatus == "ONLINE" ? "success" : "medium"}
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
                                onClick={(e) => {
                                    e.stopPropagation(); // Empêche le déclenchement du onClick de la carte
                                    navigateToConversation(friend.id, friend.username);
                                }}
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