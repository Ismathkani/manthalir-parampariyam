import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
    title: 'Manthalir Parampariyam | Home - Pure Traditional Herbal Care'
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products').then(m => m.ProductsComponent),
    title: 'All 16 Products | Manthalir Parampariyam'
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetailComponent),
    title: 'Product Details | Manthalir Parampariyam'
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart').then(m => m.CartComponent),
    title: 'Shopping Cart | Manthalir Parampariyam'
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./pages/wishlist/wishlist').then(m => m.WishlistComponent),
    title: 'My Wishlist | Manthalir Parampariyam'
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent),
    title: 'About Us | Manthalir Parampariyam'
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent),
    title: 'Contact Us | Manthalir Parampariyam'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
