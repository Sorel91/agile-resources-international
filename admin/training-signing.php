<?php
declare(strict_types=1);

/** Hostinger keeps the private signing key; Supabase stores only its public counterpart. */
function ari_training_signing_key(): array {
    if (!is_dir(ARI_PRIVATE_DIR) && !@mkdir(ARI_PRIVATE_DIR, 0700, true) && !is_dir(ARI_PRIVATE_DIR)) {
        throw new RuntimeException('Stockage privé indisponible.');
    }
    $privateRoot = realpath(ARI_PRIVATE_DIR);
    $webRoot = realpath(dirname(__DIR__));
    if (!$privateRoot || !$webRoot || $privateRoot === $webRoot
        || strpos($privateRoot, $webRoot . DIRECTORY_SEPARATOR) === 0) {
        throw new RuntimeException('La clé doit rester hors du répertoire public.');
    }
    $path = $privateRoot . '/training-signing.pem';
    $lock = @fopen($privateRoot . '/training-signing.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) {
        throw new RuntimeException('Verrou de configuration indisponible.');
    }
    try {
        if (!is_file($path)) {
            $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
            if (!$key || !openssl_pkey_export($key, $pem)) {
                throw new RuntimeException('Création de la clé impossible.');
            }
            $tmp = $path . '.tmp-' . bin2hex(random_bytes(8));
            if (file_put_contents($tmp, $pem, LOCK_EX) === false) {
                throw new RuntimeException('Enregistrement de la clé impossible.');
            }
            @chmod($tmp, 0600);
            if (!rename($tmp, $path)) {
                @unlink($tmp);
                throw new RuntimeException('Installation de la clé impossible.');
            }
        }
        $pem = file_get_contents($path);
        $key = $pem ? openssl_pkey_get_private($pem) : false;
        $details = $key ? openssl_pkey_get_details($key) : false;
        if (!$key || !is_array($details) || empty($details['key'])) {
            throw new RuntimeException('Clé privée indisponible.');
        }
        $public = str_replace("\r\n", "\n", $details['key']);
        return ['private' => $key, 'public_key' => $public, 'key_id' => hash('sha256', $public)];
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

function ari_training_signed_headers(string $body, ?int $timestamp = null, ?string $nonce = null): array {
    $key = ari_training_signing_key();
    $timestamp = $timestamp ?? time();
    $nonce = $nonce ?? bin2hex(random_bytes(16));
    $canonical = $timestamp . "\n" . $nonce . "\n" . hash('sha256', $body);
    if (!openssl_sign($canonical, $signature, $key['private'], OPENSSL_ALGO_SHA256)) {
        throw new RuntimeException('Signature de la requête impossible.');
    }
    return [
        'Content-Type: application/json',
        'X-ARI-Key: ' . $key['key_id'],
        'X-ARI-Time: ' . $timestamp,
        'X-ARI-Nonce: ' . $nonce,
        'X-ARI-Signature: ' . base64_encode($signature),
    ];
}
