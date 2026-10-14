import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-floating-cart-bar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './floating-cart-bar.html',
  styleUrl: './floating-cart-bar.scss'
})
export class FloatingCartBarComponent {
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);

  readonly currentUrl = signal<string>(this.router.url);

  readonly isVisible = computed(() => {
    const total = this.cartService.totalItems();
    if (total <= 0) return false;
    if (this.cartService.isDismissed()) return false;

    const url = this.currentUrl();
    if (url.startsWith('/cart') || url.startsWith('/admin')) {
      return false;
    }
    return true;
  });

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
      });
  }

  dismiss(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.cartService.dismissFloatingBar();
  }
}
