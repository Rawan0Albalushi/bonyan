<?php

namespace App\Http\Controllers\Api;

use App\Enums\DonationStatus;
use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Services\DonationService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService $paymentService,
        private readonly DonationService $donationService,
    ) {}

    public function success(Request $request): RedirectResponse|JsonResponse
    {
        $donationId = $request->integer('donation_id');

        if (! $donationId) {
            return $this->redirectToFrontend('/donate', ['error' => 'missing_donation']);
        }

        $donation = Donation::query()->find($donationId);

        if (! $donation) {
            return $this->redirectToFrontend('/donate', ['error' => 'donation_not_found']);
        }

        if ($donation->status === DonationStatus::Completed) {
            return $this->redirectToFrontend("/donation/success/{$donation->reference}", ['success' => '1']);
        }

        $session = $this->paymentService->getLatestSessionForDonation($donationId);

        if (! $session) {
            Log::warning('Payment success callback: no session found', ['donation_id' => $donationId]);

            return $this->redirectToFrontend('/donate', ['error' => 'session_not_found']);
        }

        $validation = $this->paymentService->validatePayment($session->id);

        if (! $validation->isValid) {
            return $this->redirectToFrontend("/donation/success/{$donation->reference}", [
                'success' => '0',
                'status' => $validation->status,
            ]);
        }

        $this->donationService->completePayment($donation, $session->id);

        return $this->redirectToFrontend("/donation/success/{$donation->reference}", ['success' => '1']);
    }

    public function cancel(Request $request): RedirectResponse
    {
        $donationId = $request->integer('donation_id');

        if ($donationId) {
            $donation = Donation::query()->find($donationId);

            if ($donation && $donation->status === DonationStatus::Pending) {
                $this->donationService->cancelPayment($donation);
            }

            if ($donation) {
                return $this->redirectToFrontend("/donation/cancel/{$donation->reference}");
            }
        }

        return $this->redirectToFrontend('/donate', ['cancelled' => '1']);
    }

    public function webhook(Request $request): JsonResponse
    {
        $sessionId = $request->input('session_id')
            ?? $request->input('payment_intent_id')
            ?? $request->input('order_id');

        if (! $sessionId) {
            return response()->json(['message' => 'Missing session identifier.'], 422);
        }

        $validation = $this->paymentService->validatePayment((string) $sessionId);

        if ($validation->isValid) {
            $session = \App\Models\PaymentSession::query()->find($sessionId);

            if ($session && $session->model_type === Donation::class) {
                $donation = Donation::query()->find($session->model_id);

                if ($donation && $donation->status === DonationStatus::Pending) {
                    $this->donationService->completePayment($donation, $sessionId);
                }
            }
        }

        return response()->json(['received' => true]);
    }

    public function status(int $donationId): JsonResponse
    {
        $donation = Donation::query()->find($donationId);

        if (! $donation) {
            return response()->json(['message' => 'Donation not found.'], 404);
        }

        if ($donation->status === DonationStatus::Completed) {
            return response()->json([
                'status' => 'paid',
                'donation_reference' => $donation->reference,
            ]);
        }

        $session = $this->paymentService->getLatestSessionForDonation($donationId);

        if (! $session) {
            return response()->json(['status' => 'failed', 'message' => 'No payment session.'], 404);
        }

        $validation = $this->paymentService->validatePayment($session->id);

        if ($validation->isValid) {
            $this->donationService->completePayment($donation, $session->id);

            return response()->json([
                'status' => 'paid',
                'donation_reference' => $donation->fresh()->reference,
            ]);
        }

        return response()->json([
            'status' => $validation->status,
            'donation_reference' => $donation->reference,
        ]);
    }

    /**
     * @param  array<string, string>  $query
     */
    private function redirectToFrontend(string $path, array $query = []): RedirectResponse
    {
        $base = rtrim(config('payment.frontend_url'), '/');
        $url = $base.$path;

        if ($query !== []) {
            $url .= '?'.http_build_query($query);
        }

        return redirect()->away($url);
    }
}
