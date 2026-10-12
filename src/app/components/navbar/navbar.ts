import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);
  readonly wishlistService = inject(WishlistService);
  readonly productService = inject(ProductService);

  readonly categories = this.productService.getCategories();

  mobileMenuOpen = signal(false);
  categoriesDropdownOpen = signal(false);
  searchQuery = signal('');

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
    this.categoriesDropdownOpen.set(false);
  }

  toggleCategoriesDropdown(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.categoriesDropdownOpen.update(v => !v);
  }

  closeCategoriesDropdown(): void {
    this.categoriesDropdownOpen.set(false);
  }

  onSearchSubmit(): void {
    const q = this.searchQuery().trim();
    if (q) {
      this.router.navigate(['/products'], { queryParams: { q } });
      this.closeMobileMenu();
    }
  }
}
