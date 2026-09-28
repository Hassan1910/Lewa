import { LegalDocument } from '@/components/legal-document';

export default function PrivacyScreen() {
  return (
    <LegalDocument
      title="Privacy"
      paragraphs={[
        'Lewa Wildlife Conservancy collects the account details you provide — name, email, and phone — so we can confirm bookings, donations, and event registration.',
        'Payments are processed by Paystack. The app never stores your card number. Paystack verifies each charge on our server before a booking or gift is marked successful.',
        'Push notifications are optional. If you allow them, we store a device token against your account and use it for booking updates, donation receipts, and conservancy announcements you have not turned off.',
        'We do not sell personal information. Staff can see bookings, donations, and feedback in order to operate visits and answer you.',
        'You can update your profile and notification preferences in the app, and you can sign out at any time. To ask for a copy or deletion of your account data, use Send feedback and choose the account category.',
      ]}
    />
  );
}
