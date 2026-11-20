<?php
declare(strict_types=1);

function ari_training_public_fields(array $input): array {
    $result = [];
    foreach (['first_name'=>80,'last_name'=>80,'city'=>120,'residence_country'=>100,'education_domain'=>180] as $field=>$max) {
        $value = $input[$field] ?? null;
        if (!is_string($value)) { throw new InvalidArgumentException('Veuillez compléter tous les champs obligatoires.'); }
        $value = trim($value);
        if (!preg_match('/^.{1,' . $max . '}$/usD', $value) || preg_match('/[\x00-\x1f\x7f]/u', $value)) {
            throw new InvalidArgumentException('Veuillez vérifier les champs obligatoires.');
        }
        $result[$field] = $value;
    }
    $email = $input['email'] ?? null;
    if (!is_string($email) || strlen($email) > 254 || !filter_var(trim($email), FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('Veuillez renseigner une adresse e-mail valide.');
    }
    if (($input['consent'] ?? '') !== '1') {
        throw new InvalidArgumentException('Veuillez accepter l’utilisation de vos informations pour cette inscription.');
    }
    $result['email'] = strtolower(trim($email));
    $result['consent'] = true;
    $result['topics'] = ['network','profile','interview'];
    return $result;
}
