<?php

namespace App\Models;

use App\Enums\DonationStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

#[Fillable([
    'reference',
    'project_id',
    'amount',
    'phone',
    'donor_name',
    'status',
    'payment_method',
    'payment_gateway',
    'payment_reference',
    'payment_metadata',
    'locale',
    'notes',
])]
class Donation extends Model
{
    protected static function booted(): void
    {
        static::creating(function (Donation $donation): void {
            if (empty($donation->reference)) {
                $donation->reference = (string) Str::uuid();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'status' => DonationStatus::class,
            'payment_metadata' => 'array',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
