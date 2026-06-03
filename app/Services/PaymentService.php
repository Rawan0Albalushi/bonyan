<?php

namespace App\Services;

use App\Contracts\PaymentGatewayInterface;
use App\DTOs\PaymentLinkResponse;
use App\DTOs\PaymentValidationResponse;
use App\Models\PaymentSession;
use App\Services\PaymentGateways\ThawaniGateway;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class PaymentService
{
    /** @var array<string, PaymentGatewayInterface> */
    private array $gateways = [];

    private ?string $activeGateway = null;

    public function __construct()
    {
        $this->loadGateways();
    }

    public function switchGateway(string $name): void
    {
        if (! isset($this->gateways[$name])) {
            throw new RuntimeException("Payment gateway [{$name}] is not available.");
        }

        $this->activeGateway = $name;
    }

    /**
     * @param  array{
     *     model_type: class-string,
     *     model_id: int,
     *     amount: float,
     *     currency: string,
     *     description: string,
     *     user_id?: int|null,
     *     donation_data?: array<string, mixed>
     * }  $data
     */
    public function createPaymentLink(array $data): PaymentLinkResponse
    {
        $gateway = $this->getActiveGateway();
        $response = $gateway->createPaymentLink($data);

        $gatewayData = $response->gatewayData;
        if (! empty($data['donation_data'])) {
            $gatewayData['donation_data'] = $data['donation_data'];
        }

        PaymentSession::query()->create([
            'id' => $response->sessionId,
            'user_id' => $data['user_id'] ?? null,
            'model_type' => $data['model_type'],
            'model_id' => $data['model_id'],
            'gateway_name' => $response->gatewayName,
            'amount' => $data['amount'],
            'currency' => $data['currency'] ?? 'OMR',
            'status' => 'pending',
            'payment_link' => $response->paymentLink,
            'gateway_data' => $gatewayData,
            'expires_at' => now()->addDay(),
        ]);

        Log::info('Payment link created', [
            'session_id' => $response->sessionId,
            'model_type' => $data['model_type'],
            'model_id' => $data['model_id'],
            'gateway' => $response->gatewayName,
        ]);

        return $response;
    }

    public function validatePayment(string $sessionId): PaymentValidationResponse
    {
        $session = PaymentSession::query()->find($sessionId);

        if (! $session) {
            return new PaymentValidationResponse(false, 'failed', [], 'Payment session not found');
        }

        $gateway = $this->gateways[$session->gateway_name] ?? null;

        if (! $gateway) {
            return new PaymentValidationResponse(false, 'failed', [], 'Gateway not available');
        }

        $validation = $gateway->validatePayment($sessionId);

        if ($validation->isValid) {
            $session->update([
                'status' => 'paid',
                'paid_at' => now(),
                'gateway_data' => array_merge($session->gateway_data ?? [], $validation->gatewayData),
            ]);
        } elseif ($validation->status === 'pending') {
            $session->update(['status' => 'pending']);
        } else {
            $session->update(['status' => 'failed']);
        }

        Log::info('Payment validation completed', [
            'session_id' => $sessionId,
            'is_valid' => $validation->isValid,
            'status' => $validation->status,
        ]);

        return $validation;
    }

    public function getLatestSessionForDonation(int $donationId): ?PaymentSession
    {
        return PaymentSession::query()
            ->where('model_type', \App\Models\Donation::class)
            ->where('model_id', $donationId)
            ->where('status', '!=', 'failed')
            ->latest()
            ->first();
    }

    private function getActiveGateway(): PaymentGatewayInterface
    {
        $name = $this->activeGateway ?? config('payment.default_gateway');

        if ($name && isset($this->gateways[$name])) {
            return $this->gateways[$name];
        }

        $first = reset($this->gateways);

        if ($first === false) {
            throw new RuntimeException('No payment gateway configured.');
        }

        return $first;
    }

    private function loadGateways(): void
    {
        $configs = config('payment.gateways', []);

        foreach ($configs as $name => $config) {
            if (! $this->validateGatewayConfig($config)) {
                continue;
            }

            $this->gateways[$name] = match ($name) {
                'thawani' => new ThawaniGateway($config),
                default => null,
            };

            if ($this->gateways[$name] === null) {
                unset($this->gateways[$name]);
            }
        }
    }

    /**
     * @param  array<string, mixed>  $config
     */
    private function validateGatewayConfig(array $config): bool
    {
        return ! empty($config['public_key']) && ! empty($config['secret_key']);
    }
}
