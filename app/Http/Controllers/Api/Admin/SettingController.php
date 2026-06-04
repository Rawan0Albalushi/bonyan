<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function __construct(
        private readonly SettingsService $settingsService,
    ) {}

    public function index(): JsonResponse
    {
        $defaults = $this->settingsService->defaults();
        $stored = $this->settingsService->all()->pluck('value', 'key')->toArray();

        return response()->json([
            'data' => array_merge($defaults, $stored),
            'keys' => $this->settingsService->all(),
        ]);
    }

    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $this->settingsService->updateMany($request->validated('settings'));
        $defaults = $this->settingsService->defaults();
        $stored = $this->settingsService->all()->pluck('value', 'key')->toArray();

        return response()->json([
            'message' => __('messages.settings_updated'),
            'data' => array_merge($defaults, $stored),
        ]);
    }
}
