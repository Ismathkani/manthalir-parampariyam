export interface Product {
  id: number;
  name: string;
  tamilName?: string;
  slug?: string;
  category: string;
  categorySlug: string;
  badge?: string;
  featured: boolean;
  price?: number;
  salePrice?: number | null;
  images?: string[];
  mainImage?: string;
  sku?: string;
  stock?: number;
  isAvailable?: boolean;
  status?: 'Published' | 'Draft';
  
  pricePlaceholder?: string;
  ingredientsPlaceholder?: string;
  sizePlaceholder?: string;
  descriptionPlaceholder?: string;
  benefitsPlaceholder?: string[];
  usagePlaceholder?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id?: number;
  name: string;
  slug: string;
  count?: number;
  description: string;
  subtitle?: string;
  icon?: string;
}
