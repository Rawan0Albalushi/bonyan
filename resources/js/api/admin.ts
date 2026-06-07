import api, { ensureCsrfCookie } from './client';
import type { AdminUser, DashboardStats, Donation, Project, PublicSettings } from './types';

export async function adminLogin(email: string, password: string) {
    await ensureCsrfCookie();
    const { data } = await api.post<{ user: AdminUser; message: string }>('/admin/login', {
        email,
        password,
    });
    return data;
}

export async function adminLogout() {
    const { data } = await api.post<{ message: string }>('/admin/logout');
    return data;
}

export async function fetchAdminMe() {
    const { data } = await api.get<{ user: AdminUser }>('/admin/me');
    return data;
}

export async function fetchDashboard() {
    const { data } = await api.get<{
        stats: DashboardStats;
        recent_donations: Array<{
            id: number;
            reference: string;
            amount: number;
            phone: string;
            created_at: string;
            project_title: string;
        }>;
    }>('/admin/dashboard');
    return data;
}

export async function fetchProjects() {
    const { data } = await api.get<{ data: Project[] }>('/admin/projects');
    return data;
}

export async function createProject(payload: Record<string, unknown>) {
    const { data } = await api.post<{ data: Project }>('/admin/projects', payload);
    return data;
}

export async function updateProject(id: number, payload: Record<string, unknown>) {
    const { data } = await api.put<{ data: Project }>(`/admin/projects/${id}`, payload);
    return data;
}

export async function deleteProject(id: number) {
    await api.delete(`/admin/projects/${id}`);
}

export async function fetchDonations(params?: Record<string, string | number>) {
    const { data } = await api.get<{
        data: Donation[];
        meta: { current_page: number; last_page: number; per_page: number; total: number };
    }>('/admin/donations', { params });
    return data;
}

export async function exportDonations(params?: Record<string, string | number>) {
    const response = await api.get<Blob>('/admin/donations/export', {
        params,
        responseType: 'blob',
    });

    const disposition = response.headers['content-disposition'] as string | undefined;
    const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch?.[1] ?? `donations-report-${new Date().toISOString().slice(0, 10)}.xlsx`;

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

export async function fetchSettings() {
    const { data } = await api.get<{ data: PublicSettings }>('/admin/settings');
    return data;
}

export async function updateSettings(settings: Partial<PublicSettings>) {
    await ensureCsrfCookie();
    const { data } = await api.put<{ data: PublicSettings }>('/admin/settings', { settings });
    return data;
}
