import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'item/new',
    loadComponent: () => import('./item-form/item-form.page').then((m) => m.ItemFormPage),
  },
  {
    path: 'item/:id/edit',
    loadComponent: () => import('./item-form/item-form.page').then((m) => m.ItemFormPage),
  },
  {
    path: 'item/:id',
    loadComponent: () => import('./item-detail/item-detail.page').then((m) => m.ItemDetailPage),
  },
  {
    path: 'category/:id',
    loadComponent: () => import('./category/category.page').then((m) => m.CategoryPage),
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
];
