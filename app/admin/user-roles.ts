export const userRoles = [
  { value: 'admin', label: 'Admin' },
  { value: 'sales_executive', label: 'Sales Executive' },
  { value: 'sales_manager', label: 'Sales Manager' },
  { value: 'junior_website_developer', label: 'Junior Website Developer' },
  { value: 'senior_website_developer', label: 'Senior Website Developer' },
  { value: 'junior_seo_executive', label: 'Junior SEO Executive' },
  { value: 'senior_seo_executive', label: 'Senior SEO Executive' },
  { value: 'junior_content_writer', label: 'Junior Content Writer' },
  { value: 'senior_content_writer', label: 'Senior Content Writer' },
  { value: 'junior_marketing_executive', label: 'Junior Marketing Executive' },
  { value: 'senior_marketing_executive', label: 'Senior Marketing Executive' },
] as const;

export function roleLabel(role: string) {
  return role === 'founder' ? 'Founder' : userRoles.find(item => item.value === role)?.label || role;
}
