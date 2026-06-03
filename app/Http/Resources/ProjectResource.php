<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Project */
class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = app()->getLocale();

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->localizedTitle($locale),
            'title_ar' => $this->title_ar,
            'title_en' => $this->title_en,
            'description' => $this->localizedDescription($locale),
            'description_ar' => $this->description_ar,
            'description_en' => $this->description_en,
            'goal_amount' => (float) $this->goal_amount,
            'raised_amount' => (float) $this->raised_amount,
            'remaining_amount' => $this->remainingAmount(),
            'currency' => $this->currency,
            'progress_percentage' => $this->progressPercentage(),
            'donations_count' => (int) ($this->donations_count ?? $this->donations()->where('status', 'completed')->count()),
            'is_active' => $this->is_active,
            'display_order' => $this->display_order,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
