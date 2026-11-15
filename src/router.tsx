// router.tsx — route tree: public site, auth, and the guarded operator dashboard.
import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RequireAuth } from '@/components/guards/RequireAuth';

import { HomePage } from '@/features/public-content/pages/HomePage';
import { AboutPage } from '@/features/public-content/pages/AboutPage';
import { AnnouncementsPage } from '@/features/public-content/pages/AnnouncementsPage';
import { CommitteesPage } from '@/features/public-content/pages/CommitteesPage';
import { GovernmentLinksPage } from '@/features/public-content/pages/GovernmentLinksPage';
import { DownloadsPage } from '@/features/public-content/pages/DownloadsPage';
import { ContactPage } from '@/features/public-content/pages/ContactPage';
import { ServicesPage } from '@/features/public-content/pages/ServicesPage';

import { LoginPage } from '@/features/auth/pages/LoginPage';
import { AdminLoginPage } from '@/features/auth/pages/AdminLoginPage';
import { SignUpPage } from '@/features/auth/pages/SignUpPage';
import { PendingApprovalPage } from '@/features/auth/pages/PendingApprovalPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';

import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { CustomerListPage } from '@/features/customers/pages/CustomerListPage';
import { CustomerFormPage } from '@/features/customers/pages/CustomerFormPage';
import { CustomerDetailPage } from '@/features/customers/pages/CustomerDetailPage';
import { MyReportPage } from '@/features/reports/pages/MyReportPage';
import { WalletPage } from '@/features/wallet/pages/WalletPage';
import { FidMakerPage } from '@/features/fid/pages/FidMakerPage';
import { FidHistoryPage } from '@/features/fid/pages/FidHistoryPage';
import { B2ConverterPage } from '@/features/tools/pages/B2ConverterPage';
import { PassportPhotoPage } from '@/features/tools/pages/PassportPhotoPage';
import { InsuranceRequestPage } from '@/features/applications/pages/InsuranceRequestPage';
import { MembershipPage } from '@/features/applications/pages/MembershipPage';
import { TrainingPage } from '@/features/applications/pages/TrainingPage';
import { GrievancePage } from '@/features/applications/pages/GrievancePage';
import { RequireStaff } from '@/components/guards/RequireStaff';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AdminDashboard } from '@/features/admin/pages/AdminDashboard';
import { ServiceCatalogue } from '@/features/admin/pages/ServiceCatalogue';
import { UsersApprovals } from '@/features/admin/pages/UsersApprovals';
import { AnnouncementsAdmin } from '@/features/admin/pages/AnnouncementsAdmin';
import { CommitteesAdmin } from '@/features/admin/pages/CommitteesAdmin';
import { GovernmentLinksAdmin } from '@/features/admin/pages/GovernmentLinksAdmin';
import { DocumentsAdmin } from '@/features/admin/pages/DocumentsAdmin';
import { WalletManagement } from '@/features/admin/pages/WalletManagement';
import { ManualTopups } from '@/features/admin/pages/ManualTopups';
import { Settings as AdminSettings } from '@/features/admin/pages/Settings';
import { ApplicationsAdmin } from '@/features/admin/pages/ApplicationsAdmin';
import { AuditLogs } from '@/features/admin/pages/AuditLogs';
import { AdminCustomers } from '@/features/admin/pages/AdminCustomers';
import { AdminMfaSetupPage } from '@/features/auth/pages/AdminMfaSetupPage';
import { PortalsPage } from '@/features/dashboard/pages/PortalsPage';
import { MyApplicationsPage } from '@/features/applications/pages/MyApplicationsPage';
import { NotFoundPage } from '@/features/public-content/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/services', element: <ServicesPage /> },
      { path: '/announcements', element: <AnnouncementsPage /> },
      { path: '/committees', element: <CommitteesPage /> },
      { path: '/government-links', element: <GovernmentLinksPage /> },
      { path: '/downloads', element: <DownloadsPage /> },
      { path: '/contact', element: <ContactPage /> },
      // Application forms: logged-in operators only (the API enforces this too).
      {
        element: <RequireAuth />,
        children: [
          { path: '/forms/insurance', element: <InsuranceRequestPage /> },
          { path: '/forms/membership', element: <MembershipPage /> },
          { path: '/forms/training', element: <TrainingPage /> },
          { path: '/forms/grievance', element: <GrievancePage /> },
        ],
      },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/admin/login', element: <AdminLoginPage /> },
  { path: '/admin/mfa-setup', element: <AdminMfaSetupPage /> },
  { path: '/register', element: <SignUpPage /> },
  { path: '/pending', element: <PendingApprovalPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/app',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          {
            path: 'customers',
            children: [
              { index: true, element: <CustomerListPage /> },
              { path: 'new', element: <CustomerFormPage /> },
              { path: ':id', element: <CustomerDetailPage /> },
              { path: ':id/edit', element: <CustomerFormPage /> },
            ],
          },
          { path: 'reports', element: <MyReportPage /> },
          { path: 'wallet', element: <WalletPage /> },
          { path: 'fid', element: <FidMakerPage /> },
          { path: 'fid/history', element: <FidHistoryPage /> },
          { path: 'tools/b2-photo', element: <B2ConverterPage /> },
          { path: 'tools/passport-photo', element: <PassportPhotoPage /> },
          { path: 'applications', element: <MyApplicationsPage /> },
          { path: 'portals', element: <PortalsPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireStaff />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'approvals', element: <UsersApprovals /> },
          { path: 'customers', element: <AdminCustomers /> },
          { path: 'services', element: <ServiceCatalogue /> },
          { path: 'announcements', element: <AnnouncementsAdmin /> },
          { path: 'committees', element: <CommitteesAdmin /> },
          { path: 'links', element: <GovernmentLinksAdmin /> },
          { path: 'documents', element: <DocumentsAdmin /> },
          { path: 'wallets', element: <WalletManagement /> },
          { path: 'manual-topups', element: <ManualTopups /> },
          { path: 'settings', element: <AdminSettings /> },
          { path: 'applications', element: <ApplicationsAdmin /> },
          { path: 'audit', element: <AuditLogs /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
