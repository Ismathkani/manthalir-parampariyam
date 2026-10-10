import { Injectable, signal } from '@angular/core';
import { Product, Category } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // All 16 products of Manthalir Parampariyam
  // Note: Placeholders are explicitly indicated for prices and ingredients until owner provides final values.
  private readonly productsData: Product[] = [
    {
      id: 1,
      name: 'Kumkumadi Night Serum',
      tamilName: 'குங்குமாதி நைட் சீரம்',
      category: 'Skin & Face',
      categorySlug: 'skin-and-face',
      badge: 'Signature Care',
      featured: true,
      pricePlaceholder: '[Price to be updated by owner]',
      ingredientsPlaceholder: '[Authentic herbal formulation & saffron blend to be updated by owner]',
      sizePlaceholder: '[Volume to be updated by owner (e.g. 30 ml)]',
      descriptionPlaceholder: 'Traditional Kumkumadi night concentrate for skin glow and radiance. (Official description to be updated by owner)',
      benefitsPlaceholder: [
        '[Benefit 1 to be updated by owner - e.g. Night complexion radiance]',
        '[Benefit 2 to be updated by owner - e.g. Blemish reduction]',
        '[Benefit 3 to be updated by owner - e.g. Natural skin nourishment]'
      ],
      usagePlaceholder: '[Directions for application to be updated by owner]'
    },
    {
      id: 2,
      name: 'Avarampoo Face Wash',
      tamilName: 'ஆவாரம்பூ ஃபேஸ் வாஷ்',
      category: 'Skin & Face',
      categorySlug: 'skin-and-face',
      badge: 'Herbal Cleanse',
      featured: true,
      pricePlaceholder: '[Price to be updated by owner]',
      ingredientsPlaceholder: '[Avarampoo (Senna auriculata) extract details to be updated by owner]',
      sizePlaceholder: '[Volume to be updated by owner (e.g. 100 ml)]',
      descriptionPlaceholder: 'Gentle golden Avarampoo petal facial cleanser for refreshing daily skin hygiene. (Official description to be updated by owner)',
      benefitsPlaceholder: [
        '[Benefit 1 to be updated by owner - e.g. Deep pore cleansing]',
        '[Benefit 2 to be updated by owner - e.g. Natural oil balance]',
        '[Benefit 3 to be updated by owner - e.g. Tan reduction]'
      ],
      usagePlaceholder: '[Directions for application to be updated by owner]'
    },
    {
      id: 3,
      name: 'Semparuthi Shampoo',
      tamilName: 'செம்பருத்தி ஷாம்பு',
      category: 'Hair Care',
      categorySlug: 'hair-care',
      badge: 'Pure Herbal',
      featured: true,
      pricePlaceholder: '[Price to be updated by owner]',
      ingredientsPlaceholder: '[Hibiscus petal and herbal extracts to be updated by owner]',
      sizePlaceholder: '[Volume to be updated by owner (e.g. 200 ml)]',
      descriptionPlaceholder: 'Traditional red hibiscus shampoo for soft, manageable, and revitalized hair strands. (Official description to be updated by owner)',
      benefitsPlaceholder: [
        '[Benefit 1 to be updated by owner - e.g. Hair softening & conditioning]',
        '[Benefit 2 to be updated by owner - e.g. Root nourishment]',
        '[Benefit 3 to be updated by owner - e.g. Gentle scalp cleanse]'
      ],
      usagePlaceholder: '[Directions for application to be updated by owner]'
    },
    {
      id: 4,
      name: 'Goat Milk Soap',
      tamilName: 'ஆட்டுப்பால் சோப்',
      category: 'Traditional Soaps',
      categorySlug: 'traditional-soaps',
      badge: 'Handcrafted',
      featured: true,
      pricePlaceholder: '[Price to be updated by owner]',
      ingredientsPlaceholder: '[Pure goat milk & cold-pressed oils ratio to be updated by owner]',
      sizePlaceholder: '[Weight to be updated by owner (e.g. 100 g)]',
      descriptionPlaceholder: 'Rich moisturizing handmade soap crafted with creamy goat milk. (Official description to be updated by owner)',
      benefitsPlaceholder: [
        '[Benefit 1 to be updated by owner - e.g. Intensive moisturization]',
        '[Benefit 2 to be updated by owner - e.g. Gentle for sensitive skin]',
        '[Benefit 3 to be updated by owner - e.g. Velvety soft finish]'
      ],
      usagePlaceholder: '[Directions for application to be updated by owner]'
    },
    {
      id: 5,
      name: 'Regular Hair Oil',
      tamilName: 'ரெகுலர் ஹேர் ஆயில்',
      category: 'Hair Care',
      categorySlug: 'hair-care',
      badge: 'Traditional Recipe',
      featured: true,
      pricePlaceholder: '[Price to be updated by owner]',
      ingredientsPlaceholder: '[Traditional botanical herb infusion to be updated by owner]',
      sizePlaceholder: '[Volume to be updated by owner (e.g. 200 ml)]',
      descriptionPlaceholder: 'Daily nourishing herbal oil for healthy scalp and strong hair vitality. (Official description to be updated by owner)',
      benefitsPlaceholder: [
        '[Benefit 1 to be updated by owner - e.g. Scalp cooling therapy]',
        '[Benefit 2 to be updated by owner - e.g. Strengthens hair roots]',
        '[Benefit 3 to be updated by owner - e.g. Reduces daily hair fall]'
      ],
      usagePlaceholder: '[Directions for application to be updated by owner]'
    },
    {
      id: 6,
      name: 'Rabbit Hair Oil',
      tamilName: 'ராபிட் ஹேர் ஆயில்',
      category: 'Hair Care',
      categorySlug: 'hair-care',
      badge: 'Heritage Formula',
      featured: true,
      pricePlaceholder: '[Price to be updated by owner]',
      ingredientsPlaceholder: '[Specialized traditional herbal extracts to be updated by owner]',
      sizePlaceholder: '[Volume to be updated by owner (e.g. 200 ml)]',
      descriptionPlaceholder: 'Specialized heritage hair oil formulated for intensive hair revival and thickness. (Official description to be updated by owner)',
      benefitsPlaceholder: [
        '[Benefit 1 to be updated by owner - e.g. Root-deep stimulation]',
        '[Benefit 2 to be updated by owner - e.g. Follicle strengthening]',
        '[Benefit 3 to be updated by owner - e.g. Traditional intensive hair care]'
      ],
      usagePlaceholder: '[Directions for application to be updated by owner]'
    },
    {
      id: 7,
      name: 'Dandruff Shampoo',
      tamilName: 'பொடுகு எதிர்ப்பு ஷாம்பு',
      category: 'Hair Care',
      categorySlug: 'hair-care',
      badge: 'Scalp Therapy',
      featured: false,
      pricePlaceholder: '[Price to be updated by owner]',
      ingredientsPlaceholder: '[Neem, tea tree and botanical anti-dandruff herbs to be updated by owner]',
      sizePlaceholder: '[Volume to be updated by owner (e.g. 200 ml)]',
      descriptionPlaceholder: 'Targeted scalp cleanser to keep roots clear, cool, and free from persistent flakes. (Official description to be updated by owner)',
      benefitsPlaceholder: [
        '[Benefit 1 to be updated by owner - e.g. Eliminates stubborn flakes]',
        '[Benefit 2 to be updated by owner - e.g. Calms scalp itching]',
        '[Benefit 3 to be updated by owner - e.g. Purifies scalp pores]'
      ],
      usagePlaceholder: '[Directions for application to be updated by owner]'
    },
    {
      id: 8,
      name: 'Wine Melon Face Wash',
      tamilName: 'வைன் மெலன் ஃபேஸ் வாஷ்',
      category: 'Skin & Face',
      categorySlug: 'skin-and-face',
      badge: 'Antioxidant Care',
      featured: false,
      pricePlaceholder: '[Price to be updated by owner]',
      ingredientsPlaceholder: '[Wine grape and watermelon extract details to be updated by owner]',
      sizePlaceholder: '[Volume to be updated by owner (e.g. 100 ml)]',
      descriptionPlaceholder: 'Dewy antioxidant facial wash combining cooling melon with nourishing grape extracts. (Official description to be updated by owner)',
      benefitsPlaceholder: [
        '[Benefit 1 to be updated by owner - e.g. Refreshing antioxidant shield]',
        '[Benefit 2 to be updated by owner - e.g. Hydrates thirsty skin]',
        '[Benefit 3 to be updated by owner - e.g. Clear glowing complexion]'
      ],
      usagePlaceholder: '[Directions for application to be updated by owner]'
    },
    {
      id: 9,
      name: 'Sunscreen Lotion',
      tamilName: 'சன்ஸ்கிரீன் லோஷன்',
      category: 'Skin & Face',
      categorySlug: 'skin-and-face',
      badge: 'Daily Defense',
      featured: true,
      pricePlaceholder: '[Price to be updated by owner]',
      ingredientsPlaceholder: '[Mineral UV protection and botanical shield herbs to be updated by owner]',
      sizePlaceholder: '[Volume to be updated by owner (e.g. 100 ml)]',
      descriptionPlaceholder: 'Lightweight herbal sun defense lotion offering broad-spectrum protection with non-sticky feel. (Official description to be updated by owner)',
      benefitsPlaceholder: [
        '[Benefit 1 to be updated by owner - e.g. Sun damage protection]',
        '[Benefit 2 to be updated by owner - e.g. Non-greasy finish]',
        '[Benefit 3 to be updated by owner - e.g. Prevents sun-induced dark spots]'
      ],
      usagePlaceholder: '[Directions for application to be updated by owner]'
    },
    {
      id: 10,
      name: 'Niacinamide Night Serum',
      tamilName: 'நியாசினமைடு நைட் சீரம்',
      category: 'Skin & Face',
      categorySlug: 'skin-and-face',
      badge: 'Advanced Care',
      featured: false,
      pricePlaceholder: '[Price to be updated by owner]',
      ingredientsPlaceholder: '[Vitamin B3 and soothing herbal actives to be updated by owner]',
      sizePlaceholder: '[Volume to be updated by owner (e.g. 30 ml)]',
      descriptionPlaceholder: 'Pore refining and skin texture clarifying overnight herbal concentrate. (Official description to be updated by owner)',
      benefitsPlaceholder: [
        '[Benefit 1 to be updated by owner - e.g. Refines skin pores]',
        '[Benefit 2 to be updated by owner - e.g. Smoothens uneven tone]',
        '[Benefit 3 to be updated by owner - e.g. Night barrier repair]'
      ],
      usagePlaceholder: '[Directions for application to be updated by owner]'
    },
    {
      id: 11,
      name: 'Rose Toner',
      tamilName: 'ரோஸ் டோனர்',
      category: 'Skin & Face',
      categorySlug: 'skin-and-face',
      badge: 'Steam Distilled',
      featured: false,
      pricePlaceholder: '[Price to be updated by owner]',
      ingredientsPlaceholder: '[Pure steam-distilled rose water to be updated by owner]',
      sizePlaceholder: '[Volume to be updated by owner (e.g. 100 ml)]',
      descriptionPlaceholder: 'Pure floral mist to tone, balance pH, and hydrate the skin with natural rose fragrance. (Official description to be updated by owner)',
      benefitsPlaceholder: [
        '[Benefit 1 to be updated by owner - e.g. Balances natural pH]',
        '[Benefit 2 to be updated by owner - e.g. Instant hydration mist]',
        '[Benefit 3 to be updated by owner - e.g. Tightens open facial pores]'
      ],
      usagePlaceholder: '[Directions for application to be updated by owner]'
    },
    {
      id: 12,
      name: 'Herbal Sanitary Napkins',
      tamilName: 'மூலிகை சானிட்டரி நாப்கின்ஸ்',
      category: 'Wellness & Hygiene',
      categorySlug: 'wellness-and-hygiene',
      badge: 'Natural Comfort',
      featured: true,
      pricePlaceholder: '[Price to be updated by owner]',
      ingredientsPlaceholder: '[Organic cotton top-sheet and herbal hygiene core to be updated by owner]',
      sizePlaceholder: '[Pack size to be updated by owner (e.g. Pack of 10 XL)]',
      descriptionPlaceholder: 'Rash-free, breathable cotton pads infused with protective herbal strips for total comfort. (Official description to be updated by owner)',
      benefitsPlaceholder: [
        '[Benefit 1 to be updated by owner - e.g. 100% Rash-free cotton comfort]',
        '[Benefit 2 to be updated by owner - e.g. Antibacterial herbal strip]',
        '[Benefit 3 to be updated by owner - e.g. Breathable & high absorption]'
      ],
      usagePlaceholder: '[Directions for usage to be updated by owner]'
    },
    {
      id: 13,
      name: 'Brightening Cream',
      tamilName: 'பிரைட்னிங் கிரீம்',
      category: 'Skin & Face',
      categorySlug: 'skin-and-face',
      badge: 'Radiant Glow',
      featured: false,
      pricePlaceholder: '[Price to be updated by owner]',
      ingredientsPlaceholder: '[Kasturi turmeric, sandalwood & herbal butter to be updated by owner]',
      sizePlaceholder: '[Weight to be updated by owner (e.g. 50 g)]',
      descriptionPlaceholder: 'Traditional complexion rejuvenating cream to nurture even skin tone and natural luminosity. (Official description to be updated by owner)',
      benefitsPlaceholder: [
        '[Benefit 1 to be updated by owner - e.g. Promotes youthful radiance]',
        '[Benefit 2 to be updated by owner - e.g. Deep nourishment without stickiness]',
        '[Benefit 3 to be updated by owner - e.g. Softens dry skin]'
      ],
      usagePlaceholder: '[Directions for application to be updated by owner]'
    },
    {
      id: 14,
      name: 'Sandalwood Soap',
      tamilName: 'சந்தன சோப்',
      category: 'Traditional Soaps',
      categorySlug: 'traditional-soaps',
      badge: 'Classic Heritage',
      featured: true,
      pricePlaceholder: '[Price to be updated by owner]',
      ingredientsPlaceholder: '[Sandalwood extract & essential oils formulation to be updated by owner]',
      sizePlaceholder: '[Weight to be updated by owner (e.g. 100 g)]',
      descriptionPlaceholder: 'Luxurious handmade soap scented with authentic soothing sandalwood for divine freshness. (Official description to be updated by owner)',
      benefitsPlaceholder: [
        '[Benefit 1 to be updated by owner - e.g. Soothes body heat]',
        '[Benefit 2 to be updated by owner - e.g. Divine calming aroma]',
        '[Benefit 3 to be updated by owner - e.g. Gentle skin cleansing]'
      ],
      usagePlaceholder: '[Directions for application to be updated by owner]'
    },
    {
      id: 15,
      name: 'Kuppaimeni Soap',
      tamilName: 'குப்பைமேனி சோப்',
      category: 'Traditional Soaps',
      categorySlug: 'traditional-soaps',
      badge: 'Siddha Remedy',
      featured: true,
      pricePlaceholder: '[Price to be updated by owner]',
      ingredientsPlaceholder: '[Fresh Kuppaimeni (Acalypha Indica) & neem extract to be updated by owner]',
      sizePlaceholder: '[Weight to be updated by owner (e.g. 100 g)]',
      descriptionPlaceholder: 'Time-honored Siddha herbal soap formulated for acne relief, skin purity, and clarity. (Official description to be updated by owner)',
      benefitsPlaceholder: [
        '[Benefit 1 to be updated by owner - e.g. Helps calm acne and skin bumps]',
        '[Benefit 2 to be updated by owner - e.g. Relieves skin itchiness and redness]',
        '[Benefit 3 to be updated by owner - e.g. Pure Siddha herbal legacy]'
      ],
      usagePlaceholder: '[Directions for application to be updated by owner]'
    },
    {
      id: 16,
      name: 'Skin Shining Soap',
      tamilName: 'ஸ்கின் ஷைனிங் சோப்',
      category: 'Traditional Soaps',
      categorySlug: 'traditional-soaps',
      badge: 'Golden Glow',
      featured: false,
      pricePlaceholder: '[Price to be updated by owner]',
      ingredientsPlaceholder: '[Turmeric, saffron & brightening botanicals to be updated by owner]',
      sizePlaceholder: '[Weight to be updated by owner (e.g. 100 g)]',
      descriptionPlaceholder: 'Handcrafted glow booster soap packed with traditional brightening herbs for post-bath radiance. (Official description to be updated by owner)',
      benefitsPlaceholder: [
        '[Benefit 1 to be updated by owner - e.g. Visible post-bath glow]',
        '[Benefit 2 to be updated by owner - e.g. Gentle de-tanning]',
        '[Benefit 3 to be updated by owner - e.g. Moisturizing herbal wash]'
      ],
      usagePlaceholder: '[Directions for application to be updated by owner]'
    }
  ];

  readonly products = signal<Product[]>(this.productsData);

  getProducts(): Product[] {
    return this.productsData;
  }

  getProductById(id: number): Product | undefined {
    return this.productsData.find(p => p.id === id);
  }

  getFeaturedProducts(): Product[] {
    return this.productsData.filter(p => p.featured);
  }

  getCategories(): Category[] {
    const cats: Record<string, Category> = {
      'hair-care': {
        name: 'Hair Care',
        slug: 'hair-care',
        description: 'Traditional hair oils, hibiscus shampoos and scalp care',
        count: 0
      },
      'skin-and-face': {
        name: 'Skin & Face',
        slug: 'skin-and-face',
        description: 'Herbal serums, face washes, toners, creams and sun protection',
        count: 0
      },
      'traditional-soaps': {
        name: 'Traditional Soaps',
        slug: 'traditional-soaps',
        description: 'Handcrafted cold-processed goat milk, kuppaimeni & sandalwood soaps',
        count: 0
      },
      'wellness-and-hygiene': {
        name: 'Wellness & Hygiene',
        slug: 'wellness-and-hygiene',
        description: '100% Cotton herbal sanitary napkins and holistic personal care',
        count: 0
      }
    };

    for (const prod of this.productsData) {
      if (cats[prod.categorySlug]) {
        cats[prod.categorySlug].count++;
      }
    }

    return Object.values(cats);
  }

  filterProducts(categorySlug?: string, searchQuery?: string): Product[] {
    return this.productsData.filter(product => {
      const matchesCategory = !categorySlug || categorySlug === 'all' || product.categorySlug === categorySlug;
      const matchesQuery = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.tamilName && product.tamilName.includes(searchQuery)) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }
}
