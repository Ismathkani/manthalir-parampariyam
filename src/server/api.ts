import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { db, DBProduct } from './db.js';
import { requireAdminAuth } from './auth.js';

const router = Router();

// Fast healthcheck & serverless prewarm endpoint
router.get('/ping', (_req: Request, res: Response) => {
  res.json({ ok: true, timestamp: Date.now() });
});

// Ensure upload directory exists (safe for Vercel serverless /tmp)
const isVercel = Boolean(process.env['VERCEL']);
const uploadDir = isVercel
  ? path.join('/tmp', 'uploads')
  : path.join(process.cwd(), 'public', 'uploads');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('Upload directory creation skipped or read-only:', err);
}

// Multer Storage Engine with secure filename hashing
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBaseName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .substring(0, 30);
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    cb(null, `${safeBaseName}-${uniqueSuffix}${ext}`);
  }
});

// Allowed Image MIME types
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg'
]);

// Allowed extensions
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit per image
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed. Executable or unsupported files are rejected.'));
      return;
    }
    cb(null, true);
  }
});

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// GET /api/products - Public product catalog (Only Published products)
router.get('/products', (_req: Request, res: Response) => {
  try {
    const products = db.getProducts(false);
    res.json({ success: true, count: products.length, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve products' });
  }
});

// GET /api/products/:id - Single product details
router.get('/products/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params['id']), 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid product ID' });
      return;
    }
    const product = db.getProductById(id);
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve product' });
  }
});

// GET /api/categories - Public category list
router.get('/categories', (_req: Request, res: Response) => {
  try {
    const categories = db.getCategories();
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve categories' });
  }
});

// ==========================================
// PROTECTED ADMIN API ENDPOINTS
// ==========================================

// GET /api/admin/products - List all products including Drafts
router.get('/admin/products', requireAdminAuth, (_req: Request, res: Response) => {
  try {
    const products = db.getProducts(true);
    res.json({ success: true, count: products.length, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve admin products' });
  }
});

// POST /api/admin/products - Create a new product with full validation
router.post('/admin/products', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const body = req.body || {};

    // Server-side validation
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Product name is required.' });
      return;
    }

    if (!body.category || typeof body.category !== 'string' || body.category.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Product category is required.' });
      return;
    }

    const price = Number(body.price);
    if (isNaN(price) || price < 0) {
      res.status(400).json({ success: false, error: 'Valid price (non-negative number) is required.' });
      return;
    }

    let salePrice: number | null = null;
    if (body.salePrice !== undefined && body.salePrice !== null && body.salePrice !== '') {
      salePrice = Number(body.salePrice);
      if (isNaN(salePrice) || salePrice < 0) {
        res.status(400).json({ success: false, error: 'Sale price must be a valid non-negative number.' });
        return;
      }
      if (salePrice >= price) {
        res.status(400).json({ success: false, error: 'Sale price must be less than regular price.' });
        return;
      }
    }

    const stock = Number(body.stock ?? 0);
    if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      res.status(400).json({ success: false, error: 'Stock quantity must be a non-negative integer.' });
      return;
    }

    // Auto-generate slug if not provided
    const slug = (body.slug || body.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const categorySlug = (body.categorySlug || body.category)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const images: string[] = Array.isArray(body.images) && body.images.length > 0
      ? body.images
      : ['images/manthalir-logo.jpeg'];

    const mainImage = body.mainImage || images[0] || 'images/manthalir-logo.jpeg';

    const product = db.addProduct({
      name: body.name.trim(),
      tamilName: body.tamilName ? body.tamilName.trim() : '',
      slug,
      category: body.category.trim(),
      categorySlug,
      price,
      salePrice,
      pricePlaceholder: `₹${price}`,
      ingredientsPlaceholder: body.ingredientsPlaceholder ? body.ingredientsPlaceholder.trim() : '',
      sizePlaceholder: body.sizePlaceholder ? body.sizePlaceholder.trim() : '',
      descriptionPlaceholder: body.descriptionPlaceholder ? body.descriptionPlaceholder.trim() : '',
      benefitsPlaceholder: Array.isArray(body.benefitsPlaceholder) ? body.benefitsPlaceholder : [],
      usagePlaceholder: body.usagePlaceholder ? body.usagePlaceholder.trim() : '',
      images,
      mainImage,
      sku: body.sku ? body.sku.trim() : '',
      stock,
      isAvailable: body.isAvailable ?? (stock > 0),
      status: body.status === 'Draft' ? 'Draft' : 'Published',
      featured: Boolean(body.featured),
      badge: body.badge ? body.badge.trim() : ''
    });

    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal server error while creating product' });
  }
});

// PUT /api/admin/products/:id - Update product
router.put('/admin/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params['id']), 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid product ID' });
      return;
    }

    const existing = db.getProductById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    const body = req.body || {};

    // Validate price if provided
    if (body.price !== undefined) {
      const price = Number(body.price);
      if (isNaN(price) || price < 0) {
        res.status(400).json({ success: false, error: 'Valid price (non-negative number) is required.' });
        return;
      }
    }

    // Validate sale price if provided
    if (body.salePrice !== undefined && body.salePrice !== null && body.salePrice !== '') {
      const salePrice = Number(body.salePrice);
      const effectivePrice = body.price !== undefined ? Number(body.price) : existing.price;
      if (isNaN(salePrice) || salePrice < 0) {
        res.status(400).json({ success: false, error: 'Sale price must be a valid non-negative number.' });
        return;
      }
      if (salePrice >= effectivePrice) {
        res.status(400).json({ success: false, error: 'Sale price must be less than regular price.' });
        return;
      }
    }

    // Validate stock if provided
    if (body.stock !== undefined) {
      const stock = Number(body.stock);
      if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
        res.status(400).json({ success: false, error: 'Stock quantity must be a non-negative integer.' });
        return;
      }
    }

    const updated = db.updateProduct(id, body);
    res.json({ success: true, message: 'Product updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update product' });
  }
});

// DELETE /api/admin/products/:id - Delete product
router.delete('/admin/products/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params['id']), 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid product ID' });
      return;
    }

    const deleted = db.deleteProduct(id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
});

// PATCH /api/admin/products/:id/toggle-publish - Toggle Draft/Published
router.patch('/admin/products/:id/toggle-publish', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params['id']), 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid product ID' });
      return;
    }

    const existing = db.getProductById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    const newStatus = existing.status === 'Published' ? 'Draft' : 'Published';
    const updated = db.updateProduct(id, { status: newStatus });
    res.json({ success: true, message: `Product is now ${newStatus}`, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to toggle product status' });
  }
});

// POST /api/admin/upload - Multi/Single image upload with security checks
router.post('/admin/upload', requireAdminAuth, (req: Request, res: Response) => {
  upload.array('images', 8)(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ success: false, error: 'File size exceeds 5MB limit.' });
        return;
      }
      res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
      return;
    } else if (err) {
      res.status(400).json({ success: false, error: err.message });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, error: 'No image files uploaded.' });
      return;
    }

    // Generate web accessible URLs
    const urls = files.map(file => `/uploads/${file.filename}`);

    res.json({
      success: true,
      message: `${files.length} image(s) uploaded successfully.`,
      urls,
      primaryUrl: urls[0]
    });
  });
});

// POST /api/admin/categories - Add category
router.post('/admin/categories', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const { name, description } = req.body || {};
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Category name is required.' });
      return;
    }

    const newCat = db.addCategory(name.trim(), description ? description.trim() : '');
    res.status(201).json({ success: true, message: 'Category created successfully', data: newCat });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to create category' });
  }
});

// DELETE /api/admin/categories/:id - Delete category with dependency safeguard
router.delete('/admin/categories/:id', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params['id']), 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid category ID' });
      return;
    }

    const result = db.deleteCategory(id);
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to delete category' });
  }
});

// GET /api/admin/stats - Overview statistics
router.get('/admin/stats', requireAdminAuth, (_req: Request, res: Response) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve stats' });
  }
});

// GET /api/admin/settings - Store settings
router.get('/admin/settings', requireAdminAuth, (_req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve settings' });
  }
});

// PUT /api/admin/settings - Update settings
router.put('/api/admin/settings', requireAdminAuth, (req: Request, res: Response) => {
  try {
    const updated = db.updateSettings(req.body || {});
    res.json({ success: true, message: 'Store settings updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

export default router;
