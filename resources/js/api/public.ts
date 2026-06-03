import api from './client';
import type { Donation, Project, PublicSettings } from './types';

export async function fetchActiveProject() {
    const { data } = await api.get<{
        data: Project | null;
        settings: PublicSettings;
    }>('/public/projects/active');
    return data;
}

export async function submitDonation(payload: {
    project_id: number;
    amount: number;
    phone: string;
    donor_name?: string;
    locale?: string;
}) {
    const { data } = await api.post<{
        success: boolean;
        data: Donation;
        project: Project;
        message: string;
        payment_link?: string;
        session_id?: string;
    }>('/public/donations', payload);
    return data;
}

export async function checkDonationPaymentStatus(donationId: number) {
    const { data } = await api.get<{
        status: string;
        donation_reference?: string;
        message?: string;
    }>(`/payments/status/${donationId}`);
    return data;
}

export async function fetchDonationConfirmation(reference: string) {
    const { data } = await api.get<{
        data: Donation;
        project: Project;
    }>(`/public/donations/confirm/${reference}`);
    return data;
}
