import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import '../css/app.css';
import '@/i18n';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { HomePage } from '@/pages/public/HomePage';
import { DonatePage } from '@/pages/public/DonatePage';
import { SuccessPage } from '@/pages/public/SuccessPage';
import { CancelPage } from '@/pages/public/CancelPage';
import { LoginPage } from '@/pages/admin/LoginPage';
import { DashboardPage } from '@/pages/admin/DashboardPage';
import { ProjectsPage } from '@/pages/admin/ProjectsPage';
import { DonationsPage } from '@/pages/admin/DonationsPage';
import { SettingsPage } from '@/pages/admin/SettingsPage';

const root = document.getElementById('root');

if (root) {
    createRoot(root).render(
        <StrictMode>
            <LocaleProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<PublicLayout />}>
                            <Route index element={<HomePage />} />
                            <Route path="donate" element={<DonatePage />} />
                            <Route path="donation/success/:reference" element={<SuccessPage />} />
                            <Route path="donation/cancel/:reference?" element={<CancelPage />} />
                        </Route>

                        <Route path="admin/login" element={<LoginPage />} />
                        <Route path="admin" element={<AdminLayout />}>
                            <Route index element={<DashboardPage />} />
                            <Route path="projects" element={<ProjectsPage />} />
                            <Route path="donations" element={<DonationsPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                        </Route>

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </LocaleProvider>
        </StrictMode>,
    );
}
