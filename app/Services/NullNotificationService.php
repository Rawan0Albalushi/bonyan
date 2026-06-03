<?php

namespace App\Services;

use App\Contracts\NotificationServiceInterface;
use App\Models\Donation;

class NullNotificationService implements NotificationServiceInterface
{
    public function sendDonationConfirmation(Donation $donation): void
    {
        // Future: SMS/email notification
    }

    public function sendAdminDonationAlert(Donation $donation): void
    {
        // Future: admin notification
    }
}
