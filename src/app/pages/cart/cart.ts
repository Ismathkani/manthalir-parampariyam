import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent {
  readonly cartService = inject(CartService);

  customerNotes = signal<string>('');

  updateQty(productId: number, newQty: number): void {
    this.cartService.updateQuantity(productId, newQty);
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  checkoutViaWhatsApp(): void {
    const url = this.cartService.getWhatsAppCheckoutUrl(this.customerNotes());
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
