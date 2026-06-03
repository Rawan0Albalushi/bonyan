<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Collection;

class SettingsService
{
    public function all(): Collection
    {
        return Setting::query()->orderBy('group')->orderBy('key')->get();
    }

    public function get(string $key, mixed $default = null): mixed
    {
        $setting = Setting::query()->where('key', $key)->first();

        return $setting?->value ?? $default;
    }

    /**
     * @param  array<string, mixed>  $settings
     */
    public function updateMany(array $settings): Collection
    {
        foreach ($settings as $key => $value) {
            Setting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value],
            );
        }

        return $this->all();
    }

    public function defaults(): array
    {
        return [
            'site_name_ar' => 'بُنيان',
            'site_name_en' => 'Bonyan',
            'tagline_ar' => 'نبني لهم حياة كريمة',
            'tagline_en' => 'We build a decent life for them',
            'donation_amounts' => [5, 10, 25, 50, 100],
            'min_donation_amount' => 1,
            'max_donation_amount' => 10000,
            'contact_phone' => '',
            'contact_email' => '',
        ];
    }
}
