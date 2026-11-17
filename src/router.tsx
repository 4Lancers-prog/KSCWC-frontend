// router.tsx — route tree: public site, auth, and the guarded operator dashboard.
import { createBrowserRouter } from 'react-router-dom';
import { RouteError } from '@/components/RouteError';
import { lazyPage } from '@/lib/lazy-page';
import { PageSuspense } from '@/components/PageSuspense';
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

const DashboardPage = lazyPage(() => import('@/features/dashboard/pages/DashboardPage'), 'DashboardPage');
const CustomerListPage = lazyPage(() => import('@/features/customers/pages/CustomerListPage'), 'CustomerListPage');
const CustomerFormPage = lazyPage(() => import('@/features/customers/pages/CustomerFormPage'), 'CustomerFormPage');
const CustomerDetailPage = lazyPage(() => import('@/features/customers/pages/CustomerDetailPage'), 'CustomerDetailPage');
const MyReportPage = lazyPage(() => import('@/features/reports/pages/MyReportPage'), 'MyReportPage');
const WalletPage = lazyPage(() => import('@/features/wallet/pages/WalletPage'), 'WalletPage');
const B2ConverterPage = lazyPage(() => import('@/features/tools/pages/B2ConverterPage'), 'B2ConverterPage');
const PassportPhotoPage = lazyPage(() => import('@/features/tools/pages/PassportPhotoPage'), 'PassportPhotoPage');
const InsuranceRequestPage = lazyPage(() => import('@/features/applications/pages/InsuranceRequestPage'), 'InsuranceRequestPage');
const MembershipPage = lazyPage(() => import('@/features/applications/pages/MembershipPage'), 'MembershipPage');
const TrainingPage = lazyPage(() => import('@/features/applications/pages/TrainingPage'), 'TrainingPage');
const GrievancePage = lazyPage(() => import('@/features/applications/pages/GrievancePage'), 'GrievancePage');
import { RequireStaff } from '@/components/guards/RequireStaff';
import { AdminLayout } from '@/components/layout/AdminLayout';
const AdminDashboard = lazyPage(() => import('@/features/admin/pages/AdminDashboard'), 'AdminDashboard');
const ServiceCatalogue = lazyPage(() => import('@/features/admin/pages/ServiceCatalogue'), 'ServiceCatalogue');
const UsersApprovals = lazyPage(() => import('@/features/admin/pages/UsersApprovals'), 'UsersApprovals');
const AnnouncementsAdmin = lazyPage(() => import('@/features/admin/pages/AnnouncementsAdmin'), 'AnnouncementsAdmin');
const CommitteesAdmin = lazyPage(() => import('@/features/admin/pages/CommitteesAdmin'), 'CommitteesAdmin');
const GovernmentLinksAdmin = lazyPage(() => import('@/features/admin/pages/GovernmentLinksAdmin'), 'GovernmentLinksAdmin');
const DocumentsAdmin = lazyPage(() => import('@/features/admin/pages/DocumentsAdmin'), 'DocumentsAdmin');
const WalletManagement = lazyPage(() => import('@/features/admin/pages/WalletManagement'), 'WalletManagement');
const ManualTopups = lazyPage(() => import('@/features/admin/pages/ManualTopups'), 'ManualTopups');
const ApplicationsAdmin = lazyPage(() => import('@/features/admin/pages/ApplicationsAdmin'), 'ApplicationsAdmin');
const AuditLogs = lazyPage(() => import('@/features/admin/pages/AuditLogs'), 'AuditLogs');
const AdminCustomers = lazyPage(() => import('@/features/admin/pages/AdminCustomers'), 'AdminCustomers');
const AdminMfaSetupPage = lazyPage(() => import('@/features/auth/pages/AdminMfaSetupPage'), 'AdminMfaSetupPage');
const ProfilePage = lazyPage(() => import('@/features/auth/pages/ProfilePage'), 'ProfilePage');
const TemplatesPage = lazyPage(() => import('@/features/dashboard/pages/TemplatesPage'), 'TemplatesPage');
const CategoriesAdmin = lazyPage(() => import('@/features/admin/pages/CategoriesAdmin'), 'CategoriesAdmin');
const PortalsPage = lazyPage(() => import('@/features/dashboard/pages/PortalsPage'), 'PortalsPage');
const MyApplicationsPage = lazyPage(() => import('@/features/applications/pages/MyApplicationsPage'), 'MyApplicationsPage');
import { NotFoundPage } from '@/features/public-content/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    // one friendly error page for every route (instead of the raw "Unexpected Application Error!")
    errorElement: <RouteError />,
    children: [
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
  { path: '/admin/mfa-setup', element: <PageSuspense><AdminMfaSetupPage /></PageSuspense> },
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
          { path: 'tools/b2-photo', element: <B2ConverterPage /> },
          { path: 'tools/passport-photo', element: <PassportPhotoPage /> },
          { path: 'applications', element: <MyApplicationsPage /> },
          { path: 'portals', element: <PortalsPage /> },
          { path: 'templates', element: <TemplatesPage /> },
          { path: 'profile', element: <ProfilePage /> },
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
          { path: 'categories', element: <CategoriesAdmin /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'services', element: <ServiceCatalogue /> },
          { path: 'announcements', element: <AnnouncementsAdmin /> },
          { path: 'committees', element: <CommitteesAdmin /> },
          { path: 'links', element: <GovernmentLinksAdmin /> },
          { path: 'documents', element: <DocumentsAdmin /> },
          { path: 'wallets', element: <WalletManagement /> },
          { path: 'manual-topups', element: <ManualTopups /> },
          { path: 'applications', element: <ApplicationsAdmin /> },
          { path: 'audit', element: <AuditLogs /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
