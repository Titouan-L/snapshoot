// src/pages/tabs/socialPages/Groups.tsx
import React, { useState } from "react";
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
} from "@ionic/react";
import { add, close, imageOutline } from "ionicons/icons";
import { useIonRouter } from "@ionic/react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

// Mock data pour les groupes
const mockGroups = [
    { id: "1", name: "Groupe Sport", groupPicture: "" },
    { id: "2", name: "Projet Dev", groupPicture: "" },
];

// Mock data pour les amis (utilisé pour sélectionner qui ajouter au groupe)
const mockFriends = [
    { id: "1", username: "Alice", profilePicture: "", userStatus: "ONLINE" },
    { id: "2", username: "Bob", profilePicture: "", userStatus: "OFFLINE" },
    { id: "3", username: "Charlie", profilePicture: "", userStatus: "ONLINE" },
    { id: "4", username: "David", profilePicture: "", userStatus: "OFFLINE" },
    { id: "5", username: "Emma", profilePicture: "", userStatus: "ONLINE" },
];

const Groups: React.FC = () => {
    const router = useIonRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [groupAvatar, setGroupAvatar] = useState<string | null>(null);
    const [searchFriends, setSearchFriends] = useState("");
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [groups, setGroups] = useState(mockGroups);

    // Filtrer les amis en fonction de la recherche
    const filteredFriends = mockFriends.filter((friend) =>
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
        }
    };

    // Créer un nouveau groupe
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

        // Créer un nouveau groupe avec les données du formulaire
        const newGroup = {
            id: Date.now().toString(), // Simuler un ID unique
            name: groupName,
            groupPicture: groupAvatar || "",
            members: selectedFriends,
        };

        // Ajouter le nouveau groupe à la liste
        setGroups([...groups, newGroup]);

        // Réinitialiser le formulaire
        resetForm();

        // Fermer le modal
        setIsModalOpen(false);

        // Afficher un message de confirmation
        setToastMessage("Groupe créé avec succès");
        setShowToast(true);
    };

    // Réinitialiser le formulaire
    const resetForm = () => {
        setGroupName("");
        setGroupAvatar(null);
        setSelectedFriends([]);
        setSearchFriends("");
    };

    return (
        <>
            <IonList>
                {groups.map((group) => (
                    <IonCard key={group.id} className="group-card">
                        <IonCardContent
                            style={{ display: "flex", alignItems: "center" }}
                        >
                            <IonAvatar>
                                <img
                                    src={
                                        group.groupPicture ||
                                        "https://ui-avatars.com/api/?name=" +
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
                ))}
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
                            {filteredFriends.map((friend) => (
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
                                                friend.profilePicture ||
                                                "https://ui-avatars.com/api/?name=" +
                                                    encodeURIComponent(
                                                        friend.username
                                                    )
                                            }
                                            alt={friend.username}
                                        />
                                    </IonAvatar>
                                    <IonLabel>{friend.username}</IonLabel>
                                </IonItem>
                            ))}
                        </IonList>

                        {/* Message si aucun ami n'est trouvé */}
                        {filteredFriends.length === 0 && (
                            <IonItem lines="none">
                                <IonLabel className="ion-text-center">
                                    Aucun ami trouvé
                                </IonLabel>
                            </IonItem>
                        )}

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
