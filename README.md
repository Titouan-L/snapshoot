# Snapshoot - Guide d'installation et de démarrage

## Sommaire
- [Démarrage Rapide](#démarrage-rapide)
- [Prérequis Essentiels](#prérequis-essentiels)
- [Installation et Lancement du Projet](#installation-et-lancement-du-projet)
  - [Préparation](#préparation)
  - [Pour le Web](#pour-le-web)
  - [Pour Android](#pour-android)
  - [Pour iOS](#pour-ios)

## Démarrage Rapide

Ce guide est conçu pour vous aider à lancer rapidement l'application Snapshoot sur votre machine, que ce soit pour le web ou pour les appareils mobiles.

## Prérequis Essentiels

Avant de commencer, assurez-vous d'avoir ces outils indispensables installés sur votre ordinateur:

### Node.js et npm
- **Description**: Le moteur JavaScript qui fait fonctionner Ionic et le gestionnaire de paquets pour gérer les dépendances
- **Installation**: [Télécharger Node.js](https://nodejs.org/)

### CLI Ionic
- **Description**: L'outil en ligne de commande d'Ionic qui simplifie les tâches de développement
- **Installation**: Ouvrez votre terminal et exécutez:
  ```bash
  npm install -g @ionic/cli
  ```
- **Plus d'informations**: [Documentation d'installation d'Ionic](https://ionicframework.com/docs/intro/environment)

## Installation et Lancement du Projet

### Préparation

1. **Accéder au dossier du projet**:
   ```bash
   cd /chemin/vers/votre/dossier/Snapshoot
   ```

2. **Installer les dépendances**:
   ```bash
   npm install
   ```
   > Alternative avec Yarn: `yarn install`

### Pour le Web

Le moyen le plus rapide de voir votre application en action:

```bash
ionic serve
```

> [Plus d'informations sur ionic serve](https://ionicframework.com/docs/cli/commands/serve)

### Pour Android

#### Prérequis spécifiques à Android

1. **Java Development Kit (JDK)**:
   - Indispensable pour le développement Android
   - [Télécharger JDK](https://adoptium.net/) (Eclipse Temurin recommandé)

2. **Android Studio**:
   - L'environnement de développement officiel pour Android
   - Inclut le SDK Android, les émulateurs, etc.
   - N'oubliez pas d'installer les "SDK Platforms" et "SDK Tools" via le SDK Manager
   - [Télécharger Android Studio](https://developer.android.com/studio)
   - [Documentation complète pour Android avec Ionic](https://ionicframework.com/docs/developing/android)

#### Commandes Android

```bash
# Ajouter la plateforme Android à votre projet (une seule fois)
ionic cap add android

# Compiler votre application web pour la préparer au mobile
ionic build

# Synchroniser le code web avec le projet Android natif
ionic cap sync android

# Lancer l'application sur un émulateur ou appareil Android connecté
ionic cap run android

# Pour ouvrir le projet dans Android Studio (option avancée)
ionic cap open android
```

### Pour iOS

#### Prérequis spécifiques à iOS

1. **Un Mac**:
   - Le développement iOS nécessite macOS

2. **Xcode**:
   - L'environnement de développement d'Apple
   - Téléchargez-le depuis l'App Store
   - Laissez-le installer tous les composants nécessaires après le premier démarrage
   - [Documentation complète pour iOS avec Ionic](https://ionicframework.com/docs/developing/ios)

#### Commandes iOS

```bash
# Ajouter la plateforme iOS à votre projet (une seule fois)
ionic cap add ios

# Compiler l'application web
ionic build

# Synchroniser le code web avec le projet iOS natif
ionic cap sync ios

# Lancer l'application sur un simulateur ou appareil iOS connecté
ionic cap run ios

# Pour ouvrir le projet dans Xcode (option avancée)
ionic cap open ios
```
