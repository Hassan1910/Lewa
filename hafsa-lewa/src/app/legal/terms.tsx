import { LegalDocument } from '@/components/legal-document';

export default function TermsScreen() {
  return (
    <LegalDocument
      title="Terms"
      paragraphs={[
        'This app lets you browse Lewa Wildlife Conservancy, book published experiences, register for events, and donate in Kenyan Shillings.',
        'A booking is confirmed only after Paystack verifies the payment. Choosing a date holds the seats you request. Cancelling releases those seats. A confirmed payment is not refunded automatically in the app.',
        'Prices shown at checkout are taken from the published service or campaign, not from an amount typed on your phone.',
        'Donation campaigns describe how gifts are used. A gift is counted toward the campaign only after payment succeeds.',
        'Wildlife, education, and community pages are for information. They are not a permit to enter the conservancy without a confirmed booking.',
        'Lewa may suspend an account that abuses bookings, payments, or feedback. Continued use of the app means you accept these terms and the privacy notice.',
      ]}
    />
  );
}
