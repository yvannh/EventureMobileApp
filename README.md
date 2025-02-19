# Prérequis #

**Node (via node -v) :** v22.13.1

**NPM (via npm -v) :** 11.1.0

**Android studio**

# Initialisation du projet #

A la racine du projet exécuter la commande suivante :
```bash
npm install
```

Lancer un émulateur (créer un émulateur avant dans Android Studio/utiliser celui déjà créé) :
```bash
emulator -list-avds
emulator @<Nom de l'appareil à émuler>
```

Lancer un serveur backend via la version Web :
```bash
cd backend && node server
```

Dans un IDE (Visual Studio Code) ou un terminal lancer l'application mobile & synchroniser avec l'émulateur :
```bash
npx react-native run-android
```

Cela lancera un terminal (Metro) dans lequel il est possible d'ouvrir une console de debug avec la touche 'J' ou de recharger (=/= de relancer) l'application via la touche 'R'
Il n'est pas nécessaire de relancer l'application après une modification, celle-ci est prise en compte et recharge l'application (sauf si ajoute d'une bibliothèque/dépendance via npm)
