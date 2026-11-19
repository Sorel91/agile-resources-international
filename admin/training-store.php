<?php
declare(strict_types=1);

/** Private MySQL storage; uses the existing administration session. */
function ari_training_config_path(): string {
    return ARI_PRIVATE_DIR . '/training-database.php';
}

function ari_training_db(?array $config = null): PDO {
    if ($config === null) {
        if (!is_file(ari_training_config_path())) {
            throw new RuntimeException('Configurez d’abord la base de données Hostinger.');
        }
        $config = require ari_training_config_path();
    }
    if (!is_array($config)) {
        throw new RuntimeException('Configuration de base de données invalide.');
    }
    $host = (string)($config['host'] ?? '');
    $name = (string)($config['name'] ?? '');
    $port = (int)($config['port'] ?? 3306);
    if (!preg_match('/^[a-zA-Z0-9.-]+$/D', $host)
        || !preg_match('/^[a-zA-Z0-9_]+$/D', $name)
        || $port < 1 || $port > 65535) {
        throw new RuntimeException('Paramètres de connexion invalides.');
    }
    return new PDO(
        'mysql:host=' . $host . ';port=' . $port . ';dbname=' . $name . ';charset=utf8mb4',
        (string)($config['user'] ?? ''), (string)($config['password'] ?? ''),
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
         PDO::ATTR_EMULATE_PREPARES => false]
    );
}

function ari_training_install(PDO $db): void {
    $db->exec("CREATE TABLE IF NOT EXISTS ari_training_events (
        id INT UNSIGNED NOT NULL PRIMARY KEY,
        title VARCHAR(180) NOT NULL,
        event_date DATE NOT NULL,
        start_time VARCHAR(5) NOT NULL DEFAULT '',
        duration_minutes SMALLINT UNSIGNED NULL,
        location VARCHAR(500) NOT NULL DEFAULT '',
        format_mode VARCHAR(16) NOT NULL DEFAULT 'pending',
        capacity SMALLINT UNSIGNED NOT NULL DEFAULT 30,
        registration_open TINYINT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $db->exec("CREATE TABLE IF NOT EXISTS ari_training_registrations (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        event_id INT UNSIGNED NOT NULL,
        full_name VARCHAR(160) NOT NULL,
        email VARCHAR(254) NOT NULL,
        phone VARCHAR(40) NOT NULL,
        situation VARCHAR(100) NOT NULL DEFAULT '',
        topics_json TEXT NOT NULL,
        status VARCHAR(16) NOT NULL,
        cv_file VARCHAR(68) NULL,
        consent_version VARCHAR(64) NOT NULL,
        consent_at DATETIME NOT NULL,
        created_at DATETIME NOT NULL,
        UNIQUE KEY ari_training_email (event_id, email),
        KEY ari_training_status (event_id, status),
        CONSTRAINT ari_training_event_fk FOREIGN KEY (event_id)
            REFERENCES ari_training_events (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $q = $db->prepare("INSERT IGNORE INTO ari_training_events
        (id, title, event_date, capacity) VALUES (1, ?, '2026-11-21', 30)");
    $q->execute(['Ateliers carrière — Agile Resources']);
}

function ari_training_topics(): array {
    return [
        'network' => 'Développer son réseau professionnel',
        'profile' => 'Valoriser son CV, son profil LinkedIn et son pitch',
        'interview' => 'Préparer et réussir son entretien d’embauche',
    ];
}

function ari_training_cv_dir(): string {
    if (!is_dir(ARI_PRIVATE_DIR) && !mkdir(ARI_PRIVATE_DIR, 0700, true) && !is_dir(ARI_PRIVATE_DIR)) {
        throw new RuntimeException('Le stockage privé est indisponible.');
    }
    $base = realpath(ARI_PRIVATE_DIR);
    $root = realpath(dirname(__DIR__));
    if ($base === false || $root === false || $base === $root
        || strpos($base, $root . DIRECTORY_SEPARATOR) === 0) {
        throw new RuntimeException('Le stockage des CV doit être hors du répertoire public.');
    }
    $dir = $base . '/training-cvs';
    if (!is_dir($dir) && !mkdir($dir, 0700, true) && !is_dir($dir)) {
        throw new RuntimeException('Le stockage privé des CV est indisponible.');
    }
    return $dir;
}

function ari_training_cv_path(string $file): string {
    if (!preg_match('/^[a-f0-9]{64}\.pdf$/D', $file)) {
        throw new RuntimeException('Référence du CV invalide.');
    }
    return ari_training_cv_dir() . '/' . $file;
}

/** For the future public endpoint: PDF only, 5 MiB, never an original filename. */
function ari_training_store_cv(array $upload): ?string {
    $error = (int)($upload['error'] ?? UPLOAD_ERR_NO_FILE);
    if ($error === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    $tmp = (string)($upload['tmp_name'] ?? '');
    if ($error !== UPLOAD_ERR_OK || !is_uploaded_file($tmp)) {
        throw new InvalidArgumentException('L’envoi du CV a échoué.');
    }
    $size = filesize($tmp);
    if ($size === false || $size < 5 || $size > 5 * 1024 * 1024) {
        throw new InvalidArgumentException('Le CV doit être un PDF de 5 Mo maximum.');
    }
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($tmp);
    $handle = fopen($tmp, 'rb');
    $magic = $handle ? fread($handle, 5) : '';
    if ($handle) { fclose($handle); }
    if ($mime !== 'application/pdf' || $magic !== '%PDF-') {
        throw new InvalidArgumentException('Seuls les CV au format PDF sont acceptés.');
    }
    $name = bin2hex(random_bytes(32)) . '.pdf';
    if (!move_uploaded_file($tmp, ari_training_cv_path($name))) {
        throw new RuntimeException('Impossible de conserver le CV.');
    }
    chmod(ari_training_cv_path($name), 0600);
    return $name;
}

/** Shared capacity lock: every writer must lock the event before registration rows. */
function ari_training_set_status(PDO $db, int $id, string $status): void {
    if (!in_array($status, ['confirmed', 'waitlist', 'cancelled'], true)) {
        throw new InvalidArgumentException('Statut invalide.');
    }
    $db->beginTransaction();
    try {
        $event = $db->query('SELECT * FROM ari_training_events WHERE id = 1 FOR UPDATE')->fetch();
        if (!$event) { throw new RuntimeException('Formation introuvable.'); }
        $q = $db->prepare('SELECT id, status FROM ari_training_registrations WHERE id = ? AND event_id = 1 FOR UPDATE');
        $q->execute([$id]);
        $row = $q->fetch();
        if (!$row) { throw new InvalidArgumentException('Inscription introuvable.'); }
        if ($status === 'confirmed' && $row['status'] !== 'confirmed') {
            $count = (int)$db->query("SELECT COUNT(*) FROM ari_training_registrations WHERE event_id = 1 AND status = 'confirmed'")->fetchColumn();
            if ($count >= (int)$event['capacity']) {
                throw new InvalidArgumentException('Les 30 places sont prises. Conservez cette personne en liste d’attente.');
            }
        }
        $q = $db->prepare('UPDATE ari_training_registrations SET status = ? WHERE id = ? AND event_id = 1');
        $q->execute([$status, $id]);
        $db->commit();
    } catch (Throwable $e) {
        if ($db->inTransaction()) { $db->rollBack(); }
        throw $e;
    }
}

function ari_training_delete(PDO $db, int $id): void {
    $db->beginTransaction();
    try {
        $db->query('SELECT id FROM ari_training_events WHERE id = 1 FOR UPDATE')->fetch();
        $q = $db->prepare('SELECT cv_file FROM ari_training_registrations WHERE id = ? AND event_id = 1 FOR UPDATE');
        $q->execute([$id]);
        $row = $q->fetch();
        if (!$row) { throw new InvalidArgumentException('Inscription introuvable.'); }
        // Remove private attachment before committing deletion; a failed removal keeps the record.
        if (!empty($row['cv_file'])) {
            $path = ari_training_cv_path($row['cv_file']);
            if (is_file($path) && !unlink($path)) {
                throw new RuntimeException('Le CV n’a pas pu être supprimé ; l’inscription a été conservée.');
            }
        }
        $q = $db->prepare('DELETE FROM ari_training_registrations WHERE id = ? AND event_id = 1');
        $q->execute([$id]);
        $db->commit();
    } catch (Throwable $e) {
        if ($db->inTransaction()) { $db->rollBack(); }
        throw $e;
    }
}

function ari_training_rows(PDO $db, string $search, string $status): array {
    $sql = 'SELECT * FROM ari_training_registrations WHERE event_id = 1';
    $args = [];
    if ($search !== '') {
        $sql .= ' AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
        $term = '%' . $search . '%';
        $args = [$term, $term, $term];
    }
    if (in_array($status, ['confirmed', 'waitlist', 'cancelled'], true)) {
        $sql .= ' AND status = ?';
        $args[] = $status;
    }
    $q = $db->prepare($sql . ' ORDER BY created_at, id');
    $q->execute($args);
    return $q->fetchAll();
}

function ari_training_csv_cell(string $value): string {
    // Prevent spreadsheet formulas from untrusted names, phone numbers and e-mails.
    return preg_match('/^[\s\x00-\x1f]*[=+@-]/u', $value) ? "'" . $value : $value;
}
