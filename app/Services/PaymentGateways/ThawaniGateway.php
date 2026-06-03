<?php

namespace App\Services\PaymentGateways;

use App\Contracts\PaymentGatewayInterface;
use App\DTOs\PaymentLinkResponse;
use App\DTOs\PaymentValidationResponse;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class ThawaniGateway implements PaymentGatewayInterface
{
    public function __construct(
        private readonly array $config,
    ) {}

    public function getName(): string
    {
        return 'thawani';
    }

    public function createPaymentLink(array $data): PaymentLinkResponse
    {
        $amountOmr = (float) $data['amount'];
        $description = $this->formatProductName($data['description']);

        $body = [
            'client_reference_id' => uniqid('thawani_'),
            'mode' => 'payment',
            'products' => [[
                'name' => $description,
                'quantity' => 1,
                'unit_amount' => (int) ($amountOmr * 1000),
            ]],
            'success_url' => route('payment.success', ['donation_id' => $data['model_id']], true),
            'cancel_url' => route('payment.cancel', ['donation_id' => $data['model_id']], true),
            'metadata' => $this->buildMetadata($data),
        ];

        $response = $this->makeRequest('POST', '/checkout/session', $body);
        $sessionId = $response['data']['session_id'] ?? null;

        if (! $sessionId) {
            throw new RuntimeException('Thawani did not return a session_id.');
        }

        $paymentLink = $this->checkoutHost().'/pay/'.$sessionId.'?key='.$this->config['public_key'];

        return new PaymentLinkResponse(
            paymentLink: $paymentLink,
            sessionId: $sessionId,
            gatewayData: $response,
            gatewayName: $this->getName(),
        );
    }

    public function validatePayment(string $sessionId): PaymentValidationResponse
    {
        try {
            $response = $this->makeRequest('GET', '/checkout/session/'.$sessionId);
            $paymentStatus = $response['data']['payment_status'] ?? 'failed';

            return match ($paymentStatus) {
                'paid' => new PaymentValidationResponse(true, 'paid', $response),
                'pending' => new PaymentValidationResponse(false, 'pending', $response),
                'failed' => new PaymentValidationResponse(false, 'failed', $response),
                default => new PaymentValidationResponse(false, 'failed', $response, 'Unknown payment status'),
            };
        } catch (\Throwable $e) {
            Log::error('Thawani payment validation failed', [
                'session_id' => $sessionId,
                'error' => $e->getMessage(),
            ]);

            return new PaymentValidationResponse(false, 'failed', [], $e->getMessage());
        }
    }

    private function apiBase(): string
    {
        return ($this->config['mode'] ?? 'test') === 'live'
            ? 'https://checkout.thawani.om/api/v1'
            : 'https://uatcheckout.thawani.om/api/v1';
    }

    private function checkoutHost(): string
    {
        return ($this->config['mode'] ?? 'test') === 'live'
            ? 'https://checkout.thawani.om'
            : 'https://uatcheckout.thawani.om';
    }

    /**
     * @param  array<string, mixed>|null  $body
     * @return array<string, mixed>
     */
    private function makeRequest(string $method, string $path, ?array $body = null): array
    {
        $url = $this->apiBase().$path;

        Log::debug('Thawani API Request', ['method' => $method, 'path' => $path]);

        $ch = curl_init($url);
        $headers = [
            'Content-Type: application/json',
            'Accept: application/json',
            'thawani-api-key: '.$this->config['secret_key'],
        ];

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 30,
        ]);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }

        $raw = curl_exec($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            throw new RuntimeException('Thawani cURL error: '.$curlError);
        }

        $decoded = json_decode((string) $raw, true) ?? [];

        if ($httpCode >= 400) {
            Log::error('Thawani API error: HTTP '.$httpCode, ['response' => $raw]);

            throw new RuntimeException('Thawani HTTP '.$httpCode.': '.$raw);
        }

        return $decoded;
    }

    /**
     * Thawani rejects null values in metadata.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, int|string>
     */
    private function buildMetadata(array $data): array
    {
        $metadata = [
            'model_type' => (string) $data['model_type'],
            'model_id' => (int) $data['model_id'],
        ];

        if (! empty($data['user_id'])) {
            $metadata['user_id'] = (int) $data['user_id'];
        }

        if (! empty($data['donation_data']) && is_array($data['donation_data'])) {
            foreach ($data['donation_data'] as $key => $value) {
                if ($value !== null && $value !== '') {
                    $metadata[(string) $key] = is_scalar($value) ? (string) $value : json_encode($value);
                }
            }
        }

        return $metadata;
    }

    private function formatProductName(string $name): string
    {
        if (mb_strlen($name) <= 39) {
            return $name;
        }

        return '...'.mb_substr($name, 0, 36);
    }
}
