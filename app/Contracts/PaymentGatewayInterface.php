<?php

namespace App\Contracts;

use App\DTOs\PaymentLinkResponse;
use App\DTOs\PaymentValidationResponse;

interface PaymentGatewayInterface
{
    public function getName(): string;

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
    public function createPaymentLink(array $data): PaymentLinkResponse;

    public function validatePayment(string $sessionId): PaymentValidationResponse;
}
