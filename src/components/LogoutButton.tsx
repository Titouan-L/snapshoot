import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import { useAuth } from '../hooks/useAuth';

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();

  return (
    <IonButton onClick={logout} fill="clear">
      <IonIcon slot="icon-only" icon={logOutOutline} />
    </IonButton>
  );
};

export default LogoutButton;