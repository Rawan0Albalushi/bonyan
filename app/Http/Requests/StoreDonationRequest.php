<?php

namespace App\Http\Requests;

use App\Services\SettingsService;
use Illuminate\Foundation\Http\FormRequest;

class StoreDonationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $min = (float) app(SettingsService::class)->get('min_donation_amount', 1);
        $max = app(SettingsService::class)->maxDonationAmountOmr();

        return [
            'project_id' => ['required', 'integer', 'exists:projects,id'],
            'amount' => ['required', 'numeric', "min:{$min}", "max:{$max}"],
            'phone' => ['required', 'string', 'min:8', 'max:20', 'regex:/^[\d\s\+\-\(\)]+$/'],
            'donor_name' => ['nullable', 'string', 'max:255'],
            'locale' => ['nullable', 'in:ar,en'],
        ];
    }

    public function messages(): array
    {
        $settings = app(SettingsService::class);
        $min = (float) $settings->get('min_donation_amount', 1);
        $max = $settings->maxDonationAmountOmr();

        return [
            'amount.max' => __('messages.donation_amount_max', ['max' => $max]),
            'amount.min' => __('messages.donation_amount_min', ['min' => $min]),
        ];
    }
}
