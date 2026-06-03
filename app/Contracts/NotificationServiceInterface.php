<?php

namespace App\Contracts;

use App\Models\Donation;

interface NotificationServiceInterface
{
    public function sendDonationConfirmation(Donation $donation): void;

    public function sendAdminDonationAlert(Donation $donation): void;
}
