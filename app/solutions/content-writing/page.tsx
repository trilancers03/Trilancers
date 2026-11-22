import type { Metadata } from 'next';
import Content from './content-writing';

export const metadata: Metadata = {
  title: "Content Writing | Trilancers",
  description: "Tell your story with clear, purposeful content from Trilancers.",
  alternates: { canonical: "https://trilancers.com/solutions/content-writing" },
  openGraph: { title: "Content Writing | Trilancers", description: "Tell your story with clear, purposeful content from Trilancers.", url: "https://trilancers.com/solutions/content-writing", type: 'website' },
};
const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Content Writing | Trilancers",
  "description": "Tell your story with clear, purposeful content from Trilancers.",
  "url": "https://trilancers.com/solutions/content-writing",
  "provider": {
    "@type": "Organization",
    "name": "Trilancers"
  }
};
export default function Page() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><Content /></>;
}
