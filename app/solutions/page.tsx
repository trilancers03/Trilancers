import type { Metadata } from 'next';
import Content from './solutions';

export const metadata: Metadata = {
  title: "Digital Solutions | Trilancers",
  description: "Explore website development, content writing and SEO solutions from Trilancers.",
  alternates: { canonical: "https://trilancers.com/solutions" },
  openGraph: { title: "Digital Solutions | Trilancers", description: "Explore website development, content writing and SEO solutions from Trilancers.", url: "https://trilancers.com/solutions", type: 'website' },
};
const schema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Digital Solutions | Trilancers",
  "description": "Explore website development, content writing and SEO solutions from Trilancers.",
  "url": "https://trilancers.com/solutions"
};
export default function Page() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><Content /></>;
}
