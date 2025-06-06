/**
 * Componente para mostrar detalles de un producto
 * Incluye consulta de inventario y funcionalidad de compra
 * Desarrollado por Juan José Ariza V.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';

import { ProductsService } from '../../services/products.service';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../services/notification.service';
import { Product, Inventory, StockStatus, getStockStatus } from '../../interfaces';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="row">
        <div class="col-12">
          <!-- Breadcrumb Navigation -->
          <nav aria-label="breadcrumb" class="mb-4">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <a routerLink="/products" class="text-decoration-none">
                  <i class="bi bi-house-door me-1"></i>Productos
                </a>
              </li>
              <li class="breadcrumb-item active" aria-current="page">
                {{product?.name || 'Detalle del Producto'}}
              </li>
            </ol>
          </nav>

          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-3 text-muted">Cargando detalles del producto...</p>
          </div>

          <!-- Error State -->
          <div *ngIf="error && !loading" class="alert alert-danger" role="alert">
            <h4 class="alert-heading">
              <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar producto
            </h4>
            <p>{{error}}</p>
            <hr>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-danger" (click)="loadProductDetails()">
                <i class="bi bi-arrow-clockwise me-2"></i>Reintentar
              </button>
              <button class="btn btn-secondary" routerLink="/products">
                <i class="bi bi-arrow-left me-2"></i>Volver a Productos
              </button>
            </div>
          </div>

          <!-- Product Detail Content -->
          <div *ngIf="product && !loading" class="row">
            <!-- Product Information -->
            <div class="col-lg-8">
              <div class="card card-custom mb-4">
                <div class="card-header bg-primary text-white">
                  <h2 class="card-title mb-0">
                    <i class="bi bi-box-seam me-2"></i>{{product.name}}
                  </h2>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <h5>Información del Producto</h5>
                      <table class="table table-borderless">
                        <tr>
                          <td><strong>ID:</strong></td>
                          <td>{{product.id}}</td>
                        </tr>
                        <tr>
                          <td><strong>Nombre:</strong></td>
                          <td>{{product.name}}</td>
                        </tr>
                        <tr>
                          <td><strong>Descripción:</strong></td>
                          <td>{{product.description || 'No disponible'}}</td>
                        </tr>
                        <tr>
                          <td><strong>Precio:</strong></td>
                          <td>
                            <span class="h4 text-success">
                              <i class="bi bi-currency-dollar me-1"></i>
                              {{product.price | number:'1.2-2'}}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </div>
                    <div class="col-md-6">
                      <h5>Estado del Inventario</h5>
                      <div *ngIf="inventoryLoading" class="text-center py-3">
                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                          <span class="visually-hidden">Cargando inventario...</span>
                        </div>
                        <p class="small text-muted mt-2">Consultando disponibilidad...</p>
                      </div>
                      
                      <div *ngIf="inventory && !inventoryLoading">
                        <div class="inventory-info">
                          <div class="d-flex align-items-center mb-3">
                            <i class="bi bi-boxes me-2 fs-4" [class]="getStockIconClass()"></i>
                            <div>
                              <h6 class="mb-0">Cantidad Disponible</h6>
                              <span class="h3 mb-0" [class]="getStockTextClass()">
                                {{inventory.quantity}}
                              </span>
                              <span class="text-muted ms-2">unidades</span>
                            </div>
                          </div>
                          
                          <div class="alert" [class]="getStockAlertClass()" role="alert">
                            <i class="bi me-2" [class]="getStockIconClass()"></i>
                            <strong>{{getStockStatusText()}}</strong>
                            <div class="small mt-1">{{getStockDescription()}}</div>
                          </div>
                        </div>
                      </div>

                      <div *ngIf="inventoryError && !inventoryLoading" class="alert alert-warning" role="alert">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        No se pudo consultar el inventario
                        <button class="btn btn-sm btn-outline-warning ms-2" (click)="loadInventory()">
                          <i class="bi bi-arrow-clockwise"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Purchase Panel -->
            <div class="col-lg-4">
              <div class="card card-custom">
                <div class="card-header bg-success text-white">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-cart-plus me-2"></i>Realizar Compra
                  </h5>
                </div>
                <div class="card-body">
                  <form (ngSubmit)="onPurchase()" #purchaseForm="ngForm">
                    <div class="mb-3">
                      <label for="quantity" class="form-label">
                        <strong>Cantidad a comprar:</strong>
                      </label>
                      <div class="input-group">
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary"
                          (click)="decrementQuantity()"
                          [disabled]="purchaseQuantity <= 1">
                          <i class="bi bi-dash"></i>
                        </button>
                        <input 
                          type="number" 
                          id="quantity"
                          name="quantity"
                          class="form-control text-center"
                          [(ngModel)]="purchaseQuantity"
                          [min]="1"
                          [max]="getMaxPurchaseQuantity()"
                          required>
                        <button 
                          type="button" 
                          class="btn btn-outline-secondary"
                          (click)="incrementQuantity()"
                          [disabled]="purchaseQuantity >= getMaxPurchaseQuantity()">
                          <i class="bi bi-plus"></i>
                        </button>
                      </div>
                      <div class="form-text">
                        Máximo disponible: {{getMaxPurchaseQuantity()}} unidades
                      </div>
                    </div>

                    <div class="mb-3">
                      <div class="d-flex justify-content-between">
                        <span>Precio unitario:</span>
                        <span class="fw-bold">\${{product.price | number:'1.2-2'}}</span>
                      </div>
                      <div class="d-flex justify-content-between">
                        <span>Cantidad:</span>
                        <span class="fw-bold">{{purchaseQuantity}}</span>
                      </div>
                      <hr>
                      <div class="d-flex justify-content-between">
                        <span><strong>Total:</strong></span>
                        <span class="h5 text-success mb-0">
                          <strong>\${{getTotalPrice() | number:'1.2-2'}}</strong>
                        </span>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      class="btn btn-success w-100"
                      [disabled]="!canPurchase() || purchaseLoading">
                      <span *ngIf="purchaseLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                      <i *ngIf="!purchaseLoading" class="bi bi-cart-check me-2"></i>
                      {{purchaseLoading ? 'Procesando...' : 'Confirmar Compra'}}
                    </button>

                    <div *ngIf="!canPurchase() && inventory" class="alert alert-warning mt-3" role="alert">
                      <i class="bi bi-exclamation-triangle me-2"></i>
                      <small>
                        <span *ngIf="inventory.quantity === 0">Producto sin stock disponible</span>
                        <span *ngIf="inventory.quantity > 0 && purchaseQuantity > inventory.quantity">
                          Cantidad excede el stock disponible
                        </span>
                      </small>
                    </div>
                  </form>
                </div>
              </div>

              <!-- Product Actions -->
              <div class="card card-custom mt-3">
                <div class="card-body">
                  <h6 class="card-title">Acciones</h6>
                  <div class="d-grid gap-2">
                    <button class="btn btn-outline-primary" routerLink="/products">
                      <i class="bi bi-arrow-left me-2"></i>Volver a Productos
                    </button>
                    <button class="btn btn-outline-secondary" (click)="refreshData()">
                      <i class="bi bi-arrow-clockwise me-2"></i>Actualizar Datos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
  styles: [`
    .inventory-info {
      background: #f8f9fa;
      border-radius: 0.5rem;
      padding: 1rem;
    }
    
    .card-custom {
      border: none;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      transition: box-shadow 0.15s ease-in-out;
    }
    
    .card-custom:hover {
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }
    
    .input-group .btn {
      border-color: #ced4da;
    }
  `]
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estados del componente
  loading = false;
  error: string | null = null;
  inventoryLoading = false;
  inventoryError: string | null = null;
  purchaseLoading = false;
  
  // Datos
  productId: number = 0;
  product: Product | null = null;
  inventory: Inventory | null = null;
  
  // Compra
  purchaseQuantity = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private inventoryService: InventoryService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    console.log('ProductDetailComponent inicializado por Juan José Ariza V.');
    
    // Obtener ID del producto de la ruta
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !isNaN(Number(id))) {
      this.productId = Number(id);
      this.loadProductDetails();
    } else {
      this.error = 'ID de producto inválido';
      this.notificationService.error('Error', 'ID de producto inválido');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 1. CONSULTAR DETALLES DE UN PRODUCTO ESPECÍFICO
   * Cargar detalles completos del producto e inventario
   */
  loadProductDetails(): void {
    this.loading = true;
    this.error = null;

    // Cargar producto e inventario en paralelo usando forkJoin
    forkJoin({
      product: this.productsService.getProductById(this.productId),
      inventory: this.inventoryService.getProductQuantity(this.productId).pipe(
        catchError(error => {
          console.warn('Error al cargar inventario:', error);
          this.inventoryError = 'No se pudo cargar el inventario';
          return of(null);
        })
      )
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => {
        this.product = data.product;
        this.inventory = data.inventory;
        this.inventoryError = data.inventory ? null : 'No se pudo cargar el inventario';
        
        console.log('Producto cargado:', this.product);
        console.log('Inventario cargado:', this.inventory);
        
        this.notificationService.success('Producto Cargado', `Producto "${this.product.name}" cargado exitosamente`);
      },
      error: (error: any) => {
        this.error = error.message || 'Error al cargar el producto';
        this.notificationService.error('Error', this.error || 'Error desconocido');
        console.error('Error en loadProductDetails:', error);
      }
    });
  }

  /**
   * 2. MOSTRAR LA CANTIDAD DISPONIBLE DESDE EL MICROSERVICIO DE INVENTARIO
   * Cargar solo el inventario
   */
  loadInventory(): void {
    if (!this.productId) return;
    
    this.inventoryLoading = true;
    this.inventoryError = null;

    this.inventoryService.getProductQuantity(this.productId).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.inventoryLoading = false)
    ).subscribe({
      next: (inventory: any) => {
        this.inventory = inventory;
        console.log('Inventario actualizado:', inventory);
        this.notificationService.info('Inventario Actualizado', 'Inventario actualizado');
      },
      error: (error: any) => {
        this.inventoryError = error.message || 'Error al cargar inventario';
        this.notificationService.error('Error', this.inventoryError || 'Error desconocido');
        console.error('Error en loadInventory:', error);
      }
    });
  }

  /**
   * 3. ACTUALIZAR LA CANTIDAD DISPONIBLE TRAS UNA COMPRA
   * Procesar compra y actualizar inventario
   */
  onPurchase(): void {
    if (!this.canPurchase() || !this.product) return;

    this.purchaseLoading = true;
    const originalQuantity = this.purchaseQuantity;

    this.inventoryService.purchaseProduct(this.productId, this.purchaseQuantity).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.purchaseLoading = false)
    ).subscribe({
      next: (updatedInventory: any) => {
        // Actualizar inventario con la nueva cantidad
        this.inventory = updatedInventory;
        
        const total = this.getTotalPrice();
        this.notificationService.success(
          'Compra Exitosa',
          `¡Compra exitosa! ${originalQuantity} unidades por $${total.toFixed(2)}`
        );
        
        // Resetear cantidad de compra
        this.purchaseQuantity = 1;
        
        console.log('Compra procesada exitosamente:', {
          productId: this.productId,
          quantityPurchased: originalQuantity,
          newInventory: updatedInventory,
          previousQuantity: this.inventory ? this.inventory.quantity + originalQuantity : 'unknown'
        });
      },
      error: (error: any) => {
        this.notificationService.error(
          'Error de Compra',
          error.message || 'Error al procesar la compra'
        );
        console.error('Error en onPurchase:', error);
      }
    });
  }

  /**
   * Incrementar cantidad de compra
   */
  incrementQuantity(): void {
    if (this.purchaseQuantity < this.getMaxPurchaseQuantity()) {
      this.purchaseQuantity++;
    }
  }

  /**
   * Decrementar cantidad de compra
   */
  decrementQuantity(): void {
    if (this.purchaseQuantity > 1) {
      this.purchaseQuantity--;
    }
  }

  /**
   * Actualizar todos los datos
   */
  refreshData(): void {
    this.notificationService.info('Actualizando', 'Actualizando datos...');
    this.loadProductDetails();
  }

  /**
   * Verificar si se puede realizar la compra
   */
  canPurchase(): boolean {
    return !!(
      this.inventory &&
      this.inventory.quantity > 0 &&
      this.purchaseQuantity > 0 &&
      this.purchaseQuantity <= this.inventory.quantity &&
      !this.purchaseLoading
    );
  }

  /**
   * Obtener máxima cantidad que se puede comprar
   */
  getMaxPurchaseQuantity(): number {
    return this.inventory?.quantity || 0;
  }

  /**
   * Calcular precio total
   */
  getTotalPrice(): number {
    return this.product ? this.product.price * this.purchaseQuantity : 0;
  }

  /**
   * Obtener estado del stock
   */
  getStockStatus(): StockStatus {
    return getStockStatus(this.inventory?.quantity || 0);
  }

  /**
   * Obtener clase CSS para el ícono de stock
   */
  getStockIconClass(): string {
    const status = this.getStockStatus().status;
    const iconMap: { [key: string]: string } = {
      'in-stock': 'bi-check-circle-fill text-success',
      'low-stock': 'bi-exclamation-triangle-fill text-warning', 
      'out-of-stock': 'bi-x-circle-fill text-danger'
    };
    return iconMap[status] || iconMap['out-of-stock'];
  }

  /**
   * Obtener clase CSS para el texto de stock
   */
  getStockTextClass(): string {
    const status = this.getStockStatus().status;
    const classMap: { [key: string]: string } = {
      'in-stock': 'text-success',
      'low-stock': 'text-warning',
      'out-of-stock': 'text-danger'
    };
    return classMap[status] || classMap['out-of-stock'];
  }

  /**
   * Obtener clase CSS para la alerta de stock
   */
  getStockAlertClass(): string {
    const status = this.getStockStatus().status;
    const classMap: { [key: string]: string } = {
      'in-stock': 'alert-success',
      'low-stock': 'alert-warning',
      'out-of-stock': 'alert-danger'
    };
    return classMap[status] || classMap['out-of-stock'];
  }

  /**
   * Obtener texto del estado de stock
   */
  getStockStatusText(): string {
    const status = this.getStockStatus().status;
    const textMap: { [key: string]: string } = {
      'in-stock': 'Stock Disponible',
      'low-stock': 'Stock Bajo',
      'out-of-stock': 'Sin Stock'
    };
    return textMap[status] || textMap['out-of-stock'];
  }

  /**
   * Obtener descripción del estado de stock
   */
  getStockDescription(): string {
    const status = this.getStockStatus().status;
    const quantity = this.inventory?.quantity || 0;
    const descMap: { [key: string]: string } = {
      'in-stock': `Producto disponible (${quantity} unidades)`,
      'low-stock': `¡Pocas unidades disponibles! (${quantity} restantes)`,
      'out-of-stock': 'Producto agotado, no disponible para compra'
    };
    return descMap[status] || descMap['out-of-stock'];
  }
} 