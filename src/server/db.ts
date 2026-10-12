import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';

export interface DBProduct {
  id: number;
  name: string;
  tamilName?: string;
  slug: string;
  category: string;
  categorySlug: string;
  price: number;
  salePrice?: number | null;
  pricePlaceholder: string;
  ingredientsPlaceholder: string;
  sizePlaceholder: string;
  descriptionPlaceholder: string;
  benefitsPlaceholder: string[];
  usagePlaceholder: string;
  images: string[];
  mainImage?: string;
  sku: string;
  stock: number;
  isAvailable: boolean;
  status: 'Published' | 'Draft';
  featured: boolean;
  badge?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface DBAdminUser {
  id: number;
  username: string;
  passwordHash: string;
  mustChangePassword: boolean;
  lastLogin?: string;
}

export interface DBData {
  admin: DBAdminUser;
  categories: DBCategory[];
  products: DBProduct[];
  orders: any[];
  settings: {
    storeName: string;
    tamilName: string;
    founder: string;
    address: string;
    phone: string;
    whatsappNumber: string;
  };
}

const isVercel = Boolean(process.env['VERCEL']);
const SEED_FILE = path.join(process.cwd(), 'data', 'store.json');
const DB_FILE = isVercel ? path.join('/tmp', 'store.json') : SEED_FILE;

// 16 original products seeded with exact metadata from poster
const INITIAL_PRODUCTS: Omit<DBProduct, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Kumkumadi Night Serum',
    tamilName: 'குங்குமாதி நைட் சீரம்',
    slug: 'kumkumadi-night-serum',
    category: 'Face Care',
    categorySlug: 'skin-and-face',
    price: 499,
    salePrice: null,
    badge: 'Signature Care',
    featured: true,
    sku: 'MP-KNS-001',
    stock: 50,
    isAvailable: true,
    status: 'Published',
    images: ['images/manthalir-logo.jpeg'],
    mainImage: 'images/manthalir-logo.jpeg',
    pricePlaceholder: '[Price to be updated by owner]',
    ingredientsPlaceholder: '[Authentic herbal formulation & saffron blend to be updated by owner]',
    sizePlaceholder: '[Volume to be updated by owner (e.g. 30 ml)]',
    descriptionPlaceholder: 'Traditional Kumkumadi night concentrate for skin glow and radiance.',
    benefitsPlaceholder: [
      '[Benefit 1 - Night complexion radiance]',
      '[Benefit 2 - Blemish reduction]',
      '[Benefit 3 - Natural skin nourishment]'
    ],
    usagePlaceholder: '[Directions for application to be updated by owner]'
  },
  {
    name: 'Avarampoo Face Wash',
    tamilName: 'ஆவாரம்பூ ஃபேஸ் வாஷ்',
    slug: 'avarampoo-face-wash',
    category: 'Face Care',
    categorySlug: 'skin-and-face',
    price: 249,
    salePrice: null,
    badge: 'Herbal Cleanse',
    featured: true,
    sku: 'MP-AFW-002',
    stock: 45,
    isAvailable: true,
    status: 'Published',
    images: ['images/manthalir-logo.jpeg'],
    mainImage: 'images/manthalir-logo.jpeg',
    pricePlaceholder: '[Price to be updated by owner]',
    ingredientsPlaceholder: '[Avarampoo (Senna auriculata) extract details to be updated by owner]',
    sizePlaceholder: '[Volume to be updated by owner (e.g. 100 ml)]',
    descriptionPlaceholder: 'Gentle golden Avarampoo petal facial cleanser for refreshing daily skin hygiene.',
    benefitsPlaceholder: [
      '[Benefit 1 - Deep pore cleansing]',
      '[Benefit 2 - Natural oil balance]',
      '[Benefit 3 - Tan reduction]'
    ],
    usagePlaceholder: '[Directions for application to be updated by owner]'
  },
  {
    name: 'Semparuthi Shampoo',
    tamilName: 'செம்பருத்தி ஷாம்பு',
    slug: 'semparuthi-shampoo',
    category: 'Hair Care',
    categorySlug: 'hair-care',
    price: 299,
    salePrice: null,
    badge: 'Pure Herbal',
    featured: true,
    sku: 'MP-SPS-003',
    stock: 60,
    isAvailable: true,
    status: 'Published',
    images: ['images/manthalir-logo.jpeg'],
    mainImage: 'images/manthalir-logo.jpeg',
    pricePlaceholder: '[Price to be updated by owner]',
    ingredientsPlaceholder: '[Hibiscus petal and herbal extracts to be updated by owner]',
    sizePlaceholder: '[Volume to be updated by owner (e.g. 200 ml)]',
    descriptionPlaceholder: 'Traditional red hibiscus shampoo for soft, manageable, and revitalized hair strands.',
    benefitsPlaceholder: [
      '[Benefit 1 - Hair softening & conditioning]',
      '[Benefit 2 - Root nourishment]',
      '[Benefit 3 - Gentle scalp cleanse]'
    ],
    usagePlaceholder: '[Directions for application to be updated by owner]'
  },
  {
    name: 'Goat Milk Soap',
    tamilName: 'ஆட்டுப்பால் சோப்',
    slug: 'goat-milk-soap',
    category: 'Herbal Soaps',
    categorySlug: 'traditional-soaps',
    price: 180,
    salePrice: null,
    badge: 'Handcrafted',
    featured: true,
    sku: 'MP-GMS-004',
    stock: 75,
    isAvailable: true,
    status: 'Published',
    images: ['images/manthalir-logo.jpeg'],
    mainImage: 'images/manthalir-logo.jpeg',
    pricePlaceholder: '[Price to be updated by owner]',
    ingredientsPlaceholder: '[Pure goat milk & cold-pressed oils ratio to be updated by owner]',
    sizePlaceholder: '[Weight to be updated by owner (e.g. 100 g)]',
    descriptionPlaceholder: 'Rich moisturizing handmade soap crafted with creamy goat milk.',
    benefitsPlaceholder: [
      '[Benefit 1 - Intensive moisturization]',
      '[Benefit 2 - Gentle for sensitive skin]',
      '[Benefit 3 - Velvety soft finish]'
    ],
    usagePlaceholder: '[Directions for application to be updated by owner]'
  },
  {
    name: 'Regular Hair Oil',
    tamilName: 'ரெகுலர் ஹேர் ஆயில்',
    slug: 'regular-hair-oil',
    category: 'Hair Care',
    categorySlug: 'hair-care',
    price: 350,
    salePrice: null,
    badge: 'Traditional Recipe',
    featured: true,
    sku: 'MP-RHO-005',
    stock: 80,
    isAvailable: true,
    status: 'Published',
    images: ['images/manthalir-logo.jpeg'],
    mainImage: 'images/manthalir-logo.jpeg',
    pricePlaceholder: '[Price to be updated by owner]',
    ingredientsPlaceholder: '[Traditional botanical herb infusion to be updated by owner]',
    sizePlaceholder: '[Volume to be updated by owner (e.g. 200 ml)]',
    descriptionPlaceholder: 'Daily nourishing herbal oil for healthy scalp and strong hair vitality.',
    benefitsPlaceholder: [
      '[Benefit 1 - Scalp cooling therapy]',
      '[Benefit 2 - Strengthens hair roots]',
      '[Benefit 3 - Reduces daily hair fall]'
    ],
    usagePlaceholder: '[Directions for application to be updated by owner]'
  },
  {
    name: 'Rabbit Hair Oil',
    tamilName: 'ராபிட் ஹேர் ஆயில்',
    slug: 'rabbit-hair-oil',
    category: 'Hair Care',
    categorySlug: 'hair-care',
    price: 420,
    salePrice: null,
    badge: 'Heritage Formula',
    featured: true,
    sku: 'MP-RBHO-006',
    stock: 40,
    isAvailable: true,
    status: 'Published',
    images: ['images/manthalir-logo.jpeg'],
    mainImage: 'images/manthalir-logo.jpeg',
    pricePlaceholder: '[Price to be updated by owner]',
    ingredientsPlaceholder: '[Specialized traditional herbal extracts to be updated by owner]',
    sizePlaceholder: '[Volume to be updated by owner (e.g. 200 ml)]',
    descriptionPlaceholder: 'Specialized heritage hair oil formulated for intensive hair revival and thickness.',
    benefitsPlaceholder: [
      '[Benefit 1 - Root-deep stimulation]',
      '[Benefit 2 - Follicle strengthening]',
      '[Benefit 3 - Traditional intensive hair care]'
    ],
    usagePlaceholder: '[Directions for application to be updated by owner]'
  },
  {
    name: 'Dandruff Shampoo',
    tamilName: 'பொடுகு எதிர்ப்பு ஷாம்பு',
    slug: 'dandruff-shampoo',
    category: 'Hair Care',
    categorySlug: 'hair-care',
    price: 299,
    salePrice: null,
    badge: 'Scalp Therapy',
    featured: false,
    sku: 'MP-DFS-007',
    stock: 35,
    isAvailable: true,
    status: 'Published',
    images: ['images/manthalir-logo.jpeg'],
    mainImage: 'images/manthalir-logo.jpeg',
    pricePlaceholder: '[Price to be updated by owner]',
    ingredientsPlaceholder: '[Neem, tea tree and botanical anti-dandruff herbs to be updated by owner]',
    sizePlaceholder: '[Volume to be updated by owner (e.g. 200 ml)]',
    descriptionPlaceholder: 'Targeted scalp cleanser to keep roots clear, cool, and free from persistent flakes.',
    benefitsPlaceholder: [
      '[Benefit 1 - Eliminates stubborn flakes]',
      '[Benefit 2 - Calms scalp itching]',
      '[Benefit 3 - Purifies scalp pores]'
    ],
    usagePlaceholder: '[Directions for application to be updated by owner]'
  },
  {
    name: 'Wine Melon Face Wash',
    tamilName: 'வைன் மெலன் ஃபேஸ் வாஷ்',
    slug: 'wine-melon-face-wash',
    category: 'Face Care',
    categorySlug: 'skin-and-face',
    price: 259,
    salePrice: null,
    badge: 'Antioxidant Care',
    featured: false,
    sku: 'MP-WMFW-008',
    stock: 30,
    isAvailable: true,
    status: 'Published',
    images: ['images/manthalir-logo.jpeg'],
    mainImage: 'images/manthalir-logo.jpeg',
    pricePlaceholder: '[Price to be updated by owner]',
    ingredientsPlaceholder: '[Wine grape and watermelon extract details to be updated by owner]',
    sizePlaceholder: '[Volume to be updated by owner (e.g. 100 ml)]',
    descriptionPlaceholder: 'Dewy antioxidant facial wash combining cooling melon with nourishing grape extracts.',
    benefitsPlaceholder: [
      '[Benefit 1 - Refreshing antioxidant shield]',
      '[Benefit 2 - Hydrates thirsty skin]',
      '[Benefit 3 - Clear glowing complexion]'
    ],
    usagePlaceholder: '[Directions for application to be updated by owner]'
  },
  {
    name: 'Sunscreen Lotion',
    tamilName: 'சன்ஸ்கிரீன் லோஷன்',
    slug: 'sunscreen-lotion',
    category: 'Skin Care',
    categorySlug: 'skin-and-face',
    price: 349,
    salePrice: null,
    badge: 'Daily Defense',
    featured: true,
    sku: 'MP-SSL-009',
    stock: 50,
    isAvailable: true,
    status: 'Published',
    images: ['images/manthalir-logo.jpeg'],
    mainImage: 'images/manthalir-logo.jpeg',
    pricePlaceholder: '[Price to be updated by owner]',
    ingredientsPlaceholder: '[Mineral UV protection and botanical shield herbs to be updated by owner]',
    sizePlaceholder: '[Volume to be updated by owner (e.g. 100 ml)]',
    descriptionPlaceholder: 'Lightweight herbal sun defense lotion offering broad-spectrum protection with non-sticky feel.',
    benefitsPlaceholder: [
      '[Benefit 1 - Sun damage protection]',
      '[Benefit 2 - Non-greasy finish]',
      '[Benefit 3 - Prevents sun-induced dark spots]'
    ],
    usagePlaceholder: '[Directions for application to be updated by owner]'
  },
  {
    name: 'Niacinamide Night Serum',
    tamilName: 'நியாசினமைடு நைட் சீரம்',
    slug: 'niacinamide-night-serum',
    category: 'Face Care',
    categorySlug: 'skin-and-face',
    price: 449,
    salePrice: null,
    badge: 'Advanced Care',
    featured: false,
    sku: 'MP-NNS-010',
    stock: 25,
    isAvailable: true,
    status: 'Published',
    images: ['images/manthalir-logo.jpeg'],
    mainImage: 'images/manthalir-logo.jpeg',
    pricePlaceholder: '[Price to be updated by owner]',
    ingredientsPlaceholder: '[Vitamin B3 and soothing herbal actives to be updated by owner]',
    sizePlaceholder: '[Volume to be updated by owner (e.g. 30 ml)]',
    descriptionPlaceholder: 'Pore refining and skin texture clarifying overnight herbal concentrate.',
    benefitsPlaceholder: [
      '[Benefit 1 - Refines skin pores]',
      '[Benefit 2 - Smoothens uneven tone]',
      '[Benefit 3 - Night barrier repair]'
    ],
    usagePlaceholder: '[Directions for application to be updated by owner]'
  },
  {
    name: 'Rose Toner',
    tamilName: 'ரோஸ் டோனர்',
    slug: 'rose-toner',
    category: 'Face Care',
    categorySlug: 'skin-and-face',
    price: 199,
    salePrice: null,
    badge: 'Steam Distilled',
    featured: false,
    sku: 'MP-RT-011',
    stock: 60,
    isAvailable: true,
    status: 'Published',
    images: ['images/manthalir-logo.jpeg'],
    mainImage: 'images/manthalir-logo.jpeg',
    pricePlaceholder: '[Price to be updated by owner]',
    ingredientsPlaceholder: '[Pure steam-distilled rose water to be updated by owner]',
    sizePlaceholder: '[Volume to be updated by owner (e.g. 100 ml)]',
    descriptionPlaceholder: 'Pure floral mist to tone, balance pH, and hydrate the skin with natural rose fragrance.',
    benefitsPlaceholder: [
      '[Benefit 1 - Balances natural pH]',
      '[Benefit 2 - Instant hydration mist]',
      '[Benefit 3 - Tightens open facial pores]'
    ],
    usagePlaceholder: '[Directions for application to be updated by owner]'
  },
  {
    name: 'Herbal Sanitary Napkins',
    tamilName: 'மூலிகை சானிட்டரி நாப்கின்ஸ்',
    slug: 'herbal-sanitary-napkins',
    category: 'Feminine Hygiene',
    categorySlug: 'wellness-and-hygiene',
    price: 160,
    salePrice: null,
    badge: 'Natural Comfort',
    featured: true,
    sku: 'MP-HSN-012',
    stock: 100,
    isAvailable: true,
    status: 'Published',
    images: ['images/manthalir-logo.jpeg'],
    mainImage: 'images/manthalir-logo.jpeg',
    pricePlaceholder: '[Price to be updated by owner]',
    ingredientsPlaceholder: '[Organic cotton top-sheet and herbal hygiene core to be updated by owner]',
    sizePlaceholder: '[Pack size to be updated by owner (e.g. Pack of 10 XL)]',
    descriptionPlaceholder: 'Rash-free, breathable cotton pads infused with protective herbal strips for total comfort.',
    benefitsPlaceholder: [
      '[Benefit 1 - 100% Rash-free cotton comfort]',
      '[Benefit 2 - Antibacterial herbal strip]',
      '[Benefit 3 - Breathable & high absorption]'
    ],
    usagePlaceholder: '[Directions for usage to be updated by owner]'
  },
  {
    name: 'Brightening Cream',
    tamilName: 'பிரைட்னிங் கிரீம்',
    slug: 'brightening-cream',
    category: 'Skin Care',
    categorySlug: 'skin-and-face',
    price: 380,
    salePrice: null,
    badge: 'Radiant Glow',
    featured: false,
    sku: 'MP-BC-013',
    stock: 40,
    isAvailable: true,
    status: 'Published',
    images: ['images/manthalir-logo.jpeg'],
    mainImage: 'images/manthalir-logo.jpeg',
    pricePlaceholder: '[Price to be updated by owner]',
    ingredientsPlaceholder: '[Kasturi turmeric, sandalwood & herbal butter to be updated by owner]',
    sizePlaceholder: '[Weight to be updated by owner (e.g. 50 g)]',
    descriptionPlaceholder: 'Traditional complexion rejuvenating cream to nurture even skin tone and natural luminosity.',
    benefitsPlaceholder: [
      '[Benefit 1 - Promotes youthful radiance]',
      '[Benefit 2 - Deep nourishment without stickiness]',
      '[Benefit 3 - Softens dry skin]'
    ],
    usagePlaceholder: '[Directions for application to be updated by owner]'
  },
  {
    name: 'Sandalwood Soap',
    tamilName: 'சந்தன சோப்',
    slug: 'sandalwood-soap',
    category: 'Herbal Soaps',
    categorySlug: 'traditional-soaps',
    price: 160,
    salePrice: null,
    badge: 'Classic Heritage',
    featured: true,
    sku: 'MP-SWS-014',
    stock: 70,
    isAvailable: true,
    status: 'Published',
    images: ['images/manthalir-logo.jpeg'],
    mainImage: 'images/manthalir-logo.jpeg',
    pricePlaceholder: '[Price to be updated by owner]',
    ingredientsPlaceholder: '[Sandalwood extract & essential oils formulation to be updated by owner]',
    sizePlaceholder: '[Weight to be updated by owner (e.g. 100 g)]',
    descriptionPlaceholder: 'Luxurious handmade soap scented with authentic soothing sandalwood for divine freshness.',
    benefitsPlaceholder: [
      '[Benefit 1 - Soothes body heat]',
      '[Benefit 2 - Divine calming aroma]',
      '[Benefit 3 - Gentle skin cleansing]'
    ],
    usagePlaceholder: '[Directions for application to be updated by owner]'
  },
  {
    name: 'Kuppaimeni Soap',
    tamilName: 'குப்பைமேனி சோப்',
    slug: 'kuppaimeni-soap',
    category: 'Herbal Soaps',
    categorySlug: 'traditional-soaps',
    price: 150,
    salePrice: null,
    badge: 'Siddha Remedy',
    featured: true,
    sku: 'MP-KMS-015',
    stock: 90,
    isAvailable: true,
    status: 'Published',
    images: ['images/manthalir-logo.jpeg'],
    mainImage: 'images/manthalir-logo.jpeg',
    pricePlaceholder: '[Price to be updated by owner]',
    ingredientsPlaceholder: '[Fresh Kuppaimeni (Acalypha Indica) & neem extract to be updated by owner]',
    sizePlaceholder: '[Weight to be updated by owner (e.g. 100 g)]',
    descriptionPlaceholder: 'Time-honored Siddha herbal soap formulated for acne relief, skin purity, and clarity.',
    benefitsPlaceholder: [
      '[Benefit 1 - Helps calm acne and skin bumps]',
      '[Benefit 2 - Relieves skin itchiness and redness]',
      '[Benefit 3 - Pure Siddha herbal legacy]'
    ],
    usagePlaceholder: '[Directions for application to be updated by owner]'
  },
  {
    name: 'Skin Shining Soap',
    tamilName: 'ஸ்கின் ஷைனிங் சோப்',
    slug: 'skin-shining-soap',
    category: 'Herbal Soaps',
    categorySlug: 'traditional-soaps',
    price: 175,
    salePrice: null,
    badge: 'Golden Glow',
    featured: false,
    sku: 'MP-SSS-016',
    stock: 65,
    isAvailable: true,
    status: 'Published',
    images: ['images/manthalir-logo.jpeg'],
    mainImage: 'images/manthalir-logo.jpeg',
    pricePlaceholder: '[Price to be updated by owner]',
    ingredientsPlaceholder: '[Turmeric, saffron & brightening botanicals to be updated by owner]',
    sizePlaceholder: '[Weight to be updated by owner (e.g. 100 g)]',
    descriptionPlaceholder: 'Handcrafted glow booster soap packed with traditional brightening herbs for post-bath radiance.',
    benefitsPlaceholder: [
      '[Benefit 1 - Visible post-bath glow]',
      '[Benefit 2 - Gentle de-tanning]',
      '[Benefit 3 - Moisturizing herbal wash]'
    ],
    usagePlaceholder: '[Directions for application to be updated by owner]'
  }
];

const INITIAL_CATEGORIES: DBCategory[] = [
  { id: 1, name: 'Face Care', slug: 'face-care', description: 'Serums, face washes, toners & creams' },
  { id: 2, name: 'Hair Care', slug: 'hair-care', description: 'Traditional hair oils and herbal shampoos' },
  { id: 3, name: 'Herbal Soaps', slug: 'herbal-soaps', description: 'Handcrafted cold-processed ayurvedic soaps' },
  { id: 4, name: 'Skin Care', slug: 'skin-care', description: 'Sunscreen, brightening creams & body lotions' },
  { id: 5, name: 'Feminine Hygiene', slug: 'feminine-hygiene', description: '100% Cotton organic herbal sanitary pads' }
];

class Database {
  private data: DBData;

  constructor() {
    this.data = this.loadOrInitialize();
  }

  private loadOrInitialize(): DBData {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
      if (isVercel && fs.existsSync(SEED_FILE)) {
        const raw = fs.readFileSync(SEED_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        try {
          fs.writeFileSync(DB_FILE, raw, 'utf-8');
        } catch {}
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read existing store.json, re-initializing database.', e);
    }

    // Secure initial administrator credential hashing
    const initialUsername = process.env['ADMIN_USERNAME'] || 'Manthalir';
    const initialPassword = process.env['ADMIN_INITIAL_PASSWORD'] || 'Manthalir@2026';
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(initialPassword, salt);

    const now = new Date().toISOString();
    const seededProducts: DBProduct[] = INITIAL_PRODUCTS.map((p, index) => ({
      ...p,
      id: index + 1,
      createdAt: now,
      updatedAt: now
    }));

    const initialData: DBData = {
      admin: {
        id: 1,
        username: initialUsername,
        passwordHash,
        mustChangePassword: true
      },
      categories: INITIAL_CATEGORIES,
      products: seededProducts,
      orders: [],
      settings: {
        storeName: 'Manthalir Parampariyam',
        tamilName: 'மாந்தளிர் பாரம்பரியம்',
        founder: 'M. முத்துமணி MBA. (M. Muthumani MBA.)',
        address: 'Morais City, Trichy - 620 007, Tamil Nadu, India.',
        phone: '70101 36599',
        whatsappNumber: '917010136599'
      }
    };

    this.saveData(initialData);
    return initialData;
  }

  private saveData(data: DBData): void {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.promises.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8').catch(err => {
        console.error('Failed to write database file asynchronously:', err);
      });
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // --- Admin User Methods ---
  getAdmin(): DBAdminUser {
    return this.data.admin;
  }

  updateAdminPassword(newPasswordHash: string): void {
    this.data.admin.passwordHash = newPasswordHash;
    this.data.admin.mustChangePassword = false;
    this.saveData(this.data);
  }

  updateAdminLoginTime(): void {
    this.data.admin.lastLogin = new Date().toISOString();
    this.saveData(this.data);
  }

  // --- Category Methods ---
  getCategories(): DBCategory[] {
    return this.data.categories;
  }

  addCategory(name: string, description: string): DBCategory {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newId = this.data.categories.length > 0 
      ? Math.max(...this.data.categories.map(c => c.id)) + 1 
      : 1;

    const cat: DBCategory = { id: newId, name, slug, description };
    this.data.categories.push(cat);
    this.saveData(this.data);
    return cat;
  }

  deleteCategory(id: number): { success: boolean; error?: string } {
    const cat = this.data.categories.find(c => c.id === id);
    if (!cat) return { success: false, error: 'Category not found' };

    // Prevent deletion if products assigned
    const assignedProducts = this.data.products.filter(
      p => p.category.toLowerCase() === cat.name.toLowerCase() || p.categorySlug === cat.slug
    );
    if (assignedProducts.length > 0) {
      return { 
        success: false, 
        error: `Cannot delete category "${cat.name}": ${assignedProducts.length} product(s) are currently assigned to it.` 
      };
    }

    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.saveData(this.data);
    return { success: true };
  }

  // --- Product Methods ---
  getProducts(includeDrafts = false): DBProduct[] {
    if (includeDrafts) {
      return this.data.products;
    }
    return this.data.products.filter(p => p.status === 'Published');
  }

  getProductById(id: number): DBProduct | undefined {
    return this.data.products.find(p => p.id === id);
  }

  addProduct(productData: Partial<DBProduct>): DBProduct {
    const newId = this.data.products.length > 0 
      ? Math.max(...this.data.products.map(p => p.id)) + 1 
      : 1;

    const now = new Date().toISOString();
    const slug = productData.slug || 
      (productData.name || `product-${newId}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newProduct: DBProduct = {
      id: newId,
      name: productData.name || 'New Product',
      tamilName: productData.tamilName || '',
      slug,
      category: productData.category || 'Face Care',
      categorySlug: productData.categorySlug || 'face-care',
      price: Number(productData.price) || 0,
      salePrice: productData.salePrice ? Number(productData.salePrice) : null,
      pricePlaceholder: productData.price ? `₹${productData.price}` : '[Price to be updated]',
      ingredientsPlaceholder: productData.ingredientsPlaceholder || '[Ingredients to be updated by owner]',
      sizePlaceholder: productData.sizePlaceholder || '[Size to be updated by owner]',
      descriptionPlaceholder: productData.descriptionPlaceholder || '',
      benefitsPlaceholder: productData.benefitsPlaceholder || [],
      usagePlaceholder: productData.usagePlaceholder || '',
      images: productData.images && productData.images.length > 0 ? productData.images : ['images/manthalir-logo.jpeg'],
      mainImage: productData.mainImage || (productData.images && productData.images[0]) || 'images/manthalir-logo.jpeg',
      sku: productData.sku || `MP-${String(newId).padStart(3, '0')}`,
      stock: Number(productData.stock) || 0,
      isAvailable: productData.isAvailable ?? true,
      status: productData.status || 'Published',
      featured: productData.featured ?? false,
      badge: productData.badge || '',
      createdAt: now,
      updatedAt: now
    };

    this.data.products.push(newProduct);
    this.saveData(this.data);
    return newProduct;
  }

  updateProduct(id: number, updates: Partial<DBProduct>): DBProduct | undefined {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    const existing = this.data.products[index];
    const updated: DBProduct = {
      ...existing,
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : existing.price,
      salePrice: updates.salePrice !== undefined ? (updates.salePrice ? Number(updates.salePrice) : null) : existing.salePrice,
      stock: updates.stock !== undefined ? Number(updates.stock) : existing.stock,
      pricePlaceholder: updates.price ? `₹${updates.price}` : existing.pricePlaceholder,
      updatedAt: new Date().toISOString()
    };

    if (updates.images && updates.images.length > 0 && !updates.mainImage) {
      updated.mainImage = updates.images[0];
    }

    this.data.products[index] = updated;
    this.saveData(this.data);
    return updated;
  }

  deleteProduct(id: number): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    const deleted = this.data.products.length < initialLen;
    if (deleted) {
      this.saveData(this.data);
    }
    return deleted;
  }

  // --- Orders & Stats Methods ---
  getStats() {
    const totalProducts = this.data.products.length;
    const publishedProducts = this.data.products.filter(p => p.status === 'Published').length;
    const draftProducts = this.data.products.filter(p => p.status === 'Draft').length;
    const lowStock = this.data.products.filter(p => p.stock <= 10).length;
    const totalCategories = this.data.categories.length;

    return {
      totalProducts,
      publishedProducts,
      draftProducts,
      lowStock,
      totalCategories,
      totalOrders: this.data.orders.length
    };
  }

  getSettings() {
    return this.data.settings;
  }

  updateSettings(newSettings: Partial<DBData['settings']>) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.saveData(this.data);
    return this.data.settings;
  }
}

export const db = new Database();
