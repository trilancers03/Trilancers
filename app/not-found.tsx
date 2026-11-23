import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <section className="contact-page section-pad">
        <div className="section-label"><span aria-hidden="true">✳</span> ERROR 404</div>
        <h1>Page <em>not found.</em></h1>
        <p>The page you’re looking for may have moved or the link may be out of date.</p>
        <Link className="button button-light" href="/">Back to home</Link>
      </section>
    </main>
  );
}
