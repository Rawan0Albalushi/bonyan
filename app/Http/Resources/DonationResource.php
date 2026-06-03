<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Donation */
class DonationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'project_id' => $this->project_id,
            'amount' => (float) $this->amount,
            'phone' => $this->when($request->user()?->isAdmin(), $this->phone),
            'donor_name' => $this->donor_name,
            'status' => $this->status->value,
            'payment_method' => $this->payment_method,
            'locale' => $this->locale,
            'created_at' => $this->created_at?->toIso8601String(),
            'project' => new ProjectResource($this->whenLoaded('project')),
        ];
    }
}
