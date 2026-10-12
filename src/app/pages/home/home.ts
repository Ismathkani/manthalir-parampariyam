import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  private readonly productService = inject(ProductService);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);

  readonly categories = this.productService.getCategories();
  readonly featuredProducts = this.productService.getFeaturedProducts();
  readonly allProducts = this.productService.getProducts();

  selectedCategory = signal<string>('all');

  filteredCollection = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'all') {
      return this.allProducts;
    }
    return this.allProducts.filter(p => p.categorySlug === cat);
  });

  selectCategory(slug: string): void {
    this.selectedCategory.set(slug);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  toggleWishlist(product: Product): void {
    this.wishlistService.toggleWishlist(product);
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId);
  }
}
