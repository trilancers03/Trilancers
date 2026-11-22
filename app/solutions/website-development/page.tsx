import type { Metadata } from 'next';
import Content from './website-development';

export const metadata: Metadata = {
  title: "Website Development | Trilancers",
  description: "Build a responsive, purposeful website with Trilancers.",
  alternates: { canonical: "https://trilancers.com/solutions/website-development" },
  openGraph: { title: "Website Development | Trilancers", description: "Build a responsive, purposeful website with Trilancers.", url: "https://trilancers.com/solutions/website-development", type: 'website' },
};
const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Website Development | Trilancers",
  "description": "Build a responsive, purposeful website with Trilancers.",
  "url": "https://trilancers.com/solutions/website-development",
  "provider": {
    "@type": "Organization",
    "name": "Trilancers"
  }
};
export default function Page() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><Content /></>;
}
