<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\DonationStatus;
use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $activeProject = Project::query()->where('is_active', true)->first();

        return response()->json([
            'stats' => [
                'total_donations' => Donation::query()->where('status', DonationStatus::Completed)->count(),
                'total_raised' => (float) Donation::query()->where('status', DonationStatus::Completed)->sum('amount'),
                'today_donations' => Donation::query()
                    ->where('status', DonationStatus::Completed)
                    ->whereDate('created_at', today())
                    ->count(),
                'today_raised' => (float) Donation::query()
                    ->where('status', DonationStatus::Completed)
                    ->whereDate('created_at', today())
                    ->sum('amount'),
                'active_project' => $activeProject ? [
                    'id' => $activeProject->id,
                    'title' => $activeProject->localizedTitle(app()->getLocale()),
                    'title_ar' => $activeProject->title_ar,
                    'title_en' => $activeProject->title_en,
                    'progress_percentage' => $activeProject->progressPercentage(),
                    'raised_amount' => (float) $activeProject->raised_amount,
                    'goal_amount' => (float) $activeProject->goal_amount,
                ] : null,
            ],
            'recent_donations' => Donation::query()
                ->with('project')
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn ($d) => [
                    'id' => $d->id,
                    'reference' => $d->reference,
                    'amount' => (float) $d->amount,
                    'phone' => $d->phone,
                    'created_at' => $d->created_at?->toIso8601String(),
                    'project_title' => $d->project?->localizedTitle(app()->getLocale()),
                ]),
        ]);
    }
}
