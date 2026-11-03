/**
 * Site Settings — stored in localStorage (client-side persistence).
 * Admin can update these from /admin/settings.
 * Pages read from here to display dynamic content.
 */

export interface SiteSettings {
  logoUrl: string;
  termsContent: string;
  privacyContent: string;
  cancellationPolicy: string;
  siteName: string;
  supportEmail: string;
  supportPhone: string;
}

const STORAGE_KEY = 'terno_site_settings';

export const DEFAULT_SETTINGS: SiteSettings = {
  logoUrl: '/images/logo.svg',
  siteName: 'TernoTrip',
  supportEmail: 'support@ternotrip.com',
  supportPhone: '+91 98765 43210',
  cancellationPolicy: `# Cancellation Policy

**Last updated:** ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

## Free Cancellation
- **Up to 7 days before departure:** 100% refund
- **3–7 days before departure:** 50% refund
- **Within 3 days of departure:** No refund

## Refund Processing
Refunds are processed within 7–10 business days to your original payment method.

## Exceptions
- No refund for no-shows
- Group bookings have separate cancellation terms
- Force majeure events may have different policies

## Contact Support
For cancellation requests or questions: **support@ternotrip.com**`,
  termsContent: `# Terms & Conditions

**Last updated:** ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

## 1. Acceptance of Terms
By accessing and using TernoTrip, you agree to be bound by these Terms & Conditions and all applicable laws and regulations.

## 2. Booking Policy
All bookings are subject to availability. Prices are quoted in Indian Rupees (₹) and include all applicable taxes unless stated otherwise. Bookings are confirmed only after full payment is received.

## 3. Payment
- Full payment is required at the time of booking
- We accept all major credit/debit cards and UPI
- Payments are processed securely through our payment partner

## 4. Cancellation & Refund Policy
- **Free cancellation:** Up to 7 days before departure — 100% refund
- **Partial refund:** 3–7 days before departure — 50% refund
- **No refund:** Within 3 days of departure
- Refunds are processed within 7–10 business days

## 5. Changes to Itinerary
TernoTrip reserves the right to modify trip itineraries due to unforeseen circumstances including weather, road conditions, or force majeure events.

## 6. Responsibility
TernoTrip acts as a travel organiser and is not liable for events beyond our control, including natural disasters, political unrest, or medical emergencies.

## 7. Traveller Responsibility
Travellers are responsible for carrying valid government-issued ID. TernoTrip is not responsible for losses due to traveller negligence.

## 8. Contact
For any queries regarding these terms, email us at **support@ternotrip.com**`,

  privacyContent: `# Privacy Policy

**Last updated:** ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

## 1. Information We Collect
We collect the following information when you use TernoTrip:
- **Personal information:** Name, email address, phone number
- **Booking information:** Travel dates, destination, traveller details
- **Payment information:** Processed securely by our payment partner (we do not store card details)
- **Usage data:** Pages visited, time spent, device information

## 2. How We Use Your Information
Your information is used to:
- Process and confirm your bookings
- Send booking confirmations and updates
- Provide customer support
- Send promotional offers (with your consent)
- Improve our services and website

## 3. Data Security
We implement industry-standard security measures including:
- SSL/TLS encryption for all data transmission
- Secure storage with limited access controls
- Regular security audits

## 4. Cookies
We use cookies to:
- Keep you logged in during your session
- Remember your preferences
- Analyse website traffic (anonymously)

You can disable cookies in your browser settings, though some features may not work correctly.

## 5. Data Sharing
We do **not** sell your personal information. We may share data with:
- Payment processors (for transaction processing)
- Trip operators (necessary booking details only)
- Legal authorities (when required by law)

## 6. Your Rights
You have the right to:
- Access your personal data
- Correct inaccurate data
- Request deletion of your data
- Withdraw consent for marketing communications

## 7. Contact
For privacy concerns, email us at **privacy@ternotrip.com**`,
};

export function getSiteSettings(): SiteSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSiteSettings(settings: Partial<SiteSettings>): void {
  if (typeof window === 'undefined') return;
  const current = getSiteSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  // Dispatch event so other components can react
  window.dispatchEvent(new CustomEvent('site-settings-updated', { detail: updated }));
}
