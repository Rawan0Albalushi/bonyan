<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Donation;
use App\Models\Project;
use App\Services\PaymentService;

$project = Project::query()->where('is_active', true)->first();

if (! $project) {
    echo "No active project. Run seeders first.\n";
    exit(1);
}

$donation = Donation::query()->create([
    'project_id' => $project->id,
    'amount' => 1.0,
    'phone' => '90000000',
    'status' => 'pending',
    'payment_method' => 'thawani',
    'payment_gateway' => 'thawani',
]);

$service = app(PaymentService::class);
$service->switchGateway('thawani');

try {
    $response = $service->createPaymentLink([
        'model_type' => Donation::class,
        'model_id' => $donation->id,
        'amount' => 1.0,
        'currency' => 'OMR',
        'description' => 'Test Donation',
    ]);

    echo "session_id: {$response->sessionId}\n";
    echo "payment_link: {$response->paymentLink}\n";
} catch (\Throwable $e) {
    echo 'Error: '.$e->getMessage()."\n";
    exit(1);
}
