<?php
declare(strict_types=1);

header('Content-Type: text/html; charset=UTF-8');

$siteLanguage = (string)($_POST['lang'] ?? $_GET['lang'] ?? '') === 'en' ? 'en' : 'fr';

function clean_line(string $value): string {
    return trim(str_replace(["\r", "\n"], ' ', $value));
}

function page(string $title, string $message, bool $success): void {
    global $siteLanguage;
    $english = [
        'Merci' => 'Thank you',
        'Votre demande a bien été prise en compte.' => 'Your request has been received.',
        'Demande incomplète' => 'Incomplete request',
        'Veuillez revenir au formulaire et vérifier les champs obligatoires.' => 'Please return to the form and check all required fields.',
        'Demande invalide' => 'Invalid request',
        'Le type de demande sélectionné n’est pas valide.' => 'The selected request type is not valid.',
        'CV manquant' => 'CV missing',
        'Veuillez sélectionner votre CV avant d’envoyer la candidature.' => 'Please select your CV before submitting your application.',
        'Fichier trop volumineux' => 'File too large',
        'Votre CV ne doit pas dépasser 5 Mo.' => 'Your CV must not exceed 5 MB.',
        'Format non accepté' => 'Unsupported format',
        'Veuillez transmettre un CV au format PDF, DOC ou DOCX.' => 'Please upload your CV as a PDF, DOC or DOCX file.',
        'Demande envoyée' => 'Request sent',
        'Envoi indisponible' => 'Sending unavailable',
        'Le message n’a pas pu être transmis automatiquement. Vous pouvez nous écrire à contact@agileresources-intl.com.' => 'Your message could not be sent automatically. You can email us at contact@agileresources-intl.com.',
    ];
    if ($siteLanguage === 'en') {
        $title = $english[$title] ?? $title;
        $message = $english[$message] ?? $message;
        if (str_starts_with($message, 'Merci ')) {
            $message = preg_replace('/^Merci (.+)\. Votre message a bien été transmis à notre équipe\. Nous vous répondrons dans les meilleurs délais\.$/u', 'Thank you $1. Your message has been sent to our team. We will reply as soon as possible.', $message) ?? $message;
        }
    }
    $safeTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    $safeMessage = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    $color = $success ? '#aa7c18' : '#a43131';
    $home = $siteLanguage === 'en' ? '/en' : '/';
    $back = $siteLanguage === 'en' ? 'Back to website' : 'Retour au site';
    echo '<!doctype html><html lang="'.$siteLanguage.'"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'.$safeTitle.' — ARI</title><style>body{margin:0;background:#f1f3f8;color:#1d3063;font-family:Georgia,serif}.box{max-width:720px;margin:10vh auto;background:#fff;padding:55px;border-radius:32px;text-align:center;box-shadow:0 15px 40px #1d30631a}.line{width:70px;border-top:4px solid '.$color.';margin:25px auto}h1{font-family:Arial Narrow,Arial,sans-serif;font-size:48px}p{font-size:18px;line-height:1.6}a{display:inline-block;margin-top:20px;padding:16px 30px;background:#aa7c18;color:#fff;text-decoration:none;border-radius:10px}</style></head><body><main class="box"><h1>'.$safeTitle.'</h1><div class="line"></div><p>'.$safeMessage.'</p><a href="'.$home.'">'.$back.'</a></main></body></html>';
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: '.($siteLanguage === 'en' ? '/en/contact' : '/contact'), true, 303);
    exit;
}

if (!empty($_POST['website'] ?? '')) {
    page('Merci', 'Votre demande a bien été prise en compte.', true);
}

$name = clean_line((string)($_POST['name'] ?? ''));
$email = clean_line((string)($_POST['email'] ?? ''));
$company = clean_line((string)($_POST['company'] ?? ''));
$phone = clean_line((string)($_POST['phone'] ?? ''));
$type = clean_line((string)($_POST['request_type'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));
$consent = (string)($_POST['consent'] ?? '');
$isCandidate = $type === 'candidat';

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $type === '' || (!$isCandidate && $message === '') || $consent !== 'yes') {
    page('Demande incomplète', 'Veuillez revenir au formulaire et vérifier les champs obligatoires.', false);
}

$allowedTypes = ['entreprise', 'candidat', 'catalogue', 'autre'];
if (!in_array($type, $allowedTypes, true)) {
    page('Demande invalide', 'Le type de demande sélectionné n’est pas valide.', false);
}

$to = 'contact@agileresources-intl.com';
$subject = 'Nouvelle demande ARI — '.$type;
$body = "Nouvelle demande depuis agileresources-intl.com\n\n".
        "Type : {$type}\nNom : {$name}\nE-mail : {$email}\nOrganisation : {$company}\nTéléphone : {$phone}\n\nMessage :\n{$message}\n";
$headers = [
    'From: Site ARI <contact@agileresources-intl.com>',
    'Reply-To: '.$email,
    'X-Mailer: PHP/'.PHP_VERSION,
];

if ($isCandidate) {
    $file = $_FILES['cv'] ?? null;
    if (!$file || (int)$file['error'] !== UPLOAD_ERR_OK) {
        page('CV manquant', 'Veuillez sélectionner votre CV avant d’envoyer la candidature.', false);
    }

    if ((int)$file['size'] > 5 * 1024 * 1024) {
        page('Fichier trop volumineux', 'Votre CV ne doit pas dépasser 5 Mo.', false);
    }

    $originalName = (string)$file['name'];
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $allowedExtensions = ['pdf', 'doc', 'docx'];
    if (!in_array($extension, $allowedExtensions, true)) {
        page('Format non accepté', 'Veuillez transmettre un CV au format PDF, DOC ou DOCX.', false);
    }

    $mimeTypes = [
        'pdf' => 'application/pdf',
        'doc' => 'application/msword',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    $safeFilename = preg_replace('/[^A-Za-z0-9._-]/', '_', basename($originalName)) ?: 'CV.'.$extension;
    $attachment = chunk_split(base64_encode((string)file_get_contents((string)$file['tmp_name'])));
    $boundary = 'ari_'.bin2hex(random_bytes(12));
    $textBody = $body;
    $body = "--{$boundary}\r\n".
            "Content-Type: text/plain; charset=UTF-8\r\n".
            "Content-Transfer-Encoding: 8bit\r\n\r\n".
            $textBody."\r\n\r\n".
            "--{$boundary}\r\n".
            "Content-Type: {$mimeTypes[$extension]}; name=\"{$safeFilename}\"\r\n".
            "Content-Transfer-Encoding: base64\r\n".
            "Content-Disposition: attachment; filename=\"{$safeFilename}\"\r\n\r\n".
            $attachment."\r\n--{$boundary}--\r\n";
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: multipart/mixed; boundary="'.$boundary.'"';
} else {
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
}

$sent = @mail($to, $subject, $body, implode("\r\n", $headers));
if ($sent) {
    page('Demande envoyée', 'Merci '.$name.'. Votre message a bien été transmis à notre équipe. Nous vous répondrons dans les meilleurs délais.', true);
}

page('Envoi indisponible', 'Le message n’a pas pu être transmis automatiquement. Vous pouvez nous écrire à contact@agileresources-intl.com.', false);
