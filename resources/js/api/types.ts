export interface Project {
    id: number;
    slug: string;
    title: string;
    title_ar: string;
    title_en: string;
    description: string | null;
    description_ar: string | null;
    description_en: string | null;
    goal_amount: number;
    raised_amount: number;
    remaining_amount: number;
    currency: string;
    progress_percentage: number;
    donations_count: number;
    is_active: boolean;
}

export interface PublicSettings {
    site_name_ar: string;
    site_name_en: string;
    tagline_ar: string;
    tagline_en: string;
    donation_amounts: number[];
    min_donation_amount: number;
    max_donation_amount: number;
    contact_phone?: string;
    contact_email?: string;
}

export interface Donation {
    id: number;
    reference: string;
    project_id: number;
    amount: number;
    phone?: string;
    donor_name?: string | null;
    status: string;
    created_at: string;
    project?: Project;
}

export interface DashboardStats {
    total_donations: number;
    total_raised: number;
    today_donations: number;
    today_raised: number;
    active_project: {
        id: number;
        title: string;
        title_ar: string;
        title_en: string;
        progress_percentage: number;
        raised_amount: number;
        goal_amount: number;
    } | null;
}

export interface AdminUser {
    id: number;
    name: string;
    email: string;
}
