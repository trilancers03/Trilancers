'use client';

import { useRouter } from 'next/navigation';

const products = [
  { key: 'website', label: 'Website' },
  { key: 'seo', label: 'SEO' },
  { key: 'content', label: 'Content' },
  { key: 'custom', label: 'Custom Solutions' },
  { key: 'erp', label: 'ERP' },
];

export default function ProductDashboardSelect({ active }: { active: string }) {
  const router = useRouter();
  const selected = products.some(product => product.key === active) ? active : '';
  return <label className="dashboard-product-select"><span>Products</span><select aria-label="Product dashboard" value={selected} onChange={event => { if (event.target.value) router.push(`/admin?dashboard=${event.target.value}`); }}><option value="" disabled>Select product</option>{products.map(product => <option key={product.key} value={product.key}>{product.label}</option>)}</select></label>;
}
