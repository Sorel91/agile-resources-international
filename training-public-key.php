<?php
declare(strict_types=1);
require __DIR__ . '/admin/bootstrap.php';
require __DIR__ . '/admin/training-signing.php';
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    http_response_code(405);
    exit;
}
try {
    $key = ari_training_signing_key();
    // Public key only. This endpoint never signs requests or exposes the private key.
    echo json_encode(['key_id' => $key['key_id'], 'public_key' => $key['public_key']], JSON_THROW_ON_ERROR);
} catch (Throwable $e) {
    http_response_code(503);
    echo '{"error":"Configuration de la liaison indisponible."}';
}
