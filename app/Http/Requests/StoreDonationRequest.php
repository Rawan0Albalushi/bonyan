<?php

namespace App\Http\Requests;

use App\Models\Project;
use App\Services\SettingsService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $project = Project::query()
                ->where('id', $this->input('project_id'))
                ->where('is_active', true)
                ->first();

            if (! $project) {
                return;
            }

            $maxDonatable = $project->maxDonatableAmount();
            $amount = (float) $this->input('amount');

            if ($maxDonatable <= 0) {
                $validator->errors()->add('amount', __('messages.project_fully_funded'));

                return;
            }

            if ($amount > $maxDonatable) {
                $validator->errors()->add(
                    'amount',
                    __('messages.donation_amount_exceeds_remaining', ['max' => $maxDonatable]),
                );
            }
        });
    }
}
