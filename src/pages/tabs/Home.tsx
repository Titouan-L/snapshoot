import { useState, useEffect } from "react";
import { Message, getMessages } from "../../data/messages";
import {
    IonContent,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    IonList,
    IonButton,
    IonIcon,
    IonToast,
    IonSpinner,
    isPlatform,
    IonFooter,
    IonFab,
    IonFabButton,
    IonText,
    IonRow,
    IonCol,
    IonGrid,
    IonItem,
    useIonViewWillEnter,
    getPlatforms,
} from "@ionic/react";
import { useAuth } from "../../hooks/useAuth";
import { camera, images, flashOutline } from "ionicons/icons";
import MessageListItem from "../../components/MessageListItem";
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import "./Home.css";

const Home: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [cameraPermission, setCameraPermission] = useState<boolean>(false);
    const [showCameraPreview, setShowCameraPreview] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showToast, setShowToast] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>("");
    const { currentUser } = useAuth();

    useIonViewWillEnter(() => {
        const msgs = getMessages();
        setMessages(msgs);
        checkCameraPermission();
    });

    const checkCameraPermission = async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                const permission = await Camera.checkPermissions();
                setCameraPermission(permission.camera === "granted");

                if (permission.camera === "granted") {
                    setShowCameraPreview(true);
                }
            } catch (error) {
                console.error(
                    "Erreur lors de la vérification des permissions de caméra:",
                    error
                );
                setToastMessage(
                    "Impossible de vérifier les permissions de caméra"
                );
                setShowToast(true);
            }
        }
    };

    const requestCameraPermission = async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                setIsLoading(true);
                const permission = await Camera.requestPermissions();
                setCameraPermission(permission.camera === "granted");

                if (permission.camera === "granted") {
                    setShowCameraPreview(true);
                } else {
                    setToastMessage("Permission de caméra refusée");
                    setShowToast(true);
                }
            } catch (error) {
                console.error(
                    "Erreur lors de la demande de permission de caméra:",
                    error
                );
                setToastMessage("Erreur lors de la demande de permission");
                setShowToast(true);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const takePicture = async () => {
        if (!Capacitor.isNativePlatform()) {
            setToastMessage(
                "Cette fonctionnalité nécessite un appareil mobile"
            );
            setShowToast(true);
            return;
        }

        try {
            setIsLoading(true);
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Uri,
                source: CameraSource.Camera,
            });

            // Traitement de l'image (à implémenter selon vos besoins)
            console.log("Image capturée:", image.webPath);

            // Afficher une confirmation
            setToastMessage("Image capturée avec succès!");
            setShowToast(true);
        } catch (error) {
            console.error("Erreur lors de la capture de la photo:", error);
            setToastMessage("Erreur lors de la capture de la photo");
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    const refresh = (e: CustomEvent) => {
        setTimeout(() => {
            e.detail.complete();
        }, 1000);
    };

    return (
        <IonPage className="home-page">
            {/* Pas de IonHeader ici comme demandé */}

            <IonContent
                fullscreen
                className={showCameraPreview ? "camera-preview" : ""}
            >
                <IonRefresher slot="fixed" onIonRefresh={refresh}>
                    <IonRefresherContent></IonRefresherContent>
                </IonRefresher>

                {/* Container principal avec Safe Area */}
                <div className="safe-area-container">
                    {/* Message de bienvenue */}
                    {currentUser && (
                        <div className="welcome-container">
                            <h2>
                                Bienvenue {currentUser.username} sur Snapshoot
                            </h2>
                        </div>
                    )}

                    {/* Demande de permission caméra si nécessaire */}
                    {!cameraPermission && !showCameraPreview && (
                        <div className="camera-permission-container">
                            <IonText color="light">
                                <h3>Accès à la caméra nécessaire</h3>
                                <p>
                                    Pour profiter pleinement de Snapshoot,
                                    veuillez autoriser l'accès à votre caméra.
                                </p>
                            </IonText>
                            <IonButton
                                expand="block"
                                className="permission-button"
                                onClick={requestCameraPermission}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <IonSpinner name="crescent" />
                                ) : (
                                    "Autoriser la caméra"
                                )}
                            </IonButton>
                        </div>
                    )}

                    {/* Affichage des messages */}
                    <IonList className="message-list">
                        {messages.map((m) => (
                            <MessageListItem key={m.id} message={m} />
                        ))}
                    </IonList>
                </div>

                {/* Bouton de capture photo */}
                {cameraPermission && (
                    <IonFab vertical="bottom" horizontal="center" slot="fixed">
                        <IonFabButton
                            onClick={takePicture}
                            className="capture-button"
                        >
                            <IonIcon icon={camera} />
                        </IonFabButton>
                    </IonFab>
                )}

                {/* Boutons de contrôle de caméra */}
                {showCameraPreview && (
                    <div className="camera-controls">
                        <IonGrid>
                            <IonRow>
                                <IonCol size="4">
                                    <IonButton
                                        fill="clear"
                                        className="control-button"
                                    >
                                        <IonIcon
                                            slot="icon-only"
                                            icon={images}
                                        />
                                    </IonButton>
                                </IonCol>
                                <IonCol size="4">
                                    {/* Bouton de capture principal est en FAB */}
                                </IonCol>
                                <IonCol size="4">
                                    <IonRow>
                                        <IonCol size="6">
                                            <IonButton
                                                fill="clear"
                                                className="control-button"
                                            >
                                                <IonIcon
                                                    slot="icon-only"
                                                    icon={flashOutline}
                                                />
                                            </IonButton>
                                        </IonCol>
                                        <IonCol size="6">
                                            <IonButton
                                                fill="clear"
                                                className="control-button"
                                            >
                                                <IonIcon
                                                    slot="icon-only"
                                                    icon={camera}
                                                />
                                            </IonButton>
                                        </IonCol>
                                    </IonRow>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </div>
                )}
            </IonContent>

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

export default Home;
