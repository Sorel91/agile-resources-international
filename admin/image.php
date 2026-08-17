<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

$filename = (string)($_GET['file'] ?? '');
if (!preg_match('/\A[A-Za-z0-9._-]+\z/', $filename)) {
    http_response_code(404);
    exit;
}

$path = ARI_UPLOAD_DIR . '/' . $filename;
if (!is_file($path)) {
    $legacy = ARI_LEGACY_UPLOAD_DIR . '/' . $filename;
    $path = is_file($legacy) ? $legacy : '';
}
if ($path === '') {
    http_response_code(404);
    exit;
}

$info = @getimagesize($path);
$mime = is_array($info) ? (string)($info['mime'] ?? '') : '';
if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
    http_response_code(404);
    exit;
}

header('Content-Type: ' . $mime);
header('Content-Length: ' . (string)filesize($path));
header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=31536000, immutable');
readfile($path);
