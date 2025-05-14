import React, { useState } from 'react';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  useIonLoading,
  useIonAlert
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Login.css';

const Login: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [present, dismiss] = useIonLoading();
  const [presentAlert] = useIonAlert();
  const history = useHistory();
  const { login, register } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginEmailError, setLoginEmailError] = useState<string>('');
  const [loginPasswordError, setLoginPasswordError] = useState<string>('');

  // Register form state
  const [username, setUsername] = useState<string>('');
  const [registerEmail, setRegisterEmail] = useState<string>('');
  const [registerPassword, setRegisterPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string>('');
  const [registerEmailError, setRegisterEmailError] = useState<string>('');
  const [registerPasswordError, setRegisterPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');

  const toggleMode = (): void => {
    setIsLoginMode(!isLoginMode);
    // Reset form fields and errors when switching modes
    resetFormFields();
  };

  const resetFormFields = (): void => {
    // Reset login form
    setLoginEmail('');
    setLoginPassword('');
    setLoginEmailError('');
    setLoginPasswordError('');

    // Reset register form
    setUsername('');
    setRegisterEmail('');
    setRegisterPassword('');
    setConfirmPassword('');
    setUsernameError('');
    setRegisterEmailError('');
    setRegisterPasswordError('');
    setConfirmPasswordError('');
  };

  const validateLoginForm = (): boolean => {
    let isValid = true;

    // Validate email
    if (!loginEmail) {
      setLoginEmailError('Email requis');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(loginEmail)) {
      setLoginEmailError('Format d\'email invalide');
      isValid = false;
    } else {
      setLoginEmailError('');
    }

    // Validate password
    if (!loginPassword) {
      setLoginPasswordError('Mot de passe requis');
      isValid = false;
    } else if (loginPassword.length < 6) {
      setLoginPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      isValid = false;
    } else {
      setLoginPasswordError('');
    }

    return isValid;
  };

  const validateRegisterForm = (): boolean => {
    let isValid = true;

    // Validate username
    if (!username) {
      setUsernameError('Nom d\'utilisateur requis');
      isValid = false;
    } else {
      setUsernameError('');
    }

    // Validate email
    if (!registerEmail) {
      setRegisterEmailError('Email requis');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(registerEmail)) {
      setRegisterEmailError('Format d\'email invalide');
      isValid = false;
    } else {
      setRegisterEmailError('');
    }

    // Validate password
    if (!registerPassword) {
      setRegisterPasswordError('Mot de passe requis');
      isValid = false;
    } else if (registerPassword.length < 6) {
      setRegisterPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      isValid = false;
    } else {
      setRegisterPasswordError('');
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Confirmation du mot de passe requise');
      isValid = false;
    } else if (confirmPassword !== registerPassword) {
      setConfirmPasswordError('Les mots de passe ne correspondent pas');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async (): Promise<void> => {
    if (!validateLoginForm()) return;

    await present({ message: 'Connexion en cours...', spinner: 'circles' });

    try {
      // In a real app, this would be an actual API call
      await login(loginEmail, loginPassword);
      await dismiss();
      history.push('/tabs/camera'); // Redirection vers la page de caméra
    } catch (error) {
      await dismiss();
      presentAlert({
        header: 'Échec de connexion',
        message: 'Email ou mot de passe incorrect',
        buttons: ['OK']
      });
    }
  };

  const handleRegister = async (): Promise<void> => {
    if (!validateRegisterForm()) return;

    await present({ message: 'Création du compte...', spinner: 'circles' });

    try {
      // In a real app, this would be an actual API call
      await register(username, registerEmail, registerPassword);
      await dismiss();
      presentAlert({
        header: 'Inscription réussie',
        message: 'Votre compte a été créé avec succès!',
        buttons: ['OK']
      });
      setIsLoginMode(true); // Switch to login mode after successful registration
    } catch (error) {
      await dismiss();
      presentAlert({
        header: 'Échec d\'inscription',
        message: 'Un problème est survenu lors de la création de votre compte',
        buttons: ['OK']
      });
    }
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (isLoginMode) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <IonContent className="auth-form">
      <div className="logo-container">
        <img src="/assets/logo/snapshoot-logo.png" alt="Snapshoot" className="app-logo" />
        <h1>Snapshoot</h1>
      </div>

      <div className="form-container">
        {isLoginMode ? (
          // Login Form
          <form onSubmit={handleSubmit}>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Connexion</IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <IonItem>
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={loginEmail}
                    onIonChange={(e) => setLoginEmail(e.detail.value!)}
                  />
                </IonItem>
                {loginEmailError && (
                  <IonText color="danger">
                    <small>{loginEmailError}</small>
                  </IonText>
                )}

                <IonItem className="ion-margin-top">
                  <IonLabel position="floating">Mot de passe</IonLabel>
                  <IonInput
                    type="password"
                    value={loginPassword}
                    onIonChange={(e) => setLoginPassword(e.detail.value!)}
                  />
                </IonItem>
                {loginPasswordError && (
                  <IonText color="danger">
                    <small>{loginPasswordError}</small>
                  </IonText>
                )}

                <IonButton
                  expand="block"
                  type="submit"
                  className="ion-margin-top"
                >
                  Se connecter
                </IonButton>
              </IonCardContent>
            </IonCard>
          </form>
        ) : (
          // Register Form
          <form onSubmit={handleSubmit}>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Créer un compte</IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <IonItem>
                  <IonLabel position="floating">Nom d'utilisateur</IonLabel>
                  <IonInput
                    type="text"
                    value={username}
                    onIonChange={(e) => setUsername(e.detail.value!)}
                  />
                </IonItem>
                {usernameError && (
                  <IonText color="danger">
                    <small>{usernameError}</small>
                  </IonText>
                )}

                <IonItem className="ion-margin-top">
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={registerEmail}
                    onIonChange={(e) => setRegisterEmail(e.detail.value!)}
                  />
                </IonItem>
                {registerEmailError && (
                  <IonText color="danger">
                    <small>{registerEmailError}</small>
                  </IonText>
                )}

                <IonItem className="ion-margin-top">
                  <IonLabel position="floating">Mot de passe</IonLabel>
                  <IonInput
                    type="password"
                    value={registerPassword}
                    onIonChange={(e) => setRegisterPassword(e.detail.value!)}
                  />
                </IonItem>
                {registerPasswordError && (
                  <IonText color="danger">
                    <small>{registerPasswordError}</small>
                  </IonText>
                )}

                <IonItem className="ion-margin-top">
                  <IonLabel position="floating">Confirmer le mot de passe</IonLabel>
                  <IonInput
                    type="password"
                    value={confirmPassword}
                    onIonChange={(e) => setConfirmPassword(e.detail.value!)}
                  />
                </IonItem>
                {confirmPasswordError && (
                  <IonText color="danger">
                    <small>{confirmPasswordError}</small>
                  </IonText>
                )}

                <IonButton
                  expand="block"
                  type="submit"
                  className="ion-margin-top"
                >
                  S'inscrire
                </IonButton>
              </IonCardContent>
            </IonCard>
          </form>
        )}

        {/* Toggle between login and register */}
        <div className="toggle-mode">
          <IonButton fill="clear" onClick={toggleMode}>
            {isLoginMode
              ? "Pas encore inscrit ? Créer un compte"
              : "Déjà un compte ? Se connecter"}
          </IonButton>
        </div>
      </div>
    </IonContent>
  );
};

export default Login;