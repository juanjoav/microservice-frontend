/**
 * Servicio para gestión de productos
 * Conecta con el microservicio de productos del backend
 * Desarrollado por Juan José Ariza V.
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, timer } from 'rxjs';
import { catchError, map, retry, tap, shareReplay } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest,
  ProductFilters,
  ProductSortOptions,
  JsonApiResponse,
  JsonApiListResponse,
  JsonApiErrorResponse,
  PaginationOptions,
  PaginatedResponse,
  LoadingState
} from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly baseUrl = environment.api.products.baseUrl;
  private readonly endpoints = environment.api.products.endpoints;
  
  // BehaviorSubject para mantener el estado de los productos en cache
  private productsCache$ = new BehaviorSubject<Product[]>([]);
  private loadingState$ = new BehaviorSubject<LoadingState>({
    loading: false,
    error: null,
    lastUpdate: null
  });

  constructor(private http: HttpClient) {
    console.log('ProductsService inicializado por Juan José Ariza V.');
  }

  /**
   * Headers HTTP con autenticación API Key
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      [environment.auth.headerName]: environment.auth.apiKey
    });
  }

  /**
   * Manejo de errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error && error.error.errors && error.error.errors.length > 0) {
        // Error en formato JSON API
        const jsonApiError = error.error.errors[0];
        errorMessage = `${jsonApiError.title}: ${jsonApiError.detail}`;
      } else {
        errorMessage = `Error del servidor (${error.status}): ${error.message}`;
      }
    }

    console.error('Error en ProductsService:', errorMessage, error);
    
    // Actualizar estado de error
    this.updateLoadingState({ loading: false, error: errorMessage, lastUpdate: new Date() });
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Actualizar estado de carga
   */
  private updateLoadingState(state: Partial<LoadingState>): void {
    const currentState = this.loadingState$.value;
    this.loadingState$.next({ ...currentState, ...state });
  }

  /**
   * Obtener estado de carga actual
   */
  getLoadingState(): Observable<LoadingState> {
    return this.loadingState$.asObservable();
  }

  /**
   * Obtener productos del cache
   */
  getProductsCache(): Observable<Product[]> {
    return this.productsCache$.asObservable();
  }

  /**
   * Obtener todos los productos con paginación
   */
  getProducts(options: PaginationOptions = { page: 0, size: 10 }): Observable<PaginatedResponse<Product>> {
    this.updateLoadingState({ loading: true, error: null });

    const params = new HttpParams()
      .set('page', options.page.toString())
      .set('size', options.size.toString());

    const url = `${this.baseUrl}${this.endpoints.products}`;

    return this.http.get<JsonApiListResponse<Product>>(url, {
      headers: this.getHeaders(),
      params
    }).pipe(
      retry({
        count: environment.app.http.retryAttempts,
        delay: (error, retryCount) => {
          console.log(`Reintento ${retryCount} para obtener productos`);
          return timer(environment.app.http.retryDelay * retryCount);
        }
      }),
      map(response => {
        // Actualizar cache con los productos obtenidos
        this.productsCache$.next(response.data);
        
        // Convertir a PaginatedResponse
        return {
          ...response,
          meta: {
            ...response.meta,
            totalRecords: response.meta.totalRecords || 0,
            page: response.meta.page || 0,
            size: response.meta.size || 10,
            totalPages: response.meta.totalPages || 0
          }
        } as PaginatedResponse<Product>;
      }),
      tap(() => {
        this.updateLoadingState({ loading: false, error: null, lastUpdate: new Date() });
      }),
      catchError(this.handleError.bind(this)),
      shareReplay(1) // Cache la última respuesta
    );
  }

  /**
   * Obtener un producto por ID
   */
  getProductById(id: number): Observable<Product> {
    this.updateLoadingState({ loading: true, error: null });

    const url = `${this.baseUrl}${this.endpoints.productById}/${id}`;

    return this.http.get<JsonApiResponse<Product>>(url, {
      headers: this.getHeaders()
    }).pipe(
      retry({
        count: environment.app.http.retryAttempts,
        delay: (error, retryCount) => {
          console.log(`Reintento ${retryCount} para obtener producto ${id}`);
          return timer(environment.app.http.retryDelay * retryCount);
        }
      }),
      map(response => response.data),
      tap(() => {
        this.updateLoadingState({ loading: false, error: null, lastUpdate: new Date() });
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Crear un nuevo producto
   */
  createProduct(product: CreateProductRequest): Observable<Product> {
    this.updateLoadingState({ loading: true, error: null });

    const url = `${this.baseUrl}${this.endpoints.createProduct}`;

    return this.http.post<JsonApiResponse<Product>>(url, product, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      tap(newProduct => {
        // Actualizar cache agregando el nuevo producto
        const currentProducts = this.productsCache$.value;
        this.productsCache$.next([...currentProducts, newProduct]);
        
        this.updateLoadingState({ loading: false, error: null, lastUpdate: new Date() });
        console.log('Producto creado exitosamente:', newProduct);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Actualizar un producto existente
   */
  updateProduct(id: number, product: UpdateProductRequest): Observable<Product> {
    this.updateLoadingState({ loading: true, error: null });

    const url = `${this.baseUrl}${this.endpoints.updateProduct}/${id}`;

    return this.http.put<JsonApiResponse<Product>>(url, product, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      tap(updatedProduct => {
        // Actualizar cache reemplazando el producto actualizado
        const currentProducts = this.productsCache$.value;
        const updatedProducts = currentProducts.map(p => 
          p.id === id ? updatedProduct : p
        );
        this.productsCache$.next(updatedProducts);
        
        this.updateLoadingState({ loading: false, error: null, lastUpdate: new Date() });
        console.log('Producto actualizado exitosamente:', updatedProduct);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Eliminar un producto
   */
  deleteProduct(id: number): Observable<void> {
    this.updateLoadingState({ loading: true, error: null });

    const url = `${this.baseUrl}${this.endpoints.deleteProduct}/${id}`;

    return this.http.delete<void>(url, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => {
        // Actualizar cache removiendo el producto eliminado
        const currentProducts = this.productsCache$.value;
        const filteredProducts = currentProducts.filter(p => p.id !== id);
        this.productsCache$.next(filteredProducts);
        
        this.updateLoadingState({ loading: false, error: null, lastUpdate: new Date() });
        console.log('Producto eliminado exitosamente, ID:', id);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Buscar productos con filtros (implementación local sobre cache)
   */
  searchProducts(filters: ProductFilters): Observable<Product[]> {
    return this.productsCache$.pipe(
      map(products => {
        return products.filter(product => {
          // Filtro por nombre
          if (filters.name && !product.name.toLowerCase().includes(filters.name.toLowerCase())) {
            return false;
          }
          
          // Filtro por precio mínimo
          if (filters.priceMin !== undefined && product.price < filters.priceMin) {
            return false;
          }
          
          // Filtro por precio máximo
          if (filters.priceMax !== undefined && product.price > filters.priceMax) {
            return false;
          }
          
          return true;
        });
      })
    );
  }

  /**
   * Ordenar productos (implementación local sobre cache)
   */
  sortProducts(sortOptions: ProductSortOptions): Observable<Product[]> {
    return this.productsCache$.pipe(
      map(products => {
        return [...products].sort((a, b) => {
          const aValue = a[sortOptions.field];
          const bValue = b[sortOptions.field];
          
          let comparison = 0;
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue);
          } else {
            comparison = (aValue as number) - (bValue as number);
          }
          
          return sortOptions.direction === 'desc' ? -comparison : comparison;
        });
      })
    );
  }

  /**
   * Refrescar cache de productos
   */
  refreshProducts(options?: PaginationOptions): Observable<PaginatedResponse<Product>> {
    console.log('Refrescando cache de productos...');
    return this.getProducts(options);
  }

  /**
   * Limpiar cache de productos
   */
  clearCache(): void {
    this.productsCache$.next([]);
    this.updateLoadingState({ loading: false, error: null, lastUpdate: null });
    console.log('Cache de productos limpiado');
  }

  /**
   * Verificar si hay productos en cache
   */
  hasProductsInCache(): boolean {
    return this.productsCache$.value.length > 0;
  }

  /**
   * Obtener estadísticas de productos
   */
  getProductStatistics(): Observable<any> {
    return this.productsCache$.pipe(
      map(products => {
        const total = products.length;
        const prices = products.map(p => p.price);
        const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

        return {
          totalProducts: total,
          averagePrice: avgPrice,
          maxPrice,
          minPrice,
          lastUpdate: this.loadingState$.value.lastUpdate
        };
      })
    );
  }
} 