import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly items = signal<Product[]>([]);

  readonly wishlist = this.items.asReadonly();

  readonly totalWishlist = computed(() => this.items().length);

  toggleWishlist(product: Product): void {
    const current = this.items();
    const exists = current.some(p => p.id === product.id);

    if (exists) {
      this.items.set(current.filter(p => p.id !== product.id));
    } else {
      this.items.set([...current, product]);
    }
  }

  isInWishlist(productId: number): boolean {
    return this.items().some(p => p.id === productId);
  }

  removeFromWishlist(productId: number): void {
    this.items.set(this.items().filter(p => p.id !== productId));
  }
}
