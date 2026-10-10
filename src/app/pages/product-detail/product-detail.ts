import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);

  product = signal<Product | undefined>(undefined);
  relatedProducts = signal<Product[]>([]);
  quantity = signal<number>(1);
  addedToCartAlert = signal<boolean>(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        const id = parseInt(idParam, 10);
        const found = this.productService.getProductById(id);
        this.product.set(found);
        this.quantity.set(1);
        this.addedToCartAlert.set(false);

        if (found) {
          // Related products from same category or others
          const related = this.productService.getProducts()
            .filter(p => p.id !== found.id && p.categorySlug === found.categorySlug)
            .slice(0, 3);
          this.relatedProducts.set(related);
        }
      }
    });
  }

  incrementQty(): void {
    this.quantity.update(q => q + 1);
  }

  decrementQty(): void {
    this.quantity.update(q => Math.max(1, q - 1));
  }

  addToCart(): void {
    const prod = this.product();
    if (prod) {
      this.cartService.addToCart(prod, this.quantity());
      this.addedToCartAlert.set(true);
      setTimeout(() => this.addedToCartAlert.set(false), 3000);
    }
  }

  toggleWishlist(): void {
    const prod = this.product();
    if (prod) {
      this.wishlistService.toggleWishlist(prod);
    }
  }

  isInWishlist(): boolean {
    const prod = this.product();
    return prod ? this.wishlistService.isInWishlist(prod.id) : false;
  }

  getWhatsAppLink(): string {
    const prod = this.product();
    if (!prod) return 'https://wa.me/917010136599';
    const text = `Vanakkam! I would like to order / enquire about *${prod.name}* (${prod.tamilName || ''}) with quantity: ${this.quantity()} from Manthalir Parampariyam.`;
    return `https://wa.me/917010136599?text=${encodeURIComponent(text)}`;
  }
}
