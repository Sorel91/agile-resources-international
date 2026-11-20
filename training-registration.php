<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: same-origin');

function reply(int $status, array $data): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 7 * 1024 * 1024) {
    reply(413, ['message'=>'Le CV doit être un PDF de 5 Mo maximum.']);
}
$secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_name('ARI_TRAINING_FORM');
session_set_cookie_params(['lifetime'=>0,'path'=>'/training-registration.php','secure'=>$secure,'httponly'=>true,'samesite'=>'Strict']);
session_start();
require __DIR__ . '/admin/bootstrap.php';
require __DIR__ . '/admin/training-store.php';
require __DIR__ . '/admin/training-public.php';
require __DIR__ . '/admin/training-notifications.php';
$lang = (($_POST['lang'] ?? $_GET['lang'] ?? '') === 'en') ? 'en' : 'fr';
$en = $lang === 'en';

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'GET') {
        if (empty($_SESSION['training_csrf'])) {
            $_SESSION['training_csrf'] = bin2hex(random_bytes(32));
        }
        $_SESSION['training_form_started'] = time();
        $event = ari_training_db()->request(['action'=>'info']);
        reply(200, ['csrf'=>$_SESSION['training_csrf'],'event'=>$event]);
    }
    if ($method !== 'POST') { reply(405, ['message'=>'Méthode non autorisée.']); }
    $origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin !== '' && !in_array($origin, ['https://agileresources-intl.com','https://www.agileresources-intl.com'], true)) {
        reply(403, ['message'=>$en ? 'Please reopen the form from our website.' : 'Veuillez rouvrir le formulaire depuis notre site.']);
    }
    if (!is_string($_POST['csrf'] ?? null) || empty($_SESSION['training_csrf'])
        || !hash_equals((string)$_SESSION['training_csrf'], $_POST['csrf'])) {
        reply(403, ['message'=>$en ? 'Your session has expired. Close and reopen the form.' : 'Votre session a expiré. Fermez puis rouvrez le formulaire.']);
    }
    if (!empty($_POST['website'])) {
        reply(400, ['message'=>$en ? 'Unable to submit this request.' : 'L’envoi de cette demande est impossible.']);
    }
    if (time() - (int)($_SESSION['training_form_started'] ?? time()) < 2) {
        reply(429, ['message'=>$en ? 'Please wait a moment before submitting.' : 'Veuillez patienter quelques secondes avant de valider.']);
    }
    $fields = ari_training_public_fields($_POST);
    $upload = ari_training_require_cv(isset($_FILES['cv']) && is_array($_FILES['cv']) ? $_FILES['cv'] : null);
    $attempts = (array)($_SESSION['training_attempts'] ?? []);
    $attempts = array_values(array_filter($attempts, static fn($at) => (int)$at > time()-600));
    if (count($attempts) >= 6) {
        reply(429, ['message'=>$en ? 'Too many attempts. Please try again later.' : 'Trop de tentatives. Réessayez un peu plus tard.']);
    }
    $attempts[] = time();
    $_SESSION['training_attempts'] = $attempts;
    $privateKey = @file_get_contents(ARI_PRIVATE_DIR . '/training-signing.pem');
    if (!$privateKey) {
        ari_training_signing_key();
        $privateKey = @file_get_contents(ARI_PRIVATE_DIR . '/training-signing.pem');
    }
    if (!$privateKey) { throw new RuntimeException('Clé privée indisponible.'); }
    $fingerprint = hash_hmac('sha256', (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'), $privateKey);
    $store = ari_training_db();
    $rate = $store->request(['action'=>'rate','fingerprint'=>$fingerprint]);
    if (($rate['allowed'] ?? false) !== true) {
        reply(429, ['message'=>$en ? 'Too many attempts. Please try again later.' : 'Trop de tentatives. Réessayez un peu plus tard.']);
    }
    $registration = ari_training_register($store, $fields, 'training-registration-2026-11-20-v2', $upload);
    if ($registration['status'] === 'waitlist') {
        $sent = ari_training_status_email($fields['email'], $fields['first_name'] . ' ' . $fields['last_name'], 'waitlist', $lang);
        if (!$sent) { error_log('ARI waiting list notification could not be handed to mail transport.'); }
        $_SESSION['training_csrf'] = bin2hex(random_bytes(32));
        reply(200, ['ok'=>true,'status'=>'waitlist','message'=>$en
            ? 'Your registration has been received. You are on the waiting list. We will contact you if a place becomes available.'
            : 'Votre candidature a bien été reçue. Vous êtes sur liste d’attente. Nous vous recontacterons si une place se libère.']);
    }
    $_SESSION['training_csrf'] = bin2hex(random_bytes(32));
    reply(200, ['ok'=>true,'status'=>'pending','message'=>$en
        ? 'Your registration has been received. The team will contact you by email with the practical details.'
        : 'Votre inscription a bien été reçue. L’équipe vous communiquera les informations pratiques par e-mail.']);
} catch (InvalidArgumentException $e) {
    $message = $e->getMessage();
    if ($en) {
        $messages = [
            'Veuillez joindre votre CV au format PDF.'=>'Please attach your CV as a PDF.',
            'Une inscription existe déjà pour cet e-mail.'=>'This email address is already registered.',
            'Veuillez compléter tous les champs obligatoires.'=>'Please complete all required fields.',
            'Veuillez vérifier les champs obligatoires.'=>'Please check the required fields.',
            'Veuillez renseigner une adresse e-mail valide.'=>'Please enter a valid email address.',
            'Veuillez accepter l’utilisation de vos informations pour cette inscription.'=>'Please agree to the use of your details for this registration.',
            'Le CV doit être un PDF de 5 Mo maximum.'=>'Your CV must be a PDF no larger than 5 MB.',
            'Format de CV invalide.'=>'Please upload a valid PDF CV.',
        ];
        $message = $messages[$message] ?? 'Please check your details and your PDF CV.';
    }
    reply(400, ['message'=>$message]);
} catch (Throwable $e) {
    error_log('ARI public training registration: ' . get_class($e));
    reply(503, ['message'=>$en ? 'Registration is temporarily unavailable. Your details have not been cleared; please try again.' :
        'L’inscription est momentanément indisponible. Vos champs sont conservés : veuillez réessayer.']);
}
