import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, AdminUser } from '../../../services/auth.service';
import { AdminService, AdminStats, StoreSettings } from '../../../services/admin.service';
import { Product, Category } from '../../../models/product.model';

export type DashboardSection = 
  | 'overview' 
  | 'products' 
  | 'add-product' 
  | 'categories' 
  | 'inventory' 
  | 'orders' 
  | 'settings' 
  | 'change-password';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  private router = inject(Router);

  activeSection: DashboardSection = 'overview';
  currentUser: AdminUser | null = null;
  mobileMenuOpen = false;

  // Data signals and states
  stats: AdminStats = {
    totalProducts: 0,
    publishedProducts: 0,
    draftProducts: 0,
    lowStock: 0,
    totalCategories: 0,
    totalOrders: 0
  };

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  settings: StoreSettings = {
    storeName: 'Manthalir Parampariyam',
    tamilName: 'மாந்தளிர் பாரம்பரியம்',
    founder: 'Traditional Herbal Care',
    address: 'Tamil Nadu, India',
    phone: '+91 70101 36599',
    whatsappNumber: '+91 70101 36599'
  };

  // Search & Filter
  searchQuery = '';
  selectedCategory = 'all';

  // Product Form Model
  isEditing = false;
  editingId: number | null = null;
  productForm = {
    name: '',
    tamilName: '',
    slug: '',
    category: 'Face Care',
    price: 0,
    salePrice: null as number | null,
    sku: '',
    stock: 25,
    status: 'Published' as 'Published' | 'Draft',
    featured: false,
    badge: '',
    descriptionPlaceholder: '',
    ingredientsPlaceholder: '',
    usagePlaceholder: '',
    sizePlaceholder: '',
    images: [] as string[],
    mainImage: ''
  };

  // Image Uploading State
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  isUploading = false;
  uploadStatusMessage = '';

  // Feedback notifications
  notification = {
    type: 'success' as 'success' | 'error',
    message: ''
  };

  // Delete modal
  productToDelete: Product | null = null;
  categoryToDelete: Category | null = null;

  // Change Password Form
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  passwordLoading = false;
  passwordFeedback = {
    success: '',
    error: ''
  };

  // Add Category Form
  newCategory = {
    name: '',
    description: ''
  };
  categoryLoading = false;

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser();
    this.loadAllData();
  }

  setSection(section: DashboardSection): void {
    this.activeSection = section;
    this.mobileMenuOpen = false;
    this.notification.message = '';

    if (section === 'add-product' && !this.isEditing) {
      this.resetProductForm();
    }
  }

  loadAllData(): void {
    this.loadStats();
    this.loadProducts();
    this.loadCategories();
    this.loadSettings();
  }

  loadStats(): void {
    this.adminService.getStats().subscribe({
      next: (res) => {
        if (res.success) this.stats = res.data;
      }
    });
  }

  loadProducts(): void {
    this.adminService.getProducts().subscribe({
      next: (res) => {
        if (res.success) {
          this.products = res.data;
          this.applyProductFilter();
          this.loadStats();
        }
      }
    });
  }

  loadCategories(): void {
    this.adminService.getCategories().subscribe({
      next: (res) => {
        if (res.success) {
          this.categories = res.data;
          if (this.categories.length > 0 && !this.productForm.category) {
            this.productForm.category = this.categories[0].name;
          }
        }
      }
    });
  }

  loadSettings(): void {
    this.adminService.getSettings().subscribe({
      next: (res) => {
        if (res.success) this.settings = res.data;
      }
    });
  }

  applyProductFilter(): void {
    let list = [...this.products];
    if (this.selectedCategory !== 'all') {
      list = list.filter(p => p.category.toLowerCase() === this.selectedCategory.toLowerCase());
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.tamilName && p.tamilName.includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
    }
    this.filteredProducts = list;
  }

  onSearchChange(): void {
    this.applyProductFilter();
  }

  onCategoryFilterChange(): void {
    this.applyProductFilter();
  }

  // --- Product Form Actions ---
  resetProductForm(): void {
    this.isEditing = false;
    this.editingId = null;
    this.productForm = {
      name: '',
      tamilName: '',
      slug: '',
      category: this.categories.length > 0 ? this.categories[0].name : 'Face Care',
      price: 0,
      salePrice: null,
      sku: '',
      stock: 25,
      status: 'Published',
      featured: false,
      badge: '',
      descriptionPlaceholder: '',
      ingredientsPlaceholder: '',
      usagePlaceholder: '',
      sizePlaceholder: '',
      images: ['images/manthalir-logo.jpeg'],
      mainImage: 'images/manthalir-logo.jpeg'
    };
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.uploadStatusMessage = '';
  }

  editProduct(product: Product): void {
    this.isEditing = true;
    this.editingId = product.id;
    this.productForm = {
      name: product.name,
      tamilName: product.tamilName || '',
      slug: product.slug || '',
      category: product.category,
      price: product.price || 0,
      salePrice: product.salePrice ?? null,
      sku: product.sku || '',
      stock: product.stock ?? 20,
      status: product.status || 'Published',
      featured: Boolean(product.featured),
      badge: product.badge || '',
      descriptionPlaceholder: product.descriptionPlaceholder || '',
      ingredientsPlaceholder: product.ingredientsPlaceholder || '',
      usagePlaceholder: product.usagePlaceholder || '',
      sizePlaceholder: product.sizePlaceholder || '',
      images: product.images && product.images.length > 0 ? [...product.images] : ['images/manthalir-logo.jpeg'],
      mainImage: product.mainImage || (product.images && product.images[0]) || 'images/manthalir-logo.jpeg'
    };
    this.imagePreviews = [...this.productForm.images];
    this.setSection('add-product');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    // Validate file sizes and types on client side
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    const validFiles: File[] = [];

    for (const f of files) {
      if (!allowed.includes(f.type)) {
        this.showNotification('error', `File "${f.name}" is not an allowed image type. (JPEG, PNG, WebP only)`);
        continue;
      }
      if (f.size > 5 * 1024 * 1024) {
        this.showNotification('error', `File "${f.name}" exceeds 5MB maximum size.`);
        continue;
      }
      validFiles.push(f);
    }

    if (validFiles.length === 0) return;

    this.selectedFiles = validFiles;

    // Upload to server immediately to get persistent URLs
    this.uploadImagesToServer(validFiles);
  }

  uploadImagesToServer(files: File[]): void {
    this.isUploading = true;
    this.uploadStatusMessage = `Uploading ${files.length} image(s)...`;

    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }

    this.adminService.uploadImages(formData).subscribe({
      next: (res) => {
        this.isUploading = false;
        if (res.success && res.urls.length > 0) {
          this.uploadStatusMessage = `✓ ${res.urls.length} image(s) uploaded successfully!`;
          // Merge with current images
          const newImages = [...this.productForm.images.filter(img => !img.includes('manthalir-logo.jpeg')), ...res.urls];
          this.productForm.images = newImages;
          if (!this.productForm.mainImage || this.productForm.mainImage.includes('manthalir-logo.jpeg')) {
            this.productForm.mainImage = newImages[0];
          }
          this.imagePreviews = [...newImages];
          this.showNotification('success', 'Product images uploaded securely to persistent storage.');
        }
      },
      error: (err) => {
        this.isUploading = false;
        this.uploadStatusMessage = 'Upload failed';
        this.showNotification('error', err.error?.error || 'Failed to upload images to server.');
      }
    });
  }

  setMainImage(imgUrl: string): void {
    this.productForm.mainImage = imgUrl;
    this.showNotification('success', 'Main display image updated.');
  }

  removeImage(index: number): void {
    if (this.productForm.images.length <= 1) {
      this.productForm.images = ['images/manthalir-logo.jpeg'];
      this.productForm.mainImage = 'images/manthalir-logo.jpeg';
      this.imagePreviews = ['images/manthalir-logo.jpeg'];
      return;
    }

    const removed = this.productForm.images.splice(index, 1)[0];
    if (this.productForm.mainImage === removed) {
      this.productForm.mainImage = this.productForm.images[0];
    }
    this.imagePreviews = [...this.productForm.images];
  }

  saveProduct(status: 'Published' | 'Draft'): void {
    this.productForm.status = status;

    if (!this.productForm.name.trim()) {
      this.showNotification('error', 'Please enter a product name.');
      return;
    }
    if (!this.productForm.category) {
      this.showNotification('error', 'Please select a product category.');
      return;
    }
    if (this.productForm.price < 0) {
      this.showNotification('error', 'Price cannot be negative.');
      return;
    }
    if (this.productForm.stock < 0) {
      this.showNotification('error', 'Stock quantity cannot be negative.');
      return;
    }

    const payload: Partial<Product> = {
      name: this.productForm.name.trim(),
      tamilName: this.productForm.tamilName.trim(),
      slug: this.productForm.slug.trim(),
      category: this.productForm.category,
      price: Number(this.productForm.price),
      salePrice: this.productForm.salePrice ? Number(this.productForm.salePrice) : null,
      sku: this.productForm.sku.trim(),
      stock: Number(this.productForm.stock),
      status: this.productForm.status,
      featured: this.productForm.featured,
      badge: this.productForm.badge.trim(),
      descriptionPlaceholder: this.productForm.descriptionPlaceholder.trim(),
      ingredientsPlaceholder: this.productForm.ingredientsPlaceholder.trim(),
      usagePlaceholder: this.productForm.usagePlaceholder.trim(),
      sizePlaceholder: this.productForm.sizePlaceholder.trim(),
      images: this.productForm.images,
      mainImage: this.productForm.mainImage || this.productForm.images[0]
    };

    if (this.isEditing && this.editingId) {
      this.adminService.updateProduct(this.editingId, payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.showNotification('success', `Product "${res.data.name}" updated successfully!`);
            this.loadProducts();
            this.setSection('products');
            this.resetProductForm();
          }
        },
        error: (err) => {
          this.showNotification('error', err.error?.error || 'Failed to update product.');
        }
      });
    } else {
      this.adminService.createProduct(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.showNotification('success', `Product "${res.data.name}" added successfully as ${status}!`);
            this.loadProducts();
            this.setSection('products');
            this.resetProductForm();
          }
        },
        error: (err) => {
          this.showNotification('error', err.error?.error || 'Failed to create product.');
        }
      });
    }
  }

  // --- Quick Status & Stock Actions ---
  togglePublish(product: Product): void {
    this.adminService.togglePublish(product.id).subscribe({
      next: (res) => {
        if (res.success) {
          product.status = res.data.status;
          this.showNotification('success', `Status updated: "${product.name}" is now ${res.data.status}.`);
          this.loadStats();
        }
      },
      error: (err) => {
        this.showNotification('error', err.error?.error || 'Failed to toggle product status.');
      }
    });
  }

  updateStock(product: Product, delta: number): void {
    const newStock = Math.max(0, (product.stock || 0) + delta);
    this.adminService.updateProduct(product.id, { stock: newStock }).subscribe({
      next: (res) => {
        if (res.success) {
          product.stock = res.data.stock;
          this.showNotification('success', `Stock updated for ${product.name}: ${res.data.stock} units.`);
          this.loadStats();
        }
      }
    });
  }

  // --- Delete Modal Actions ---
  confirmDelete(product: Product): void {
    this.productToDelete = product;
  }

  cancelDelete(): void {
    this.productToDelete = null;
  }

  executeDelete(): void {
    if (!this.productToDelete) return;
    const id = this.productToDelete.id;
    const name = this.productToDelete.name;

    this.adminService.deleteProduct(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showNotification('success', `Product "${name}" deleted.`);
          this.productToDelete = null;
          this.loadProducts();
        }
      },
      error: (err) => {
        this.showNotification('error', err.error?.error || 'Failed to delete product.');
        this.productToDelete = null;
      }
    });
  }

  // --- Category Actions ---
  addCategory(): void {
    if (!this.newCategory.name.trim()) {
      this.showNotification('error', 'Category name is required.');
      return;
    }

    this.categoryLoading = true;
    this.adminService.createCategory({
      name: this.newCategory.name.trim(),
      description: this.newCategory.description.trim()
    }).subscribe({
      next: (res) => {
        this.categoryLoading = false;
        if (res.success) {
          this.showNotification('success', `Category "${res.data.name}" added successfully.`);
          this.newCategory = { name: '', description: '' };
          this.loadCategories();
          this.loadStats();
        }
      },
      error: (err) => {
        this.categoryLoading = false;
        this.showNotification('error', err.error?.error || 'Failed to create category.');
      }
    });
  }

  deleteCategory(cat: Category): void {
    if (!cat.id) return;
    if (!confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    this.adminService.deleteCategory(cat.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.showNotification('success', `Category "${cat.name}" deleted.`);
          this.loadCategories();
          this.loadStats();
        }
      },
      error: (err) => {
        this.showNotification('error', err.error?.error || 'Failed to delete category.');
      }
    });
  }

  getCategoryProductCount(catName: string): number {
    return this.products.filter(p => p.category.toLowerCase() === catName.toLowerCase()).length;
  }

  // --- Store Settings ---
  saveSettings(): void {
    this.adminService.updateSettings(this.settings).subscribe({
      next: (res) => {
        if (res.success) {
          this.showNotification('success', 'Store settings updated successfully.');
        }
      },
      error: (err) => {
        this.showNotification('error', err.error?.error || 'Failed to update store settings.');
      }
    });
  }

  // --- Change Password Actions ---
  onChangePassword(): void {
    this.passwordFeedback = { success: '', error: '' };

    if (!this.passwordForm.currentPassword) {
      this.passwordFeedback.error = 'Current password is required.';
      return;
    }
    if (this.passwordForm.newPassword.length < 8) {
      this.passwordFeedback.error = 'New password must be at least 8 characters long.';
      return;
    }
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordFeedback.error = 'New password and confirmation do not match.';
      return;
    }

    this.passwordLoading = true;
    this.authService.changePassword({
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: (res) => {
        this.passwordLoading = false;
        if (res.success) {
          this.passwordFeedback.success = 'Password successfully changed and updated in database.';
          this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        } else {
          this.passwordFeedback.error = res.error || 'Failed to change password.';
        }
      },
      error: (err) => {
        this.passwordLoading = false;
        this.passwordFeedback.error = err.error?.error || 'Failed to change password.';
      }
    });
  }

  // --- Logout ---
  logout(): void {
    this.authService.logout().subscribe();
  }

  showNotification(type: 'success' | 'error', message: string): void {
    this.notification = { type, message };
    setTimeout(() => {
      if (this.notification.message === message) {
        this.notification.message = '';
      }
    }, 6000);
  }
}
