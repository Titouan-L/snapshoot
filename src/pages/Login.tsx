import React, { useState } from "react";
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
    useIonRouter,
    isPlatform,
    useIonViewDidEnter,
    IonSpinner,
    IonToast,
    IonIcon,
} from "@ionic/react";
import { Keyboard } from "@capacitor/keyboard";
import { StatusBar, Style } from "@capacitor/status-bar";
import { mail, lockClosed, person, eye, eyeOff } from "ionicons/icons";
import { useAuth } from "../hooks/useAuth";
import "./Login.css";

const Login: React.FC = () => {
    const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
    const [present, dismiss] = useIonLoading();
    const router = useIonRouter();
    const { login, register, isLoading } = useAuth();
    const [showToast, setShowToast] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState<boolean>(false);

    // Login form state
    const [loginEmail, setLoginEmail] = useState<string>("");
    const [loginPassword, setLoginPassword] = useState<string>("");
    const [loginEmailError, setLoginEmailError] = useState<string>("");
    const [loginPasswordError, setLoginPasswordError] = useState<string>("");

    // Register form state
    const [username, setUsername] = useState<string>("");
    const [registerEmail, setRegisterEmail] = useState<string>("");
    const [registerPassword, setRegisterPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [usernameError, setUsernameError] = useState<string>("");
    const [registerEmailError, setRegisterEmailError] = useState<string>("");
    const [registerPasswordError, setRegisterPasswordError] =
        useState<string>("");
    const [confirmPasswordError, setConfirmPasswordError] =
        useState<string>("");

    useIonViewDidEnter(() => {
        if (isPlatform("capacitor")) {
            StatusBar.setStyle({ style: Style.Dark });
        }
    });

    React.useEffect(() => {
        if (isPlatform("capacitor")) {
            Keyboard.addListener("keyboardWillShow", () => {
                document.body.style.setProperty("--keyboard-offset", "250px");
            });

            Keyboard.addListener("keyboardWillHide", () => {
                document.body.style.setProperty("--keyboard-offset", "0px");
            });
        }

        return () => {
            if (isPlatform("capacitor")) {
                Keyboard.removeAllListeners();
            }
        };
    }, []);

    const toggleMode = (): void => {
        setIsLoginMode(!isLoginMode);
        resetFormFields();
    };

    const resetFormFields = (): void => {
        setLoginEmail("");
        setLoginPassword("");
        setLoginEmailError("");
        setLoginPasswordError("");
        setUsername("");
        setRegisterEmail("");
        setRegisterPassword("");
        setConfirmPassword("");
        setUsernameError("");
        setRegisterEmailError("");
        setRegisterPasswordError("");
        setConfirmPasswordError("");
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const validateLoginForm = (): boolean => {
        let isValid = true;
        if (!loginEmail) {
            setLoginEmailError("Email requis");
            isValid = false;
        } else if (loginEmail.length < 5) {
            setLoginEmailError("Format d'email invalide");
            isValid = false;
        } else {
            setLoginEmailError("");
        }

        if (!loginPassword) {
            setLoginPasswordError("Mot de passe requis");
            isValid = false;
        } else if (loginPassword.length < 6) {
            setLoginPasswordError(
                "Le mot de passe doit contenir au moins 6 caractères"
            );
            isValid = false;
        } else {
            setLoginPasswordError("");
        }

        return isValid;
    };

    const validateRegisterForm = (): boolean => {
        let isValid = true;
        if (!username) {
            setUsernameError("Nom d'utilisateur requis");
            isValid = false;
        } else {
            setUsernameError("");
        }

        if (!registerEmail) {
            setRegisterEmailError("Email requis");
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(registerEmail)) {
            setRegisterEmailError("Format d'email invalide");
            isValid = false;
        } else {
            setRegisterEmailError("");
        }

        if (!registerPassword) {
            setRegisterPasswordError("Mot de passe requis");
            isValid = false;
        } else if (registerPassword.length < 6) {
            setRegisterPasswordError(
                "Le mot de passe doit contenir au moins 6 caractères"
            );
            isValid = false;
        } else {
            setRegisterPasswordError("");
        }

        if (!confirmPassword) {
            setConfirmPasswordError("Confirmation du mot de passe requise");
            isValid = false;
        } else if (confirmPassword !== registerPassword) {
            setConfirmPasswordError("Les mots de passe ne correspondent pas");
            isValid = false;
        } else {
            setConfirmPasswordError("");
        }

        return isValid;
    };

    const handleLogin = async (): Promise<void> => {
        // Valider le formulaire de connexion
        //if (!validateLoginForm()) return;

        try {
            // Afficher un indicateur de chargement
            await present({
                message: "Connexion en cours...",
                spinner: "circles",
                cssClass: "loading-spinner",
            });

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("X-API-Key", "{{token}}");

            const raw = JSON.stringify({
                email: "alexio@gmail.com",
                password: "Alexandre#I0",
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow",
            };

            try {
                const response = await fetch(
                    "http://localhost/api/auth/login",
                    requestOptions
                );
                const result = await response.text();
                console.log("result : " + result);
            } catch (error) {
                console.error(error);
            }

            // Appeler la fonction de connexion
            await login(loginEmail, loginPassword);

            // Masquer l'indicateur de chargement
            await dismiss();

            // Rediriger vers la page de la caméra après la connexion
            router.push("/tabs/camera", "forward", "push");
        } catch (error) {
            // Masquer l'indicateur de chargement en cas d'erreur
            await dismiss();

            // Afficher un message d'erreur
            setToastMessage("Email ou mot de passe incorrect");
            setShowToast(true);

            // Log l'erreur pour le débogage
            console.error("Erreur de connexion:", error);
        }
    };

    const handleRegister = async (): Promise<void> => {
        //if (!validateRegisterForm()) return;

        try {
            await present({
                message: "Création du compte...",
                spinner: "circles",
                cssClass: "loading-spinner",
            });

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("X-API-Key", "{{token}}");

            const raw = JSON.stringify({
                username: "alexHess",
                email: "alexio@gmail.com",
                password: "Alexandre#I0",
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow",
            };

            try {
                const response = await fetch(
                    "http://localhost/api/auth/register",
                    requestOptions
                );
                const result = await response.text();
                console.log("result : " + result);
            } catch (error) {
                console.error(error);
            }

            await register(username, registerEmail, registerPassword);
            await dismiss();
            setToastMessage("Votre compte a été créé avec succès!");
            setShowToast(true);

            setTimeout(() => {
                setIsLoginMode(true);
            }, 1500);
        } catch (error) {
            await dismiss();
            setToastMessage(
                "Un problème est survenu lors de la création de votre compte"
            );
            setShowToast(true);
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

    const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (!target.closest("ion-input") && isPlatform("capacitor")) {
            Keyboard.hide();
        }
    };

    return (
        <IonContent className="auth-form" onClick={handleContentClick}>
            <div className="logo-container">
                <img
                    src="/assets/logo/snapshoot-logo.png"
                    alt="Snapshoot"
                    className="app-logo"
                />
                <h1>Snapshoot</h1>
            </div>

            <div className="form-container">
                {isLoginMode ? (
                    <form onSubmit={handleSubmit}>
                        <IonCard className="auth-card">
                            <IonCardHeader>
                                <IonCardTitle className="ion-text-center">
                                    Connexion
                                </IonCardTitle>
                            </IonCardHeader>

                            <IonCardContent>
                                <IonItem className="custom-input">
                                    <IonIcon
                                        icon={mail}
                                        slot="start"
                                        color="medium"
                                    />
                                    <IonLabel position="floating">
                                        Email
                                    </IonLabel>
                                    <IonInput
                                        type="email"
                                        value={loginEmail}
                                        onIonChange={(e) =>
                                            setLoginEmail(e.detail.value!)
                                        }
                                        clearInput
                                    />
                                </IonItem>
                                {loginEmailError && (
                                    <IonText
                                        color="danger"
                                        className="error-message"
                                    >
                                        <small>{loginEmailError}</small>
                                    </IonText>
                                )}

                                <IonItem className="ion-margin-top custom-input">
                                    <IonIcon
                                        icon={lockClosed}
                                        slot="start"
                                        color="medium"
                                    />
                                    <IonLabel position="floating">
                                        Mot de passe
                                    </IonLabel>
                                    <IonInput
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={loginPassword}
                                        onIonChange={(e) =>
                                            setLoginPassword(e.detail.value!)
                                        }
                                        clearInput
                                    />
                                    <IonIcon
                                        icon={showPassword ? eyeOff : eye}
                                        slot="end"
                                        color="medium"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        style={{ cursor: "pointer" }}
                                    />
                                </IonItem>
                                {loginPasswordError && (
                                    <IonText
                                        color="danger"
                                        className="error-message"
                                    >
                                        <small>{loginPasswordError}</small>
                                    </IonText>
                                )}

                                <IonButton
                                    expand="block"
                                    type="submit"
                                    className="ion-margin-top login-button"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <IonSpinner name="dots" />
                                    ) : (
                                        "Se connecter"
                                    )}
                                </IonButton>
                            </IonCardContent>
                        </IonCard>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <IonCard className="auth-card">
                            <IonCardHeader>
                                <IonCardTitle className="ion-text-center">
                                    Créer un compte
                                </IonCardTitle>
                            </IonCardHeader>

                            <IonCardContent>
                                <IonItem className="custom-input">
                                    <IonIcon
                                        icon={person}
                                        slot="start"
                                        color="medium"
                                    />
                                    <IonLabel position="floating">
                                        Nom d'utilisateur
                                    </IonLabel>
                                    <IonInput
                                        type="text"
                                        value={username}
                                        onIonChange={(e) =>
                                            setUsername(e.detail.value!)
                                        }
                                        clearInput
                                    />
                                </IonItem>
                                {usernameError && (
                                    <IonText
                                        color="danger"
                                        className="error-message"
                                    >
                                        <small>{usernameError}</small>
                                    </IonText>
                                )}

                                <IonItem className="ion-margin-top custom-input">
                                    <IonIcon
                                        icon={mail}
                                        slot="start"
                                        color="medium"
                                    />
                                    <IonLabel position="floating">
                                        Email
                                    </IonLabel>
                                    <IonInput
                                        type="email"
                                        value={registerEmail}
                                        onIonChange={(e) =>
                                            setRegisterEmail(e.detail.value!)
                                        }
                                        clearInput
                                    />
                                </IonItem>
                                {registerEmailError && (
                                    <IonText
                                        color="danger"
                                        className="error-message"
                                    >
                                        <small>{registerEmailError}</small>
                                    </IonText>
                                )}

                                <IonItem className="ion-margin-top custom-input">
                                    <IonIcon
                                        icon={lockClosed}
                                        slot="start"
                                        color="medium"
                                    />
                                    <IonLabel position="floating">
                                        Mot de passe
                                    </IonLabel>
                                    <IonInput
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={registerPassword}
                                        onIonChange={(e) =>
                                            setRegisterPassword(e.detail.value!)
                                        }
                                        clearInput
                                    />
                                    <IonIcon
                                        icon={showPassword ? eyeOff : eye}
                                        slot="end"
                                        color="medium"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        style={{ cursor: "pointer" }}
                                    />
                                </IonItem>
                                {registerPasswordError && (
                                    <IonText
                                        color="danger"
                                        className="error-message"
                                    >
                                        <small>{registerPasswordError}</small>
                                    </IonText>
                                )}

                                <IonItem className="ion-margin-top custom-input">
                                    <IonIcon
                                        icon={lockClosed}
                                        slot="start"
                                        color="medium"
                                    />
                                    <IonLabel position="floating">
                                        Confirmer le mot de passe
                                    </IonLabel>
                                    <IonInput
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={confirmPassword}
                                        onIonChange={(e) =>
                                            setConfirmPassword(e.detail.value!)
                                        }
                                        clearInput
                                    />
                                    <IonIcon
                                        icon={
                                            showConfirmPassword ? eyeOff : eye
                                        }
                                        slot="end"
                                        color="medium"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        style={{ cursor: "pointer" }}
                                    />
                                </IonItem>
                                {confirmPasswordError && (
                                    <IonText
                                        color="danger"
                                        className="error-message"
                                    >
                                        <small>{confirmPasswordError}</small>
                                    </IonText>
                                )}

                                <IonButton
                                    expand="block"
                                    type="submit"
                                    className="ion-margin-top login-button"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <IonSpinner name="dots" />
                                    ) : (
                                        "S'inscrire"
                                    )}
                                </IonButton>
                            </IonCardContent>
                        </IonCard>
                    </form>
                )}

                <div className="toggle-mode">
                    <IonButton
                        fill="clear"
                        onClick={toggleMode}
                        className="toggle-button"
                    >
                        {isLoginMode
                            ? "Pas encore inscrit ? Créer un compte"
                            : "Déjà un compte ? Se connecter"}
                    </IonButton>
                </div>
            </div>

            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={toastMessage}
                duration={2000}
                position="top"
                color={toastMessage.includes("succès") ? "success" : "danger"}
            />
        </IonContent>
    );
};

export default Login;
