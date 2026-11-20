# Inscriptions aux formations — Supabase Free

## Installation
Le projet « Agile Resource » est dans Delectio, forfait Free, région Paris (eu-west-3).
Référence publique : urorvrgyxjbtivirtbpm.
L'administration existante reste à /admin/, avec son mot de passe actuel.
Le menu « Inscriptions aux formations » ouvre la rubrique. Aucun paramètre MySQL n'est demandé.
Le formulaire public de l’accueil est connecté à /training-registration.php. Le QR code existant continue à ouvrir l’accueil.

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
Les listes et exports récupèrent toutes les pages de 500 lignes, sans blocage des candidatures.
La mention « 30 places » reste publique. À partir de la 36e candidature, le statut initial est automatiquement « Liste d’attente ».
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

## Formulaire public
L’accueil FR/EN affiche un appel à l’inscription et les trois thèmes. Le formulaire s’ouvre sans quitter la page.
Champs obligatoires : nom, prénom, e-mail, ville, pays de résidence, domaine d’éducation.
CV PDF obligatoire, 5 Mio maximum. Aucun numéro de téléphone n’est demandé.
Les champs supplémentaires sont conservés en base, affichés dans l’administration et ajoutés à l’export.
Le serveur impose un jeton anti-CSRF avec session distincte de l’admin, un contrôle d’origine, un champ anti-robot,
un délai minimum et des limites de tentatives par session et par empreinte IP. L’IP brute n’est pas conservée en base.
La limite IP est partagée entre instances et laisse passer les inscriptions d’un groupe utilisant le même réseau.
La mention « 30 places disponibles uniquement » reste informative, conformément au cadrage, avec mise en liste d’attente dès la 36e candidature.
L’accusé de réception est affiché à l’écran ; aucun e-mail automatique n’est envoyé.

## Exploitation
Le forfait Free a ses quotas et peut mettre en pause un projet inactif. Ne pas promettre une disponibilité permanente.
Surveiller le stockage et l'état du projet ; prévoir une sauvegarde des inscriptions et CV.
Aucun mécanisme de maintien artificiel en activité ni abonnement payant n'est ajouté.

## Revenir en arrière
Le commit avant la bascule conserve l'ancien back-office MySQL.
Revenir au code précédent n'efface pas la base Supabase et ne rétablit pas à lui seul une base MySQL.
La suppression des données est une opération distincte.

## Liste d’attente à partir de la 36e candidature
Le compteur total de candidatures est incrémenté atomiquement sur la ligne de session, dans la transaction d’insertion.
Une candidature échouée ou un doublon ne consomme pas de rang. Les annulations et suppressions ne réinitialisent pas le compteur.
Les 35 premières sont À traiter ; les suivantes sont sur Liste d’attente. Aucune candidature n’est refusée.
Les dossiers existants ne sont pas reclassés rétroactivement.
La réponse publique contient le statut attribué ; le message à l’écran indique explicitement la liste d’attente.
Un e-mail texte est transmis par PHP mail sur Hostinger aux personnes mises en attente, sans CV joint.
La confirmation manuelle d’une candidature précédemment en attente déclenche un e-mail de confirmation.
Le code contrôle le résultat de remise au serveur mail ; la réception en boîte ne peut pas être garantie ni vérifiée par cette remise.
Les essais automatisés utilisent un transport mail simulé : aucun e-mail de test n’est envoyé à de vrais candidats.
