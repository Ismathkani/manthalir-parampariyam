import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class ProductsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);

  readonly allProducts = this.productService.getProducts();
  readonly categories = this.productService.getCategories();

  selectedCategory = signal<string>('all');
  searchQuery = signal<string>('');

  readonly filteredProducts = computed(() => {
    return this.productService.filterProducts(
      this.selectedCategory(),
      this.searchQuery()
    );
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }
      if (params['q']) {
        this.searchQuery.set(params['q']);
      }
    });
  }

  setCategory(catSlug: string): void {
    this.selectedCategory.set(catSlug);
  }

  clearFilters(): void {
    this.selectedCategory.set('all');
    this.searchQuery.set('');
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

  getWhatsAppInquiry(product: Product): string {
    const text = `Vanakkam! I would like to enquire about the price and availability of *${product.name}* (${product.tamilName || ''}) from Manthalir Parampariyam.`;
    return `https://wa.me/917010136599?text=${encodeURIComponent(text)}`;
  }
}
