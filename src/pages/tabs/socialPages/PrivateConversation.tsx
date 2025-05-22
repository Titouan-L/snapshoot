import React, { useState, useEffect, useRef } from "react";
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
    IonButtons,
    IonBackButton,
    useIonViewWillEnter,
    IonAvatar,
    IonIcon,
    IonFooter,
    IonToast,
} from "@ionic/react";
import { useParams, useLocation } from "react-router-dom";
import { Preferences } from "@capacitor/preferences";
import { send } from "ionicons/icons";
import "./Conversations.css";

interface RouteParams {
    friendId: string;
}

interface LocationState {
    friendId: string;
    friendUsername: string;
}

interface Message {
    id: string;
    content: string;
    mediaUrl: string | null;
    receiver: {
        id: string;
        username: string;
        profilePicture: string;
        status: string;
    };
    sender: {
        id: string;
        username: string;
        profilePicture: string;
        status: string;
    };
    sentAt: string;
    status: string;
}

const PrivateConversation: React.FC = () => {
    const { friendId: paramFriendId } = useParams<RouteParams>();
    const location = useLocation<LocationState>();

    const actualFriendId = paramFriendId || location.state?.friendId;

    const contentRef = useRef<HTMLIonContentElement>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [friendUsername, setFriendUsername] = useState("");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    async function getAuthToken(): Promise<string> {
        try {
            const { value } = await Preferences.get({ key: "authToken" });
            return value || "";
        } catch (error) {
            console.error("Erreur lors de la récupération du token:", error);
            return "";
        }
    }

    async function getCurrentUserId(): Promise<string | null> {
        try {
            const token = await getAuthToken();
            if (!token) return null;

            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${token}`);

            const requestOptions = {
                method: "GET",
                headers: myHeaders,
                redirect: "follow" as RequestRedirect,
            };

            const response = await fetch(
                "http://localhost/api/private/user/me",
                requestOptions
            );
            if (!response.ok) {
                console.error(
                    `Erreur lors de la récupération de l'utilisateur actuel: ${response.status}`
                );
                return null;
            }
            const result = await response.json();
            return result.id || null;
        } catch (error) {
            console.error(
                "Erreur lors de la récupération de l'ID utilisateur:",
                error
            );
            return null;
        }
    }

    const loadMessages = async (targetFriendId: string) => {
        if (!targetFriendId) {
            console.warn(
                "loadMessages: L'ID de l'ami est manquant, impossible de charger les messages."
            );
            setToastMessage("Erreur: ID de conversation non trouvé.");
            setShowToast(true);
            return;
        }

        console.log(
            `Chargement des messages pour l'ami avec l'ID: ${targetFriendId}`
        );
        try {
            const token = await getAuthToken();
            const myId = await getCurrentUserId();
            setCurrentUserId(myId);

            if (!token) {
                setToastMessage("Token d'authentification non trouvé.");
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

            const response = await fetch(
                `http://localhost/api/private/messages/private/${targetFriendId}`,
                requestOptions
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Erreur HTTP: ${response.status} - ${errorText}`
                );
            }

            const data = await response.json();

            // *** MODIFICATION ICI : Accéder à data.messages ***
            if (data && Array.isArray(data.messages)) {
                setMessages(data.messages);
                if (!friendUsername && data.messages.length > 0) {
                    const firstMessage = data.messages[0];
                    if (firstMessage.sender.id === myId) {
                        setFriendUsername(firstMessage.receiver.username);
                    } else {
                        setFriendUsername(firstMessage.sender.username);
                    }
                }
            } else if (Array.isArray(data)) {
                // Fallback au cas où l'API changerait ou renverrait un tableau direct
                setMessages(data);
                if (!friendUsername && data.length > 0) {
                    const firstMessage = data[0];
                    if (firstMessage.sender.id === myId) {
                        setFriendUsername(firstMessage.receiver.username);
                    } else {
                        setFriendUsername(firstMessage.sender.username);
                    }
                }
            } else {
                console.warn(
                    "API response for messages is not in the expected format.",
                    data
                );
                setMessages([]);
            }
        } catch (error: any) {
            console.error("Erreur lors du chargement des messages:", error);
            setToastMessage(
                `Échec du chargement des messages: ${error.message}`
            );
            setShowToast(true);
            setMessages([]);
        }
    };

    const sendPrivateMessage = async () => {
        if (newMessage.trim() === "") {
            setToastMessage("Veuillez saisir un message.");
            setShowToast(true);
            return;
        }

        if (!actualFriendId) {
            console.error(
                "Friend ID (recipient) not found. Cannot send message."
            );
            setToastMessage("ID de l'ami introuvable. Impossible d'envoyer.");
            setShowToast(true);
            return;
        }

        try {
            const token = await getAuthToken();
            if (!token) {
                setToastMessage("Token d'authentification non trouvé.");
                setShowToast(true);
                return;
            }

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("Authorization", `Bearer ${token}`);

            const raw = JSON.stringify({
                content: newMessage,
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow" as RequestRedirect,
            };

            const response = await fetch(
                `http://localhost/api/private/messages/private/${actualFriendId}`,
                requestOptions
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Erreur HTTP: ${response.status} - ${errorText}`
                );
            }

            setToastMessage("Message envoyé avec succès !");
            setShowToast(true);

            await loadMessages(actualFriendId);
            setNewMessage("");
        } catch (error: any) {
            console.error("Erreur lors de l'envoi du message:", error);
            setToastMessage(`Échec de l'envoi: ${error.message}`);
            setShowToast(true);
        }
    };

    useEffect(() => {
        const fetchCurrentUserId = async () => {
            const id = await getCurrentUserId();
            setCurrentUserId(id);
        };
        fetchCurrentUserId();
    }, []);

    useIonViewWillEnter(() => {
        if (location.state?.friendUsername) {
            setFriendUsername(location.state.friendUsername);
        }
        if (actualFriendId) {
            loadMessages(actualFriendId);
        } else {
            console.warn(
                "useIonViewWillEnter: ID de l'ami est indéfini ou null."
            );
            setToastMessage("Erreur: ID de conversation non trouvé.");
            setShowToast(true);
        }
    });

    useEffect(() => {
        if (location.state?.friendUsername) {
            setFriendUsername(location.state.friendUsername);
        }
    }, [location.state?.friendUsername]);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollToBottom(300);
        }
    }, [messages]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/tabs/social" />
                    </IonButtons>
                    <IonTitle>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <IonAvatar
                                style={{
                                    width: "30px",
                                    height: "30px",
                                    marginRight: "10px",
                                }}
                            >
                                <img
                                    src={
                                        friendUsername
                                            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                  friendUsername
                                              )}`
                                            : "https://ui-avatars.com/api/?name=User"
                                    }
                                    alt={friendUsername || "Friend"}
                                />
                            </IonAvatar>
                            <IonLabel>
                                {friendUsername ||
                                    `Conversation ${actualFriendId}`}
                            </IonLabel>
                        </div>
                    </IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen ref={contentRef}>
                <IonList lines="none" className="message-list">
                    {messages.map((msg) => (
                        <IonItem
                            key={msg.id}
                            className={
                                msg.sender.id === currentUserId
                                    ? "message-sent"
                                    : "message-received"
                            }
                        >
                            <IonAvatar
                                slot={
                                    msg.sender.id === currentUserId
                                        ? "end"
                                        : "start"
                                }
                                className={
                                    msg.sender.id === currentUserId
                                        ? "hidden-avatar"
                                        : "visible-avatar"
                                }
                            >
                                <img
                                    src={
                                        msg.sender.profilePicture ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            msg.sender.username
                                        )}`
                                    }
                                    alt={msg.sender.username}
                                />
                            </IonAvatar>

                            <IonLabel className="message-bubble">
                                <p className="message-text">{msg.content}</p>
                                <span className="message-time">
                                    {new Date(msg.sentAt).toLocaleTimeString(
                                        [],
                                        {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )}
                                </span>
                            </IonLabel>
                        </IonItem>
                    ))}
                </IonList>

                <div style={{ height: "70px" }}></div>
            </IonContent>

            <IonFooter>
                <IonToolbar>
                    <IonItem
                        lines="none"
                        style={{ width: "100%", padding: "0 10px" }}
                    >
                        <IonInput
                            placeholder="Écrire un message..."
                            className="message-input"
                            value={newMessage}
                            onIonChange={(e) =>
                                setNewMessage(e.detail.value || "")
                            }
                            onKeyDown={(e) =>
                                e.key === "Enter" && sendPrivateMessage()
                            }
                            rows={1}
                            autoGrow={true}
                            style={{
                                "--padding-start": "0",
                                "--padding-end": "0",
                            }}
                        />
                        <IonButton
                            slot="end"
                            fill="clear"
                            className="send-button"
                            onClick={sendPrivateMessage}
                            disabled={!newMessage.trim()}
                        >
                            <IonIcon icon={send} slot="icon-only" />
                        </IonButton>
                    </IonItem>
                </IonToolbar>
            </IonFooter>

            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={toastMessage}
                duration={3000}
                color="dark"
            />
        </IonPage>
    );
};

export default PrivateConversation;
