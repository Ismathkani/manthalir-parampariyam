import { Component } from '@angular/core';

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  templateUrl: './whatsapp-button.html',
  styleUrl: './whatsapp-button.scss'
})
export class WhatsappButtonComponent {
  readonly whatsappUrl = 'https://wa.me/917010136599?text=' + encodeURIComponent('Vanakkam! I would like to enquire about Manthalir Parampariyam herbal products.');
}
