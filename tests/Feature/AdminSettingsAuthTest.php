<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSettingsAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_settings_requires_authentication(): void
    {
        $this->getJson('/api/v1/admin/settings')
            ->assertUnauthorized();
    }

    public function test_admin_can_load_settings_after_session_login(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->get('/sanctum/csrf-cookie');

        $this->postJson('/api/v1/admin/login', [
            'email' => 'admin@bonyan.test',
            'password' => 'password',
        ])->assertOk();

        $this->getJson('/api/v1/admin/settings')
            ->assertOk()
            ->assertJsonStructure(['data' => ['site_name_ar', 'site_name_en']]);
    }

    public function test_admin_can_load_settings_when_acting_as_user(): void
    {
        $user = User::factory()->create([
            'is_admin' => true,
        ]);

        $this->actingAs($user)
            ->getJson('/api/v1/admin/settings')
            ->assertOk();
    }
}
