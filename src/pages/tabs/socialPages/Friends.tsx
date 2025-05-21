// src/pages/tabs/socialPages/Friends.tsx
import React, { useState, useEffect } from "react";
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
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonToast,
    IonFab,
    IonFabButton,
} from "@ionic/react";
import { sendOutline, ellipse, addOutline, closeOutline, personAddOutline } from "ionicons/icons";
import { useIonRouter } from "@ionic/react";

// Mock data - conservé tel quel
const mockFriends = [
    { id: "1", username: "Alice", profilePicture: "", userStatus: "ONLINE" },
    { id: "2", username: "Bob", profilePicture: "", userStatus: "OFFLINE" },
    { id: "3", username: "Charlie", profilePicture: "", userStatus: "ONLINE" },
];

const Friends: React.FC = () => {
    const [search, setSearch] = useState("");
    const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
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

    // Fonction pour rechercher des utilisateurs avec fetch
    const searchUsers = async (prefix: string) => {
        if (prefix.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await fetch(`http://localhost/private/users/search/${prefix}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Ajoutez ici les en-têtes d'authentification si nécessaire
                    // 'Authorization': 'Bearer ' + votre_token,
                },
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Erreur lors de la recherche d'utilisateurs:", error);
            // Pour la démo, on utilise des données simulées si l'API échoue
            setSearchResults([
                { id: "101", username: "David", profilePicture: "" },
                { id: "102", username: "Emma", profilePicture: "" },
                { id: "103", username: "Frank", profilePicture: "" },
            ].filter(user => user.username.toLowerCase().includes(prefix.toLowerCase())));
        }
    };

    // Fonction pour ajouter un ami avec fetch
    const addFriend = async (friendId: string, friendUsername: string) => {
        try {
            const response = await fetch(`http://localhost/private/users/add/${friendId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Ajoutez ici les en-têtes d'authentification si nécessaire
                    // 'Authorization': 'Bearer ' + votre_token,
                },
                // Si vous devez envoyer des données dans le corps de la requête:
                // body: JSON.stringify({ /* vos données */ }),
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            // Si l'API renvoie des données, vous pouvez les traiter ici
            // const data = await response.json();

            setToastMessage(`${friendUsername} a été ajouté à votre liste d'amis`);
            setShowToast(true);

            // On peut rafraîchir la liste des amis ici si nécessaire
            // Dans un vrai cas, vous pourriez vouloir recharger la liste des amis

            // Fermer le modal après ajout réussi
            setIsAddFriendModalOpen(false);
        } catch (error) {
            console.error("Erreur lors de l'ajout d'un ami:", error);
            setToastMessage("Erreur lors de l'ajout de l'ami");
            setShowToast(true);
        }
    };

    // Effet pour la recherche d'utilisateurs
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery) {
                searchUsers(searchQuery);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

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
                                    color={friend.userStatus === "ONLINE" ? "success" : "medium"}
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

            {/* Bouton FAB pour ajouter des amis */}
            <IonFab vertical="bottom" horizontal="end" slot="fixed">
                <IonFabButton onClick={() => setIsAddFriendModalOpen(true)}>
                    <IonIcon icon={addOutline} />
                </IonFabButton>
            </IonFab>

            {/* Modal pour rechercher et ajouter des amis */}
            <IonModal isOpen={isAddFriendModalOpen} onDidDismiss={() => setIsAddFriendModalOpen(false)}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Ajouter un ami</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={() => setIsAddFriendModalOpen(false)}>
                                <IonIcon icon={closeOutline} slot="icon-only" />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonSearchbar
                        value={searchQuery}
                        onIonChange={(e) => setSearchQuery(e.detail.value!)}
                        placeholder="Rechercher un utilisateur"
                        debounce={500}
                    />
                    <IonList>
                        {searchResults.map((user) => (
                            <IonCard key={user.id} className="user-card">
                                <IonCardContent
                                    style={{ display: "flex", alignItems: "center" }}
                                >
                                    <IonAvatar>
                                        <img
                                            src={
                                                user.profilePicture ||
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
                                        color="primary"
                                        size="small"
                                        onClick={() => addFriend(user.id, user.username)}
                                    >
                                        <IonIcon icon={personAddOutline} slot="icon-only" />
                                    </IonButton>
                                </IonCardContent>
                            </IonCard>
                        ))}
                        {searchQuery.length > 0 && searchResults.length === 0 && (
                            <div style={{ textAlign: "center", padding: "20px" }}>
                                Aucun utilisateur trouvé
                            </div>
                        )}
                    </IonList>
                </IonContent>
            </IonModal>

            {/* Toast de notification */}
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={toastMessage}
                duration={2000}
                position="bottom"
            />
        </>
    );
};

export default Friends;