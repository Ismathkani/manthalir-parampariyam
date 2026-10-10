import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class ContactComponent {
  name = signal<string>('');
  phone = signal<string>('');
  productInterest = signal<string>('General Enquiry');
  message = signal<string>('');

  sendWhatsAppMessage(): void {
    let msg = `🌿 *Website Enquiry - Manthalir Parampariyam*\n\n`;
    if (this.name()) msg += `*Name:* ${this.name()}\n`;
    if (this.phone()) msg += `*Phone:* ${this.phone()}\n`;
    msg += `*Subject:* ${this.productInterest()}\n`;
    if (this.message()) msg += `*Message:* ${this.message()}\n`;

    const url = `https://wa.me/917010136599?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
