import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/react';
import { Route, Redirect } from 'react-router';
import { camera, mail } from 'ionicons/icons';
import CameraPage from '../pages/CameraPage';
import Home from '../pages/Home';
import ViewMessage from '../pages/ViewMessage';
import './TabsContainer.css';

const TabsContainer: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/tabs/camera">
          <CameraPage />
        </Route>
        <Route exact path="/tabs/messages">
          <Home />
        </Route>
        <Route path="/tabs/messages/:id">
          <ViewMessage />
        </Route>
        <Route exact path="/tabs">
          <Redirect to="/tabs/camera" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom" className="main-tab-bar">
        <IonTabButton tab="camera" href="/tabs/camera">
          <IonIcon icon={camera} />
          <IonLabel>Appareil photo</IonLabel>
        </IonTabButton>
        <IonTabButton tab="messages" href="/tabs/messages">
          <IonIcon icon={mail} />
          <IonLabel>Messages</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default TabsContainer;