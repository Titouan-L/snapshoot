import React, { useState, useEffect } from "react";
import {
    IonList,
    IonCard,
    IonCardContent,
    IonAvatar,
    IonLabel,
    IonButton,
    IonFab,
    IonFabButton,
    IonIcon,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonInput,
    IonItem,
    IonSearchbar,
    IonCheckbox,
    IonFooter,
    IonItemDivider,
    IonToast,
    IonNote,
    useIonViewWillEnter,
} from "@ionic/react";
import { add, close, imageOutline } from "ionicons/icons";
import { useIonRouter } from "@ionic/react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Preferences } from "@capacitor/preferences";

// Interfaces pour la typographie des données
interface Group {
    id: string;
    name: string;
    groupPicture: string;
}

interface Friend {
    id: string;
    username: string;
    profilePicture: string;
    status: string | null;
}

const Groups: React.FC = () => {
    const router = useIonRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [groupAvatar, setGroupAvatar] = useState<string | null>(null);
    const [searchFriends, setSearchFriends] = useState("");
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [groups, setGroups] = useState<Group[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(true);

    // Fonction utilitaire pour récupérer le token d'authentification
    async function getAuthToken(): Promise<string> {
        try {
            const { value } = await Preferences.get({ key: "authToken" });
            console.log(
                "Auth Token retrieved:",
                value ? "Exists" : "Does Not Exist"
            ); // Debug
            return value || "";
        } catch (error) {
            console.error("Erreur lors de la récupération du token:", error);
            return "";
        }
    }

    // --- Récupération des groupes de l'utilisateur ---
    const loadGroups = async () => {
        const token = await getAuthToken();
        if (!token) {
            setToastMessage("Vous n'êtes pas authentifié.");
            setShowToast(true);
            return;
        }

        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow" as RequestRedirect,
        };

        try {
            const response = await fetch(
                "http://localhost/api/private/user/groups",
                requestOptions
            );

            if (response.ok) {
                const result = await response.json();
                if (result && Array.isArray(result.groups)) {
                    setGroups(result.groups);
                } else {
                    console.warn(
                        "La réponse de l'API pour les groupes n'est pas dans le format attendu:",
                        result
                    );
                    setGroups([]);
                }
            } else {
                const errorText = await response.text();
                console.error(
                    `Erreur HTTP lors du chargement des groupes: ${response.status} - ${errorText}`
                );
                setToastMessage(
                    `Erreur lors du chargement des groupes: ${response.status}`
                );
                setShowToast(true);
                setGroups([]);
            }
        } catch (error) {
            console.error(
                "Erreur lors de l'appel API pour les groupes:",
                error
            );
            setToastMessage("Échec du chargement des groupes.");
            setShowToast(true);
            setGroups([]);
        }
    };

    // --- Récupération des amis de l'utilisateur ---
    const loadFriends = async () => {
        console.log("loadFriends: Début de la fonction."); // Debug
        setLoadingFriends(true);
        const token = await getAuthToken();
        if (!token) {
            console.warn("loadFriends: Pas de token d'authentification."); // Debug
            setToastMessage("Vous n'êtes pas authentifié.");
            setShowToast(true);
            setLoadingFriends(false);
            return;
        }

        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow" as RequestRedirect,
        };

        try {
            console.log("loadFriends: Tentative de fetch de l'API des amis."); // Debug
            const response = await fetch(
                "http://localhost/api/private/user/friends",
                requestOptions
            );
            console.log(
                "loadFriends: Réponse du fetch reçue.",
                response.ok,
                response.status
            ); // Debug

            if (response.ok) {
                const result = await response.json();
                console.log("loadFriends: API Friends Raw Response:", result); // Log de la réponse brute

                if (
                    result &&
                    typeof result === "object" &&
                    "friends" in result &&
                    Array.isArray(result.friends)
                ) {
                    setFriends(result.friends);
                    console.log(
                        "loadFriends: Friends successfully loaded into state:",
                        result.friends
                    ); // Confirmez les amis chargés dans l'état
                } else {
                    console.warn(
                        "loadFriends: La réponse de l'API pour les amis n'est pas dans le format attendu (attendait un objet avec 'friends' array):",
                        result
                    );
                    setFriends([]);
                }
            } else {
                const errorText = await response.text();
                console.error(
                    `loadFriends: Erreur HTTP lors du chargement des amis: ${response.status} - ${errorText}`
                );
                setToastMessage(
                    `Erreur lors du chargement des amis: ${response.status}`
                );
                setShowToast(true);
                setFriends([]);
            }
        } catch (error) {
            console.error(
                "loadFriends: Erreur lors de l'appel API pour les amis:",
                error
            );
            setToastMessage("Échec du chargement des amis.");
            setShowToast(true);
            setFriends([]);
        } finally {
            console.log(
                "loadFriends: Fin de la fonction. Définition de setLoadingFriends(false)."
            ); // Debug
            setLoadingFriends(false);
        }
    };

    // Filtrer les amis en fonction de la recherche
    const filteredFriends = friends.filter((friend) =>
        friend.username.toLowerCase().includes(searchFriends.toLowerCase())
    );

    // Gérer la sélection/désélection d'un ami
    const toggleFriendSelection = (friendId: string) => {
        setSelectedFriends((prevSelected) => {
            if (prevSelected.includes(friendId)) {
                return prevSelected.filter((id) => id !== friendId);
            } else {
                return [...prevSelected, friendId];
            }
        });
    };

    const selectGroupAvatar = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: true,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Photos,
                promptLabelHeader: "Photo de groupe",
                promptLabelPhoto: "Choisir depuis la galerie",
            });

            setGroupAvatar(image.dataUrl);
        } catch (error) {
            console.error("Erreur lors de la sélection de photo:", error);
            setToastMessage("Échec de la sélection de l'image.");
            setShowToast(true);
        }
    };

    const createGroup = () => {
        if (groupName.trim() === "") {
            setToastMessage("Veuillez entrer un nom de groupe");
            setShowToast(true);
            return;
        }

        if (selectedFriends.length === 0) {
            setToastMessage("Veuillez sélectionner au moins un ami");
            setShowToast(true);
            return;
        }

        const newGroup = {
            id: Date.now().toString(),
            name: groupName,
            groupPicture: groupAvatar || "",
        };

        setGroups([...groups, newGroup]);

        resetForm();

        setIsModalOpen(false);

        setToastMessage("Groupe créé avec succès (localement)!");
        setShowToast(true);
    };

    // Réinitialiser le formulaire
    const resetForm = () => {
        setGroupName("");
        setGroupAvatar(null);
        setSelectedFriends([]);
        setSearchFriends("");
    };

    // Charger les groupes et les amis au moment où la vue est sur le point d'entrer
    useIonViewWillEnter(() => {
        console.log("useIonViewWillEnter: Appel de loadGroups et loadFriends."); // Debug
        loadGroups();
        loadFriends();
    });

    // Optionnel: Log l'état des amis après chaque re-render (pour debug)
    useEffect(() => {
        console.log("friends state updated:", friends);
    }, [friends]);

    useEffect(() => {
        console.log("loadingFriends state updated:", loadingFriends); // Debug du state loadingFriends
    }, [loadingFriends]);

    return (
        <>
            <IonList>
                {groups.length === 0 ? (
                    <IonItem lines="none">
                        <IonLabel className="ion-text-center">
                            Aucun groupe trouvé. Créez-en un !
                        </IonLabel>
                    </IonItem>
                ) : (
                    groups.map((group) => (
                        <IonCard key={group.id} className="group-card">
                            <IonCardContent
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <IonAvatar>
                                    <img
                                        src={
                                            group.groupPicture &&
                                            group.groupPicture !== "string"
                                                ? group.groupPicture
                                                : "https://ui-avatars.com/api/?name=" +
                                                  encodeURIComponent(group.name)
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
                                    onClick={() =>
                                        router.push({
                                            pathname: `/tabs/social/group/${group.id}`,
                                            state: {
                                                groupName: group.name,
                                                groupId: group.id,
                                            },
                                        })
                                    }
                                >
                                    Accéder
                                </IonButton>
                            </IonCardContent>
                        </IonCard>
                    ))
                )}
            </IonList>

            {/* FAB pour créer un nouveau groupe */}
            <IonFab vertical="bottom" horizontal="end" slot="fixed">
                <IonFabButton onClick={() => setIsModalOpen(true)}>
                    <IonIcon icon={add} />
                </IonFabButton>
            </IonFab>

            {/* Modal pour créer un nouveau groupe */}
            <IonModal
                isOpen={isModalOpen}
                onDidDismiss={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
            >
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Créer un groupe</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={() => setIsModalOpen(false)}>
                                <IonIcon icon={close} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>

                <IonContent>
                    <div style={{ padding: "16px" }}>
                        {/* Sélection de l'image du groupe */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                marginBottom: "20px",
                            }}
                        >
                            <div style={{ position: "relative" }}>
                                <IonAvatar
                                    style={{
                                        width: "100px",
                                        height: "100px",
                                        border: "2px solid #ccc",
                                    }}
                                >
                                    <img
                                        src={
                                            groupAvatar ||
                                            "https://ui-avatars.com/api/?name=" +
                                                encodeURIComponent(
                                                    groupName || "Group"
                                                )
                                        }
                                        alt="Group Avatar"
                                    />
                                </IonAvatar>
                                {/* Bouton de sélection d'image corrigé */}
                                <IonButton
                                    size="small"
                                    onClick={selectGroupAvatar}
                                    style={{
                                        position: "absolute",
                                        bottom: "-5px",
                                        right: "-5px",
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        "--padding-start": "0",
                                        "--padding-end": "0",
                                    }}
                                >
                                    <IonIcon icon={imageOutline} />
                                </IonButton>
                            </div>
                        </div>

                        {/* Nom du groupe - Corrigé */}
                        <IonItem>
                            <IonLabel position="stacked">
                                Nom du groupe
                            </IonLabel>
                            <IonInput
                                value={groupName}
                                onIonChange={(e) =>
                                    setGroupName(e.detail.value || "")
                                }
                                placeholder="Entrez le nom du groupe"
                                required
                            />
                        </IonItem>

                        <IonItemDivider style={{ margin: "16px 0 8px 0" }}>
                            <IonLabel>Sélectionner des amis</IonLabel>
                        </IonItemDivider>

                        {/* Barre de recherche pour filtrer les amis */}
                        <IonSearchbar
                            value={searchFriends}
                            onIonChange={(e) =>
                                setSearchFriends(e.detail.value!)
                            }
                            placeholder="Rechercher des amis"
                        />

                        {/* Liste des amis avec checkbox */}
                        <IonList>
                            {/* Afficher un indicateur de chargement */}
                            {loadingFriends ? (
                                <IonItem lines="none">
                                    <IonLabel className="ion-text-center">
                                        Chargement des amis...
                                    </IonLabel>
                                </IonItem>
                            ) : filteredFriends.length === 0 ? (
                                <IonItem lines="none">
                                    <IonLabel className="ion-text-center">
                                        {/* Message plus informatif */}
                                        {friends.length === 0 && !loadingFriends
                                            ? "Aucun ami trouvé."
                                            : "Aucun ami correspondant à la recherche."}
                                    </IonLabel>
                                </IonItem>
                            ) : (
                                filteredFriends.map((friend) => (
                                    <IonItem key={friend.id}>
                                        <IonCheckbox
                                            slot="start"
                                            checked={selectedFriends.includes(
                                                friend.id
                                            )}
                                            onIonChange={() =>
                                                toggleFriendSelection(friend.id)
                                            }
                                        />
                                        <IonAvatar slot="start">
                                            <img
                                                src={
                                                    friend.profilePicture &&
                                                    friend.profilePicture !==
                                                        "string"
                                                        ? friend.profilePicture
                                                        : "https://ui-avatars.com/api/?name=" +
                                                          encodeURIComponent(
                                                              friend.username
                                                          )
                                                }
                                                alt={friend.username}
                                            />
                                        </IonAvatar>
                                        <IonLabel>{friend.username}</IonLabel>
                                    </IonItem>
                                ))
                            )}
                        </IonList>

                        <IonNote
                            style={{
                                display: "block",
                                padding: "10px",
                                color: "#666",
                            }}
                        >
                            Amis sélectionnés: {selectedFriends.length}
                        </IonNote>
                    </div>
                </IonContent>

                <IonFooter>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonButton onClick={() => setIsModalOpen(false)}>
                                Annuler
                            </IonButton>
                        </IonButtons>
                        <IonButtons slot="end">
                            <IonButton strong={true} onClick={createGroup}>
                                Créer
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonFooter>
            </IonModal>

            {/* Toast pour les notifications */}
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

export default Groups;
