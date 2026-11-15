// kn.ts — Kannada UI strings (primary language).
export const kn = {
  org_name: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ನಾಗರಿಕ ಸೇವಾ ಕೇಂದ್ರ ಕಲ್ಯಾಣ ಮಂಡಳಿ',
  org_short: 'ಕೆಎಸ್‌ಸಿಡಬ್ಲ್ಯೂಸಿ',
  nav_home: 'ಮುಖಪುಟ',
  nav_about: 'ನಮ್ಮ ಬಗ್ಗೆ',
  nav_services: 'ಸೇವೆಗಳು',
  nav_announcements: 'ಪ್ರಕಟಣೆಗಳು',
  nav_committees: 'ಸಮಿತಿಗಳು',
  nav_links: 'ಸರ್ಕಾರಿ ಕೊಂಡಿಗಳು',
  nav_contact: 'ಸಂಪರ್ಕ',
  login: 'ಪ್ರವೇಶ',
  register: 'ನೋಂದಣಿ',
  logout: 'ನಿರ್ಗಮನ',
  dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',

  hero_title: 'ಸೇವಾ ಕೇಂದ್ರ ಸಂಚಾಲಕರಿಗೆ ವಿಶ್ವಾಸಾರ್ಹ ಡಿಜಿಟಲ್ ವೇದಿಕೆ',
  hero_body:
    'ಗ್ರಾಹಕರ ದಾಖಲೆಗಳು, ವರದಿಗಳು, ವಾಲೆಟ್ ಮತ್ತು ಸರ್ಕಾರಿ ಸೇವಾ ಪೋರ್ಟಲ್‌ಗಳು — ಎಲ್ಲವೂ ಒಂದೇ ಸುರಕ್ಷಿತ ಸ್ಥಳದಲ್ಲಿ.',
  hero_cta_primary: 'ಸಂಚಾಲಕ ಪ್ರವೇಶ',
  hero_cta_secondary: 'ಹೊಸ ನೋಂದಣಿ',
  hero_note: 'ಇದು ಸರ್ಕಾರಿ ಅಧಿಕೃತ ಗುರುತಿನ ಚೀಟಿ ನೀಡುವ ಪೋರ್ಟಲ್ ಅಲ್ಲ; ಇದು ಕಲ್ಯಾಣ ಮಂಡಳಿಯ ಸೇವಾ ವೇದಿಕೆ.',

  services_title: 'ನಮ್ಮ ಸೇವೆಗಳು',
  services_body: 'ಮಂಡಳಿಯ ಸದಸ್ಯ ಕೇಂದ್ರಗಳ ಮೂಲಕ ಒದಗಿಸುವ ನಾಗರಿಕ ಸೇವೆಗಳು.',
  announcements_title: 'ಇತ್ತೀಚಿನ ಪ್ರಕಟಣೆಗಳು',
  committees_title: 'ನಾಯಕತ್ವ ಮತ್ತು ಸಮಿತಿಗಳು',

  // auth
  login_title: 'ಸಂಚಾಲಕ ಪ್ರವೇಶ',
  register_title: 'ಹೊಸ ಖಾತೆ ನೋಂದಣಿ',
  field_phone: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
  field_password: 'ಪಾಸ್‌ವರ್ಡ್',
  field_full_name: 'ಪೂರ್ಣ ಹೆಸರು',
  field_centre: 'ಕೇಂದ್ರದ ಹೆಸರು',
  field_csc_id: 'ಸಿಎಸ್‌ಸಿ ಐಡಿ',
  field_email: 'ಇಮೇಲ್ (ಐಚ್ಛಿಕ)',
  field_mfa: 'ದೃಢೀಕರಣ ಕೋಡ್',
  forgot_password: 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?',
  no_account: 'ಖಾತೆ ಇಲ್ಲವೇ?',
  have_account: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?',
  submit_login: 'ಪ್ರವೇಶಿಸಿ',
  submit_register: 'ನೋಂದಾಯಿಸಿ',

  pending_title: 'ನಿಮ್ಮ ಖಾತೆ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ',
  pending_body:
    'ನಿಮ್ಮ ನೋಂದಣಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ನಿರ್ವಾಹಕರು ಪರಿಶೀಲಿಸಿ ಅನುಮೋದಿಸಿದ ನಂತರ ನೀವು ಪ್ರವೇಶಿಸಬಹುದು.',

  footer_disclaimer:
    'ಈ ವೇದಿಕೆ ಕಲ್ಯಾಣ ಮಂಡಳಿಯ ಸದಸ್ಯ ಸೇವಾ ಕೇಂದ್ರಗಳಿಗೆ ಮೀಸಲಾಗಿದೆ.',
} as const;

export type I18nKey = keyof typeof kn;
