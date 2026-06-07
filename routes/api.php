<?php

use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\DonationController as AdminDonationController;
use App\Http\Controllers\Api\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Api\Admin\SettingController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\Public\DonationController;
use App\Http\Controllers\Api\Public\ProjectController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('payments/success', [PaymentController::class, 'success'])->name('payment.success');
    Route::get('payments/cancel', [PaymentController::class, 'cancel'])->name('payment.cancel');
    Route::post('payments/webhook', [PaymentController::class, 'webhook'])->name('payment.webhook');
    Route::get('payments/status/{donationId}', [PaymentController::class, 'status']);

    Route::prefix('public')->group(function (): void {
        Route::get('projects/active', [ProjectController::class, 'active']);
        Route::post('donations', [DonationController::class, 'store']);
        Route::get('donations/confirm/{reference}', [DonationController::class, 'confirmation']);
    });

    Route::prefix('admin')->group(function (): void {
        Route::post('login', [AuthController::class, 'login']);

        Route::middleware(['auth:sanctum', 'admin'])->group(function (): void {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
            Route::get('dashboard', [DashboardController::class, 'index']);

            Route::apiResource('projects', AdminProjectController::class);
            Route::get('donations/export', [AdminDonationController::class, 'export']);
            Route::get('donations', [AdminDonationController::class, 'index']);
            Route::get('donations/{donation}', [AdminDonationController::class, 'show']);

            Route::get('settings', [SettingController::class, 'index']);
            Route::put('settings', [SettingController::class, 'update']);
        });
    });
});
