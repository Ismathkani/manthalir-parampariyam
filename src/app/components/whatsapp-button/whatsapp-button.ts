import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  templateUrl: './whatsapp-button.html',
  styleUrl: './whatsapp-button.scss'
})
export class WhatsappButtonComponent {
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  readonly currentUrl = signal<string>(this.router.url);

  readonly whatsappUrl = 'https://wa.me/917010136599?text=' + encodeURIComponent('Vanakkam! I would like to enquire about Manthalir Parampariyam herbal products.');

  readonly hasFloatingCart = computed(() => {
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
}
