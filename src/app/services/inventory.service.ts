/**
 * Servicio para gestión de inventario
 * Conecta con el microservicio de inventario del backend
 * Desarrollado por Juan José Ariza V.
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, timer, forkJoin } from 'rxjs';
import { catchError, map, retry, tap, switchMap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { 
  Inventory,
  InventoryQueryResponse,
  PurchaseRequest,
  SyncInventoryRequest,
  StockStatus,
  getStockStatus,
  JsonApiResponse,
  JsonApiSuccessResponse,
  LoadingState
} from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private readonly baseUrl = environment.api.inventory.baseUrl;
  private readonly endpoints = environment.api.inventory.endpoints;
  
  // Cache para inventarios consultados
  private inventoryCache$ = new BehaviorSubject<Map<number, InventoryQueryResponse>>(new Map());
  private loadingState$ = new BehaviorSubject<LoadingState>({
    loading: false,
    error: null,
    lastUpdate: null
  });

  constructor(private http: HttpClient) {
    console.log('InventoryService inicializado por Juan José Ariza V.');
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
    let errorMessage = 'Error desconocido en inventario';
    
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

    console.error('Error en InventoryService:', errorMessage, error);
    
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
   * Obtener inventario del cache
   */
  getInventoryCache(): Observable<Map<number, InventoryQueryResponse>> {
    return this.inventoryCache$.asObservable();
  }

  /**
   * Obtener cantidad disponible de un producto
   */
  getProductQuantity(productId: number): Observable<InventoryQueryResponse> {
    this.updateLoadingState({ loading: true, error: null });

    const url = `${this.baseUrl}${this.endpoints.getQuantity}/${productId}`;

    return this.http.get<JsonApiResponse<InventoryQueryResponse>>(url, {
      headers: this.getHeaders()
    }).pipe(
      retry({
        count: environment.app.http.retryAttempts,
        delay: (error: any, retryCount: number) => {
          console.log(`Reintento ${retryCount} para obtener inventario del producto ${productId}`);
          return timer(environment.app.http.retryDelay * retryCount);
        }
      }),
      map(response => response.data),
      tap(inventory => {
        // Actualizar cache
        const currentCache = this.inventoryCache$.value;
        currentCache.set(productId, inventory);
        this.inventoryCache$.next(new Map(currentCache));
        
        this.updateLoadingState({ loading: false, error: null, lastUpdate: new Date() });
        console.log(`Inventario obtenido para producto ${productId}:`, inventory);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Actualizar cantidad tras una compra
   */
  purchaseProduct(productId: number, quantity: number): Observable<any> {
    this.updateLoadingState({ loading: true, error: null });

    const url = `${this.baseUrl}${this.endpoints.purchase}/${productId}/purchase/${quantity}`;

    return this.http.put<JsonApiSuccessResponse>(url, {}, {
      headers: this.getHeaders()
    }).pipe(
      retry({
        count: environment.app.http.retryAttempts,
        delay: (error: any, retryCount: number) => {
          console.log(`Reintento ${retryCount} para compra del producto ${productId}`);
          return timer(environment.app.http.retryDelay * retryCount);
        }
      }),
      tap(response => {
        // Invalidar cache para este producto y refrescar
        const currentCache = this.inventoryCache$.value;
        currentCache.delete(productId);
        this.inventoryCache$.next(new Map(currentCache));
        
        this.updateLoadingState({ loading: false, error: null, lastUpdate: new Date() });
        console.log(`Compra realizada para producto ${productId}, cantidad: ${quantity}`, response);
      }),
      // Después de la compra exitosa, refrescar el inventario
      switchMap(() => this.getProductQuantity(productId)),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Sincronizar inventario para un producto
   */
  syncInventory(productId: number): Observable<any> {
    this.updateLoadingState({ loading: true, error: null });

    const url = `${this.baseUrl}${this.endpoints.sync}`;
    const body: SyncInventoryRequest = { productId };

    return this.http.post<JsonApiSuccessResponse>(url, body, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        // Invalidar cache para este producto
        const currentCache = this.inventoryCache$.value;
        currentCache.delete(productId);
        this.inventoryCache$.next(new Map(currentCache));
        
        this.updateLoadingState({ loading: false, error: null, lastUpdate: new Date() });
        console.log(`Inventario sincronizado para producto ${productId}`, response);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Obtener múltiples inventarios de manera eficiente
   */
  getMultipleProductQuantities(productIds: number[]): Observable<Map<number, InventoryQueryResponse>> {
    if (productIds.length === 0) {
      return new Observable(observer => {
        observer.next(new Map());
        observer.complete();
      });
    }

    this.updateLoadingState({ loading: true, error: null });

    // Crear observables para cada producto
    const requests = productIds.map(productId => 
      this.getProductQuantity(productId).pipe(
        map(inventory => ({ productId, inventory })),
        catchError(error => {
          console.warn(`Error obteniendo inventario para producto ${productId}:`, error);
          // Retornar inventario por defecto en caso de error
          return new Observable(observer => {
            observer.next({ 
              productId, 
              inventory: { productId, quantity: 0 } as InventoryQueryResponse 
            });
            observer.complete();
          });
        })
      )
    );

    return forkJoin(requests).pipe(
      map(results => {
        const inventoryMap = new Map<number, InventoryQueryResponse>();
        results.forEach((result: any) => {
          inventoryMap.set(result.productId, result.inventory);
        });
        return inventoryMap;
      }),
      tap(() => {
        this.updateLoadingState({ loading: false, error: null, lastUpdate: new Date() });
      })
    );
  }

  /**
   * Obtener estado del stock con categorización
   */
  getStockStatus(productId: number, lowStockThreshold: number = 10): Observable<StockStatus> {
    return this.getProductQuantity(productId).pipe(
      map(inventory => getStockStatus(inventory.quantity, lowStockThreshold))
    );
  }

  /**
   * Verificar si un producto tiene stock suficiente para una compra
   */
  hasEnoughStock(productId: number, requestedQuantity: number): Observable<boolean> {
    return this.getProductQuantity(productId).pipe(
      map((inventory: InventoryQueryResponse) => inventory.quantity >= requestedQuantity),
      catchError(() => {
        // En caso de error, asumir que no hay stock
        return new Observable<boolean>(observer => {
          observer.next(false);
          observer.complete();
        });
      })
    );
  }

  /**
   * Obtener estadísticas de inventario desde cache
   */
  getInventoryStatistics(): Observable<any> {
    return this.inventoryCache$.pipe(
      map(cache => {
        const inventories = Array.from(cache.values());
        const totalProducts = inventories.length;
        const totalStock = inventories.reduce((sum, inv) => sum + inv.quantity, 0);
        
        const inStock = inventories.filter(inv => inv.quantity > 10).length;
        const lowStock = inventories.filter(inv => inv.quantity > 0 && inv.quantity <= 10).length;
        const outOfStock = inventories.filter(inv => inv.quantity === 0).length;

        return {
          totalProducts,
          totalStock,
          inStockProducts: inStock,
          lowStockProducts: lowStock,
          outOfStockProducts: outOfStock,
          lastUpdate: this.loadingState$.value.lastUpdate
        };
      })
    );
  }

  /**
   * Limpiar cache de inventario
   */
  clearInventoryCache(): void {
    this.inventoryCache$.next(new Map());
    this.updateLoadingState({ loading: false, error: null, lastUpdate: null });
    console.log('Cache de inventario limpiado');
  }

  /**
   * Obtener inventario desde cache (sin hacer petición HTTP)
   */
  getInventoryFromCache(productId: number): InventoryQueryResponse | null {
    const cache = this.inventoryCache$.value;
    return cache.get(productId) || null;
  }

  /**
   * Verificar si un producto está en cache
   */
  isProductInCache(productId: number): boolean {
    const cache = this.inventoryCache$.value;
    return cache.has(productId);
  }

  /**
   * Refrescar inventario específico
   */
  refreshProductInventory(productId: number): Observable<InventoryQueryResponse> {
    // Remover del cache para forzar nueva consulta
    const currentCache = this.inventoryCache$.value;
    currentCache.delete(productId);
    this.inventoryCache$.next(new Map(currentCache));
    
    return this.getProductQuantity(productId);
  }

  /**
   * Simular una compra (validación previa sin ejecutar)
   */
  simulatePurchase(productId: number, quantity: number): Observable<{ canPurchase: boolean, availableQuantity: number }> {
    return this.getProductQuantity(productId).pipe(
      map((inventory: InventoryQueryResponse) => ({
        canPurchase: inventory.quantity >= quantity,
        availableQuantity: inventory.quantity
      })),
      catchError(() => {
        return new Observable<{ canPurchase: boolean, availableQuantity: number }>(observer => {
          observer.next({ canPurchase: false, availableQuantity: 0 });
          observer.complete();
        });
      })
    );
  }
} 