<?php

return [
    'default_gateway' => env('DEFAULT_PAYMENT_GATEWAY', 'thawani'),

    'frontend_url' => env('FRONTEND_URL', env('APP_URL', 'http://localhost')),

    'gateways' => [
        'thawani' => [
            'public_key' => env('THAWANI_PUBLIC_KEY'),
            'secret_key' => env('THAWANI_SECRET_KEY'),
            'mode' => env('THAWANI_MODE', 'test'),
            // Thawani unit_amount is in baisa; API allows 1–5_000_000 (= 5_000 OMR max per line item).
            'max_amount_omr' => 5000,
            'max_unit_amount_baisa' => 5_000_000,
        ],
    ],
];
