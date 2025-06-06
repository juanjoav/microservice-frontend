/**
 * Definición de rutas de la aplicación
 * Frontend Angular - Desarrollado por Juan José Ariza V.
 */

import { Routes } from '@angular/router';

import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { InventoryDashboardComponent } from './components/inventory-dashboard/inventory-dashboard.component';
import { AboutComponent } from './components/about/about.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

export const routes: Routes = [
  // Ruta por defecto redirige a productos
  {
    path: '',
    redirectTo: '/products',
    pathMatch: 'full'
  },
  
  // Rutas principales - Importación directa por ahora
  {
    path: 'products',
    loadComponent: () => import('./components/product-list/product-list.component')
      .then(m => m.ProductListComponent),
    title: 'Productos | Juan José Ariza V.'
  },
  
  {
    path: 'products/new',
    component: ProductFormComponent,
    title: 'Nuevo Producto | Juan José Ariza V.'
  },
  
  {
    path: 'products/edit/:id',
    component: ProductFormComponent,
    title: 'Editar Producto | Juan José Ariza V.'
  },
  
  {
    path: 'products/:id',
    component: ProductDetailComponent,
    title: 'Detalle del Producto | Juan José Ariza V.'
  },
  
  {
    path: 'inventory',
    component: InventoryDashboardComponent,
    title: 'Dashboard de Inventario | Juan José Ariza V.'
  },
  
  {
    path: 'about',
    component: AboutComponent,
    title: 'Acerca de | Juan José Ariza V.'
  },
  
  // Ruta 404 - Página no encontrada
  {
    path: '**',
    component: PageNotFoundComponent,
    title: 'Página No Encontrada | Juan José Ariza V.'
  }
]; 