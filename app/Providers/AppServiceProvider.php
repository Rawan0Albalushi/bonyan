<?php

namespace App\Providers;

use App\Contracts\NotificationServiceInterface;
use App\Services\NullNotificationService;
use App\Services\PaymentService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(NotificationServiceInterface::class, NullNotificationService::class);
        $this->app->singleton(PaymentService::class);
    }

    public function boot(): void
    {
        //
    }
}
