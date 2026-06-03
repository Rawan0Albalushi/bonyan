<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Setting;
use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@bonyan.test'],
            [
                'name' => 'Bonyan Admin',
                'password' => Hash::make('password'),
                'is_admin' => true,
            ],
        );

        $settingsService = app(SettingsService::class);

        foreach ($settingsService->defaults() as $key => $value) {
            Setting::query()->updateOrCreate(['key' => $key], ['value' => $value, 'group' => 'general']);
        }

        Project::query()->updateOrCreate(
            ['slug' => 'family-home-2026'],
            [
                'title_ar' => 'بناء منزل لعائلة محتاجة',
                'title_en' => 'Building a Home for a Family in Need',
                'description_ar' => 'ساهم معنا في إكمال بناء منزل يوفر المأوى الآمن والكرامة لعائلة محتاجة. كل تبرع يقربنا من إتمام البناء ومنحهم حياة كريمة.',
                'description_en' => 'Join us in completing the construction of a home that provides safe shelter and dignity for a family in need. Every donation brings us closer to finishing the build and giving them a decent life.',
                'goal_amount' => 50000,
                'raised_amount' => 12500,
                'currency' => 'OMR',
                'is_active' => true,
                'display_order' => 1,
            ],
        );
    }
}
