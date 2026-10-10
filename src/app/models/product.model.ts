export interface Product {
  id: number;
  name: string;
  tamilName?: string;
  category: 'Hair Care' | 'Skin & Face' | 'Traditional Soaps' | 'Wellness & Hygiene';
  categorySlug: string;
  badge?: string;
  featured: boolean;
  
  // Clearly marked placeholders as requested by owner
  pricePlaceholder: string;
  ingredientsPlaceholder: string;
  sizePlaceholder: string;
  descriptionPlaceholder: string;
  benefitsPlaceholder: string[];
  usagePlaceholder: string;
}

export interface Category {
  name: string;
  slug: string;
  count: number;
  description: string;
}
