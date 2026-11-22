import type { Metadata } from 'next';
import Content from './about';

export const metadata: Metadata = {
  title: "About Trilancers",
  description: "Get to know the thinking and approach behind Trilancers.",
  alternates: { canonical: "https://trilancers.com/about" },
  openGraph: { title: "About Trilancers", description: "Get to know the thinking and approach behind Trilancers.", url: "https://trilancers.com/about", type: 'website' },
};
const schema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About Trilancers",
  "description": "Get to know the thinking and approach behind Trilancers.",
  "url": "https://trilancers.com/about"
};
export default function Page() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><Content /></>;
}
