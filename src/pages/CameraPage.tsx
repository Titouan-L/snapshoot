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
  useIonActionSheet
} from '@ionic/react';
import { camera, videocam, image, send, close, stopCircle, sync } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useAuth } from '../hooks/useAuth';
import LogoutButton from '../components/LogoutButton';
import './CameraPage.css';

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

  // Fonction pour prendre une photo avec l'appareil photo
  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      setPhoto(image.dataUrl || null);
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
    }
  };

  // Fonction pour démarrer l'enregistrement vidéo
  const startVideoRecording = async () => {
    try {
      // Demande l'accès à la caméra et au micro
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      // Affiche le flux vidéo dans l'élément vidéo
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Initialiser le MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Enregistre les données vidéo
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Quand l'enregistrement est terminé
      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        setPhoto(videoUrl);

        // Arrête tous les tracks du stream
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      };

      // Démarre l'enregistrement
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Démarrer le chronomètre
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          // Si on atteint 10 secondes, on arrête l'enregistrement
          if (prev >= 10) {
            stopVideoRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Erreur lors de l\'accès à la caméra:', error);
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
      setIsRecording(false);
    }
  };

  // Nettoyer le timer si le composant est démonté
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Arrêter l'enregistrement vidéo si en cours
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Fonction pour annuler/supprimer la photo ou vidéo
  const cancelMedia = () => {
    setPhoto(null);
    if (isRecording) {
      stopVideoRecording();
    }
  };

  // Fonction pour envoyer la photo ou vidéo
  const sendMedia = () => {
    // Afficher les options d'envoi
    presentActionSheet({
      header: 'Envoyer à',
      buttons: [
        {
          text: 'Envoyer à des amis',
          icon: send,
          handler: () => {
            console.log('Envoyer à des amis');
            // Ici, vous pourriez naviguer vers une page de sélection d'amis
            // ou ouvrir un modal pour sélectionner des destinataires
          }
        },
        {
          text: 'Publier dans Story',
          icon: image,
          handler: () => {
            console.log('Publier dans Story');
            // Ici, vous pourriez implémenter la logique pour publier dans la Story
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
      <IonHeader>
        <IonToolbar>
          <IonTitle>Snapshoot</IonTitle>
          <IonButtons slot="end">
            <LogoutButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="camera-content">
        {currentUser && !photo && !isRecording && (
          <div className="welcome-container">
            <h2>Bonjour {currentUser.username}</h2>
            <p>Prenez une photo ou enregistrez une vidéo!</p>
          </div>
        )}

        {isRecording && (
          <div className="recording-container">
            <video ref={videoRef} className="video-preview" autoPlay muted />
            <div className="recording-timer">
              {recordingTime}s / 10s
            </div>
          </div>
        )}

        {photo && !isRecording && (
          <div className="media-preview">
            {photo.startsWith('data:image') ? (
              <img src={photo} alt="Capture" />
            ) : (
              <video src={photo} controls autoPlay />
            )}
          </div>
        )}

        {!photo && !isRecording && (
          <div className="camera-actions">
            <IonButton className="camera-button" onClick={takePhoto}>
              <IonIcon icon={camera} />
            </IonButton>
            <IonButton className="video-button" onClick={startVideoRecording}>
              <IonIcon icon={videocam} />
            </IonButton>
          </div>
        )}

        {isRecording && (
          <div className="recording-actions">
            <IonButton color="danger" onClick={stopVideoRecording}>
              <IonIcon icon={stopCircle} />
            </IonButton>
          </div>
        )}

        {photo && !isRecording && (
          <div className="media-actions">
            <IonButton color="danger" onClick={cancelMedia}>
              <IonIcon icon={close} />
            </IonButton>
            <IonButton color="primary" onClick={sendMedia}>
              <IonIcon icon={send} />
            </IonButton>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default CameraPage;