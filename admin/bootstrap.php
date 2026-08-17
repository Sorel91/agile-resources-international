<?php
declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) {
    $secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/admin',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

const ARI_DATA_DIR = __DIR__ . '/data';
const ARI_DEFAULT_SETTINGS_FILE = ARI_DATA_DIR . '/settings.default.json';
define('ARI_PRIVATE_DIR', dirname(__DIR__, 2) . '/ari-private');
define('ARI_SETTINGS_FILE', ARI_PRIVATE_DIR . '/settings.json');
define('ARI_UPLOAD_DIR', ARI_PRIVATE_DIR . '/uploads');
define('ARI_LEGACY_SETTINGS_FILE', ARI_DATA_DIR . '/settings.json');
define('ARI_LEGACY_UPLOAD_DIR', __DIR__ . '/../uploads/site');
define('ARI_LOCAL_CREDENTIALS_FILE', ARI_PRIVATE_DIR . '/credentials.php');
define('ARI_LEGACY_CREDENTIALS_FILE', ARI_DATA_DIR . '/credentials.local.php');

function ari_font_options(): array {
    return [
        'oswald' => ['label' => 'Oswald', 'css' => '"Oswald","Arial Narrow",Arial,sans-serif'],
        'cormorant' => ['label' => 'Cormorant Garamond', 'css' => '"Cormorant Garamond",Georgia,serif'],
        'georgia' => ['label' => 'Georgia', 'css' => 'Georgia,"Times New Roman",serif'],
        'arial' => ['label' => 'Arial', 'css' => 'Arial,Helvetica,sans-serif'],
        'times' => ['label' => 'Times New Roman', 'css' => '"Times New Roman",Times,serif'],
    ];
}

function ari_photo_slots(): array {
    return [
        'home_hero' => ['page' => 'Accueil', 'label' => 'Grande photo d’ouverture', 'default' => '/assets/mine.webp'],
        'home_enterprises' => ['page' => 'Accueil', 'label' => 'Carte Entreprises', 'default' => '/assets/solution-enterprises.webp'],
        'home_candidates' => ['page' => 'Accueil', 'label' => 'Carte Candidats', 'default' => '/assets/solution-candidates.webp'],
        'home_advice' => ['page' => 'Accueil', 'label' => 'Carte Conseil', 'default' => '/assets/solution-advice.webp'],
        'home_team' => ['page' => 'Accueil', 'label' => 'Grande photo de l’équipe', 'default' => '/assets/team.webp'],
        'industries_hero' => ['page' => 'Industries', 'label' => 'Photo principale', 'default' => '/assets/worker.webp'],
        'industries_quarry' => ['page' => 'Industries', 'label' => 'Grande photo de la carrière', 'default' => '/assets/quarry.webp'],
        'about_office' => ['page' => 'À propos', 'label' => 'Photo des collaborateurs', 'default' => '/assets/office.webp'],
        'about_vision' => ['page' => 'À propos', 'label' => 'Illustration Notre Vision', 'default' => '/assets/about-vision.webp'],
        'enterprise_hero' => ['page' => 'Entreprises', 'label' => 'Grande image de couverture', 'default' => '/assets/enterprise-hero.jpg'],
        'enterprise_card_1' => ['page' => 'Entreprises', 'label' => 'Carte Recherche exécutive', 'default' => '/assets/solution-enterprises.webp'],
        'enterprise_card_2' => ['page' => 'Entreprises', 'label' => 'Carte Réseau d’excellence', 'default' => '/assets/solution-candidates.webp'],
        'enterprise_card_3' => ['page' => 'Entreprises', 'label' => 'Carte Performance', 'default' => '/assets/solution-advice.webp'],
        'candidate_1' => ['page' => 'Candidats', 'label' => 'Photo 1 du bandeau', 'default' => '/assets/candidate-work.webp'],
        'candidate_2' => ['page' => 'Candidats', 'label' => 'Photo 2 du bandeau', 'default' => '/assets/candidate-success.webp'],
        'candidate_3' => ['page' => 'Candidats', 'label' => 'Photo 3 du bandeau', 'default' => '/assets/candidate-mobile.webp'],
        'candidate_guidance' => ['page' => 'Candidats', 'label' => 'Photo d’accompagnement', 'default' => '/assets/candidate-guidance.webp'],
        'contact_guidance' => ['page' => 'Contact', 'label' => 'Photo principale', 'default' => '/assets/contact-guidance.webp'],
    ];
}

function ari_default_settings(): array {
    $raw = @file_get_contents(ARI_DEFAULT_SETTINGS_FILE);
    $settings = $raw ? json_decode($raw, true) : null;
    return is_array($settings) ? $settings : [
        'fonts' => ['h1' => 'oswald', 'h2' => 'oswald', 'h3' => 'oswald', 'body' => 'cormorant'],
        'sizes' => [],
        'images' => [],
        'enabled' => [],
    ];
}

function ari_merge_settings(array $defaults, array $saved): array {
    $merged = $defaults;
    foreach (['fonts', 'sizes', 'images', 'enabled'] as $section) {
        if (isset($saved[$section]) && is_array($saved[$section])) {
            $merged[$section] = array_merge($merged[$section] ?? [], $saved[$section]);
        }
    }
    foreach (['h1', 'h2', 'h3', 'body'] as $fontKey) {
        if (empty($merged['enabled']['font_' . $fontKey])) {
            $merged['fonts'][$fontKey] = $defaults['fonts'][$fontKey];
        }
    }
    $sizeGroups = [
        'h1' => ['home_h1_desktop', 'home_h1_mobile', 'industries_h1_desktop', 'industries_h1_mobile', 'about_h1_desktop', 'about_h1_mobile', 'enterprise_h1_desktop', 'enterprise_h1_mobile', 'candidates_h1_desktop', 'candidates_h1_mobile', 'contact_h1_desktop', 'contact_h1_mobile'],
        'h2' => ['h2_desktop', 'h2_mobile'],
        'h3' => ['h3_desktop', 'h3_mobile'],
        'body' => ['body_desktop', 'body_mobile'],
    ];
    foreach ($sizeGroups as $group => $keys) {
        if (!empty($merged['enabled']['size_' . $group])) {
            continue;
        }
        foreach ($keys as $key) {
            $merged['sizes'][$key] = $defaults['sizes'][$key];
        }
    }
    return $merged;
}

function ari_load_settings(): array {
    $defaults = ari_default_settings();
    $source = is_file(ARI_SETTINGS_FILE) ? ARI_SETTINGS_FILE : ARI_LEGACY_SETTINGS_FILE;
    $raw = @file_get_contents($source);
    if (!$raw) {
        return $defaults;
    }
    $saved = json_decode($raw, true);
    if (is_array($saved) && $source === ARI_LEGACY_SETTINGS_FILE) {
        foreach (($saved['images'] ?? []) as $slot => $url) {
            if (!preg_match('#^/uploads/site/([A-Za-z0-9._-]+)$#', (string)$url, $matches)) {
                continue;
            }
            $legacyFile = ARI_LEGACY_UPLOAD_DIR . '/' . $matches[1];
            if (!is_file($legacyFile)) {
                continue;
            }
            if (!is_dir(ARI_UPLOAD_DIR)) {
                @mkdir(ARI_UPLOAD_DIR, 0755, true);
            }
            $privateFile = ARI_UPLOAD_DIR . '/' . $matches[1];
            if (@copy($legacyFile, $privateFile)) {
                @chmod($privateFile, 0640);
                $saved['images'][$slot] = '/admin/image.php?file=' . rawurlencode($matches[1]);
            }
        }
        ari_save_settings($saved);
    }
    return is_array($saved) ? ari_merge_settings($defaults, $saved) : $defaults;
}

function ari_atomic_write(string $path, string $contents): bool {
    if (!is_dir(dirname($path)) && !@mkdir(dirname($path), 0755, true)) {
        return false;
    }
    $temp = $path . '.tmp-' . bin2hex(random_bytes(5));
    if (@file_put_contents($temp, $contents, LOCK_EX) === false) {
        return false;
    }
    @chmod($temp, 0640);
    if (!@rename($temp, $path)) {
        @unlink($temp);
        return false;
    }
    return true;
}

function ari_save_settings(array $settings): bool {
    $json = json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    return is_string($json) && ari_atomic_write(ARI_SETTINGS_FILE, $json . "\n");
}

function ari_credentials(): array {
    foreach ([ARI_LOCAL_CREDENTIALS_FILE, ARI_LEGACY_CREDENTIALS_FILE] as $path) {
        if (!is_file($path)) {
            continue;
        }
        $credentials = require $path;
        if (is_array($credentials)) {
            return $credentials;
        }
    }
    return [];
}

function ari_has_credentials(): bool {
    $credentials = ari_credentials();
    return !empty($credentials['salt']) && !empty($credentials['hash']);
}

function ari_verify_password(string $password): bool {
    $credentials = ari_credentials();
    $salt = (string)($credentials['salt'] ?? '');
    $expected = (string)($credentials['hash'] ?? '');
    if ($salt === '' || $expected === '') {
        return false;
    }
    $actual = hash_pbkdf2('sha256', $password, $salt, 210000, 64, false);
    $valid = hash_equals($expected, $actual);
    if ($valid && !is_file(ARI_LOCAL_CREDENTIALS_FILE)) {
        ari_save_password($password);
    }
    return $valid;
}

function ari_save_password(string $password): bool {
    $salt = bin2hex(random_bytes(24));
    $hash = hash_pbkdf2('sha256', $password, $salt, 210000, 64, false);
    $php = "<?php\nreturn " . var_export(['salt' => $salt, 'hash' => $hash], true) . ";\n";
    return ari_atomic_write(ARI_LOCAL_CREDENTIALS_FILE, $php);
}

function ari_store_uploaded_image(array $upload, string $slot, string $mime): string {
    if (!is_dir(ARI_UPLOAD_DIR) && !@mkdir(ARI_UPLOAD_DIR, 0755, true)) {
        return '';
    }
    $base = $slot . '-' . gmdate('Ymd-His') . '-' . bin2hex(random_bytes(4));
    $loaders = [
        'image/jpeg' => 'imagecreatefromjpeg',
        'image/png' => 'imagecreatefrompng',
        'image/webp' => 'imagecreatefromwebp',
    ];
    $loader = $loaders[$mime] ?? '';
    if ($loader !== '' && function_exists($loader) && function_exists('imagewebp')) {
        $source = @$loader((string)$upload['tmp_name']);
        if ($source !== false) {
            $width = imagesx($source);
            $height = imagesy($source);
            $ratio = min(1, 1600 / max($width, $height));
            $targetWidth = max(1, (int)round($width * $ratio));
            $targetHeight = max(1, (int)round($height * $ratio));
            $target = imagecreatetruecolor($targetWidth, $targetHeight);
            imagealphablending($target, false);
            imagesavealpha($target, true);
            $transparent = imagecolorallocatealpha($target, 0, 0, 0, 127);
            imagefilledrectangle($target, 0, 0, $targetWidth, $targetHeight, $transparent);
            imagecopyresampled($target, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);
            $filename = $base . '.webp';
            $destination = ARI_UPLOAD_DIR . '/' . $filename;
            $stored = @imagewebp($target, $destination, 78);
            imagedestroy($target);
            imagedestroy($source);
            if ($stored) {
                @chmod($destination, 0640);
                return $filename;
            }
        }
    }
    $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $extension = $extensions[$mime] ?? '';
    if ($extension === '') {
        return '';
    }
    $filename = $base . '.' . $extension;
    $destination = ARI_UPLOAD_DIR . '/' . $filename;
    if (!@move_uploaded_file((string)$upload['tmp_name'], $destination)) {
        return '';
    }
    @chmod($destination, 0640);
    return $filename;
}

function ari_send_login_code(string $code): bool {
    $subject = 'Code de connexion au back-office ARI';
    $message = "Une demande de connexion au back-office ARI a été effectuée.\n\nVotre code temporaire est : {$code}\n\nCe code permet une seule connexion et expire dans 15 minutes. Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.";
    $headers = [
        'From: Agile Resources International <contact@agileresources-intl.com>',
        'Content-Type: text/plain; charset=UTF-8',
        'X-Mailer: PHP/' . PHP_VERSION,
    ];
    return @mail('contact@agileresources-intl.com', $subject, $message, implode("\r\n", $headers));
}

function ari_csrf_token(): string {
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(24));
    }
    return (string)$_SESSION['csrf'];
}

function ari_valid_csrf(string $token): bool {
    return !empty($_SESSION['csrf']) && hash_equals((string)$_SESSION['csrf'], $token);
}

function ari_is_authenticated(): bool {
    return !empty($_SESSION['ari_admin']);
}

function ari_escape(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function ari_clean_image_url(string $url): string {
    if (preg_match('#^/(?:assets|uploads/site)/[A-Za-z0-9._/-]+$#', $url)) {
        return $url;
    }
    return preg_match('#^/admin/image\.php\?file=[A-Za-z0-9._-]+$#', $url) ? $url : '';
}
