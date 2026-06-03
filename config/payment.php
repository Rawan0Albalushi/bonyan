<?php

return [
    'default_gateway' => env('DEFAULT_PAYMENT_GATEWAY', 'thawani'),

    'frontend_url' => env('FRONTEND_URL', env('APP_URL', 'http://localhost')),

    'gateways' => [
        'thawani' => [
            'public_key' => env('THAWANI_PUBLIC_KEY'),
            'secret_key' => env('THAWANI_SECRET_KEY'),
            'mode' => env('THAWANI_MODE', 'test'),
        ],
    ],
];
