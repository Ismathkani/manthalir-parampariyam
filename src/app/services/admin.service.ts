import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category } from '../models/product.model';

export interface AdminStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  lowStock: number;
  totalCategories: number;
  totalOrders: number;
}

export interface StoreSettings {
  storeName: string;
  tamilName: string;
  founder: string;
  address: string;
  phone: string;
  whatsappNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);

  // Products
  getProducts(): Observable<{ success: boolean; count: number; data: Product[] }> {
    return this.http.get<{ success: boolean; count: number; data: Product[] }>(
      '/api/admin/products',
      { withCredentials: true }
    );
  }

  createProduct(product: Partial<Product>): Observable<{ success: boolean; message: string; data: Product }> {
    return this.http.post<{ success: boolean; message: string; data: Product }>(
      '/api/admin/products',
      product,
      { withCredentials: true }
    );
  }

  updateProduct(id: number, product: Partial<Product>): Observable<{ success: boolean; message: string; data: Product }> {
    return this.http.put<{ success: boolean; message: string; data: Product }>(
      `/api/admin/products/${id}`,
      product,
      { withCredentials: true }
    );
  }

  deleteProduct(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `/api/admin/products/${id}`,
      { withCredentials: true }
    );
  }

  togglePublish(id: number): Observable<{ success: boolean; message: string; data: Product }> {
    return this.http.patch<{ success: boolean; message: string; data: Product }>(
      `/api/admin/products/${id}/toggle-publish`,
      {},
      { withCredentials: true }
    );
  }

  uploadImages(formData: FormData): Observable<{ success: boolean; urls: string[]; primaryUrl: string; message: string }> {
    return this.http.post<{ success: boolean; urls: string[]; primaryUrl: string; message: string }>(
      '/api/admin/upload',
      formData,
      { withCredentials: true }
    );
  }

  // Categories
  getCategories(): Observable<{ success: boolean; data: Category[] }> {
    return this.http.get<{ success: boolean; data: Category[] }>('/api/categories');
  }

  createCategory(category: { name: string; description: string }): Observable<{ success: boolean; message: string; data: Category }> {
    return this.http.post<{ success: boolean; message: string; data: Category }>(
      '/api/admin/categories',
      category,
      { withCredentials: true }
    );
  }

  deleteCategory(id: number): Observable<{ success: boolean; message?: string; error?: string }> {
    return this.http.delete<{ success: boolean; message?: string; error?: string }>(
      `/api/admin/categories/${id}`,
      { withCredentials: true }
    );
  }

  // Stats
  getStats(): Observable<{ success: boolean; data: AdminStats }> {
    return this.http.get<{ success: boolean; data: AdminStats }>(
      '/api/admin/stats',
      { withCredentials: true }
    );
  }

  // Settings
  getSettings(): Observable<{ success: boolean; data: StoreSettings }> {
    return this.http.get<{ success: boolean; data: StoreSettings }>(
      '/api/admin/settings',
      { withCredentials: true }
    );
  }

  updateSettings(settings: Partial<StoreSettings>): Observable<{ success: boolean; message: string; data: StoreSettings }> {
    return this.http.put<{ success: boolean; message: string; data: StoreSettings }>(
      '/api/admin/settings',
      settings,
      { withCredentials: true }
    );
  }
}
