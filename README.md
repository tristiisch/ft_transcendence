# 🚧 ft_transcendence


## Sujet

Crée un site avec le jeu Pong avec un multijoueurs, une interface utilisateur et un chat.

- Toutes les libs sont autorisés mais obligé d'utiliser la **last stable**.
- Se lance avec `docker-compose up --build`.
- Doit être compatible avec la **last stable** de **Chrome**, **Firefox** et **Safari**.

> L’utilisateur ne doit pas rencontrer d’erreurs non gérées ou d’avertissement sur votre site

### Site
- Doit inclure un système de compte utilisateur avec le **OAuth** de l'intra 42.
- L'utilisateur doit pouvoir : 
	- Choisir un pseudo unique qui doit être affiché sur le site
	- Choisir un avatar, avec un avatar par défaut (un générateur d'image serait intéressant ??)
	- Utiliser A2F (_2FA_) pour authentification à deux facteurs ou _two-factor authentication_ , ou l'envoie d'un SMS sur son téléphone.
	- Avoir des amis et voir s'ils sont connectés, déconnectés, en train de jouer, etc.
	- Voir ses stats (ex : victoires et défaites, rang et niveaux, hauts faits, etc.)
	- Voir son historique et qui sera accessible par toute autre personne connectée au site (historique comportant les parties 1 contre 1, les niveaux et ainsi de suite).
	- Bloquer quelqu'un.
- Le chat :
	- Création de channels, publics, privés ou protéger par des mdp (mot de passe).
	- Doit inclure des MPs (messages privés).
	- Ne pas voir les messages d'un utilisateur bloqué.
	- Le créateur du channel devient son **owner** (propriétaire) jusqu'à ce qu'il le quitte.
		- Il peut mettre un mdp sur le channel, le modifier et le retirer.
		- Il peut donner le rôle **admin** aux autres.
	- Les **admins** peuvent ban ou mute les autres.
	- Possibilité d'inviter à une partie un utilisateur et d'accéder au profil (ex : en cliquant sur un pseudo ou avatar).
- **Pong** :
	- Partie en **live** contre un autre joueur.
	- Système de **matching** : l’utilisateur rejoint une file d’attente jusqu’à être matché automatiquement avec quelqu’un d’autre.
	- Peut être un jeu **canvas**, être **rendu en 3D**, ou même n’être pas très beau à voir, etc. ..., mais dans tous les cas, il doit être fidèle au **Pong original de 1972**.
	- Le jeu doit être **responsive**.
	- Il doit y avoir un **mode spectateur**, pouvoir voir les parties en cours.

> Vous devez offrir quelques options de customisation (par exemple, des power-ups ou des maps différentes) mais l’utilisateur doit pouvoir jouer à la version par défaut sans options s’il le souhaite


> Ayez en tête les soucis de réseau comme les déconnexions inattendues ou des latences. Vous devez vous efforcer d’offrir la meilleure expérience utilisateur possible.

### BackEnd
- Doit être écrit en **NestJS**.
- Doit être protégé contre les **injections SQL**.
- Doit inclure un système de validation côté serveur pour les formulaires et toute requête utilisateur.

### FrontEnd
- Doit être écrit avec le framework **TypeScript** de notre choix.
- Doit être une [application web monopage](https://fr.wikipedia.org/wiki/Application_web_monopage) et les boutons **Précédent** et **Suivant** doivent fonctionner.
### SGBD (_DBMS_)
C'est un raccourci pour Système de gestion de base de données, ou _database management system_ en anglais.
- Doit utiliser une base de données **PostgreSQL**. Aucune autre n'est autorisée.
- Les mots de passes doivent être **chiffrés**.
