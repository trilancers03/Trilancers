import type { Metadata } from 'next';
import Content from './contact';

export const metadata: Metadata = {
  title: "Contact Trilancers",
  description: "Get in touch with Trilancers to discuss your next digital project.",
  alternates: { canonical: "https://www.trilancers.in/contact-us" },
  openGraph: { title: "Contact Trilancers", description: "Get in touch with Trilancers to discuss your next digital project.", url: "https://www.trilancers.in/contact-us", type: 'website' },
};
const schema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Trilancers",
  "description": "Get in touch with Trilancers to discuss your next digital project.",
  "url": "https://www.trilancers.in/contact-us"
};
export default function Page() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><Content /></>;
}
