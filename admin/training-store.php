<?php
declare(strict_types=1);
require_once __DIR__ . '/training-signing.php';

const ARI_TRAINING_ENDPOINT = 'https://urorvrgyxjbtivirtbpm.supabase.co/functions/v1/training-admin';

final class AriTrainingStore {
    private ?Closure $transport;
    public function __construct(?Closure $transport = null) { $this->transport = $transport; }
    public function request(array $payload): array {
        $body = json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $headers = ari_training_signed_headers($body);
        if ($this->transport !== null) {
            return ($this->transport)($body, $headers);
        }
        if (!function_exists('curl_init')) {
            throw new RuntimeException('Le module cURL PHP est requis pour les inscriptions.');
        }
        $response = '';
        $curl = curl_init(ARI_TRAINING_ENDPOINT);
        curl_setopt_array($curl, [
            CURLOPT_POST => true, CURLOPT_POSTFIELDS => $body, CURLOPT_HTTPHEADER => $headers,
            CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 45,
            CURLOPT_FOLLOWLOCATION => false, CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_WRITEFUNCTION => static function ($handle, string $chunk) use (&$response): int {
                if (strlen($response) + strlen($chunk) > 10 * 1024 * 1024) { return 0; }
                $response .= $chunk;
                return strlen($chunk);
            },
        ]);
        $ok = curl_exec($curl);
        $status = (int)curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        curl_close($curl);
        $data = json_decode($response, true);
        if ($ok === false || !is_array($data)) {
            throw new RuntimeException('La connexion aux inscriptions est momentanément indisponible.');
        }
        if ($status < 200 || $status >= 300) {
            if (in_array($status, [400, 404, 409], true)) {
                throw new InvalidArgumentException((string)($data['error'] ?? 'Opération impossible.'));
            }
            throw new RuntimeException('Le service des inscriptions est momentanément indisponible.');
        }
        return $data;
    }
}

function ari_training_db(): AriTrainingStore { return new AriTrainingStore(); }

function ari_training_topics(): array {
    return [
        'network' => 'Développer son réseau professionnel',
        'profile' => 'Valoriser son CV, son profil LinkedIn et son pitch',
        'interview' => 'Préparer et réussir son entretien d’embauche',
    ];
}

function ari_training_set_status(AriTrainingStore $store, int $id, string $status): void {
    if ($id < 1 || !in_array($status, ['pending', 'confirmed', 'cancelled'], true)) {
        throw new InvalidArgumentException('Statut ou inscription invalide.');
    }
    $store->request(['action' => 'status', 'id' => $id, 'status' => $status]);
}

function ari_training_delete(AriTrainingStore $store, int $id): void {
    if ($id < 1) { throw new InvalidArgumentException('Inscription invalide.'); }
    $store->request(['action' => 'delete', 'id' => $id]);
}

function ari_training_rows(AriTrainingStore $store, string $search, string $status): array {
    $rows = [];
    $offset = 0;
    do {
        $page = $store->request(['action' => 'list', 'q' => $search, 'status' => $status, 'offset' => $offset]);
        foreach ($page as $row) {
            if (!is_array($row) || !isset($row['id'])) { throw new RuntimeException('Liste des inscriptions invalide.'); }
            $rows[] = $row;
        }
        $offset += count($page);
    } while (count($page) === 500);
    return $rows;
}

/** PDF only; no upload endpoint is exposed until the public form is connected. */
function ari_training_upload_data(array $upload): ?string {
    $error = (int)($upload['error'] ?? UPLOAD_ERR_NO_FILE);
    if ($error === UPLOAD_ERR_NO_FILE) { return null; }
    $tmp = (string)($upload['tmp_name'] ?? '');
    if ($error !== UPLOAD_ERR_OK || !is_uploaded_file($tmp)) {
        throw new InvalidArgumentException('L’envoi du CV a échoué.');
    }
    $size = filesize($tmp);
    if ($size === false || $size < 5 || $size > 5 * 1024 * 1024
        || (new finfo(FILEINFO_MIME_TYPE))->file($tmp) !== 'application/pdf') {
        throw new InvalidArgumentException('Le CV doit être un PDF de 5 Mo maximum.');
    }
    $bytes = file_get_contents($tmp);
    if ($bytes === false || substr($bytes, 0, 5) !== '%PDF-') {
        throw new InvalidArgumentException('Format de CV invalide.');
    }
    return base64_encode($bytes);
}

function ari_training_register(AriTrainingStore $store, array $input, string $consentVersion, ?array $upload = null): int {
    if (($input['consent'] ?? false) !== true || $consentVersion === '' || strlen($consentVersion) > 64) {
        throw new InvalidArgumentException('Le consentement est requis.');
    }
    $result = $store->request([
        'action' => 'register',
        'first_name' => (string)($input['first_name'] ?? ''),
        'last_name' => (string)($input['last_name'] ?? ''),
        'city' => (string)($input['city'] ?? ''),
        'residence_country' => (string)($input['residence_country'] ?? ''),
        'education_domain' => (string)($input['education_domain'] ?? ''),
        'email' => (string)($input['email'] ?? ''),
        'phone' => (string)($input['phone'] ?? ''),
        'situation' => (string)($input['situation'] ?? ''),
        'topics' => $input['topics'] ?? [],
        'consent' => true, 'consent_version' => $consentVersion,
        'cv_base64' => $upload === null ? null : ari_training_upload_data($upload),
    ]);
    return (int)$result['id'];
}

function ari_training_cv_bytes(AriTrainingStore $store, int $id): string {
    if ($id < 1) { throw new InvalidArgumentException('Inscription invalide.'); }
    $result = $store->request(['action' => 'cv', 'id' => $id]);
    $bytes = base64_decode((string)($result['base64'] ?? ''), true);
    if ($bytes === false || strlen($bytes) > 5 * 1024 * 1024 || substr($bytes, 0, 5) !== '%PDF-') {
        throw new RuntimeException('CV invalide.');
    }
    return $bytes;
}

function ari_training_csv_cell(string $value): string {
    return preg_match('/^[\s\x00-\x1f]*[=+@-]/u', $value) ? "'" . $value : $value;
}
