<?php
/**
 * Quote request handler — texts each request to Howard.
 *
 * The form in index.html posts here. The same form serves painting, handyman
 * and welding; the "service" field says which one, and only that service's
 * extra fields are sent.
 *
 * ---------------------------------------------------------------------------
 * SETUP: pick ONE way to send the text and fill in its settings below.
 *
 *   'textbelt'  Easiest for testing. key 'textbelt' = 1 free text per day.
 *               Buy a key at https://textbelt.com for more.
 *   'twilio'    Best for production. Needs an account SID, auth token and a
 *               Twilio phone number (https://www.twilio.com/console).
 *   'email'     Free carrier email-to-text gateway via PHP mail(). You must
 *               know the carrier (e.g. Verizon 4352158489@vtext.com,
 *               AT&T 4352158489@txt.att.net, T-Mobile 4352158489@tmomail.net).
 *               Delivery is less reliable than the other two.
 *
 * Settings can also come from environment variables of the same name, which
 * keeps secrets out of the file.
 * ---------------------------------------------------------------------------
 */

$config = [
    'SMS_PROVIDER'       => 'textbelt',          // 'textbelt' | 'twilio' | 'email'
    'SMS_TO'             => '+14352158489',      // who gets the text (testing number)

    'TEXTBELT_KEY'       => 'textbelt',

    'TWILIO_ACCOUNT_SID' => '',
    'TWILIO_AUTH_TOKEN'  => '',
    'TWILIO_FROM'        => '',                  // your Twilio number, e.g. +14355550123

    'SMS_EMAIL_TO'       => '',                  // e.g. 4352158489@vtext.com
    'SMS_EMAIL_FROM'     => 'quotes@example.com',// an address on your own domain

    'BUSINESS_PHONE'     => '435-619-4656',
];

foreach ($config as $key => $value) {
    $env = getenv($key);
    if ($env !== false && $env !== '') $config[$key] = $env;
}

/* ------------------------------------------------------------------------ */

$SERVICES = [
    'painting' => [
        'label'  => 'PAINTING',
        'fields' => [
            'painting_scope' => 'Where',
            'painting_items' => 'Items',
            'painting_size'  => 'Size',
        ],
    ],
    'handyman' => [
        'label'  => 'HANDYMAN',
        'fields' => [
            'handyman_items' => 'Project',
            'handyman_size'  => 'Size',
        ],
    ],
    'welding' => [
        'label'  => 'WELDING',
        'fields' => [
            'welding_items'  => 'Build',
            'welding_size'   => 'Size',
            'welding_finish' => 'Finish',
        ],
    ],
];

$wantsJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

function respond(bool $ok, string $message, int $status = 200): void
{
    global $wantsJson;
    if ($wantsJson) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message]);
    } else {
        // plain form post (JavaScript off): go back to the page with a message
        $query = $ok ? 'sent=1' : 'error=' . rawurlencode($message);
        header('Location: index.html?' . $query . '#quote', true, 303);
    }
    exit;
}

/** One line of clean text: no control characters, collapsed whitespace, length-capped. */
function clean($value, int $max = 200): string
{
    if (is_array($value)) $value = implode(', ', array_map('strval', $value));
    $value = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', (string) $value);
    $value = trim(preg_replace('/\s+/u', ' ', $value));
    return mb_substr($value, 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: index.html#quote', true, 303);
    exit;
}

// Spam checks: hidden honeypot field filled, or the form submitted inhumanly fast.
// Bots get a fake success so they don't retry.
$started = (int) ($_POST['started'] ?? 0);
if (!empty($_POST['website']) || ($started > 0 && time() - $started < 3)) {
    respond(true, 'Thanks! Howard will get back to you soon.');
}

$service = $_POST['service'] ?? '';
if (!isset($SERVICES[$service])) {
    respond(false, 'Please choose painting, handyman or welding.', 422);
}

$name    = clean($_POST['name'] ?? '', 80);
$phone   = clean($_POST['phone'] ?? '', 30);
$email   = clean($_POST['email'] ?? '', 120);
$city    = clean($_POST['city'] ?? '', 80);
$timing  = clean($_POST['timeline'] ?? '', 60);
$details = clean($_POST['details'] ?? '', 600);

if ($name === '')                                     respond(false, 'Please add your name.', 422);
if (strlen(preg_replace('/\D/', '', $phone)) < 10)    respond(false, 'Please add a phone number with area code.', 422);
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) respond(false, 'That email doesn\'t look quite right.', 422);
if ($details === '')                                  respond(false, 'Please tell us a little about the job.', 422);

// Build the text message.
$lines   = ['New ' . $SERVICES[$service]['label'] . ' quote request', ''];
$lines[] = 'Name: ' . $name;
$lines[] = 'Phone: ' . $phone;
if ($email !== '') $lines[] = 'Email: ' . $email;
if ($city !== '')  $lines[] = 'City: ' . $city;
foreach ($SERVICES[$service]['fields'] as $field => $label) {
    $value = clean($_POST[$field] ?? '', 200);
    if ($value !== '') $lines[] = $label . ': ' . $value;
}
if ($timing !== '') $lines[] = 'When: ' . $timing;
$lines[] = '';
$lines[] = $details;

$message = implode("\n", $lines);

$sent = send_sms($config, $message, $error);
if (!$sent) {
    error_log('[contact.php] SMS failed: ' . $error);
    respond(false, 'Sorry, your request didn\'t go through. Please call or text ' . $config['BUSINESS_PHONE'] . '.', 502);
}

respond(true, 'Thanks, ' . $name . '! Your request was sent. Howard will get back to you soon.');

/* ------------------------------------------------------------------------ */

function send_sms(array $c, string $message, ?string &$error): bool
{
    $error = '';
    switch ($c['SMS_PROVIDER']) {
        case 'textbelt':
            $res = http_post('https://textbelt.com/text', [
                'phone'   => $c['SMS_TO'],
                'message' => $message,
                'key'     => $c['TEXTBELT_KEY'],
            ]);
            $data = json_decode($res['body'] ?? '', true);
            if (!empty($data['success'])) return true;
            $error = $res['error'] ?: ($data['error'] ?? ('textbelt: ' . ($res['body'] ?? 'no response')));
            return false;

        case 'twilio':
            if (!$c['TWILIO_ACCOUNT_SID'] || !$c['TWILIO_AUTH_TOKEN'] || !$c['TWILIO_FROM']) {
                $error = 'Twilio settings are missing';
                return false;
            }
            $url = 'https://api.twilio.com/2010-04-01/Accounts/' . rawurlencode($c['TWILIO_ACCOUNT_SID']) . '/Messages.json';
            $res = http_post($url, [
                'To'   => $c['SMS_TO'],
                'From' => $c['TWILIO_FROM'],
                'Body' => $message,
            ], $c['TWILIO_ACCOUNT_SID'] . ':' . $c['TWILIO_AUTH_TOKEN']);
            if ($res['status'] >= 200 && $res['status'] < 300) return true;
            $data  = json_decode($res['body'] ?? '', true);
            $error = $res['error'] ?: ('twilio ' . $res['status'] . ': ' . ($data['message'] ?? $res['body']));
            return false;

        case 'email':
            if (!$c['SMS_EMAIL_TO']) {
                $error = 'SMS_EMAIL_TO is not set';
                return false;
            }
            $headers = 'From: ' . $c['SMS_EMAIL_FROM'] . "\r\n" . 'Content-Type: text/plain; charset=utf-8';
            if (mail($c['SMS_EMAIL_TO'], 'Quote request', $message, $headers)) return true;
            $error = 'mail() returned false';
            return false;
    }
    $error = 'Unknown SMS_PROVIDER "' . $c['SMS_PROVIDER'] . '"';
    return false;
}

/** Small form-encoded POST helper. Uses cURL when available, streams otherwise. */
function http_post(string $url, array $fields, string $basicAuth = ''): array
{
    $body = http_build_query($fields);

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 15,
        ]);
        if ($basicAuth !== '') curl_setopt($ch, CURLOPT_USERPWD, $basicAuth);
        $resBody = curl_exec($ch);
        $result  = [
            'status' => (int) curl_getinfo($ch, CURLINFO_HTTP_CODE),
            'body'   => $resBody === false ? '' : $resBody,
            'error'  => $resBody === false ? curl_error($ch) : '',
        ];
        curl_close($ch);
        return $result;
    }

    $headers = "Content-Type: application/x-www-form-urlencoded\r\n";
    if ($basicAuth !== '') $headers .= 'Authorization: Basic ' . base64_encode($basicAuth) . "\r\n";
    $ctx = stream_context_create(['http' => [
        'method'        => 'POST',
        'header'        => $headers,
        'content'       => $body,
        'timeout'       => 15,
        'ignore_errors' => true,
    ]]);
    $resBody = @file_get_contents($url, false, $ctx);
    $status  = 0;
    if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) $status = (int) $m[1];
    return [
        'status' => $status,
        'body'   => $resBody === false ? '' : $resBody,
        'error'  => $resBody === false ? 'request failed' : '',
    ];
}
