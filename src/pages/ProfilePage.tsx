import React, { useState, useEffect } from 'react';
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
  useIonLoading
} from '@ionic/react';
import { camera, cloudUpload, pencil, save, close, logOut } from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';
import './ProfilePage.css';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const ProfilePage: React.FC = () => {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [present, dismiss] = useIonLoading();

  // Charger les données de l'utilisateur au chargement de la page
  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setEmail(currentUser.email || '');
      setProfilePhoto(currentUser.profilePicture || null);
    }
  }, [currentUser]);

  // Fonction pour prendre une photo de profil
  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        promptLabelHeader: 'Photo de profil',
        promptLabelPhoto: 'Choisir depuis la galerie',
        promptLabelPicture: 'Prendre une photo'
      });

      setProfilePhoto(image.dataUrl);
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
      // En développement web, simuler une photo de profil
      if (window.location.hostname === 'localhost') {
        setProfilePhoto('https://ionicframework.com/docs/img/demos/avatar.svg');
        setToastMessage('En mode développement : photo de profil simulée');
        setShowToast(true);
      }
    }
  };

  // Fonction pour enregistrer les modifications
  const saveProfile = async () => {
    await present({ message: 'Enregistrement...' });

    try {
      // En production, ceci ferait un appel API pour mettre à jour le profil
      // Ici, nous simulons une mise à jour réussie
      setTimeout(async () => {
        if (updateUserProfile) {
          await updateUserProfile({
            username,
            email,
            profilePicture: profilePhoto
          });
        }

        await dismiss();
        setEditMode(false);
        setToastMessage('Profil mis à jour avec succès !');
        setShowToast(true);
      }, 1000);
    } catch (error) {
      await dismiss();
      setToastMessage('Erreur lors de la mise à jour du profil');
      setShowToast(true);
    }
  };

  // Fonction pour annuler les modifications
  const cancelEdit = () => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setEmail(currentUser.email || '');
      setProfilePhoto(currentUser.profilePicture || null);
    }
    setEditMode(false);
  };

  // Fonction pour se déconnecter
  const handleLogout = async () => {
    await logout();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mon Compte</IonTitle>
          {!editMode ? (
            <IonButton slot="end" fill="clear" onClick={() => setEditMode(true)}>
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
                  <img src="https://ionicframework.com/docs/img/demos/avatar.svg" alt="Default profile" />
                )}
              </IonAvatar>
              {editMode && (
                <IonButton fill="clear" className="change-photo-button" onClick={takePhoto}>
                  <IonIcon icon={camera} />
                </IonButton>
              )}
            </div>
            <h2 className="profile-name">{username}</h2>
            <p className="profile-email">{email}</p>
          </div>

          <div className="profile-content">
            <IonList className="profile-form">
              <IonItem>
                <IonLabel position="stacked">Nom d'utilisateur</IonLabel>
                <IonInput
                  value={username}
                  onIonChange={e => setUsername(e.detail.value!)}
                  disabled={!editMode}
                  className={editMode ? 'editable' : ''}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  type="email"
                  value={email}
                  onIonChange={e => setEmail(e.detail.value!)}
                  disabled={!editMode}
                  className={editMode ? 'editable' : ''}
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

            <IonGrid>
              <IonRow>
                <IonCol>
                  <div className="stats-item">
                    <div className="stats-number">0</div>
                    <div className="stats-label">Photos</div>
                  </div>
                </IonCol>
                <IonCol>
                  <div className="stats-item">
                    <div className="stats-number">0</div>
                    <div className="stats-label">Vidéos</div>
                  </div>
                </IonCol>
                <IonCol>
                  <div className="stats-item">
                    <div className="stats-number">0</div>
                    <div className="stats-label">Amis</div>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>

            <IonButton
              expand="block"
              color="danger"
              className="logout-button"
              onClick={() => setShowLogoutAlert(true)}
            >
              <IonIcon slot="start" icon={logOut} />
              Se déconnecter
            </IonButton>
          </div>
        </div>

        {/* Alerte de confirmation de déconnexion */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Se déconnecter"
          message="Êtes-vous sûr de vouloir vous déconnecter ?"
          buttons={[
            {
              text: 'Annuler',
              role: 'cancel'
            },
            {
              text: 'Déconnecter',
              handler: handleLogout
            }
          ]}
        />

        {/* Toast pour les notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;