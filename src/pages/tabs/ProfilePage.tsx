import React, { useState, useEffect } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonAvatar,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonAlert,
    IonToast,
    IonFab,
    IonFabButton,
    useIonLoading,
    useIonViewDidEnter,
} from "@ionic/react";
import {
    imageOutline,
    save,
    close,
    logOut,
    trash,
    pencil,
} from "ionicons/icons";
import { useAuth } from "../../hooks/useAuth";
import "./ProfilePage.css";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const ProfilePage: React.FC = () => {
    const { currentUser, logout, updateUserProfile } = useAuth();
    const [editMode, setEditMode] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [showLogoutAlert, setShowLogoutAlert] = useState<boolean>(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>("");
    const [toastColor, setToastColor] = useState<string>("success");
    const [present, dismiss] = useIonLoading();

    // Charger les données de l'utilisateur au chargement de la page
    useEffect(() => {
        if (currentUser) {
            setUsername(currentUser.username || "");
            setEmail(currentUser.email || "");
            setProfilePhoto(currentUser.profilePicture || null);
        }
    }, [currentUser]);

    // Animation lors de l'entrée dans la vue
    useIonViewDidEnter(() => {
        const profileHeader = document.querySelector(".profile-header");
        if (profileHeader) {
            profileHeader.classList.add("profile-header-animate");
        }
    });

    // Fonction pour choisir une photo depuis la galerie
    const selectPhoto = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: true,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Photos,
                promptLabelHeader: "Photo de profil",
                promptLabelPhoto: "Choisir depuis la galerie",
            });

            setProfilePhoto(image.dataUrl);
        } catch (error) {
            console.error("Erreur lors de la sélection de photo:", error);

            // En développement web, simuler une photo de profil
            if (window.location.hostname === "localhost") {
                setProfilePhoto(
                    "https://ionicframework.com/docs/img/demos/avatar.svg"
                );
                setToastMessage(
                    "En mode développement : photo de profil simulée"
                );
                setToastColor("success");
                setShowToast(true);
            } else {
                setToastMessage("Impossible de sélectionner une photo");
                setToastColor("warning");
                setShowToast(true);
            }
        }
    };

    // Fonction pour enregistrer les modifications
    const saveProfile = async () => {
        await present({
            message: "Enregistrement...",
            spinner: "crescent",
            cssClass: "custom-loading",
        });

        try {
            // En production, ceci ferait un appel API pour mettre à jour le profil
            // Ici, nous simulons une mise à jour réussie
            setTimeout(async () => {
                if (updateUserProfile) {
                    await updateUserProfile({
                        username,
                        email,
                        profilePicture: profilePhoto,
                    });
                }

                await dismiss();
                setEditMode(false);
                setToastMessage("Profil mis à jour avec succès !");
                setToastColor("success");
                setShowToast(true);
            }, 1000);
        } catch (error) {
            await dismiss();
            setToastMessage("Erreur lors de la mise à jour du profil");
            setToastColor("danger");
            setShowToast(true);
        }
    };

    // Fonction pour annuler les modifications
    const cancelEdit = () => {
        if (currentUser) {
            setUsername(currentUser.username || "");
            setEmail(currentUser.email || "");
            setProfilePhoto(currentUser.profilePicture || null);
        }
        setEditMode(false);
    };

    // Fonction pour se déconnecter
    const handleLogout = async () => {
        await logout();
    };

    // Fonction pour supprimer le compte (simulée)
    const handleDeleteAccount = async () => {
        await present({
            message: "Suppression du compte...",
            spinner: "crescent",
            cssClass: "custom-loading",
        });

        // Simulation de la suppression du compte
        setTimeout(async () => {
            await dismiss();
            setToastMessage("Compte supprimé avec succès");
            setToastColor("success");
            setShowToast(true);

            // Déconnexion après suppression du compte
            setTimeout(() => {
                logout();
            }, 2000);
        }, 2000);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Mon Profil</IonTitle>
                    {!editMode ? (
                        <IonButton
                            slot="end"
                            fill="clear"
                            onClick={() => setEditMode(true)}
                        >
                            <IonIcon slot="icon-only" icon={pencil} />
                        </IonButton>
                    ) : (
                        <IonButton slot="end" fill="clear" onClick={cancelEdit}>
                            <IonIcon slot="icon-only" icon={close} />
                        </IonButton>
                    )}
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <div className="profile-container">
                    <div className="profile-header">
                        <div className="profile-photo-container">
                            <IonAvatar className="profile-avatar">
                                {profilePhoto ? (
                                    <img src={profilePhoto} alt="Profile" />
                                ) : (
                                    <img
                                        src="https://ionicframework.com/docs/img/demos/avatar.svg"
                                        alt="Default profile"
                                    />
                                )}
                            </IonAvatar>

                            {editMode && (
                                <IonFabButton
                                    className="change-photo-button"
                                    size="small"
                                    onClick={selectPhoto}
                                >
                                    <IonIcon icon={imageOutline} />
                                </IonFabButton>
                            )}
                        </div>
                        <h2 className="profile-username">
                            {username || "Utilisateur"}
                        </h2>
                    </div>

                    <div className="profile-content">
                        <IonGrid>
                            <IonRow>
                                <IonCol size="12" size-md="8" offset-md="2">
                                    <IonList className="profile-form">
                                        <IonItem>
                                            <IonLabel position="stacked">
                                                Nom d'utilisateur
                                            </IonLabel>
                                            <IonInput
                                                value={username}
                                                onIonChange={(e) =>
                                                    setUsername(e.detail.value!)
                                                }
                                                disabled={!editMode}
                                                className={
                                                    editMode ? "editable" : ""
                                                }
                                                placeholder="Entrez votre nom d'utilisateur"
                                            />
                                        </IonItem>

                                        <IonItem>
                                            <IonLabel position="stacked">
                                                Email
                                            </IonLabel>
                                            <IonInput
                                                type="email"
                                                value={email}
                                                onIonChange={(e) =>
                                                    setEmail(e.detail.value!)
                                                }
                                                disabled={!editMode}
                                                className={
                                                    editMode ? "editable" : ""
                                                }
                                                placeholder="Entrez votre email"
                                            />
                                        </IonItem>
                                    </IonList>

                                    {editMode && (
                                        <IonButton
                                            expand="block"
                                            className="save-button"
                                            onClick={saveProfile}
                                        >
                                            <IonIcon slot="start" icon={save} />
                                            Sauvegarder
                                        </IonButton>
                                    )}

                                    <div className="profile-actions">
                                        <IonButton
                                            expand="block"
                                            className="logout-button"
                                            onClick={() =>
                                                setShowLogoutAlert(true)
                                            }
                                        >
                                            <IonIcon
                                                slot="start"
                                                icon={logOut}
                                            />
                                            Se déconnecter
                                        </IonButton>

                                        <IonButton
                                            expand="block"
                                            fill="outline"
                                            color="danger"
                                            className="delete-account-button"
                                            onClick={() =>
                                                setShowDeleteAlert(true)
                                            }
                                        >
                                            <IonIcon
                                                slot="start"
                                                icon={trash}
                                            />
                                            Supprimer mon compte
                                        </IonButton>
                                    </div>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </div>
                </div>

                {/* Alerte de confirmation de déconnexion */}
                <IonAlert
                    isOpen={showLogoutAlert}
                    onDidDismiss={() => setShowLogoutAlert(false)}
                    header="Se déconnecter"
                    message="Êtes-vous sûr de vouloir vous déconnecter ?"
                    cssClass="custom-alert"
                    buttons={[
                        {
                            text: "Annuler",
                            role: "cancel",
                            cssClass: "alert-button-cancel",
                        },
                        {
                            text: "Déconnecter",
                            handler: handleLogout,
                            cssClass: "alert-button-confirm",
                        },
                    ]}
                />

                {/* Alerte de confirmation de suppression du compte */}
                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => setShowDeleteAlert(false)}
                    header="Supprimer le compte"
                    message="Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
                    cssClass="custom-alert"
                    buttons={[
                        {
                            text: "Annuler",
                            role: "cancel",
                            cssClass: "alert-button-cancel",
                        },
                        {
                            text: "Supprimer",
                            handler: handleDeleteAccount,
                            cssClass: "alert-button-confirm-danger",
                        },
                    ]}
                />

                {/* Toast pour les notifications */}
                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                    position="bottom"
                    cssClass="custom-toast"
                    color={toastColor}
                />
            </IonContent>
        </IonPage>
    );
};

export default ProfilePage;
