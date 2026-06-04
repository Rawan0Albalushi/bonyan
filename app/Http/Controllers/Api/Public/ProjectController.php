<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Services\ProjectService;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    public function __construct(
        private readonly ProjectService $projectService,
        private readonly SettingsService $settingsService,
    ) {}

    public function active(): JsonResponse
    {
        $project = $this->projectService->getActiveProject();

        if (! $project) {
            return response()->json([
                'data' => null,
                'settings' => $this->buildPublicSettings(),
                'message' => __('messages.no_active_project'),
            ]);
        }

        return response()->json([
            'data' => new ProjectResource($project),
            'settings' => $this->buildPublicSettings(),
        ]);
    }

    private function buildPublicSettings(): array
    {
        $defaults = $this->settingsService->defaults();
        $stored = $this->settingsService->all()->pluck('value', 'key')->toArray();

        $settings = array_merge($defaults, $stored);
        $settings['max_donation_amount'] = $this->settingsService->maxDonationAmountOmr();

        return $settings;
    }
}
