/**
 * Componente para lista de productos con paginación
 * Desarrollado por Juan José Ariza V.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { 
  Product, 
  ProductWithInventory, 
  ProductFilters,
  PaginatedResponse,
  LoadingState 
} from '../../interfaces';
import { ProductsService, InventoryService, NotificationService } from '../../services';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="text-gradient mb-0">
            <i class="bi bi-box-seam me-2"></i>
            Productos
          </h2>
          <p class="text-muted mb-0">Gestión de productos e inventario</p>
        </div>
        <div>
          <button 
            class="btn btn-primary btn-custom"
            routerLink="/products/new">
            <i class="bi bi-plus-circle me-2"></i>
            Nuevo Producto
          </button>
        </div>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="card card-custom mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Buscar por nombre:</label>
              <input 
                type="text" 
                class="form-control form-control-custom"
                [(ngModel)]="filters.name"
                (input)="applyFilters()"
                placeholder="Ingresa el nombre del producto">
            </div>
            <div class="col-md-3">
              <label class="form-label">Precio mínimo:</label>
              <input 
                type="number" 
                class="form-control form-control-custom"
                [(ngModel)]="filters.priceMin"
                (input)="applyFilters()"
                placeholder="0">
            </div>
            <div class="col-md-3">
              <label class="form-label">Precio máximo:</label>
              <input 
                type="number" 
                class="form-control form-control-custom"
                [(ngModel)]="filters.priceMax"
                (input)="applyFilters()"
                placeholder="999999">
            </div>
            <div class="col-md-2 d-flex align-items-end">
              <button 
                class="btn btn-outline-secondary w-100"
                (click)="clearFilters()">
                <i class="bi bi-x-circle me-1"></i>
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Estados de carga y error -->
      <div *ngIf="loadingState.loading" class="text-center py-5">
        <div class="loading-spinner-custom text-primary"></div>
        <p class="mt-3 text-muted">Cargando productos...</p>
      </div>

      <div *ngIf="loadingState.error && !loadingState.loading" class="error-state">
        <i class="bi bi-exclamation-triangle error-icon"></i>
        <div class="error-title">Error al cargar productos</div>
        <div class="error-message">{{loadingState.error}}</div>
        <button class="btn btn-primary mt-3" (click)="loadProducts()">
          <i class="bi bi-arrow-clockwise me-2"></i>
          Reintentar
        </button>
      </div>

      <!-- Lista de productos -->
      <div *ngIf="!loadingState.loading && !loadingState.error">
        <!-- Sin productos -->
        <div *ngIf="products.length === 0" class="empty-state">
          <i class="bi bi-box empty-icon"></i>
          <div class="empty-title">No hay productos disponibles</div>
          <div class="empty-message">
            No se encontraron productos que coincidan con los filtros aplicados.
            <br>
            Intenta ajustar los criterios de búsqueda o crear un nuevo producto.
          </div>
          <button 
            class="btn btn-primary btn-custom"
            routerLink="/products/new">
            <i class="bi bi-plus-circle me-2"></i>
            Crear Primer Producto
          </button>
        </div>

        <!-- Grid de productos -->
        <div *ngIf="products.length > 0" class="row">
          <div 
            *ngFor="let product of products; trackBy: trackProduct" 
            class="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4">
            
            <div class="card product-card shadow-custom h-100">
              <!-- Imagen del producto -->
              <div class="product-image">
                <i class="bi bi-image" *ngIf="!product.imagen || product.imagen === ''"></i>
                <img 
                  *ngIf="product.imagen && product.imagen !== ''" 
                  [src]="product.imagen" 
                  [alt]="product.name"
                  class="w-100 h-100 object-fit-cover"
                  (error)="handleImageError($event)">
              </div>

              <!-- Información del producto -->
              <div class="card-body product-info d-flex flex-column">
                <h5 class="card-title text-truncate" [title]="product.name">
                  {{product.name}}
                </h5>
                
                <p class="card-text text-muted flex-grow-1" [title]="product.description">
                  {{product.description | slice:0:100}}
                  <span *ngIf="product.description.length > 100">...</span>
                </p>

                <div class="product-price mb-2">
                  \${{product.price | number:'1.2-2'}}
                </div>

                <!-- Estado del inventario -->
                <div class="mb-3">
                  <div 
                    *ngIf="getInventoryForProduct(product.id!) as inventory"
                    class="d-flex align-items-center">
                    <span 
                      class="badge me-2"
                      [ngClass]="getStockBadgeClass(inventory.quantity)">
                      {{getStockText(inventory.quantity)}}
                    </span>
                    <small class="text-muted">{{inventory.quantity}} disponibles</small>
                  </div>
                  
                  <div *ngIf="!getInventoryForProduct(product.id!)" class="text-muted">
                    <small>
                      <i class="bi bi-hourglass-split me-1"></i>
                      Consultando inventario...
                    </small>
                  </div>
                </div>

                <!-- Acciones -->
                <div class="d-grid gap-2">
                  <button 
                    class="btn btn-outline-primary btn-sm"
                    [routerLink]="['/products', product.id]">
                    <i class="bi bi-eye me-1"></i>
                    Ver Detalles
                  </button>
                  
                  <div class="btn-group" role="group">
                    <button 
                      class="btn btn-outline-secondary btn-sm"
                      [routerLink]="['/products/edit', product.id]">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button 
                      class="btn btn-outline-danger btn-sm"
                      (click)="confirmDelete(product)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación -->
        <nav *ngIf="totalPages > 1" aria-label="Paginación de productos">
          <ul class="pagination pagination-custom justify-content-center mt-4">
            <li class="page-item" [class.disabled]="currentPage === 0">
              <button class="page-link" (click)="goToPage(currentPage - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            
            <li 
              *ngFor="let page of getPageNumbers()" 
              class="page-item"
              [class.active]="page === currentPage">
              <button class="page-link" (click)="goToPage(page)">
                {{page + 1}}
              </button>
            </li>
            
            <li class="page-item" [class.disabled]="currentPage === totalPages - 1">
              <button class="page-link" (click)="goToPage(currentPage + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
          
          <div class="text-center text-muted">
            <small>
              Mostrando {{(currentPage * pageSize) + 1}} - 
              {{Math.min((currentPage + 1) * pageSize, totalItems)}} 
              de {{totalItems}} productos
            </small>
          </div>
        </nav>
      </div>
    </div>
  `,
  styles: []
})
export class ProductListComponent implements OnInit, OnDestroy {
  // Propiedades públicas
  products: Product[] = [];
  inventoryMap = new Map<number, any>();
  
  // Filtros
  filters: ProductFilters = {};
  
  // Paginación
  currentPage = 0;
  pageSize = 12;
  totalItems = 0;
  totalPages = 0;
  
  // Estado de carga
  loadingState: LoadingState = {
    loading: false,
    error: null,
    lastUpdate: null
  };

  // Para cleanup
  private destroy$ = new Subject<void>();
  
  // Referencia a Math para usar en template
  Math = Math;

  constructor(
    private productsService: ProductsService,
    private inventoryService: InventoryService,
    private notificationService: NotificationService
  ) {
    console.log('ProductListComponent inicializado por Juan José Ariza V.');
  }

  ngOnInit(): void {
    this.loadProducts();
    this.setupLoadingState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configurar observables de estado de carga
   */
  private setupLoadingState(): void {
    this.productsService.getLoadingState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.loadingState = state;
      });
  }

  /**
   * Cargar productos con paginación
   */
  loadProducts(): void {
    this.productsService.getProducts({ page: this.currentPage, size: this.pageSize })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.products = response.data;
          this.totalItems = response.meta.totalRecords;
          this.totalPages = response.meta.totalPages;
          
          // Cargar inventarios para los productos
          this.loadInventoriesForProducts();
          
          this.notificationService.dataLoaded('productos', this.products.length);
        },
        error: (error) => {
          console.error('Error cargando productos:', error);
          this.notificationService.connectionError(error.message);
        }
      });
  }

  /**
   * Cargar inventarios para los productos actuales
   */
  private loadInventoriesForProducts(): void {
    const productIds = this.products.map(p => p.id!);
    
    this.inventoryService.getMultipleProductQuantities(productIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (inventoryMap) => {
          this.inventoryMap = inventoryMap;
        },
        error: (error) => {
          console.warn('Error cargando inventarios:', error);
        }
      });
  }

  /**
   * Aplicar filtros de búsqueda
   */
  applyFilters(): void {
    // Resetear a primera página al aplicar filtros
    this.currentPage = 0;
    
    // TODO: Implementar filtrado en servidor o local
    console.log('Aplicando filtros:', this.filters);
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this.filters = {};
    this.currentPage = 0;
    this.loadProducts();
  }

  /**
   * Ir a página específica
   */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  /**
   * Obtener números de página para mostrar
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5; // Mostrar máximo 5 páginas
    
    let start = Math.max(0, this.currentPage - Math.floor(maxPages / 2));
    let end = Math.min(this.totalPages - 1, start + maxPages - 1);
    
    // Ajustar si estamos cerca del final
    if (end - start < maxPages - 1) {
      start = Math.max(0, end - maxPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  /**
   * Track function para ngFor
   */
  trackProduct(index: number, product: Product): number {
    return product.id || index;
  }

  /**
   * Obtener inventario para un producto
   */
  getInventoryForProduct(productId: number): any {
    return this.inventoryMap.get(productId);
  }

  /**
   * Obtener clase CSS para badge de stock
   */
  getStockBadgeClass(quantity: number): string {
    if (quantity === 0) {
      return 'bg-danger';
    } else if (quantity <= 10) {
      return 'bg-warning text-dark';
    } else {
      return 'bg-success';
    }
  }

  /**
   * Obtener texto descriptivo del stock
   */
  getStockText(quantity: number): string {
    if (quantity === 0) {
      return 'Sin stock';
    } else if (quantity <= 10) {
      return 'Stock bajo';
    } else {
      return 'En stock';
    }
  }

  /**
   * Manejar error de imagen
   */
  handleImageError(event: any): void {
    event.target.style.display = 'none';
  }

  /**
   * Confirmar eliminación de producto
   */
  confirmDelete(product: Product): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el producto "${product.name}"?`)) {
      this.deleteProduct(product);
    }
  }

  /**
   * Eliminar producto
   */
  private deleteProduct(product: Product): void {
    this.productsService.deleteProduct(product.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.productDeleted(product.name);
          this.loadProducts(); // Recargar lista
        },
        error: (error) => {
          console.error('Error eliminando producto:', error);
          this.notificationService.error(
            'Error al eliminar',
            `No se pudo eliminar el producto: ${error.message}`
          );
        }
      });
  }
} 