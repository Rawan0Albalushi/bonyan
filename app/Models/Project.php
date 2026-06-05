<?php

namespace App\Models;

use App\Enums\DonationStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'slug',
    'title_ar',
    'title_en',
    'description_ar',
    'description_en',
    'goal_amount',
    'raised_amount',
    'currency',
    'is_active',
    'display_order',
    'metadata',
])]
class Project extends Model
{
    protected function casts(): array
    {
        return [
            'goal_amount' => 'decimal:2',
            'raised_amount' => 'decimal:2',
            'is_active' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class);
    }

    public function progressPercentage(): float
    {
        if ($this->goal_amount <= 0) {
            return 0;
        }

        return min(100, round(($this->raised_amount / $this->goal_amount) * 100, 2));
    }

    public function remainingAmount(): float
    {
        return max(0, (float) $this->goal_amount - (float) $this->raised_amount);
    }

    public function pendingDonationsAmount(): float
    {
        return (float) $this->donations()
            ->where('status', DonationStatus::Pending)
            ->sum('amount');
    }

    /** Maximum amount that can still be donated without exceeding the project goal. */
    public function maxDonatableAmount(): float
    {
        return max(0, $this->remainingAmount() - $this->pendingDonationsAmount());
    }

    public function localizedTitle(?string $locale = null): string
    {
        $locale = $locale ?? app()->getLocale();

        return $locale === 'en' ? $this->title_en : $this->title_ar;
    }

    public function localizedDescription(?string $locale = null): ?string
    {
        $locale = $locale ?? app()->getLocale();

        return $locale === 'en' ? $this->description_en : $this->description_ar;
    }
}
