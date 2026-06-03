<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDonationRequest;
use App\Http\Resources\DonationResource;
use App\Http\Resources\ProjectResource;
use App\Services\DonationService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class DonationController extends Controller
{
    public function __construct(
        private readonly DonationService $donationService,
    ) {}

    public function store(StoreDonationRequest $request): JsonResponse
    {
        try {
            $result = $this->donationService->createPendingWithPaymentLink([
                ...$request->validated(),
                'locale' => $request->input('locale', app()->getLocale()),
            ]);
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => 'Unable to initiate payment. Please try again later.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 502);
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment link created.',
            'data' => new DonationResource($result['donation']),
            'project' => new ProjectResource($result['donation']->project),
            'payment_link' => $result['payment_link'],
            'session_id' => $result['session_id'],
        ], 201);
    }

    public function confirmation(string $donation): JsonResponse
    {
        $record = $this->donationService->findByReference($donation);

        if (! $record) {
            return response()->json(['message' => 'Donation not found.'], 404);
        }

        return response()->json([
            'data' => new DonationResource($record),
            'project' => new ProjectResource($record->project),
        ]);
    }
}
