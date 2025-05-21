// pages/TabsRoot.tsx
import React, { lazy, Suspense } from "react";
import {
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    IonSpinner,
} from "@ionic/react";
import { Route, Redirect } from "react-router-dom";
import { camera, mail, person } from "ionicons/icons";

// Lazy loading des pages de tabs
const CameraPage = lazy(() => import("./tabs/CameraPage"));
const SocialPage = lazy(() => import("./tabs/SocialPage"));
const ProfilePage = lazy(() => import("./tabs/ProfilePage"));
const GroupConversation = lazy(
    () => import("./tabs/socialPages/GroupConversation")
);
const PrivateConversation = lazy(
    () => import("./tabs/socialPages/PrivateConversation")
);

const LoadingSpinner = () => (
    <div
        style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
        }}
    >
        <IonSpinner name="crescent" />
    </div>
);

const TabsRoot: React.FC = () => {
    return (
        <IonTabs>
            <IonRouterOutlet>
                <Suspense fallback={<LoadingSpinner />}>
                    {/* Redirection pour /tabs */}
                    <Route exact path="/tabs">
                        <Redirect to="/tabs/camera" />
                    </Route>

                    {/* Pages principales */}
                    <Route exact path="/tabs/camera">
                        <CameraPage />
                    </Route>

                    <Route exact path="/tabs/social">
                        <SocialPage />
                    </Route>

                    <Route exact path="/tabs/profile">
                        <ProfilePage />
                    </Route>

                    {/* Pages de conversation */}
                    <Route exact path="/tabs/social/group/:id">
                        <GroupConversation />
                    </Route>

                    <Route exact path="/tabs/social/private/:id">
                        <PrivateConversation />
                    </Route>
                </Suspense>
            </IonRouterOutlet>

            <IonTabBar slot="bottom">
                <IonTabButton tab="camera" href="/tabs/camera">
                    <IonIcon icon={camera} />
                    <IonLabel>Caméra</IonLabel>
                </IonTabButton>
                <IonTabButton tab="social" href="/tabs/social">
                    <IonIcon icon={mail} />
                    <IonLabel>Social</IonLabel>
                </IonTabButton>
                <IonTabButton tab="profile" href="/tabs/profile">
                    <IonIcon icon={person} />
                    <IonLabel>Profil</IonLabel>
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    );
};

export default TabsRoot;
