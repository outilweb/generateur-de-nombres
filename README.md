# Générateur de nombres

Une petite application Web (HTML/CSS/JS) pour générer des nombres aléatoires, entiers ou décimaux, avec options de plage, quantité, unicité, copie et téléchargement.

## Utilisation locale

- Ouvrez `index.html` dans votre navigateur.
- Remplissez les champs, puis cliquez sur « Générer ».
- Utilisez « Copier » pour mettre les résultats dans le presse-papiers, ou « Télécharger » pour obtenir un fichier `.txt`.

Aucune installation n’est nécessaire. Tout fonctionne hors‑ligne, sans dépendances externes.

## Mise en ligne (hébergement)

Plusieurs options simples s’offrent à vous. Le projet est 100% statique : uploadez les fichiers tels quels.

- GitHub Pages
  1) Créez un dépôt et poussez les fichiers.
  2) Dans « Settings » > « Pages », sélectionnez la branche `main` et le dossier racine.
  3) Votre site sera disponible à une URL du type `https://<votre-utilisateur>.github.io/<repo>/`.

- Netlify (drag & drop)
  1) Rendez‑vous sur Netlify et créez un compte.
  2) Glissez‑déposez le dossier du projet dans l’espace « Deploys ».
  3) Netlify publie instantanément une URL publique.

- Vercel
  1) Créez un compte et importez ce répertoire depuis GitHub/GitLab.
  2) Vercel détecte un site statique et le déploie automatiquement.

- Hébergeur classique
  1) Envoyez `index.html`, `styles.css`, `script.js` sur votre hébergeur via FTP.
  2) Accédez directement à l’URL pointant sur `index.html`.

## Personnalisation

- Couleurs et styles : modifiez les variables CSS dans `styles.css`.
- Libellés : ajustez les textes dans `index.html`.
- Logique : adaptez les règles de génération dans `script.js`.

## Sécurité du hasard

Le générateur utilise `crypto.getRandomValues` quand disponible pour limiter les biais, avec une stratégie d’échantillonnage par rejet (uniformité) et un repli sur `Math.random` si nécessaire.

## Licence

Vous pouvez utiliser et adapter librement ce code pour vos besoins.

