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
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/login/login').then(m => m.AdminLoginComponent),
    title: 'Admin Login | Manthalir Parampariyam'
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./pages/admin/dashboard/dashboard').then(m => m.AdminDashboardComponent),
    canActivate: [() => import('./guards/auth.guard').then(m => m.authGuard)],
    title: 'Admin Dashboard | Manthalir Parampariyam'
  },
  {
    path: 'admin',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
