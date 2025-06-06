/**
 * Componente para crear/editar productos
 * Formulario reactivo con validaciones completas
 * Desarrollado por Juan José Ariza V.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { ProductsService } from '../../services/products.service';
import { NotificationService } from '../../services/notification.service';
import { Product, CreateProductRequest, UpdateProductRequest } from '../../interfaces';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Breadcrumb Navigation -->
          <nav aria-label="breadcrumb" class="mb-4">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <a routerLink="/products" class="text-decoration-none">
                  <i class="bi bi-house-door me-1"></i>Productos
                </a>
              </li>
              <li class="breadcrumb-item active" aria-current="page">
                {{isEdit ? 'Editar' : 'Nuevo'}} Producto
              </li>
            </ol>
          </nav>

          <!-- Header -->
          <div class="card card-custom mb-4">
            <div class="card-header" [class]="isEdit ? 'bg-warning text-dark' : 'bg-success text-white'">
              <h2 class="card-title mb-0">
                <i class="bi me-2" [class]="isEdit ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
                {{isEdit ? 'Editar' : 'Crear'}} Producto
              </h2>
              <p class="mb-0 mt-2" *ngIf="isEdit && originalProduct">
                ID: {{originalProduct.id}} - {{originalProduct.name}}
              </p>
            </div>
            <div class="card-body">
              <!-- Loading State -->
              <div *ngIf="loading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">
                    {{isEdit ? 'Cargando producto...' : 'Procesando...'}}
                  </span>
                </div>
                <p class="mt-3 text-muted">
                  {{isEdit ? 'Cargando datos del producto...' : 'Guardando producto...'}}
                </p>
              </div>

              <!-- Error State -->
              <div *ngIf="error && !loading" class="alert alert-danger" role="alert">
                <h4 class="alert-heading">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  {{isEdit ? 'Error al cargar producto' : 'Error al guardar producto'}}
                </h4>
                <p>{{error}}</p>
                <hr>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-danger" (click)="loadProduct()" *ngIf="isEdit">
                    <i class="bi bi-arrow-clockwise me-2"></i>Reintentar Carga
                  </button>
                  <button class="btn btn-secondary" routerLink="/products">
                    <i class="bi bi-arrow-left me-2"></i>Volver a Productos
                  </button>
                </div>
              </div>

              <!-- Product Form -->
              <form *ngIf="!loading && !error" [formGroup]="productForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <!-- Nombre del Producto -->
                  <div class="col-md-6 mb-3">
                    <label for="name" class="form-label">
                      <strong>Nombre del Producto *</strong>
                    </label>
                    <input 
                      type="text" 
                      id="name"
                      class="form-control"
                      placeholder="Ej: iPhone 14 Pro"
                      formControlName="name"
                      [class.is-invalid]="isFieldInvalid('name')"
                      [class.is-valid]="isFieldValid('name')">
                    <div class="invalid-feedback" *ngIf="isFieldInvalid('name')">
                      <div *ngIf="productForm.get('name')?.errors?.['required']">
                        El nombre es requerido
                      </div>
                      <div *ngIf="productForm.get('name')?.errors?.['minlength']">
                        El nombre debe tener al menos 2 caracteres
                      </div>
                      <div *ngIf="productForm.get('name')?.errors?.['maxlength']">
                        El nombre no puede exceder 100 caracteres
                      </div>
                    </div>
                    <div class="form-text">
                      Nombre descriptivo del producto (2-100 caracteres)
                    </div>
                  </div>

                  <!-- Precio -->
                  <div class="col-md-6 mb-3">
                    <label for="price" class="form-label">
                      <strong>Precio *</strong>
                    </label>
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="bi bi-currency-dollar"></i>
                      </span>
                      <input 
                        type="number" 
                        id="price"
                        class="form-control"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        formControlName="price"
                        [class.is-invalid]="isFieldInvalid('price')"
                        [class.is-valid]="isFieldValid('price')">
                    </div>
                    <div class="invalid-feedback" *ngIf="isFieldInvalid('price')">
                      <div *ngIf="productForm.get('price')?.errors?.['required']">
                        El precio es requerido
                      </div>
                      <div *ngIf="productForm.get('price')?.errors?.['min']">
                        El precio debe ser mayor a 0
                      </div>
                      <div *ngIf="productForm.get('price')?.errors?.['max']">
                        El precio no puede exceder $999,999.99
                      </div>
                    </div>
                    <div class="form-text">
                      Precio en dólares (hasta $999,999.99)
                    </div>
                  </div>

                  <!-- Descripción -->
                  <div class="col-12 mb-4">
                    <label for="description" class="form-label">
                      <strong>Descripción</strong>
                    </label>
                    <textarea 
                      id="description"
                      class="form-control"
                      rows="4"
                      placeholder="Descripción detallada del producto (opcional)..."
                      formControlName="description"
                      [class.is-invalid]="isFieldInvalid('description')"
                      [class.is-valid]="isFieldValid('description')"></textarea>
                    <div class="invalid-feedback" *ngIf="isFieldInvalid('description')">
                      <div *ngIf="productForm.get('description')?.errors?.['maxlength']">
                        La descripción no puede exceder 500 caracteres
                      </div>
                    </div>
                    <div class="form-text">
                      Descripción opcional del producto (máximo 500 caracteres)
                    </div>
                  </div>
                </div>

                <!-- Form Actions -->
                <div class="row">
                  <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                      <button type="button" class="btn btn-outline-secondary" routerLink="/products">
                        <i class="bi bi-arrow-left me-2"></i>
                        Cancelar
                      </button>
                      
                      <div class="d-flex gap-2">
                        <button 
                          type="button" 
                          class="btn btn-outline-primary"
                          (click)="resetForm()"
                          [disabled]="submitting">
                          <i class="bi bi-arrow-clockwise me-2"></i>
                          Limpiar
                        </button>
                        
                        <button 
                          type="submit" 
                          class="btn"
                          [class]="isEdit ? 'btn-warning' : 'btn-success'"
                          [disabled]="productForm.invalid || submitting">
                          <span *ngIf="submitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                          <i *ngIf="!submitting" class="bi me-2" [class]="isEdit ? 'bi-pencil-square' : 'bi-plus-circle'"></i>
                          {{submitting ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}} Producto
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Form Summary -->
                <div class="row mt-4" *ngIf="productForm.valid">
                  <div class="col-12">
                    <div class="alert alert-info" role="alert">
                      <h6 class="alert-heading">
                        <i class="bi bi-info-circle me-2"></i>
                        Vista Previa del Producto
                      </h6>
                      <div class="row">
                        <div class="col-md-8">
                          <strong>{{productForm.get('name')?.value}}</strong>
                          <p class="mb-1" *ngIf="productForm.get('description')?.value">
                            {{productForm.get('description')?.value}}
                          </p>
                          <p class="mb-0" *ngIf="!productForm.get('description')?.value">
                            <em>Sin descripción</em>
                          </p>
                        </div>
                        <div class="col-md-4 text-md-end">
                          <span class="h4 text-success">
                            <i class="bi bi-currency-dollar"></i>{{productForm.get('price')?.value | number:'1.2-2'}}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card-custom {
      border: none;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      transition: box-shadow 0.15s ease-in-out;
    }
    
    .card-custom:hover {
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }
    
    .form-control:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }
    
    .input-group .input-group-text {
      border-color: #ced4da;
    }
    
    .form-control.is-valid {
      border-color: #198754;
    }
    
    .form-control.is-invalid {
      border-color: #dc3545;
    }
    
    .alert-info {
      border-left: 4px solid #0dcaf0;
    }
  `]
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estado del componente
  productId: number | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  error: string | null = null;
  
  // Datos
  originalProduct: Product | null = null;
  productForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private productsService: ProductsService,
    private notificationService: NotificationService
  ) {
    // Inicializar formulario reactivo
    this.productForm = this.createProductForm();
  }

  ngOnInit(): void {
    console.log('ProductFormComponent inicializado por Juan José Ariza V.');
    
    // Determinar si es modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !isNaN(Number(id))) {
      this.productId = Number(id);
      this.isEdit = true;
      this.loadProduct();
    } else if (id) {
      this.error = 'ID de producto inválido';
      this.notificationService.error('Error', 'ID de producto inválido');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Crear formulario reactivo con validaciones
   */
  private createProductForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.maxLength(500)
      ]],
      price: [null, [
        Validators.required,
        Validators.min(0.01),
        Validators.max(999999.99)
      ]]
    });
  }

  /**
   * FUNCIÓN PARA CARGAR PRODUCTO (MODO EDICIÓN)
   */
  loadProduct(): void {
    if (!this.productId) return;
    
    this.loading = true;
    this.error = null;

    this.productsService.getProductById(this.productId).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading = false)
    ).subscribe({
      next: (product: Product) => {
        this.originalProduct = product;
        this.populateForm(product);
        this.notificationService.success(
          'Producto Cargado', 
          `Datos de "${product.name}" cargados para edición`
        );
        console.log('Producto cargado para edición:', product);
      },
      error: (error: any) => {
        this.error = error.message || 'Error al cargar el producto';
        this.notificationService.error('Error de Carga', this.error || 'Error desconocido');
        console.error('Error al cargar producto:', error);
      }
    });
  }

  /**
   * Poblar formulario con datos del producto
   */
  private populateForm(product: Product): void {
    this.productForm.patchValue({
      name: product.name,
      description: product.description || '',
      price: product.price
    });
  }

  /**
   * FUNCIÓN PARA ENVIAR FORMULARIO (CREAR O EDITAR)
   */
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched();
      this.notificationService.warning(
        'Formulario Inválido',
        'Por favor, corrige los errores en el formulario'
      );
      return;
    }

    this.submitting = true;
    this.error = null;

    if (this.isEdit) {
      this.updateProduct();
    } else {
      this.createProduct();
    }
  }

  /**
   * CREAR NUEVO PRODUCTO
   */
  private createProduct(): void {
    const formData = this.productForm.value;
    const createRequest: CreateProductRequest = {
      name: formData.name.trim(),
      description: formData.description.trim() || '',
      imagen: '', // Valor por defecto - sin imagen por ahora
      price: Number(formData.price)
    };

    this.productsService.createProduct(createRequest).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.submitting = false)
    ).subscribe({
      next: (newProduct: Product) => {
        this.notificationService.success(
          'Producto Creado',
          `El producto "${newProduct.name}" ha sido creado exitosamente`
        );
        
        console.log('Producto creado exitosamente:', newProduct);
        
        // Redireccionar al detalle del producto recién creado
        this.router.navigate(['/products', newProduct.id]);
      },
      error: (error: any) => {
        this.error = error.message || 'Error al crear el producto';
        this.notificationService.error('Error de Creación', this.error || 'Error desconocido');
        console.error('Error al crear producto:', error);
      }
    });
  }

  /**
   * ACTUALIZAR PRODUCTO EXISTENTE
   */
  private updateProduct(): void {
    if (!this.productId) return;

    const formData = this.productForm.value;
    const updateRequest: UpdateProductRequest = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      price: Number(formData.price)
    };

    this.productsService.updateProduct(this.productId, updateRequest).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.submitting = false)
    ).subscribe({
      next: (updatedProduct: Product) => {
        this.originalProduct = updatedProduct;
        this.notificationService.success(
          'Producto Actualizado',
          `El producto "${updatedProduct.name}" ha sido actualizado exitosamente`
        );
        
        console.log('Producto actualizado exitosamente:', updatedProduct);
        
        // Redireccionar al detalle del producto
        this.router.navigate(['/products', updatedProduct.id]);
      },
      error: (error: any) => {
        this.error = error.message || 'Error al actualizar el producto';
        this.notificationService.error('Error de Actualización', this.error || 'Error desconocido');
        console.error('Error al actualizar producto:', error);
      }
    });
  }

  /**
   * Limpiar formulario
   */
  resetForm(): void {
    if (this.isEdit && this.originalProduct) {
      // En modo edición, restaurar valores originales
      this.populateForm(this.originalProduct);
      this.notificationService.info('Formulario Restaurado', 'Valores originales restaurados');
    } else {
      // En modo creación, limpiar formulario
      this.productForm.reset();
      this.notificationService.info('Formulario Limpio', 'Formulario reiniciado');
    }
  }

  /**
   * Marcar todos los campos como tocados para mostrar errores
   */
  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Verificar si un campo es inválido y ha sido tocado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Verificar si un campo es válido y ha sido tocado
   */
  isFieldValid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.valid && (field.dirty || field.touched));
  }

  /**
   * Obtener mensaje de error para un campo específico
   */
  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field && field.errors) {
      const errors = field.errors;
      
      if (errors['required']) return `${fieldName} es requerido`;
      if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
      if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
      if (errors['min']) return `Valor mínimo: ${errors['min'].min}`;
      if (errors['max']) return `Valor máximo: ${errors['max'].max}`;
    }
    
    return '';
  }

  /**
   * Verificar si hay cambios en el formulario
   */
  hasUnsavedChanges(): boolean {
    return this.productForm.dirty && !this.submitting;
  }
} 