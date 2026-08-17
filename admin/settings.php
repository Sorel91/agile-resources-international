<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

header('Content-Type: application/javascript; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$settings = ari_load_settings();
$slots = ari_photo_slots();
$images = [];
foreach (($settings['images'] ?? []) as $key => $url) {
    if (isset($slots[$key])) {
        $clean = ari_clean_image_url((string)$url);
        if ($clean !== '') {
            $images[$key] = $clean;
        }
    }
}

echo 'window.ARI_ADMIN_SETTINGS=';
echo json_encode(['images' => $images], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
echo ";\n";

