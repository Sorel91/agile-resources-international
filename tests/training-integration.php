<?php
declare(strict_types=1);
// Run only against a disposable MySQL database whose name starts with ari_test_.
require __DIR__ . '/../admin/bootstrap.php';
require __DIR__ . '/../admin/training-store.php';
$name = (string)getenv('ARI_TEST_DB_NAME');
if (!preg_match('/^ari_test_[a-zA-Z0-9_]+$/D', $name)) {
    fwrite(STDERR, "Set ARI_TEST_DB_NAME to a disposable ari_test_ database.\n");
    exit(2);
}
$config = ['host' => getenv('ARI_TEST_DB_HOST') ?: '127.0.0.1', 'name' => $name,
    'port' => (int)(getenv('ARI_TEST_DB_PORT') ?: 3306),
    'user' => getenv('ARI_TEST_DB_USER'), 'password' => getenv('ARI_TEST_DB_PASSWORD')];
$db = ari_training_db($config);
function check(bool $ok, string $message): void {
    if (!$ok) { throw new RuntimeException($message); }
}
try {
    $db->exec('DROP TABLE IF EXISTS ari_training_registrations');
    $db->exec('DROP TABLE IF EXISTS ari_training_events');
    ari_training_install($db);
    ari_training_install($db);
    check((int)$db->query('SELECT COUNT(*) FROM ari_training_events')->fetchColumn() === 1, 'Setup must be idempotent');
    $insert = $db->prepare("INSERT INTO ari_training_registrations
        (event_id, full_name, email, phone, situation, topics_json, status, consent_version, consent_at, created_at)
        VALUES (1, ?, ?, ?, 'Salarié', '[\"network\"]', ?, 'test-v1', UTC_TIMESTAMP(), UTC_TIMESTAMP())");
    for ($i = 1; $i <= 30; $i++) {
        $insert->execute(['Participant ' . $i, 'person' . $i . '@example.invalid', '+2250000000000', 'confirmed']);
    }
    $insert->execute(['Additional person', 'additional@example.invalid', '+2250000000000', 'pending']);
    $additional = (int)$db->lastInsertId();
    ari_training_set_status($db, $additional, 'confirmed');
    check((int)$db->query("SELECT COUNT(*) FROM ari_training_registrations WHERE status = 'confirmed'")->fetchColumn() === 31,
        'The informational mention of 30 places must not block the 31st confirmation');
    ari_training_set_status($db, $additional, 'confirmed');
    ari_training_set_status($db, $additional, 'pending');
    check(count(ari_training_rows($db, 'additional@example.invalid', 'pending')) === 1, 'Pending status');
    ari_training_set_status($db, $additional, 'cancelled');
    ari_training_set_status($db, $additional, 'confirmed');
    check(count(ari_training_rows($db, 'additional@example.invalid', 'confirmed')) === 1, 'Search and status filter');
    check(count(ari_training_rows($db, "' OR 1=1 --", '')) === 0, 'Search must remain parameterized');
    $duplicate = false;
    try { $insert->execute(['Duplicate', 'additional@example.invalid', '000', 'pending']); }
    catch (PDOException $e) { $duplicate = $e->getCode() === '23000'; }
    check($duplicate, 'Duplicate e-mail must be refused within a session');
    $invalidStatus = false;
    try { ari_training_set_status($db, $additional, 'unexpected'); }
    catch (InvalidArgumentException $e) { $invalidStatus = true; }
    check($invalidStatus, 'Reject invalid administrative status');
    check(ari_training_csv_cell('=1+1') === "'=1+1", 'CSV formula protection');
    check(ari_training_csv_cell('+2250000000000') === "'+2250000000000", 'Phone must remain text in export');
    check(ari_training_csv_cell('Normal name') === 'Normal name', 'Normal export value');
    ari_training_delete($db, $additional);
    check(count(ari_training_rows($db, 'additional@example.invalid', '')) === 0, 'Participant deletion');
    $data = ['full_name' => 'New registrant', 'email' => 'new@example.invalid',
        'phone' => '+2250000000000', 'situation' => 'Salarié', 'topics' => ['network'], 'consent' => true];
    $newId = ari_training_register($db, $data, 'test-v1');
    check($newId > 0, 'Internal form connector writer');
    check(count(ari_training_rows($db, 'new@example.invalid', 'pending')) === 1, 'New records are pending');
    $data['consent'] = false;
    $denied = false;
    try { ari_training_register($db, $data, 'test-v1'); }
    catch (InvalidArgumentException $e) { $denied = true; }
    check($denied, 'Consent required');
    echo "Training integration checks passed.\n";
} finally {
    if ($db->inTransaction()) { $db->rollBack(); }
    $db->exec('DROP TABLE IF EXISTS ari_training_registrations');
    $db->exec('DROP TABLE IF EXISTS ari_training_events');
}
