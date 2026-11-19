# Gestion des inscriptions aux formations

## Accès
Entrée unique : /admin/, avec le mot de passe de l’administration actuelle.
Le lien « Inscriptions aux formations » ouvre /admin/formations.php.
Les listes, exports et CV exigent la session administrateur ; aucun nouvel identifiant n’est nécessaire.
Le parcours de récupération du mot de passe existant est conservé.

## Fonctions
- Liste et recherche par nom, e-mail ou téléphone.
- Statuts manuels : À traiter, Confirmé, Annulé ; filtrage par statut.
- Compteurs : total des inscriptions, dossiers à traiter, participants confirmés.
- CV PDF : téléchargement protégé et suppression avec la fiche.
- Export CSV UTF-8 des résultats filtrés pour Excel.
- Modification de la date, heure (Abidjan), durée, lieu et organisation des thèmes.
- Aucun plafond, aucune liste d’attente et aucune promotion automatiques.
  La mention publique « 30 places » est purement informative. La 31e confirmation est autorisée.

## Base et stockage
Utilise PHP/PDO et une base MySQL/MariaDB sur le forfait Hostinger existant.
Vérifier les quotas disponibles dans hPanel. Créer une base et son utilisateur dédié.
Après déploiement, ouvrir la rubrique et renseigner les identifiants MySQL dans le formulaire administrateur.
Celui-ci teste la connexion et prépare deux tables InnoDB préfixées ari_training_.
La configuration est conservée dans ARI_PRIVATE_DIR/training-database.php, hors public_html et hors Git.
Le compte doit disposer des droits nécessaires pour créer les tables/index et lire/écrire les tables.

Les CV seront conservés dans ARI_PRIVATE_DIR/training-cvs, hors du répertoire public.
Le helper d’envoi prévoit des PDF de 5 Mio maximum, contrôlés côté serveur et renommés aléatoirement.
Les fichiers sont téléchargés uniquement après contrôle de session, sous un nom neutre.
Sauvegarder la base et le dossier privé. Ne jamais mettre de véritables identifiants ou CV dans le dépôt.
Aucun participant fictif n’est ajouté en production.

## Session
Date préremplie : 21 novembre 2026. Horaires, durée et lieu restent à confirmer.
Les trois thèmes proposés sont :
- Développer son réseau professionnel.
- Valoriser son CV, son profil LinkedIn et son pitch.
- Préparer et réussir son entretien d’embauche.
Le choix formation unique ou ateliers reste modifiable dans l’administration.

## Ce qui reste hors de cette préparation
Le formulaire public de l’accueil n’est pas connecté.
Lors du raccordement, prévoir validation serveur, anti-spam/limitation de débit, dédoublonnage event_id/email,
utilisation du writer interne ari_training_register (statut initial pending, dédoublonnage, consentement horodaté et nettoyage du CV en cas d’échec).
Ne faire aucun contrôle de capacité. Ne jamais lire les inscriptions ou les CV depuis une API publique.
Valider la mention d’information et la conservation ; distinguer un éventuel usage recrutement futur.
Aucun e-mail ou message WhatsApp automatique n’est prévu.
L’URL du QR code reste celle de l’accueil.

## Vérification
Le workflow .github/workflows/training-admin-checks.yml vérifie la syntaxe PHP,
les opérations MySQL et le refus d’accès non authentifié (page, CSV, CV) sur une base jetable.
Le résultat du workflow, et non sa seule présence, détermine si ces tests ont passé.
Le test d’intégration vérifie explicitement qu’un 31e participant peut être confirmé.

Pour exécution manuelle :
- php -l admin/training-store.php
- php -l admin/formations.php
- php -l admin/index.php
- php -l tests/training-integration.php
- Créer une base jetable dont le nom commence par ari_test_.
- Fournir ARI_TEST_DB_HOST, ARI_TEST_DB_PORT, ARI_TEST_DB_NAME, ARI_TEST_DB_USER, ARI_TEST_DB_PASSWORD.
- php tests/training-integration.php

Le script recrée et supprime les deux tables du module dans cette base : ne pas utiliser la production.
Compléter par une vérification visuelle mobile et un test du raccordement réel sur Hostinger.
Les données de l’ancienne branche n’ont jamais été déployées : aucune migration de capacité n’est requise.

## Retour arrière
Revenir au commit précédent retire la rubrique sans effacer les tables ni les CV privés.
La suppression de ces données est une opération distincte à effectuer uniquement sur demande.
