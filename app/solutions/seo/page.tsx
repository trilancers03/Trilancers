import type { Metadata } from 'next';
import Content from './seo';

export const metadata: Metadata = {
  title: "SEO Services | Trilancers",
  description: "Help the right people discover your business with SEO from Trilancers.",
  alternates: { canonical: "https://trilancers.com/solutions/seo" },
  openGraph: { title: "SEO Services | Trilancers", description: "Help the right people discover your business with SEO from Trilancers.", url: "https://trilancers.com/solutions/seo", type: 'website' },
};
const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "SEO Services | Trilancers",
  "description": "Help the right people discover your business with SEO from Trilancers.",
  "url": "https://trilancers.com/solutions/seo",
  "provider": {
    "@type": "Organization",
    "name": "Trilancers"
  }
};
export default function Page() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><Content /></>;
}
