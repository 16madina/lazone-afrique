# Configuration Java 17 pour Android

Ce guide explique comment configurer votre application Android Capacitor pour utiliser Java 17 au lieu de Java 21.

## Prérequis

Avant de modifier ces fichiers, vous devez avoir :
1. Exporté votre projet vers GitHub
2. Fait `git pull` du projet en local
3. Installé les dépendances avec `npm install`
4. Ajouté la plateforme Android avec `npx cap add android`

## Fichiers à modifier

### 1. android/variables.gradle

Créez ou modifiez le fichier `android/variables.gradle` :

```gradle
ext {
    minSdkVersion = 22
    compileSdkVersion = 34
    targetSdkVersion = 34
    androidxActivityVersion = '1.8.0'
    androidxAppCompatVersion = '1.6.1'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.12.0'
    androidxFragmentVersion = '1.6.2'
    coreSplashScreenVersion = '1.0.1'
    androidxWebkitVersion = '1.9.0'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.1.5'
    androidxEspressoCoreVersion = '3.5.1'
    cordovaAndroidVersion = '10.1.1'
    
    // Java version
    javaVersion = JavaVersion.VERSION_17
}
```

### 2. android/build.gradle (racine du projet)

Modifiez le fichier `android/build.gradle` :

```gradle
buildscript {
    
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.1'
        classpath 'com.google.gms:google-services:4.4.0'

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

apply from: "variables.gradle"

allprojects {
    repositories {
        google()
        mavenCentral()
    }
    
    // Force Java 17 pour tous les modules
    tasks.withType(JavaCompile).configureEach {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
```

### 3. android/app/build.gradle

Modifiez le fichier `android/app/build.gradle` dans la section `android` :

```gradle
android {
    namespace "com.lazone.afrique"
    compileSdkVersion rootProject.ext.compileSdkVersion
    
    defaultConfig {
        applicationId "com.lazone.afrique"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
             // Files and dirs to omit from the packaged assets dir, modified to accommodate modern web apps.
             // Default: https://android.googlesource.com/platform/frameworks/base/+/282e181b58cf72b6ca770dc7ca5f91f135444502/tools/aapt/AaptAssets.cpp#61
            ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
        }
    }
    
    // Configuration Java 17
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4. gradle.properties (optionnel mais recommandé)

Ajoutez ou modifiez le fichier `android/gradle.properties` :

```properties
# Java version
org.gradle.jvmargs=-Xmx4608m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8 -XX:+UseParallelGC

# Android
android.useAndroidX=true
android.enableJetifier=true

# Kotlin
kotlin.code.style=official

# Gradle
org.gradle.caching=true
org.gradle.parallel=true
org.gradle.configureondemand=true
```

## Vérification de la configuration Java

### Vérifier la version Java utilisée par Gradle

```bash
cd android
./gradlew -version
```

Cela devrait afficher `Java: 17` dans la sortie.

### Vérifier la compilation

```bash
cd android
./gradlew clean
./gradlew build
```

Si vous voyez des erreurs liées à Java 21, assurez-vous que :
1. Toutes les modifications ci-dessus sont appliquées
2. Vous avez supprimé le dossier `android/build` et `android/app/build`
3. Vous avez invalidé les caches Gradle : `./gradlew cleanBuildCache`

## Installation de Java 17

Si Java 17 n'est pas installé sur votre système :

### macOS (avec Homebrew)
```bash
brew install openjdk@17
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

### Windows
Téléchargez et installez depuis : https://adoptium.net/temurin/releases/?version=17

## Définir JAVA_HOME

### macOS/Linux (ajoutez à ~/.zshrc ou ~/.bashrc)
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

### Windows
1. Ouvrez les Paramètres système avancés
2. Variables d'environnement
3. Créez `JAVA_HOME` pointant vers le dossier d'installation Java 17

## Vérifier que tout fonctionne

```bash
# 1. Vérifier Java
java -version
# Devrait afficher : openjdk version "17.x.x"

# 2. Nettoyer et rebuilder
cd android
./gradlew clean
./gradlew build

# 3. Synchroniser Capacitor
cd ..
npx cap sync android

# 4. Lancer l'app
npx cap run android
```

## Dépannage

### Erreur "Unsupported class file major version"
- Assurez-vous que tous les fichiers ci-dessus sont correctement configurés
- Supprimez les dossiers de build : `rm -rf android/build android/app/build`
- Relancez `./gradlew clean build`

### Gradle utilise toujours Java 21
- Vérifiez votre variable d'environnement `JAVA_HOME`
- Vérifiez que `gradle.properties` contient les bonnes configurations
- Redémarrez votre terminal/IDE après avoir modifié `JAVA_HOME`

### Plugins Capacitor incompatibles
Si certains plugins Capacitor ne sont pas compatibles Java 17, vous devrez peut-être les mettre à jour :
```bash
npm update @capacitor/android
npm update @capacitor/core
npx cap sync android
```

## Notes importantes

1. **Ces fichiers ne sont PAS dans Lovable** - ils sont générés localement après `npx cap add android`
2. **Vous devez les modifier après chaque `npx cap add android`** - ou mieux, ajoutez-les à votre dépôt Git
3. **Commitez ces changements dans Git** - pour ne pas les perdre
4. **Android Studio** - si vous utilisez Android Studio, assurez-vous qu'il utilise aussi Java 17 dans ses paramètres

## Commande rapide de vérification

```bash
# Vérifier Java system
java -version

# Vérifier Java Gradle
cd android && ./gradlew -version

# Tout rebuilder
cd android
rm -rf build app/build .gradle
./gradlew clean build
cd ..
npx cap sync android
npx cap run android
```
