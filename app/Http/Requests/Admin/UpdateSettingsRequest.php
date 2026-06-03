<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'settings' => ['required', 'array'],
            'settings.site_name_ar' => ['nullable', 'string', 'max:255'],
            'settings.site_name_en' => ['nullable', 'string', 'max:255'],
            'settings.tagline_ar' => ['nullable', 'string', 'max:255'],
            'settings.tagline_en' => ['nullable', 'string', 'max:255'],
            'settings.donation_amounts' => ['nullable', 'array'],
            'settings.donation_amounts.*' => ['numeric', 'min:0'],
            'settings.min_donation_amount' => ['nullable', 'numeric', 'min:0'],
            'settings.max_donation_amount' => ['nullable', 'numeric', 'min:1'],
            'settings.contact_phone' => ['nullable', 'string', 'max:50'],
            'settings.contact_email' => ['nullable', 'email', 'max:255'],
        ];
    }
}
