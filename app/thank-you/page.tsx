import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Thank you | Trilancers',
  robots: { index: false },
};

export default function ThankYouPage() {
  return (
    <main>
      <section className="contact-page thank-you-page section-pad">
        <div className="section-label"><span aria-hidden="true">✳</span> REQUEST RECEIVED</div>
        <h1>Thank <em>you.</em></h1>
        <p>We’ve received your request. The Trilancers team will be in touch to discuss your project.</p>
        <Link className="button button-light" href="/">Back to home</Link>
      </section>
    </main>
  );
}
