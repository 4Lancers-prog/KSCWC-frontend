// en.ts — English helper strings (shown as secondary helper text where clarity helps).
import type { I18nKey } from './kn';

export const en: Record<I18nKey, string> = {
  org_name: 'Karnataka State Citizen Service Centres Welfare Council',
  org_short: 'KSCWC',
  nav_home: 'Home',
  nav_about: 'About',
  nav_services: 'Services',
  nav_announcements: 'Announcements',
  nav_committees: 'Committees',
  nav_links: 'Government links',
  nav_contact: 'Contact',
  login: 'Login',
  register: 'Register',
  logout: 'Logout',
  dashboard: 'Dashboard',

  hero_title: 'A trusted digital platform for service-centre operators',
  hero_body:
    'Customer records, reports, wallet and government service portals — all in one secure place.',
  hero_cta_primary: 'Operator login',
  hero_cta_secondary: 'New registration',
  hero_note:
    'This is not a government identity-card portal; it is the Welfare Council service platform.',

  services_title: 'Our services',
  services_body: 'Citizen services delivered through member centres of the Council.',
  announcements_title: 'Latest announcements',
  committees_title: 'Leadership & committees',

  login_title: 'Operator login',
  register_title: 'Create a new account',
  field_phone: 'Mobile number',
  field_password: 'Password',
  field_full_name: 'Full name',
  field_centre: 'Centre name',
  field_csc_id: 'CSC ID',
  field_email: 'Email (optional)',
  field_mfa: 'Authenticator code',
  forgot_password: 'Forgot password?',
  no_account: "Don't have an account?",
  have_account: 'Already have an account?',
  submit_login: 'Sign in',
  submit_register: 'Register',

  pending_title: 'Your account is under review',
  pending_body:
    'Your registration was received. You can sign in once an administrator reviews and approves it.',

  footer_disclaimer: 'This platform is for member service centres of the Welfare Council.',
};
