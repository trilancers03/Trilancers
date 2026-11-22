import type { Metadata } from 'next';
import Content from './home';

export const metadata: Metadata = {
  title: "Trilancers | Digital experiences built for what’s next",
  description: "Trilancers brings strategy, design, and technology together to create meaningful digital experiences.",
  alternates: { canonical: "https://trilancers.com/" },
  openGraph: { title: "Trilancers | Digital experiences built for what’s next", description: "Trilancers brings strategy, design, and technology together to create meaningful digital experiences.", url: "https://trilancers.com/", type: 'website' },
};
const schema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Trilancers | Digital experiences built for what’s next",
  "description": "Trilancers brings strategy, design, and technology together to create meaningful digital experiences.",
  "url": "https://trilancers.com/"
};
export default function Page() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><Content /></>;
}
