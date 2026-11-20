# Inscriptions aux formations — Supabase Free

## Installation
Le projet « Agile Resource » est dans Delectio, forfait Free, région Paris (eu-west-3).
Référence publique : urorvrgyxjbtivirtbpm.
L'administration existante reste à /admin/, avec son mot de passe actuel.
Le menu « Inscriptions aux formations » ouvre la rubrique. Aucun paramètre MySQL n'est demandé.
Le formulaire public de l'accueil reste volontairement déconnecté.

## Données et sécurité
- Tables ari_training_events / ari_training_registrations protégées par RLS, sans accès anon/authenticated.
- Bucket ari-training-cvs privé, PDF uniquement, limite 5 Mio par fichier.
- La fonction training-admin utilise les secrets natifs de son environnement Supabase ; aucun secret Supabase n'est envoyé à Hostinger ni versionné.
- Le serveur PHP conserve une clé RSA privée dans ARI_PRIVATE_DIR/training-signing.pem, hors public_html, permissions 0600.
- Le point training-public-key.php ne fournit que la clé publique. Elle est enregistrée comme serveur autorisé dans ari_training_admin_keys par l'administrateur Supabase.
- Toutes les requêtes PHP sont signées RSA/SHA-256 : corps, horodatage et nonce à usage unique. Fenêtre d'acceptation : 90 secondes.
- Les nonces périmés sont supprimés après 5 minutes.
- training-public-key.php?check=1 exécute uniquement une vérification fixe de liaison, sans aucune donnée de participant. Il ne permet ni signature arbitraire ni opération utilisateur.
- verify_jwt est désactivé pour cette seule fonction car elle vérifie sa propre signature serveur. Aucune action n'est traitée sans cette signature et une clé autorisée.
- Les CV sont téléchargés via PHP après connexion administrateur, sans URL publique ni clé Supabase dans le navigateur.

## Fonctions
Liste et recherche, filtres, statuts manuels À traiter / Confirmé / Annulé, CV, suppression et CSV UTF-8 pour Excel.
Les listes et exports récupèrent toutes les pages de 500 lignes, sans plafond de participants.
La mention « 30 places » est informative. Aucune liste d'attente automatique.
Date initiale 21 novembre 2026 ; heure d'Abidjan, durée, lieu, thèmes et organisation restent à confirmer/modifier.

## Authentification et déploiement
La connexion et la récupération du mot de passe existantes sont conservées.
Les modifications de réglages / statuts et suppressions restent protégées contre les requêtes intersites.
Le point public de clé ne renvoie jamais la clé privée. Il peut créer celle-ci une seule fois sous verrou fichier.
Sauvegarder le dossier ari-private avec les autres réglages. En cas de perte de clé, le nouveau couple doit être réautorisé dans Supabase et l'ancien désactivé.

## Vérification
Le workflow training-admin-checks exécute :
- lint PHP et test du client PHP, signatures, pagination et export ;
- tests du handler avec signatures réelles : falsification, expiration, rejeu, révocation,
  31e confirmation, statuts, recherche, doublons, PDF et nettoyage d'un upload en échec ;
- contrôle HTTP de la redirection des visiteurs non connectés pour la page, le CSV et le CV.
Le test de liaison en production ne lit ni ne crée aucune inscription.
Les fichiers de test refusent l'exécution PHP depuis le web.

## Raccordement public restant
Brancher le formulaire d'accueil à ari_training_register, depuis une route PHP de soumission dédiée avec validation, anti-spam, limitation de débit,
mention d'information validée et version de consentement fournie par le serveur.
Le writer ne doit jamais être appelé directement depuis le navigateur avec des privilèges de gestion.
Distinguer l'inscription à la formation d'un éventuel accord pour un usage de recrutement futur.

## Exploitation
Le forfait Free a ses quotas et peut mettre en pause un projet inactif. Ne pas promettre une disponibilité permanente.
Surveiller le stockage et l'état du projet ; prévoir une sauvegarde des inscriptions et CV.
Aucun mécanisme de maintien artificiel en activité ni abonnement payant n'est ajouté.

## Revenir en arrière
Le commit avant la bascule conserve l'ancien back-office MySQL.
Revenir au code précédent n'efface pas la base Supabase et ne rétablit pas à lui seul une base MySQL.
La suppression des données est une opération distincte.
