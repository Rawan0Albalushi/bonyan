<?php

namespace App\Services;

use App\Contracts\NotificationServiceInterface;
use App\Enums\DonationStatus;
use App\Models\Donation;
use App\Models\PaymentSession;
use App\Models\Project;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DonationService
{
    public function __construct(
        private readonly NotificationServiceInterface $notificationService,
        private readonly PaymentService $paymentService,
    ) {}

    /**
     * @param  array{project_id: int, amount: float, phone: string, donor_name?: string|null, locale?: string}  $data
     * @return array{donation: Donation, payment_link: string, session_id: string}
     */
    public function createPendingWithPaymentLink(array $data): array
    {
        return DB::transaction(function () use ($data): array {
            $project = Project::query()
                ->where('id', $data['project_id'])
                ->where('is_active', true)
                ->lockForUpdate()
                ->firstOrFail();

            $maxDonatable = $project->maxDonatableAmount();

            if ($maxDonatable <= 0) {
                throw ValidationException::withMessages([
                    'amount' => [__('messages.project_fully_funded')],
                ]);
            }

            if ((float) $data['amount'] > $maxDonatable) {
                throw ValidationException::withMessages([
                    'amount' => [__('messages.donation_amount_exceeds_remaining', ['max' => $maxDonatable])],
                ]);
            }

            $donation = Donation::query()->create([
                'project_id' => $project->id,
                'amount' => $data['amount'],
                'phone' => $data['phone'],
                'donor_name' => $data['donor_name'] ?? null,
                'status' => DonationStatus::Pending,
                'payment_method' => 'thawani',
                'payment_gateway' => 'thawani',
                'locale' => $data['locale'] ?? 'ar',
            ]);

            $this->paymentService->switchGateway('thawani');

            $locale = $data['locale'] ?? 'ar';
            $title = mb_substr($project->localizedTitle($locale), 0, 30);
            $payment = $this->paymentService->createPaymentLink([
                'model_type' => Donation::class,
                'model_id' => $donation->id,
                'amount' => (float) $donation->amount,
                'currency' => $project->currency ?? 'OMR',
                'description' => __('messages.donation_payment', ['title' => $title], $locale),
                'donation_data' => [
                    'reference' => (string) $donation->reference,
                    'locale' => (string) $donation->locale,
                    'project_id' => (string) $project->id,
                ],
            ]);

            $donation->update([
                'payment_reference' => $payment->sessionId,
                'payment_metadata' => [
                    'session_id' => $payment->sessionId,
                    'payment_link' => $payment->paymentLink,
                ],
            ]);

            $donation->load([
                'project' => fn ($query) => $query->withCount([
                    'donations as donations_count' => fn ($q) => $q->where('status', DonationStatus::Completed),
                ]),
            ]);

            return [
                'donation' => $donation,
                'payment_link' => $payment->paymentLink,
                'session_id' => $payment->sessionId,
            ];
        });
    }

    public function completePayment(Donation $donation, string $sessionId): Donation
    {
        if ($donation->status === DonationStatus::Completed) {
            return $this->loadDonationWithProject($donation);
        }

        return DB::transaction(function () use ($donation, $sessionId): Donation {
            $donation = Donation::query()
                ->whereKey($donation->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($donation->status === DonationStatus::Completed) {
                return $this->loadDonationWithProject($donation);
            }

            $project = Project::query()
                ->whereKey($donation->project_id)
                ->lockForUpdate()
                ->firstOrFail();

            $donation->update([
                'status' => DonationStatus::Completed,
                'payment_reference' => $sessionId,
            ]);

            $toAdd = min((float) $donation->amount, $project->remainingAmount());

            if ($toAdd > 0) {
                $project->increment('raised_amount', $toAdd);
            }

            PaymentSession::query()
                ->where('id', $sessionId)
                ->update(['status' => 'paid', 'paid_at' => now()]);

            $donation = $this->loadDonationWithProject($donation);

            $this->notificationService->sendDonationConfirmation($donation);
            $this->notificationService->sendAdminDonationAlert($donation);

            return $donation;
        });
    }

    public function cancelPayment(Donation $donation): void
    {
        DB::transaction(function () use ($donation): void {
            $donation = Donation::query()
                ->whereKey($donation->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($donation->status !== DonationStatus::Pending) {
                return;
            }

            $donation->update(['status' => DonationStatus::Failed]);

            PaymentSession::query()
                ->where('model_type', Donation::class)
                ->where('model_id', $donation->id)
                ->where('status', 'pending')
                ->update(['status' => 'failed']);
        });
    }

    public function findByReference(string $reference): ?Donation
    {
        return Donation::query()
            ->with([
                'project' => fn ($query) => $query->withCount([
                    'donations as donations_count' => fn ($q) => $q->where('status', DonationStatus::Completed),
                ]),
            ])
            ->where('reference', $reference)
            ->first();
    }

    private function loadDonationWithProject(Donation $donation): Donation
    {
        $donation->load([
            'project' => fn ($query) => $query->withCount([
                'donations as donations_count' => fn ($q) => $q->where('status', DonationStatus::Completed),
            ]),
        ]);

        return $donation;
    }
}
