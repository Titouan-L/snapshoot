// App.tsx
import React, { lazy, Suspense } from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact, IonSpinner } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import PrivateRoute from './components/PrivateRoute';

// Lazy loading des pages
const Login = lazy(() => import('./pages/Login'));
const TabsRoot = lazy(() => import('./pages/TabsRoot'));

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact({
  mode: 'ios', // Pour une interface cohérente sur iOS et Android
  swipeBackEnabled: true
});

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100%' 
  }}>
    <IonSpinner name="crescent" />
  </div>
);

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <IonRouterOutlet>
            {/* Route publique */}
            <Route path="/login" exact>
              <Login />
            </Route>
            
            {/* Routes protégées - TabsRoot gère toutes les routes /tabs/* */}
            <PrivateRoute path="/tabs">
              <TabsRoot />
            </PrivateRoute>
            
            {/* Redirection par défaut */}
            <Route exact path="/">
              <Redirect to="/tabs" />
            </Route>
          </IonRouterOutlet>
        </Suspense>
      </AuthProvider>
    </IonReactRouter>
  </IonApp>
);

export default App;