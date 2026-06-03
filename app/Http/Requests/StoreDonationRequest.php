<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDonationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => ['required', 'integer', 'exists:projects,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'phone' => ['required', 'string', 'min:8', 'max:20', 'regex:/^[\d\s\+\-\(\)]+$/'],
            'donor_name' => ['nullable', 'string', 'max:255'],
            'locale' => ['nullable', 'in:ar,en'],
        ];
    }
}
