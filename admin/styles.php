<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

header('Content-Type: text/css; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$settings = ari_load_settings();
$fonts = ari_font_options();
$fontSettings = $settings['fonts'] ?? [];
$sizes = $settings['sizes'] ?? [];
$images = $settings['images'] ?? [];
$enabled = $settings['enabled'] ?? [];

function ari_css_font(array $fonts, array $settings, string $key, string $fallback): string {
    $choice = (string)($settings[$key] ?? $fallback);
    return (string)($fonts[$choice]['css'] ?? $fonts[$fallback]['css']);
}

function ari_css_size(array $sizes, string $key, int $fallback, int $min, int $max): int {
    $value = (int)($sizes[$key] ?? $fallback);
    return max($min, min($max, $value));
}

$h1Font = ari_css_font($fonts, $fontSettings, 'h1', 'oswald');
$h2Font = ari_css_font($fonts, $fontSettings, 'h2', 'oswald');
$h3Font = ari_css_font($fonts, $fontSettings, 'h3', 'oswald');
$bodyFont = ari_css_font($fonts, $fontSettings, 'body', 'cormorant');

$pageTitles = [
    '.home-hero h1' => ['home_h1_desktop', 'home_h1_mobile', 82, 47],
    '.industry-hero h1' => ['industries_h1_desktop', 'industries_h1_mobile', 77, 47],
    '.about-hero h1' => ['about_h1_desktop', 'about_h1_mobile', 78, 47],
    '.enterprise-cover h1' => ['enterprise_h1_desktop', 'enterprise_h1_mobile', 72, 43],
    '.candidate-intro h1' => ['candidates_h1_desktop', 'candidates_h1_mobile', 64, 42],
    '.contact-process h1' => ['contact_h1_desktop', 'contact_h1_mobile', 66, 43],
];

echo "/* Réglages générés par le back-office ARI. */\n";
if (!empty($enabled['font_h1'])) echo 'h1{font-family:' . $h1Font . "!important}\n";
if (!empty($enabled['font_h2'])) echo 'h2{font-family:' . $h2Font . "!important}\n";
if (!empty($enabled['font_h3'])) echo 'h3{font-family:' . $h3Font . "!important}\n";
if (!empty($enabled['font_body'])) echo 'body,p,input,textarea,select,button,.button{font-family:' . $bodyFont . "!important}\n";

if (!empty($enabled['size_h1'])) {
    foreach ($pageTitles as $selector => $values) {
        [$desktopKey, $mobileKey, $desktopDefault, $mobileDefault] = $values;
        $desktop = ari_css_size($sizes, $desktopKey, $desktopDefault, 36, 150);
        $mobile = ari_css_size($sizes, $mobileKey, $mobileDefault, 26, 90);
        echo $selector . '{font-size:clamp(' . $mobile . 'px,5vw,' . $desktop . "px)!important}\n";
    }
}

$h2Desktop = ari_css_size($sizes, 'h2_desktop', 74, 28, 110);
$h2Mobile = ari_css_size($sizes, 'h2_mobile', 45, 24, 72);
$h3Desktop = ari_css_size($sizes, 'h3_desktop', 23, 16, 60);
$h3Mobile = ari_css_size($sizes, 'h3_mobile', 21, 15, 46);
$bodyDesktop = ari_css_size($sizes, 'body_desktop', 17, 13, 32);
$bodyMobile = ari_css_size($sizes, 'body_mobile', 16, 13, 26);

if (!empty($enabled['size_h2'])) echo 'h2{font-size:clamp(' . $h2Mobile . 'px,4vw,' . $h2Desktop . "px)!important}\n";
if (!empty($enabled['size_h3'])) echo 'h3{font-size:clamp(' . $h3Mobile . 'px,2.2vw,' . $h3Desktop . "px)!important}\n";
if (!empty($enabled['size_body'])) echo 'p{font-size:' . $bodyDesktop . "px!important}\n";

$enterpriseImage = ari_clean_image_url((string)($images['enterprise_hero'] ?? ''));
if ($enterpriseImage !== '') {
    $safeUrl = str_replace(['\\', '"', "'", '(', ')'], '', $enterpriseImage);
    echo '.enterprise-cover::before{background-image:linear-gradient(90deg,rgba(8,14,25,.84),rgba(8,14,25,.18)),url("' . $safeUrl . '")!important}' . "\n";
}

echo '@media(max-width:650px){';
if (!empty($enabled['size_h1'])) {
    foreach ($pageTitles as $selector => $values) {
        $mobile = ari_css_size($sizes, $values[1], $values[3], 26, 90);
        echo $selector . '{font-size:' . $mobile . 'px!important}';
    }
}
if (!empty($enabled['size_h2'])) echo 'h2{font-size:' . $h2Mobile . 'px!important}';
if (!empty($enabled['size_h3'])) echo 'h3{font-size:' . $h3Mobile . 'px!important}';
if (!empty($enabled['size_body'])) echo 'p{font-size:' . $bodyMobile . 'px!important}';
echo "}\n";
