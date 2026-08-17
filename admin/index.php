<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$error = '';
$notice = '';
$hasCredentials = ari_has_credentials();

if (!$hasCredentials && $_SERVER['REQUEST_METHOD'] === 'POST' && (string)($_POST['action'] ?? '') === 'send_setup_code') {
    if (!ari_valid_csrf((string)($_POST['csrf'] ?? ''))) {
        $error = 'La session a expiré. Rechargez la page.';
    } elseif ((int)($_SESSION['setup_sent_at'] ?? 0) > time() - 60) {
        $error = 'Un code vient déjà d’être envoyé. Vérifiez la boîte de réception.';
    } else {
        $code = (string)random_int(10000000, 99999999);
        if (ari_send_setup_code($code)) {
            $_SESSION['setup_code_hash'] = hash('sha256', $code);
            $_SESSION['setup_code_expires'] = time() + 900;
            $_SESSION['setup_sent_at'] = time();
            $notice = 'Un code temporaire a été envoyé à contact@agileresources-intl.com.';
        } else {
            $error = 'Le code n’a pas pu être envoyé. Vérifiez que l’envoi d’e-mails PHP est actif sur Hostinger.';
        }
    }
}

if (!$hasCredentials && $_SERVER['REQUEST_METHOD'] === 'POST' && (string)($_POST['action'] ?? '') === 'create_credentials') {
    $code = trim((string)($_POST['setup_code'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    $confirmation = (string)($_POST['password_confirmation'] ?? '');
    $expectedCode = (string)($_SESSION['setup_code_hash'] ?? '');
    if (!ari_valid_csrf((string)($_POST['csrf'] ?? ''))) {
        $error = 'La session a expiré. Rechargez la page.';
    } elseif ((int)($_SESSION['setup_code_expires'] ?? 0) < time() || $expectedCode === '') {
        $error = 'Le code a expiré. Demandez un nouveau code.';
    } elseif (!hash_equals($expectedCode, hash('sha256', $code))) {
        $error = 'Le code temporaire est incorrect.';
    } elseif (strlen($password) < 12) {
        $error = 'Le mot de passe doit contenir au moins 12 caractères.';
    } elseif ($password !== $confirmation) {
        $error = 'Les deux mots de passe ne correspondent pas.';
    } elseif (!ari_save_password($password)) {
        $error = 'Le mot de passe n’a pas pu être enregistré sur le serveur.';
    } else {
        unset($_SESSION['setup_code_hash'], $_SESSION['setup_code_expires'], $_SESSION['setup_sent_at']);
        session_regenerate_id(true);
        $_SESSION['ari_admin'] = true;
        header('Location: /admin/', true, 303);
        exit;
    }
}

if ($hasCredentials && $_SERVER['REQUEST_METHOD'] === 'POST' && (string)($_POST['action'] ?? '') === 'send_reset_code') {
    if (!ari_valid_csrf((string)($_POST['csrf'] ?? ''))) {
        $error = 'La session a expiré. Rechargez la page.';
    } elseif ((int)($_SESSION['reset_sent_at'] ?? 0) > time() - 60) {
        $error = 'Un code vient déjà d’être envoyé. Vérifiez la boîte de réception.';
    } else {
        $code = (string)random_int(10000000, 99999999);
        if (ari_send_password_reset_code($code)) {
            $_SESSION['reset_code_hash'] = hash('sha256', $code);
            $_SESSION['reset_code_expires'] = time() + 900;
            $_SESSION['reset_sent_at'] = time();
            $_SESSION['reset_failures'] = 0;
            $notice = 'Un code de réinitialisation a été envoyé à contact@agileresources-intl.com.';
        } else {
            $error = 'Le code n’a pas pu être envoyé. Vérifiez que l’envoi d’e-mails PHP est actif sur Hostinger.';
        }
    }
}

if ($hasCredentials && $_SERVER['REQUEST_METHOD'] === 'POST' && (string)($_POST['action'] ?? '') === 'cancel_reset') {
    if (ari_valid_csrf((string)($_POST['csrf'] ?? ''))) {
        unset($_SESSION['reset_code_hash'], $_SESSION['reset_code_expires'], $_SESSION['reset_sent_at'], $_SESSION['reset_failures']);
    }
}

if ($hasCredentials && $_SERVER['REQUEST_METHOD'] === 'POST' && (string)($_POST['action'] ?? '') === 'reset_password') {
    $code = trim((string)($_POST['reset_code'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    $confirmation = (string)($_POST['password_confirmation'] ?? '');
    $expectedCode = (string)($_SESSION['reset_code_hash'] ?? '');
    if (!ari_valid_csrf((string)($_POST['csrf'] ?? ''))) {
        $error = 'La session a expiré. Rechargez la page.';
    } elseif ((int)($_SESSION['reset_code_expires'] ?? 0) < time() || $expectedCode === '') {
        $error = 'Le code a expiré. Demandez un nouveau code.';
        unset($_SESSION['reset_code_hash'], $_SESSION['reset_code_expires'], $_SESSION['reset_failures']);
    } elseif (!hash_equals($expectedCode, hash('sha256', $code))) {
        $failures = (int)($_SESSION['reset_failures'] ?? 0) + 1;
        $_SESSION['reset_failures'] = $failures;
        if ($failures >= 5) {
            unset($_SESSION['reset_code_hash'], $_SESSION['reset_code_expires'], $_SESSION['reset_failures']);
            $error = 'Trop de codes incorrects. Demandez un nouveau code.';
        } else {
            $error = 'Le code temporaire est incorrect.';
        }
    } elseif (strlen($password) < 12) {
        $error = 'Le mot de passe doit contenir au moins 12 caractères.';
    } elseif ($password !== $confirmation) {
        $error = 'Les deux mots de passe ne correspondent pas.';
    } elseif (!ari_save_password($password)) {
        $error = 'Le nouveau mot de passe n’a pas pu être enregistré sur le serveur.';
    } else {
        unset(
            $_SESSION['reset_code_hash'],
            $_SESSION['reset_code_expires'],
            $_SESSION['reset_sent_at'],
            $_SESSION['reset_failures'],
            $_SESSION['login_failures'],
            $_SESSION['login_locked_until']
        );
        session_regenerate_id(true);
        $_SESSION['ari_admin'] = true;
        header('Location: /admin/', true, 303);
        exit;
    }
}

if ($hasCredentials && $_SERVER['REQUEST_METHOD'] === 'POST' && (string)($_POST['action'] ?? '') === 'login') {
    $lockedUntil = (int)($_SESSION['login_locked_until'] ?? 0);
    if ($lockedUntil > time()) {
        $error = 'Trop de tentatives. Réessayez dans quelques minutes.';
    } elseif (!ari_valid_csrf((string)($_POST['csrf'] ?? ''))) {
        $error = 'La session a expiré. Rechargez la page.';
    } elseif (ari_verify_password((string)($_POST['password'] ?? ''))) {
        session_regenerate_id(true);
        $_SESSION['ari_admin'] = true;
        $_SESSION['login_failures'] = 0;
        header('Location: /admin/', true, 303);
        exit;
    } else {
        $failures = (int)($_SESSION['login_failures'] ?? 0) + 1;
        $_SESSION['login_failures'] = $failures;
        if ($failures >= 5) {
            $_SESSION['login_locked_until'] = time() + 600;
        }
        $error = 'Mot de passe incorrect.';
    }
}

if (!ari_is_authenticated()):
?>
<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Administration — ARI</title>
  <link rel="stylesheet" href="/admin/admin.css">
</head>
<body class="login-shell">
  <main class="login-card">
    <img src="/assets/logo-ari.png" alt="Agile Resources International">
    <h1>Administration du site</h1>
    <?php if ($notice !== ''): ?><p class="notice"><?= ari_escape($notice) ?></p><?php endif; ?>
    <?php if ($error !== ''): ?><p class="notice error"><?= ari_escape($error) ?></p><?php endif; ?>
    <?php if (!$hasCredentials): ?>
      <p class="muted">Première activation : un code de sécurité sera envoyé à l’adresse de contact du site.</p>
      <?php if (empty($_SESSION['setup_code_hash']) || (int)($_SESSION['setup_code_expires'] ?? 0) < time()): ?>
        <form method="post">
          <input type="hidden" name="action" value="send_setup_code">
          <input type="hidden" name="csrf" value="<?= ari_escape(ari_csrf_token()) ?>">
          <button class="button" type="submit">Envoyer le code d’activation</button>
        </form>
      <?php else: ?>
        <form method="post" autocomplete="off">
          <input type="hidden" name="action" value="create_credentials">
          <input type="hidden" name="csrf" value="<?= ari_escape(ari_csrf_token()) ?>">
          <p class="field"><label for="setup_code">Code reçu par e-mail</label><input id="setup_code" name="setup_code" inputmode="numeric" pattern="[0-9]{8}" maxlength="8" required autofocus></p>
          <p class="field"><label for="password">Créer le mot de passe</label><input id="password" name="password" type="password" minlength="12" required autocomplete="new-password"></p>
          <p class="field"><label for="password_confirmation">Confirmer le mot de passe</label><input id="password_confirmation" name="password_confirmation" type="password" minlength="12" required autocomplete="new-password"></p>
          <button class="button" type="submit">Activer le back-office</button>
        </form>
      <?php endif; ?>
    <?php elseif (!empty($_SESSION['reset_code_hash']) && (int)($_SESSION['reset_code_expires'] ?? 0) >= time()): ?>
      <p class="muted">Saisissez le code reçu par e-mail, puis choisissez un nouveau mot de passe.</p>
      <form method="post" autocomplete="off">
        <input type="hidden" name="action" value="reset_password">
        <input type="hidden" name="csrf" value="<?= ari_escape(ari_csrf_token()) ?>">
        <p class="field"><label for="reset_code">Code reçu par e-mail</label><input id="reset_code" name="reset_code" inputmode="numeric" pattern="[0-9]{8}" maxlength="8" required autofocus></p>
        <p class="field"><label for="password">Nouveau mot de passe</label><input id="password" name="password" type="password" minlength="12" required autocomplete="new-password"></p>
        <p class="field"><label for="password_confirmation">Confirmer le mot de passe</label><input id="password_confirmation" name="password_confirmation" type="password" minlength="12" required autocomplete="new-password"></p>
        <button class="button" type="submit">Réinitialiser le mot de passe</button>
      </form>
      <form class="login-secondary-action" method="post">
        <input type="hidden" name="action" value="cancel_reset">
        <input type="hidden" name="csrf" value="<?= ari_escape(ari_csrf_token()) ?>">
        <button class="text-button" type="submit">Retour à la connexion</button>
      </form>
    <?php else: ?>
      <form method="post" autocomplete="off">
        <input type="hidden" name="action" value="login">
        <input type="hidden" name="csrf" value="<?= ari_escape(ari_csrf_token()) ?>">
        <p class="field"><label for="password">Mot de passe</label><input id="password" name="password" type="password" required autofocus autocomplete="current-password"></p>
        <button class="button" type="submit">Se connecter</button>
      </form>
      <form class="login-secondary-action" method="post">
        <input type="hidden" name="action" value="send_reset_code">
        <input type="hidden" name="csrf" value="<?= ari_escape(ari_csrf_token()) ?>">
        <button class="text-button" type="submit">Mot de passe oublié ?</button>
      </form>
    <?php endif; ?>
  </main>
</body>
</html>
<?php
exit;
endif;

$settings = ari_load_settings();
$defaults = ari_default_settings();
$fontOptions = ari_font_options();
$photoSlots = ari_photo_slots();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && (string)($_POST['action'] ?? '') === 'save') {
    if (!ari_valid_csrf((string)($_POST['csrf'] ?? ''))) {
        $error = 'La session a expiré. Rechargez la page avant de recommencer.';
    } else {
        $newSettings = $settings;
        foreach (['h1', 'h2', 'h3', 'body'] as $fontKey) {
            $choice = (string)($_POST['font_' . $fontKey] ?? '');
            if (isset($fontOptions[$choice])) {
                $newSettings['fonts'][$fontKey] = $choice;
                $newSettings['enabled']['font_' . $fontKey] = $choice !== (string)$defaults['fonts'][$fontKey];
            }
        }

        $sizeRules = [
            'home_h1_desktop' => [36, 150], 'home_h1_mobile' => [26, 90],
            'industries_h1_desktop' => [36, 150], 'industries_h1_mobile' => [26, 90],
            'about_h1_desktop' => [36, 150], 'about_h1_mobile' => [26, 90],
            'enterprise_h1_desktop' => [36, 150], 'enterprise_h1_mobile' => [26, 90],
            'candidates_h1_desktop' => [36, 150], 'candidates_h1_mobile' => [26, 90],
            'contact_h1_desktop' => [36, 150], 'contact_h1_mobile' => [26, 90],
            'h2_desktop' => [28, 110], 'h2_mobile' => [24, 72],
            'h3_desktop' => [16, 60], 'h3_mobile' => [15, 46],
            'body_desktop' => [13, 32], 'body_mobile' => [13, 26],
        ];
        foreach ($sizeRules as $key => $limits) {
            $value = filter_var($_POST['size_' . $key] ?? null, FILTER_VALIDATE_INT);
            if ($value !== false) {
                $newSettings['sizes'][$key] = max($limits[0], min($limits[1], (int)$value));
            }
        }
        $sizeGroups = [
            'h1' => ['home_h1_desktop', 'home_h1_mobile', 'industries_h1_desktop', 'industries_h1_mobile', 'about_h1_desktop', 'about_h1_mobile', 'enterprise_h1_desktop', 'enterprise_h1_mobile', 'candidates_h1_desktop', 'candidates_h1_mobile', 'contact_h1_desktop', 'contact_h1_mobile'],
            'h2' => ['h2_desktop', 'h2_mobile'],
            'h3' => ['h3_desktop', 'h3_mobile'],
            'body' => ['body_desktop', 'body_mobile'],
        ];
        foreach ($sizeGroups as $group => $keys) {
            $newSettings['enabled']['size_' . $group] = false;
            foreach ($keys as $key) {
                if ((int)($newSettings['sizes'][$key] ?? 0) !== (int)($defaults['sizes'][$key] ?? 0)) {
                    $newSettings['enabled']['size_' . $group] = true;
                    break;
                }
            }
        }

        foreach ($photoSlots as $slot => $meta) {
            if (!empty($_POST['restore_image'][$slot])) {
                unset($newSettings['images'][$slot]);
                continue;
            }
            $field = 'photo_' . $slot;
            if (!isset($_FILES[$field]) || (int)$_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) {
                continue;
            }
            $upload = $_FILES[$field];
            if ((int)$upload['error'] !== UPLOAD_ERR_OK) {
                $error .= ($error ? ' ' : '') . 'Échec de l’envoi pour « ' . $meta['label'] . ' ».';
                continue;
            }
            if ((int)$upload['size'] > 8 * 1024 * 1024) {
                $error .= ($error ? ' ' : '') . 'L’image « ' . $meta['label'] . ' » dépasse 8 Mo.';
                continue;
            }
            $info = @getimagesize((string)$upload['tmp_name']);
            $mime = is_array($info) ? (string)($info['mime'] ?? '') : '';
            $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
            if (!isset($extensions[$mime])) {
                $error .= ($error ? ' ' : '') . 'Le format de « ' . $meta['label'] . ' » n’est pas accepté.';
                continue;
            }
            if (!is_dir(ARI_UPLOAD_DIR) && !@mkdir(ARI_UPLOAD_DIR, 0755, true)) {
                $error .= ($error ? ' ' : '') . 'Le dossier des images ne peut pas être créé.';
                continue;
            }
            $filename = $slot . '-' . gmdate('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . $extensions[$mime];
            $destination = ARI_UPLOAD_DIR . '/' . $filename;
            if (!@move_uploaded_file((string)$upload['tmp_name'], $destination)) {
                $error .= ($error ? ' ' : '') . 'L’image « ' . $meta['label'] . ' » n’a pas pu être enregistrée.';
                continue;
            }
            @chmod($destination, 0644);
            $newSettings['images'][$slot] = '/uploads/site/' . $filename;
        }

        $newPassword = (string)($_POST['new_password'] ?? '');
        $confirmPassword = (string)($_POST['confirm_password'] ?? '');
        if ($newPassword !== '' || $confirmPassword !== '') {
            if (strlen($newPassword) < 12) {
                $error .= ($error ? ' ' : '') . 'Le nouveau mot de passe doit contenir au moins 12 caractères.';
            } elseif ($newPassword !== $confirmPassword) {
                $error .= ($error ? ' ' : '') . 'Les deux nouveaux mots de passe ne correspondent pas.';
            } elseif (!ari_save_password($newPassword)) {
                $error .= ($error ? ' ' : '') . 'Le nouveau mot de passe n’a pas pu être enregistré.';
            } else {
                $notice = 'Le mot de passe a été modifié. ';
            }
        }

        if (ari_save_settings($newSettings)) {
            $settings = ari_load_settings();
            $notice .= 'Les réglages du site ont été enregistrés.';
        } else {
            $error .= ($error ? ' ' : '') . 'Le fichier des réglages n’est pas accessible en écriture.';
        }
    }
}

$pageSizeLabels = [
    'home' => 'Accueil',
    'industries' => 'Industries',
    'about' => 'À propos',
    'enterprise' => 'Entreprises',
    'candidates' => 'Candidats',
    'contact' => 'Contact',
];

$photosByPage = [];
foreach ($photoSlots as $slot => $meta) {
    $photosByPage[$meta['page']][$slot] = $meta;
}
?>
<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Administration — ARI</title>
  <link rel="stylesheet" href="/admin/admin.css">
</head>
<body>
  <header class="topbar">
    <img src="/assets/logo-ari.png" alt="ARI">
    <strong>Administration du site</strong>
    <nav><a href="/" target="_blank" rel="noopener">Voir le site</a><a href="/admin/logout.php">Déconnexion</a></nav>
  </header>
  <main class="shell">
    <div class="intro"><div><h1>Personnalisation du site</h1><p>Modifiez les polices, les tailles et les photos sans toucher au code.</p></div><a class="button secondary" href="/" target="_blank" rel="noopener">Ouvrir le site</a></div>
    <p class="help">Les changements sont visibles dès l’enregistrement. Utilisez « Restaurer l’image d’origine » pour revenir au visuel conservé dans GitHub.</p>
    <?php if ($notice !== ''): ?><p class="notice"><?= ari_escape($notice) ?></p><?php endif; ?>
    <?php if ($error !== ''): ?><p class="notice error"><?= ari_escape($error) ?></p><?php endif; ?>

    <form method="post" enctype="multipart/form-data">
      <input type="hidden" name="action" value="save">
      <input type="hidden" name="csrf" value="<?= ari_escape(ari_csrf_token()) ?>">

      <section class="panel">
        <h2>Polices</h2>
        <div class="grid">
          <?php foreach (['h1' => 'Grands titres', 'h2' => 'Titres de section', 'h3' => 'Petits titres', 'body' => 'Texte normal'] as $key => $label): ?>
            <p class="field"><label for="font_<?= $key ?>"><?= ari_escape($label) ?></label><select id="font_<?= $key ?>" name="font_<?= $key ?>">
              <?php foreach ($fontOptions as $value => $font): ?><option value="<?= ari_escape($value) ?>" <?= (($settings['fonts'][$key] ?? '') === $value) ? 'selected' : '' ?>><?= ari_escape($font['label']) ?></option><?php endforeach; ?>
            </select></p>
          <?php endforeach; ?>
        </div>
      </section>

      <section class="panel">
        <h2>Taille des grands titres</h2>
        <div class="page-sizes"><strong>Page</strong><strong>Ordinateur</strong><strong>Mobile</strong></div>
        <?php foreach ($pageSizeLabels as $prefix => $label): ?>
          <div class="page-sizes"><strong><?= ari_escape($label) ?></strong>
            <label class="field"><span class="muted">Pixels</span><input type="number" name="size_<?= $prefix ?>_h1_desktop" min="36" max="150" value="<?= (int)($settings['sizes'][$prefix . '_h1_desktop'] ?? 70) ?>"></label>
            <label class="field"><span class="muted">Pixels</span><input type="number" name="size_<?= $prefix ?>_h1_mobile" min="26" max="90" value="<?= (int)($settings['sizes'][$prefix . '_h1_mobile'] ?? 44) ?>"></label>
          </div>
        <?php endforeach; ?>
      </section>

      <section class="panel">
        <h2>Autres tailles de texte</h2>
        <div class="grid">
          <?php foreach ([
            'h2_desktop' => ['Titres de section — ordinateur', 28, 110], 'h2_mobile' => ['Titres de section — mobile', 24, 72],
            'h3_desktop' => ['Petits titres — ordinateur', 16, 60], 'h3_mobile' => ['Petits titres — mobile', 15, 46],
            'body_desktop' => ['Texte normal — ordinateur', 13, 32], 'body_mobile' => ['Texte normal — mobile', 13, 26],
          ] as $key => $meta): ?>
            <p class="field"><label for="size_<?= $key ?>"><?= ari_escape($meta[0]) ?></label><input id="size_<?= $key ?>" type="number" name="size_<?= $key ?>" min="<?= $meta[1] ?>" max="<?= $meta[2] ?>" value="<?= (int)($settings['sizes'][$key] ?? $defaults['sizes'][$key]) ?>"><small>Valeur en pixels</small></p>
          <?php endforeach; ?>
        </div>
      </section>

      <section class="panel">
        <h2>Photos des pages</h2>
        <p class="muted">Formats acceptés : JPG, PNG et WebP, 8 Mo maximum par image.</p>
        <?php foreach ($photosByPage as $page => $items): ?>
          <h3 class="photo-page"><?= ari_escape($page) ?></h3>
          <div class="photos">
            <?php foreach ($items as $slot => $meta): $current = ari_clean_image_url((string)($settings['images'][$slot] ?? '')) ?: $meta['default']; ?>
              <article class="photo-card">
                <img src="<?= ari_escape($current) ?>" alt="Aperçu <?= ari_escape($meta['label']) ?>">
                <h3><?= ari_escape($meta['label']) ?></h3>
                <input type="file" name="photo_<?= ari_escape($slot) ?>" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp">
                <?php if (!empty($settings['images'][$slot])): ?><label class="restore"><input type="checkbox" name="restore_image[<?= ari_escape($slot) ?>]" value="1"> Restaurer l’image d’origine</label><?php endif; ?>
              </article>
            <?php endforeach; ?>
          </div>
        <?php endforeach; ?>
      </section>

      <section class="panel">
        <h2>Sécurité</h2>
        <p class="muted">Laissez ces champs vides pour conserver le mot de passe actuel.</p>
        <div class="password-grid">
          <p class="field"><label for="new_password">Nouveau mot de passe</label><input id="new_password" name="new_password" type="password" minlength="12" autocomplete="new-password"></p>
          <p class="field"><label for="confirm_password">Confirmer le mot de passe</label><input id="confirm_password" name="confirm_password" type="password" minlength="12" autocomplete="new-password"></p>
        </div>
      </section>

      <div class="actions"><a class="button ghost" href="/" target="_blank" rel="noopener">Prévisualiser</a><button class="button" type="submit">Enregistrer les modifications</button></div>
    </form>
  </main>
</body>
</html>
