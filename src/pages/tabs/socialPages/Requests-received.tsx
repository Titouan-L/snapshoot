import React, { useState, useEffect } from "react";
import {
    IonList,
    IonCard,
    IonCardContent,
    IonAvatar,
    IonLabel,
    IonButton,
    IonButtons,
    IonIcon,
    IonToast,
} from "@ionic/react";
import { Preferences } from "@capacitor/preferences";
import { checkmarkOutline, closeOutline } from "ionicons/icons";

// Interface for the sender's user details within the request
interface SenderUser {
    id: string;
    username: string;
    profilePicture: string;
}

// Interface for a single received friend request object
// This will now be the type stored in the `receivedRequests` state
interface ReceivedFriendRequest {
    id: string; // This is the ID of the friend request itself
    receivedAt: string;
    sender: SenderUser;
    friend: boolean;
    status: string | null;
}

const RequestsReceived: React.FC = () => {
    // Store the full ReceivedFriendRequest objects
    const [receivedRequests, setReceivedRequests] = useState<
        ReceivedFriendRequest[]
    >([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    async function getAuthToken(): Promise<string> {
        try {
            const { value } = await Preferences.get({ key: "authToken" });
            return value || "";
        } catch (error) {
            console.error("Error retrieving auth token:", error);
            return "";
        }
    }

    const loadReceivedRequests = async () => {
        try {
            const token = await getAuthToken();
            if (!token) {
                setToastMessage("Authentication token not found.");
                setShowToast(true);
                return;
            }

            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${token}`);

            const requestOptions: RequestInit = {
                method: "GET",
                headers: myHeaders,
                redirect: "follow",
            };

            const response = await fetch(
                "http://localhost/api/private/users/friends/requests/received",
                requestOptions
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API error response text:", errorText);
                throw new Error(
                    `HTTP error: ${response.status} - ${errorText}`
                );
            }

            const resultText = await response.text();
            let apiResponse: {
                receivedFriendsRequests: ReceivedFriendRequest[];
            };
            try {
                apiResponse = JSON.parse(resultText);
            } catch (parseError) {
                console.error(
                    "Error parsing API response as JSON:",
                    parseError
                );
                setToastMessage("Failed to parse API response.");
                setShowToast(true);
                setReceivedRequests([]);
                return;
            }

            const friendRequestsArray = apiResponse.receivedFriendsRequests;

            if (Array.isArray(friendRequestsArray)) {
                // Set the state with the full friend request objects
                setReceivedRequests(friendRequestsArray);
            } else {
                console.warn(
                    "API response 'receivedFriendsRequests' is not an array. Setting to empty:",
                    friendRequestsArray
                );
                setReceivedRequests([]);
            }
        } catch (error: any) {
            console.error("Error loading received friend requests:", error);
            setToastMessage(`Failed to load requests: ${error.message}`);
            setShowToast(true);
            setReceivedRequests([]);
        }
    };

    // --- Corrected API Calls ---

    const acceptFriendRequest = async (requestId: string, username: string) => {
        try {
            const token = await getAuthToken();
            if (!token) {
                setToastMessage("Authentication token not found.");
                setShowToast(true);
                return;
            }

            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${token}`);
            // No Content-Type needed for a PUT request with no body

            const requestOptions: RequestInit = {
                method: "PUT", // Corrected method
                headers: myHeaders,
                redirect: "follow",
            };

            const response = await fetch(
                `http://localhost/api/private/users/friends/requests/${requestId}/accept`, // Corrected URL
                requestOptions
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `HTTP error: ${response.status} - ${errorText}`
                );
            }

            setToastMessage(`Friend request from ${username} accepted.`);
            setShowToast(true);
            loadReceivedRequests(); // Reload list after action
        } catch (error: any) {
            console.error("Error accepting friend request:", error);
            setToastMessage(`Failed to accept request: ${error.message}`);
            setShowToast(true);
        }
    };

    const declineFriendRequest = async (
        requestId: string,
        username: string
    ) => {
        try {
            const token = await getAuthToken();
            if (!token) {
                setToastMessage("Authentication token not found.");
                setShowToast(true);
                return;
            }

            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${token}`);

            const requestOptions: RequestInit = {
                method: "PUT", // Corrected method
                headers: myHeaders,
                redirect: "follow",
            };

            const response = await fetch(
                `http://localhost/api/private/users/friends/requests/${requestId}/reject`, // Corrected URL
                requestOptions
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `HTTP error: ${response.status} - ${errorText}`
                );
            }

            setToastMessage(`Friend request from ${username} declined.`);
            setShowToast(true);
            loadReceivedRequests(); // Reload list after action
        } catch (error: any) {
            console.error("Error declining friend request:", error);
            setToastMessage(`Failed to decline request: ${error.message}`);
            setShowToast(true);
        }
    };
    // --- End of Corrected API Calls ---

    useEffect(() => {
        loadReceivedRequests();
    }, []);

    return (
        <>
            <IonList>
                {receivedRequests.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        No friend requests received.
                    </div>
                ) : (
                    receivedRequests.map((request) => (
                        <IonCard key={request.id} className="received-card">
                            <IonCardContent
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <IonAvatar>
                                    <img
                                        src={
                                            request.sender.profilePicture ||
                                            "https://ui-avatars.com/api/?name=" +
                                                request.sender.username
                                        }
                                        alt={request.sender.username}
                                    />
                                </IonAvatar>
                                <IonLabel style={{ flex: 1, marginLeft: 16 }}>
                                    {request.sender.username}
                                </IonLabel>
                                <IonButtons>
                                    <IonButton
                                        color="danger"
                                        size="small"
                                        fill="outline"
                                        onClick={() =>
                                            declineFriendRequest(
                                                request.id,
                                                request.sender.username
                                            )
                                        }
                                    >
                                        <IonIcon
                                            icon={closeOutline}
                                            slot="icon-only"
                                        />
                                    </IonButton>
                                    <IonButton
                                        color="success"
                                        size="small"
                                        fill="outline"
                                        onClick={() =>
                                            acceptFriendRequest(
                                                request.id,
                                                request.sender.username
                                            )
                                        }
                                    >
                                        <IonIcon
                                            icon={checkmarkOutline}
                                            slot="icon-only"
                                        />
                                    </IonButton>
                                </IonButtons>
                            </IonCardContent>
                        </IonCard>
                    ))
                )}
            </IonList>

            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={toastMessage}
                duration={3000}
                color="dark"
            />
        </>
    );
};

export default RequestsReceived;
