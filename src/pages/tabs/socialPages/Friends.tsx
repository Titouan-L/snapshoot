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
    IonRow,
    IonCol,
    IonText,
    IonProgressBar,
} from "@ionic/react";
import { sendOutline, ellipse, addOutline, closeOutline, personAddOutline, timeOutline, playOutline } from "ionicons/icons";
import { useIonRouter } from "@ionic/react";
import { Preferences } from "@capacitor/preferences";

// Mock data - conservé tel quel
const mockFriends = [
    { id: "1", username: "Alice", profilePicture: "", userStatus: "ONLINE" },
    { id: "2", username: "Bob", profilePicture: "", userStatus: "OFFLINE" },
    { id: "3", username: "Charlie", profilePicture: "", userStatus: "ONLINE" },
];

// Mock data pour les stories
const mockStories = [
    {
        id: "1",
        userId: "1",
        username: "Alice",
        profilePicture: "",
        hasNewStory: true,
        stories: [
            { id: "s1", type: "image", url: "https://picsum.photos/id/237/800/1200", timestamp: new Date().getTime() - 3600000 },
            { id: "s2", type: "image", url: "https://picsum.photos/id/238/800/1200", timestamp: new Date().getTime() - 1800000 }
        ]
    },
    {
        id: "2",
        userId: "2",
        username: "Bob",
        profilePicture: "",
        hasNewStory: true,
        stories: [
            { id: "s3", type: "image", url: "https://picsum.photos/id/239/800/1200", timestamp: new Date().getTime() - 7200000 }
        ]
    },
    {
        id: "3",
        userId: "3",
        username: "Charlie",
        profilePicture: "",
        hasNewStory: false,
        stories: [
            { id: "s4", type: "video", url: "https://www.w3schools.com/html/mov_bbb.mp4", timestamp: new Date().getTime() - 43200000 }
        ]
    },
    {
        id: "4",
        userId: "4",
        username: "David",
        profilePicture: "",
        hasNewStory: true,
        stories: [
            { id: "s5", type: "image", url: "https://picsum.photos/id/240/800/1200", timestamp: new Date().getTime() - 1200000 }
        ]
    },
    {
        id: "5",
        userId: "5",
        username: "Emma",
        profilePicture: "",
        hasNewStory: true,
        stories: [
            { id: "s6", type: "image", url: "https://picsum.photos/id/241/800/1200", timestamp: new Date().getTime() - 900000 }
        ]
    }
];

// Version simple sans Swiper
const Friends: React.FC = () => {
    // Ajout d'un log pour voir si le composant est monté
    console.log("Friends component mounted");

    const [search, setSearch] = useState("");
    const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const router = useIonRouter();

    // États pour les stories
    const [selectedStory, setSelectedStory] = useState<any>(null);
    const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [storyProgress, setStoryProgress] = useState(0);
    const [storyTimeout, setStoryTimeout] = useState<NodeJS.Timeout | null>(null);

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

    async function getAuthToken() {
        try {
            const { value } = await Preferences.get({ key: 'authToken' });
            return value;
        } catch (error) {
            console.error('Erreur lors de la récupération du token:', error);
            return null;
        }
    }

    // Fonction pour rechercher des utilisateurs avec fetch
    const searchUsers = async (prefix: string) => {
        if (prefix.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const token = await getAuthToken();
            const response = await fetch(`http://localhost/private/users/search/${prefix}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
            const token = await getAuthToken();
            const response = await fetch(`http://localhost/private/users/add/${friendId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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

    // Ouvrir une story
    const openStory = (story: any) => {
        console.log("Opening story:", story);
        setSelectedStory(story);
        setCurrentStoryIndex(0);
        setIsStoryModalOpen(true);
        startStoryProgress();
    };

    // Gérer la progression des stories
    const startStoryProgress = () => {
        setStoryProgress(0);

        // Nettoyer le timeout existant
        if (storyTimeout) {
            clearInterval(storyTimeout);
        }

        // Créer un nouveau timeout pour la progression
        const interval = setInterval(() => {
            setStoryProgress((prev) => {
                const newProgress = prev + 0.01;

                // Si la progression est complète, passer à la story suivante ou fermer
                if (newProgress >= 1) {
                    clearInterval(interval);
                    goToNextStory();
                    return 0;
                }
                return newProgress;
            });
        }, 30); // 30ms x 100 = 3 secondes par story

        setStoryTimeout(interval);
    };

    // Aller à la story suivante
    const goToNextStory = () => {
        if (!selectedStory) return;

        if (currentStoryIndex < selectedStory.stories.length - 1) {
            setCurrentStoryIndex((prev) => prev + 1);
            startStoryProgress();
        } else {
            // Si c'est la dernière story, fermer le modal
            closeStoryModal();
        }
    };

    // Aller à la story précédente
    const goToPrevStory = () => {
        if (!selectedStory) return;

        if (currentStoryIndex > 0) {
            setCurrentStoryIndex((prev) => prev - 1);
            startStoryProgress();
        }
    };

    // Fermer le modal des stories
    const closeStoryModal = () => {
        if (storyTimeout) {
            clearInterval(storyTimeout);
        }
        setIsStoryModalOpen(false);
        setSelectedStory(null);
        setStoryProgress(0);
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

    // Nettoyer le timeout lorsque le composant est démonté
    useEffect(() => {
        return () => {
            if (storyTimeout) {
                clearInterval(storyTimeout);
            }
        };
    }, [storyTimeout]);

    // Formatage du temps écoulé
    const formatTimeAgo = (timestamp: number) => {
        const now = new Date().getTime();
        const diff = now - timestamp;

        if (diff < 60000) {
            return "à l'instant";
        } else if (diff < 3600000) {
            return `il y a ${Math.floor(diff / 60000)} min`;
        } else if (diff < 86400000) {
            return `il y a ${Math.floor(diff / 3600000)} h`;
        } else {
            return `il y a ${Math.floor(diff / 86400000)} j`;
        }
    };

    return (
        <>


            <IonSearchbar
                value={search}
                onIonChange={(e) => setSearch(e.detail.value!)}
                placeholder="Rechercher un ami"
            />

            {/* Section des stories (sans Swiper pour le moment) */}
            <div className="stories-container" style={{ margin: "10px 0", overflowX: "auto" }}>
                <IonTitle size="small" style={{ padding: "0 10px", margin: "5px 0" }}>Stories</IonTitle>

                {/* Version simple sans Swiper */}
                <div style={{ display: "flex", padding: "0 10px", gap: "10px", overflowX: "auto" }}>
                    {mockStories.map((storyItem) => (
                        <div
                            key={storyItem.id}
                            className="story-item"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: "70px",
                                flexShrink: 0
                            }}
                            onClick={() => openStory(storyItem)}
                        >
                            <div
                                style={{
                                    position: "relative",
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "50%",
                                    border: storyItem.hasNewStory ? "2px solid #3880ff" : "2px solid #cccccc",
                                    padding: "2px",
                                    overflow: "hidden"
                                }}
                            >
                                <IonAvatar style={{ width: "100%", height: "100%" }}>
                                    <img
                                        src={storyItem.profilePicture || "https://ui-avatars.com/api/?name=" + storyItem.username}
                                        alt={storyItem.username}
                                    />
                                </IonAvatar>
                            </div>
                            <IonText style={{ fontSize: "12px", marginTop: "5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "65px" }}>
                                {storyItem.username}
                            </IonText>
                        </div>
                    ))}
                </div>
            </div>

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

            {/* Modal pour afficher les stories */}
            <IonModal isOpen={isStoryModalOpen} onDidDismiss={closeStoryModal} backdropDismiss={false}>
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#000",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Header avec progression et info utilisateur */}
                    <div style={{ padding: "10px", display: "flex", alignItems: "center", zIndex: 1000 }}>
                        {/* Barres de progression pour chaque story */}
                        <div style={{ display: "flex", flex: 1, gap: "2px" }}>
                            {selectedStory?.stories.map((_: any, index: number) => (
                                <IonProgressBar
                                    key={index}
                                    value={index === currentStoryIndex ? storyProgress : (index < currentStoryIndex ? 1 : 0)}
                                    style={{ height: "3px", borderRadius: "3px" }}
                                />
                            ))}
                        </div>

                        {/* Bouton pour fermer */}
                        <IonButton
                            fill="clear"
                            color="light"
                            onClick={closeStoryModal}
                            style={{ marginLeft: "10px" }}
                        >
                            <IonIcon icon={closeOutline} slot="icon-only" />
                        </IonButton>
                    </div>

                    {/* Info utilisateur */}
                    <div style={{ padding: "0 10px 10px", display: "flex", alignItems: "center", zIndex: 1000 }}>
                        <IonAvatar style={{ width: "30px", height: "30px" }}>
                            <img
                                src={selectedStory?.profilePicture || "https://ui-avatars.com/api/?name=" + selectedStory?.username}
                                alt={selectedStory?.username}
                            />
                        </IonAvatar>
                        <IonLabel style={{ marginLeft: "10px", color: "#fff" }}>
                            {selectedStory?.username}
                        </IonLabel>
                        <IonLabel style={{ marginLeft: "auto", color: "#ccc", fontSize: "12px" }}>
                            <IonIcon icon={timeOutline} style={{ marginRight: "5px", fontSize: "14px" }} />
                            {selectedStory?.stories[currentStoryIndex] && formatTimeAgo(selectedStory.stories[currentStoryIndex].timestamp)}
                        </IonLabel>
                    </div>

                    {/* Contenu de la story */}
                    <div
                        style={{
                            flex: 1,
                            position: "relative",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            overflow: "hidden"
                        }}
                    >
                        {/* Zones tactiles pour naviguer entre les stories */}
                        <div
                            style={{ position: "absolute", left: 0, top: 0, width: "33%", height: "100%", zIndex: 900 }}
                            onClick={goToPrevStory}
                        />
                        <div
                            style={{ position: "absolute", right: 0, top: 0, width: "33%", height: "100%", zIndex: 900 }}
                            onClick={goToNextStory}
                        />

                        {/* Afficher l'image ou la vidéo */}
                        {selectedStory?.stories[currentStoryIndex]?.type === "image" ? (
                            <img
                                src={selectedStory?.stories[currentStoryIndex]?.url}
                                alt="Story"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain"
                                }}
                            />
                        ) : selectedStory?.stories[currentStoryIndex]?.type === "video" ? (
                            <video
                                autoPlay
                                controls={false}
                                muted={false}
                                playsInline
                                onPlay={() => {
                                    if (storyTimeout) {
                                        clearInterval(storyTimeout);
                                    }
                                }}
                                onEnded={goToNextStory}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain"
                                }}
                            >
                                <source src={selectedStory?.stories[currentStoryIndex]?.url} type="video/mp4" />
                                Votre navigateur ne prend pas en charge la vidéo.
                            </video>
                        ) : null}
                    </div>
                </div>
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