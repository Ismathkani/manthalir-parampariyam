import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly items = signal<CartItem[]>([]);

  readonly cartItems = this.items.asReadonly();

  readonly totalItems = computed(() => {
    return this.items().reduce((sum, item) => sum + item.quantity, 0);
  });

  readonly totalSubtotal = computed(() => {
    return this.items().reduce((sum, item) => {
      const price = item.product.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  });

  addToCart(product: Product, quantity = 1): void {
    const current = this.items();
    const existingIndex = current.findIndex(i => i.product.id === product.id);

    if (existingIndex > -1) {
      const updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity
      };
      this.items.set(updated);
    } else {
      this.items.set([...current, { product, quantity }]);
    }
  }

  removeFromCart(productId: number): void {
    this.items.set(this.items().filter(i => i.product.id !== productId));
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const current = this.items();
    const updated = current.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });
    this.items.set(updated);
  }

  clearCart(): void {
    this.items.set([]);
  }

  getWhatsAppCheckoutUrl(customerNotes = ''): string {
    const cart = this.items();
    if (cart.length === 0) {
      return 'https://wa.me/917010136599?text=' + encodeURIComponent('Vanakkam! I would like to enquire about Manthalir Parampariyam products.');
    }

    let message = `🌿 *Order Enquiry - Manthalir Parampariyam*\n\n`;
    message += `I would like to order the following products:\n`;

    cart.forEach((item, index) => {
      const priceStr = item.product.price ? ` - ₹${item.product.price * item.quantity}` : '';
      message += `${index + 1}. *${item.product.name}* (Qty: ${item.quantity}${priceStr})\n`;
    });

    const subtotal = this.totalSubtotal();
    if (subtotal > 0) {
      message += `\n*Estimated Total:* ₹${subtotal}\n`;
    }

    if (customerNotes) {
      message += `\n*Customer Note:* ${customerNotes}\n`;
    }

    message += `\nPlease confirm order and share delivery details for Trichy / Tamil Nadu. Thank you!`;

    return `https://wa.me/917010136599?text=${encodeURIComponent(message)}`;
  }
}
