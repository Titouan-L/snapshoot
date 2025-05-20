import {
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonRouterOutlet,
} from "@ionic/react";
import { Route, Redirect } from "react-router";
import { camera, mail, person } from "ionicons/icons";
import { lazy } from "react";
import "./TabsContainer.css";

const CameraPage = lazy(() => import("../pages/tabs/CameraPage"));
//const Home = lazy(() => import("../pages/tabs/Home"));
//const ViewMessage = lazy(() => import("../pages/tabs/ViewMessage"));
const ProfilePage = lazy(() => import("../pages/tabs/ProfilePage"));
const SocialPage = lazy(() => import("../pages/tabs/SocialPage"));

const TabsContainer: React.FC = () => {
    return (
        <IonTabs>
            <IonRouterOutlet>
                <Route path="/tabs/camera" component={CameraPage} exact />
                <Route path="/tabs/social" component={SocialPage} />
                <Route path="/tabs/profile" component={ProfilePage} exact />
                <Redirect exact from="/tabs" to="/tabs/camera" />
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
                <IonTabButton tab="camera" href="/tabs/camera">
                    <IonIcon icon={camera} />
                </IonTabButton>
                <IonTabButton tab="social" href="/tabs/social">
                    <IonIcon icon={mail} />
                </IonTabButton>
                <IonTabButton tab="profile" href="/tabs/profile">
                    <IonIcon icon={person} />
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    );
};

export default TabsContainer;
