import { useState, useRef, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonFooter,
  IonToolbar,
  IonButtons,
  IonHeader,
  IonTitle,
  useIonActionSheet,
  useIonViewDidEnter,
  useIonViewWillEnter,
  useIonViewWillLeave,
  useIonViewDidLeave,
  IonSpinner,
  IonToast,
  IonFab,
  IonFabButton
} from '@ionic/react';
import {
  camera, videocam, image, send, close, stopCircle,
  refreshOutline, flashOutline, checkmarkCircle
} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { useAuth } from '../../hooks/useAuth';
import LogoutButton from '../../components/LogoutButton';
import './CameraPage.css';

// Interface pour les amis
interface Friend {
  id: string;
  name: string;
}

// Amis fictifs pour démonstration
const dummyFriends: Friend[] = [
  { id: '1', name: 'Marie' },
  { id: '2', name: 'Thomas' },
  { id: '3', name: 'Sarah' },
  { id: '4', name: 'David' },
  { id: '5', name: 'Julie' },
  { id: '6', name: 'Lucas' },
  { id: '7', name: 'Emma' },
  { id: '8', name: 'Nicolas' },
];

const CameraPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [photo, setPhoto] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [presentActionSheet] = useIonActionSheet();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const [cameraDirection, setCameraDirection] = useState<CameraDirection>(CameraDirection.Front);
  const [useFlash, setUseFlash] = useState<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);

  // États pour les toasts et la sélection d'amis
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showFriendsList, setShowFriendsList] = useState<boolean>(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  // Référence pour suivre si le composant est monté
  const isMounted = useRef<boolean>(true);

  // Initialiser la caméra quand la vue est sur le point d'entrer
  useIonViewWillEnter(() => {
    isMounted.current = true;
    if (!photo && !showFriendsList) {
      initializeCamera();
    }
  });

  // S'assurer que la caméra est arrêtée lorsque l'utilisateur quitte la page
  useIonViewWillLeave(() => {
    stopCamera();
  });

  // Nettoyage complet lors de la sortie de la vue
  useIonViewDidLeave(() => {
    // Arrêter complètement la caméra et libérer toutes les ressources
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setCameraActive(false);
    isMounted.current = false;
  });

  // Initialiser la caméra
  const initializeCamera = async () => {
    // Ne pas initialiser si le composant n'est plus monté ou si la caméra est déjà active
    if (!isMounted.current || cameraActive || showFriendsList) return;

    setIsLoading(true);
    try {
      // Vérifier et demander les permissions de caméra
      const permissions = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraDirection === CameraDirection.Front ? 'user' : 'environment'
        },
        audio: false
      });

      // Vérifier à nouveau si le composant est monté avant de continuer
      if (!isMounted.current) {
        permissions.getTracks().forEach(track => track.stop());
        return;
      }

      setCameraPermission(true);

      // Stocker le stream pour pouvoir l'arrêter plus tard
      streamRef.current = permissions;

      // Afficher le flux vidéo
      if (videoRef.current) {
        videoRef.current.srcObject = permissions;
        videoRef.current.play()
          .then(() => {
            if (isMounted.current) {
              setCameraActive(true);
            }
          })
          .catch(err => {
            console.error("Erreur lors de la lecture vidéo:", err);
          });
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la caméra:', error);
      if (isMounted.current) {
        setCameraPermission(false);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Arrêter la caméra
  const stopCamera = () => {
    if (streamRef.current) {
      // Arrêter toutes les pistes vidéo et audio
      streamRef.current.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          track.stop();
        }
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load(); // Force le navigateur à libérer les ressources
    }

    if (isMounted.current) {
      setCameraActive(false);
    }
  };

  // Fonction spécifique pour relancer la caméra après annulation
  const restartCamera = async () => {
    // Ne pas tenter de relancer si non monté
    if (!isMounted.current) return;

    // S'assurer que tous les états sont réinitialisés
    setPhoto(null);
    setIsRecording(false);
    setShowFriendsList(false);
    setCameraActive(false);

    // Arrêter complètement la caméra actuelle
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Petit délai pour s'assurer que tout est nettoyé
    await new Promise(resolve => setTimeout(resolve, 200));

    // Vérifier à nouveau si toujours monté
    if (!isMounted.current) return;

    // Démarrer une nouvelle instance de caméra
    try {
      setIsLoading(true);
      const permissions = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraDirection === CameraDirection.Front ? 'user' : 'environment'
        },
        audio: false
      });

      // Vérifier si toujours monté
      if (!isMounted.current) {
        permissions.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = permissions;

      if (videoRef.current) {
        videoRef.current.srcObject = permissions;
        await videoRef.current.play();

        if (isMounted.current) {
          setCameraActive(true);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation de la caméra:', error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Basculer entre la caméra frontale et arrière
  const toggleCameraDirection = async () => {
    if (!isMounted.current) return;

    setIsLoading(true);
    stopCamera();

    // Changer la direction de la caméra
    setCameraDirection(prev =>
      prev === CameraDirection.Front ? CameraDirection.Rear : CameraDirection.Front
    );

    // Petit délai pour s'assurer que les ressources sont libérées
    setTimeout(() => {
      if (isMounted.current) {
        initializeCamera();
      }
    }, 300);
  };

  // Fonction pour prendre une photo à partir du flux vidéo en direct
  const takePhoto = async () => {
    if (!videoRef.current || !cameraActive || !isMounted.current) return;

    setIsLoading(true);
    try {
      // Créer un canvas pour capturer l'image du flux vidéo
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Si c'est la caméra frontale, on peut inverser l'image pour un effet miroir naturel
        if (cameraDirection === CameraDirection.Front) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Convertir en dataURL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

        // Arrêter la caméra avant de définir la photo
        stopCamera();

        // Vérifier si toujours monté
        if (isMounted.current) {
          // Définir la photo
          setPhoto(dataUrl);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Fonction pour démarrer l'enregistrement vidéo
  const startVideoRecording = async () => {
    if (!isMounted.current) return;

    if (!cameraActive || !videoRef.current || !streamRef.current) {
      await initializeCamera();
      // Petit délai pour s'assurer que la caméra est initialisée
      await new Promise(resolve => setTimeout(resolve, 500));

      // Vérifier si toujours monté
      if (!isMounted.current) return;
    }

    try {
      // Demander l'accès au micro (en plus de la caméra déjà active)
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      if (!isMounted.current) {
        audioStream.getTracks().forEach(track => track.stop());
        return;
      }

      // Combiner les pistes audio et vidéo
      const videoStream = streamRef.current;
      if (!videoStream) return;

      const combinedStream = new MediaStream();
      videoStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
      audioStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));

      // Initialiser le MediaRecorder
      const mediaRecorder = new MediaRecorder(combinedStream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Enregistrer les données vidéo
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Quand l'enregistrement est terminé
      mediaRecorder.onstop = () => {
        if (!isMounted.current) {
          audioStream.getTracks().forEach(track => track.stop());
          return;
        }

        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);

        // Arrêter les pistes audio
        audioStream.getTracks().forEach(track => track.stop());

        // Arrêter la caméra
        stopCamera();

        // Définir la vidéo et désactiver l'enregistrement
        if (isMounted.current) {
          setPhoto(videoUrl);
          setIsRecording(false);
        }
      };

      // Démarrer l'enregistrement
      mediaRecorder.start();

      if (isMounted.current) {
        setIsRecording(true);
        setRecordingTime(0);
      }

      // Démarrer le chronomètre
      timerRef.current = setInterval(() => {
        if (isMounted.current) {
          setRecordingTime(prev => {
            // Si on atteint 10 secondes, on arrête l'enregistrement
            if (prev >= 10) {
              stopVideoRecording();
              return 10;
            }
            return prev + 1;
          });
        }
      }, 1000);

    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
    }
  };

  // Fonction pour arrêter l'enregistrement vidéo
  const stopVideoRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Nettoyer le timer si le composant est démonté
  useEffect(() => {
    return () => {
      isMounted.current = false;

      // Nettoyer le timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Arrêter l'enregistrement vidéo si en cours
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      // Arrêter la caméra et libérer les ressources
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          if (track.readyState === 'live') {
            track.stop();
          }
        });
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // Fonction pour annuler/supprimer la photo ou vidéo et revenir à la caméra
  const cancelMedia = () => {
    if (!isMounted.current) return;

    setPhoto(null);
    if (isRecording) {
      stopVideoRecording();
    }
    // Réactiver la caméra
    restartCamera();
  };

  // Fonction pour basculer le flash (à implémenter selon les capacités du navigateur)
  const toggleFlash = () => {
    if (!isMounted.current) return;
    setUseFlash(prev => !prev);
    // Note: L'implémentation réelle du flash dépend des capacités du navigateur
    // et peut nécessiter l'utilisation d'une API spécifique ou d'un plugin Capacitor
  };

  // Gérer la sélection/désélection d'un ami
  const toggleFriendSelection = (friendId: string) => {
    if (!isMounted.current) return;

    setSelectedFriends(prev => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  // Envoyer le média aux amis sélectionnés
  const sendToSelectedFriends = () => {
    if (!isMounted.current) return;

    if (selectedFriends.length === 0) {
      setToastMessage("Veuillez sélectionner au moins un ami");
      setShowToast(true);
      return;
    }

    // Simuler l'envoi
    setIsLoading(true);

    setTimeout(() => {
      if (!isMounted.current) return;

      // Réinitialiser tout après l'envoi
      setIsLoading(false);
      setShowFriendsList(false);
      setSelectedFriends([]);
      setPhoto(null);

      // Redémarrer la caméra
      restartCamera();

      // Afficher un message de confirmation
      const friendCount = selectedFriends.length;
      setToastMessage(`Envoyé à ${friendCount} ami${friendCount > 1 ? 's' : ''}!`);
      setShowToast(true);
    }, 1500);
  };

  // Annuler la sélection et revenir à la prévisualisation
  const cancelFriendSelection = () => {
    if (!isMounted.current) return;

    setShowFriendsList(false);
    setSelectedFriends([]);
  };

  // Fonction pour envoyer la photo ou vidéo
  const sendMedia = () => {
    if (!isMounted.current) return;

    // Afficher les options d'envoi
    presentActionSheet({
      header: 'Envoyer à',
      buttons: [
        {
          text: 'Envoyer à des amis',
          icon: send,
          handler: () => {
            // Afficher la page de sélection d'amis
            if (isMounted.current) {
              setShowFriendsList(true);
            }
          }
        },
        {
          text: 'Publier dans Story',
          icon: image,
          handler: () => {
            console.log('Publier dans Story');
            // Simuler l'envoi à la story
            if (isMounted.current) {
              setIsLoading(true);
            }

            setTimeout(() => {
              if (!isMounted.current) return;

              setIsLoading(false);
              setPhoto(null);
              restartCamera();
              // Afficher un toast de confirmation
              setToastMessage("Ajouté à votre story!");
              setShowToast(true);
            }, 1500);
          }
        },
        {
          text: 'Annuler',
          icon: close,
          role: 'cancel'
        }
      ]
    });
  };

  return (
    <IonPage>
      <IonContent fullscreen className="camera-content">
        {!cameraPermission && !isLoading && !photo && !showFriendsList && (
          <div className="permission-container">
            <h2>Autorisation requise</h2>
            <p>Snapshoot a besoin d'accéder à votre caméra</p>
            <IonButton expand="block" onClick={initializeCamera}>
              Autoriser la caméra
            </IonButton>
          </div>
        )}

        {isLoading && (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Chargement en cours...</p>
          </div>
        )}

        {/* Affichage du flux vidéo de la caméra */}
        <div className={`camera-view-container ${cameraActive ? 'active' : ''}`}>
          <video
            ref={videoRef}
            className="camera-view"
            autoPlay
            playsInline
            style={{
              transform: cameraDirection === CameraDirection.Front ? 'scaleX(-1)' : 'none'
            }}
          />

          {/* Overlay pour le message de bienvenue (bref) */}
          {currentUser && cameraActive && (
            <div className="welcome-overlay">
              <h2>Bonjour {currentUser.username}</h2>
            </div>
          )}
        </div>

        {/* Affichage de la photo ou vidéo capturée */}
        {photo && !showFriendsList && (
          <div className="media-preview">
            {photo.startsWith('data:image') ? (
              <img src={photo} alt="Capture" />
            ) : (
              <video src={photo} controls autoPlay />
            )}
          </div>
        )}

        {/* Affichage du chronomètre d'enregistrement */}
        {isRecording && (
          <div className="recording-timer">
            {recordingTime}s / 10s
          </div>
        )}

        {/* Contrôles de caméra */}
        {cameraActive && !photo && !isRecording && !showFriendsList && (
          <div className="camera-controls">
            <div className="control-button flash" onClick={toggleFlash}>
              <IonIcon
                icon={flashOutline}
                color={useFlash ? "warning" : "light"}
              />
            </div>

            <div className="capture-buttons">
              <IonButton
                className="camera-button"
                onClick={takePhoto}
                disabled={isLoading}
              >
                <IonIcon icon={camera} />
              </IonButton>

              <IonButton
                className="video-button"
                onClick={startVideoRecording}
                disabled={isLoading}
              >
                <IonIcon icon={videocam} />
              </IonButton>
            </div>

            <div className="control-button switch-camera" onClick={toggleCameraDirection}>
              <IonIcon icon={refreshOutline} />
            </div>
          </div>
        )}

        {/* Contrôles pendant l'enregistrement */}
        {isRecording && (
          <div className="recording-actions">
            <IonButton color="danger" onClick={stopVideoRecording}>
              <IonIcon icon={stopCircle} />
            </IonButton>
          </div>
        )}

        {/* Contrôles après capture */}
        {photo && !isRecording && !showFriendsList && (
          <div className="media-actions">
            <IonButton color="medium" onClick={cancelMedia}>
              <IonIcon icon={close} />
            </IonButton>
            <IonButton color="primary" onClick={sendMedia}>
              <IonIcon icon={send} />
            </IonButton>
          </div>
        )}

        {/* Interface de sélection d'amis */}
        {showFriendsList && (
          <div className={`friends-selection-container ${selectedFriends.length > 0 ? 'selection-mode' : ''}`}>
            <div className="friends-header">
              <h2>{selectedFriends.length > 0 ? 'Sélectionner des amis' : 'Envoyer à'}</h2>
              <div className="selected-count">
                {selectedFriends.length > 0 && (
                  <>
                    {selectedFriends.length} sélectionné{selectedFriends.length > 1 ? 's' : ''}
                  </>
                )}
              </div>
            </div>

            {/* Message d'instruction */}
            {selectedFriends.length === 0 && (
              <div className="instruction-message">
                <p>Appuyez sur un contact pour le sélectionner</p>
              </div>
            )}

            <div className="friends-list">
              {dummyFriends.map(friend => (
                <div
                  key={friend.id}
                  className={`friend-item ${selectedFriends.includes(friend.id) ? 'selected' : ''}`}
                  onClick={() => toggleFriendSelection(friend.id)}
                >
                  <div className={`friend-avatar ${selectedFriends.includes(friend.id) ? 'selected-avatar' : ''}`}>
                    <div className="avatar-placeholder">
                      {friend.name.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="friend-name">{friend.name}</div>

                  {/* Indicateur de sélection à droite */}
                  {selectedFriends.includes(friend.id) && (
                    <div className="selection-badge">
                      <IonIcon icon={checkmarkCircle} color="primary" size="large" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Boutons d'action en bas */}
            <div className="friends-actions">
              <IonButton color="medium" onClick={cancelFriendSelection}>
                Annuler
              </IonButton>
            </div>

            {/* Bouton d'envoi flottant */}
            {selectedFriends.length > 0 && (
              <IonFab vertical="bottom" horizontal="center" slot="fixed" className="send-fab">
                <IonFabButton
                  onClick={sendToSelectedFriends}
                  color="primary"
                >
                  <IonIcon icon={send} />
                </IonFabButton>
              </IonFab>
            )}
          </div>
        )}
      </IonContent>

      {/* Toast pour les messages */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="top"
        color="dark"
        className="custom-toast"
      />
    </IonPage>
  );
};

export default CameraPage;