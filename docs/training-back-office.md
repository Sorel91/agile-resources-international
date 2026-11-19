# Back-office des inscriptions — préparation du 19 novembre 2026

## Périmètre
Module PHP/MySQL dans l’administration existante, accessible à /admin/formations.php après connexion.
La préparation ne modifie pas l’accueil et n’ouvre aucun formulaire public.

Fonctions : liste et recherche des participants, filtres par statut, compteur sur 30 places, confirmation/liste d’attente/annulation,
téléchargement privé des CV PDF, suppression des inscriptions et CV, export CSV UTF-8 pour Excel.
Les données sont vides à l’installation. Aucun participant ou témoignage fictif n’est créé.

Les thèmes proposés restent à valider :
- Développer son réseau professionnel.
- Valoriser son CV, son profil LinkedIn et son pitch.
- Préparer et réussir son entretien d’embauche.

Date préremplie : 21 novembre 2026. Heure, durée, lieu et organisation des thèmes restent modifiables.
La capacité de 30 est provisoirement commune à la session ; si elle concerne chaque atelier, adapter le modèle avant ouverture.
Annuler libère une place ; la promotion depuis la liste d’attente est manuelle.

## Hébergement et raccordement
Vérifier les quotas de bases et de stockage du forfait Hostinger existant.
Dans hPanel, créer une base MySQL/MariaDB et son utilisateur dédié.
Après déploiement validé, ouvrir /admin/formations.php, renseigner l’hôte, le nom de la base, l’utilisateur et le mot de passe.
Le formulaire authentifié teste la connexion, crée deux tables InnoDB préfixées ari_training_, puis conserve la configuration
dans ARI_PRIVATE_DIR/training-database.php (hors public_html, non versionné).
Le compte MySQL doit pouvoir créer les tables et index ainsi que lire/écrire les deux tables.
Aucun identifiant réel ne doit être ajouté au dépôt.

Les CV seront stockés dans ARI_PRIVATE_DIR/training-cvs, hors public_html et hors Git.
Ils ne sont servis que par la route administrateur authentifiée, en téléchargement avec nom neutre.
Le helper d’envoi prévoit uniquement des PDF de 5 Mio maximum, contrôlés côté serveur, nommés aléatoirement.
L’upload public sera raccordé dans une étape ultérieure. Prévoir les sauvegardes de la base ET du dossier privé.

## Étape suivante : formulaire public sur l’accueil
Conserver l’URL du QR code existant. Ajouter le bandeau et l’inscription depuis l’accueil.
Avant ouverture :
1. Valider horaires, durée, lieu, intitulés, formation unique ou ateliers, portée de la capacité.
2. Raccorder un endpoint de soumission avec validation, limitation de débit et protection antispam.
3. Faire l’allocation confirmé/liste d’attente dans une transaction : verrouiller la ligne événement FOR UPDATE,
   vérifier registration_open, compter les confirmés puis insérer. Toutes les écritures doivent respecter le même verrou.
   Garder l’unicité event_id/email et nettoyer le CV si l’insertion échoue.
4. Valider la mention d’information et la durée de conservation ; enregistrer version et date du consentement.
   L’usage recrutement futur doit être présenté séparément de l’inscription à la formation.
5. Tester les CV, les doublons, les accès non authentifiés, les envois simultanés à la 30e place et la confirmation à l’écran.
6. Ouvrir registration_open seulement quand le raccordement public est complet.
Pas de confirmation e-mail ou WhatsApp automatique dans cette préparation.

## Validation
L’environnement d’exécution PHP et MySQL n’était pas disponible lors de la préparation.
Les fichiers ont été relus, mais ni lint PHP, ni tests d’exécution, ni rendu navigateur n’ont encore été exécutés.
Ne pas fusionner la branche avant les vérifications suivantes :

- php -l admin/training-store.php
- php -l admin/formations.php
- php -l admin/index.php
- php -l tests/training-integration.php
- Créer une base MySQL jetable dont le nom commence par ari_test_.
- Fournir ARI_TEST_DB_HOST, ARI_TEST_DB_PORT, ARI_TEST_DB_NAME, ARI_TEST_DB_USER, ARI_TEST_DB_PASSWORD.
- Exécuter php tests/training-integration.php. Le script supprime/recrée uniquement les deux tables du module
  dans cette base de test, puis les supprime en fin d’exécution. Ne jamais utiliser une base de production.
- Vérifier la connexion existante, le setup, l’export filtré, les CV et la vue mobile sur un environnement de test.
- Le test couvre le plafond, la libération d’une place, la promotion, les doublons et les recherches ;
  compléter par un test de concurrence avant d’exposer un endpoint public.

## Retour arrière
La branche de préparation reste séparée de main.
Si le module est ensuite déployé, retirer son lien et ses fichiers n’efface ni les données MySQL ni les CV.
La suppression des données stockées est une opération distincte à effectuer uniquement sur demande.
