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
const ARI_SETTINGS_FILE = ARI_DATA_DIR . '/settings.json';
const ARI_DEFAULT_SETTINGS_FILE = ARI_DATA_DIR . '/settings.default.json';
const ARI_LOCAL_CREDENTIALS_FILE = ARI_DATA_DIR . '/credentials.local.php';
const ARI_UPLOAD_DIR = __DIR__ . '/../uploads/site';

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
        'home_hero' => ['page' => 'Accueil', 'label' => 'Grande photo d’ouverture', 'default' => '/assets/mine.jpg'],
        'home_enterprises' => ['page' => 'Accueil', 'label' => 'Carte Entreprises', 'default' => '/assets/solution-enterprises.jpg'],
        'home_candidates' => ['page' => 'Accueil', 'label' => 'Carte Candidats', 'default' => '/assets/solution-candidates.jpg'],
        'home_advice' => ['page' => 'Accueil', 'label' => 'Carte Conseil', 'default' => '/assets/solution-advice.jpg'],
        'home_team' => ['page' => 'Accueil', 'label' => 'Grande photo de l’équipe', 'default' => '/assets/team.jpg'],
        'industries_hero' => ['page' => 'Industries', 'label' => 'Photo principale', 'default' => '/assets/worker.jpg'],
        'industries_quarry' => ['page' => 'Industries', 'label' => 'Grande photo de la carrière', 'default' => '/assets/quarry.jpg'],
        'about_office' => ['page' => 'À propos', 'label' => 'Photo des collaborateurs', 'default' => '/assets/office.jpg'],
        'about_vision' => ['page' => 'À propos', 'label' => 'Illustration Notre Vision', 'default' => '/assets/about-vision.png'],
        'enterprise_hero' => ['page' => 'Entreprises', 'label' => 'Grande image de couverture', 'default' => '/assets/enterprise-hero.jpg'],
        'enterprise_card_1' => ['page' => 'Entreprises', 'label' => 'Carte Recherche exécutive', 'default' => '/assets/solution-enterprises.jpg'],
        'enterprise_card_2' => ['page' => 'Entreprises', 'label' => 'Carte Réseau d’excellence', 'default' => '/assets/solution-candidates.jpg'],
        'enterprise_card_3' => ['page' => 'Entreprises', 'label' => 'Carte Performance', 'default' => '/assets/solution-advice.jpg'],
        'candidate_1' => ['page' => 'Candidats', 'label' => 'Photo 1 du bandeau', 'default' => '/assets/candidate-work.jpg'],
        'candidate_2' => ['page' => 'Candidats', 'label' => 'Photo 2 du bandeau', 'default' => '/assets/candidate-success.jpg'],
        'candidate_3' => ['page' => 'Candidats', 'label' => 'Photo 3 du bandeau', 'default' => '/assets/candidate-mobile.jpg'],
        'candidate_guidance' => ['page' => 'Candidats', 'label' => 'Photo d’accompagnement', 'default' => '/assets/candidate-guidance.jpg'],
        'contact_guidance' => ['page' => 'Contact', 'label' => 'Photo principale', 'default' => '/assets/contact-guidance.jpg'],
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
    return $merged;
}

function ari_load_settings(): array {
    $defaults = ari_default_settings();
    $raw = @file_get_contents(ARI_SETTINGS_FILE);
    if (!$raw) {
        return $defaults;
    }
    $saved = json_decode($raw, true);
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
    if (!is_file(ARI_LOCAL_CREDENTIALS_FILE)) {
        return [];
    }
    $credentials = require ARI_LOCAL_CREDENTIALS_FILE;
    return is_array($credentials) ? $credentials : [];
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
    return hash_equals($expected, $actual);
}

function ari_save_password(string $password): bool {
    $salt = bin2hex(random_bytes(24));
    $hash = hash_pbkdf2('sha256', $password, $salt, 210000, 64, false);
    $php = "<?php\nreturn " . var_export(['salt' => $salt, 'hash' => $hash], true) . ";\n";
    return ari_atomic_write(ARI_LOCAL_CREDENTIALS_FILE, $php);
}

function ari_send_setup_code(string $code): bool {
    $subject = 'Code de création du back-office ARI';
    $message = "Votre code temporaire pour créer le mot de passe du back-office ARI est : {$code}\n\nCe code expire dans 15 minutes.";
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
    return preg_match('#^/(?:assets|uploads/site)/[A-Za-z0-9._/-]+$#', $url) ? $url : '';
}
