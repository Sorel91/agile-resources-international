<?php
declare(strict_types=1);
function ari_training_status_email(string $email, string $name, string $status, string $lang = 'fr', ?Closure $transport = null): bool {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !in_array($status, ['waitlist','confirmed'], true)) { return false; }
    $en = $lang === 'en';
    if ($status === 'waitlist') {
        $subject = $en ? 'ARI workshop — waiting list' : 'Formation ARI — liste d’attente';
        $message = $en
            ? "Hello {$name},\n\nYour registration has been received. You are on the waiting list for the free ARI career workshop. We will contact you if a place becomes available.\n\nAgile Resources International\ncontact@agileresources-intl.com"
            : "Bonjour {$name},\n\nVotre candidature à la formation gratuite ARI a bien été reçue. Vous êtes sur liste d’attente. Nous vous recontacterons si une place se libère.\n\nAgile Resources International\ncontact@agileresources-intl.com";
    } else {
        $subject = $en ? 'ARI workshop — registration confirmed' : 'Formation ARI — inscription confirmée';
        $message = $en
            ? "Hello {$name},\n\nA place has become available and your registration for the free ARI career workshop is now confirmed. The team will share the practical details with you.\n\nAgile Resources International\ncontact@agileresources-intl.com"
            : "Bonjour {$name},\n\nUne place s’est libérée : votre inscription à la formation gratuite ARI est maintenant confirmée. L’équipe vous communiquera les informations pratiques.\n\nAgile Resources International\ncontact@agileresources-intl.com";
    }
    $headers = "From: Agile Resources International <contact@agileresources-intl.com>\r\n"
        . "Reply-To: contact@agileresources-intl.com\r\nContent-Type: text/plain; charset=UTF-8";
    $subject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    return $transport ? (bool)$transport($email, $subject, $message, $headers) : @mail($email, $subject, $message, $headers);
}
