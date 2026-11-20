<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
define('ARI_PRIVATE_DIR', sys_get_temp_dir() . '/ari-training-tests-' . bin2hex(random_bytes(8)));
require __DIR__ . '/../admin/training-store.php';
function check(bool $ok, string $label): void {
    if (!$ok) { throw new RuntimeException($label); }
}
try {
    $key = ari_training_signing_key();
    check(ari_training_signing_key()['key_id'] === $key['key_id'], 'Persistent signing key');
    check(strpos($key['public_key'], 'PRIVATE') === false, 'Public key only');
    check((fileperms(ARI_PRIVATE_DIR . '/training-signing.pem') & 0777) === 0600, 'Private file permissions');
    $body = '{"action":"summary"}';
    $headers = ari_training_signed_headers($body, 1795184000, str_repeat('a', 32));
    $map = [];
    foreach ($headers as $header) {
        [$name, $value] = explode(': ', $header, 2);
        $map[$name] = $value;
    }
    $canonical = "1795184000\n" . str_repeat('a',32) . "\n" . hash('sha256',$body);
    check(openssl_verify($canonical, base64_decode($map['X-ARI-Signature']), $key['public_key'], OPENSSL_ALGO_SHA256) === 1, 'Valid request signature');
    check(openssl_verify($canonical . 'tampered', base64_decode($map['X-ARI-Signature']), $key['public_key'], OPENSSL_ALGO_SHA256) === 0, 'Tampering refused');

    $calls = [];
    $transport = static function(string $body, array $headers) use (&$calls): array {
        $data = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
        $calls[] = $data;
        switch ($data['action']) {
            case 'list':
                if ($data['offset'] === 0) { return array_fill(0,500,['id'=>1]); }
                return [['id'=>501]];
            case 'cv': return ['base64'=>base64_encode("%PDF-1.4\nfixture")];
            case 'register': return ['id'=>72];
            default: return ['ok'=>true];
        }
    };
    $store = new AriTrainingStore($transport);
    check(count(ari_training_rows($store,'name','confirmed')) === 501,'Paginated export fetches all rows');
    ari_training_set_status($store,31,'confirmed');
    check(end($calls)['id'] === 31,'31st confirmation is permitted');
    $invalid = false;
    try { ari_training_set_status($store,1,'waitlist'); } catch (InvalidArgumentException $e) { $invalid = true; }
    check($invalid,'Invalid status refused');
    check(ari_training_cv_bytes($store,1) === "%PDF-1.4\nfixture",'Protected CV decoding');
    check(ari_training_register($store,['consent'=>true], 'test-v1') === 72,'Registration writer connection');
    $denied = false;
    try { ari_training_register($store,['consent'=>false], 'test-v1'); } catch (InvalidArgumentException $e) { $denied = true; }
    check($denied,'Consent required');
    check(ari_training_csv_cell('=1+1') === "'=1+1",'CSV formula neutralized');
    check(ari_training_csv_cell('+2250000000000') === "'+2250000000000",'Phone remains text');
    check(ari_training_upload_data(['error'=>UPLOAD_ERR_NO_FILE]) === null,'CV optional');
    echo "PHP Supabase client checks passed.\n";
} finally {
    foreach (glob(ARI_PRIVATE_DIR . '/*') ?: [] as $file) { unlink($file); }
    if (is_dir(ARI_PRIVATE_DIR)) { rmdir(ARI_PRIVATE_DIR); }
}
