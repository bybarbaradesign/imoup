<?php
$url = 'https://bybarbaradesign.github.io/imoup/';
$response = wp_remote_get($url, ['timeout' => 20]);

if (is_wp_error($response)) {
    status_header(500);
    echo 'Nao foi possivel carregar a nova homepage.';
    exit;
}

$html = wp_remote_retrieve_body($response);

$replacements = [
    'href="styles.css"' => 'href="https://bybarbaradesign.github.io/imoup/styles.css"',
    'src="script.js"' => 'src="https://bybarbaradesign.github.io/imoup/script.js"',
    'href="favicon-imoup.png"' => 'href="https://bybarbaradesign.github.io/imoup/favicon-imoup.png"',
    'content="https://bybarbaradesign.github.io/imoup/favicon-imoup.png"' => 'content="https://bybarbaradesign.github.io/imoup/favicon-imoup.png"',
    'src="logo-imoup.png"' => 'src="https://bybarbaradesign.github.io/imoup/logo-imoup.png"',
    'src="orador.png"' => 'src="https://bybarbaradesign.github.io/imoup/orador.png"',
    'src="pagamentos.png"' => 'src="https://bybarbaradesign.github.io/imoup/pagamentos.png"',
    'src="venue-local.png"' => 'src="https://bybarbaradesign.github.io/imoup/venue-local.png"',
];

$html = str_replace(array_keys($replacements), array_values($replacements), $html);

echo $html;
