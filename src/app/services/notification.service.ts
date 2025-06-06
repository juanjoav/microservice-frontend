/**
 * Servicio para gestión de notificaciones y alertas
 * Maneja mensajes de éxito, error, warnings e información
 * Desarrollado por Juan José Ariza V.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from '../../environments/environment';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  autoHide: boolean;
  duration: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  type?: 'primary' | 'secondary' | 'danger';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private nextId = 1;

  constructor() {
    console.log('NotificationService inicializado por Juan José Ariza V.');
  }

  /**
   * Obtener todas las notificaciones activas
   */
  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  /**
   * Generar ID único para notificación
   */
  private generateId(): string {
    return `notification_${this.nextId++}_${Date.now()}`;
  }

  /**
   * Agregar una notificación
   */
  private addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): string {
    const id = this.generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date()
    };

    const currentNotifications = this.notifications$.value;
    this.notifications$.next([...currentNotifications, newNotification]);

    // Auto-ocultar si está configurado
    if (newNotification.autoHide) {
      timer(newNotification.duration).pipe(take(1)).subscribe(() => {
        this.remove(id);
      });
    }

    console.log('Nueva notificación agregada:', newNotification);
    return id;
  }

  /**
   * Mostrar notificación de éxito
   */
  success(title: string, message: string, autoHide: boolean = true, duration?: number): string {
    return this.addNotification({
      type: 'success',
      title,
      message,
      autoHide,
      duration: duration || environment.app.notifications.autoHideDelay
    });
  }

  /**
   * Mostrar notificación de error
   */
  error(title: string, message: string, autoHide: boolean = false, actions?: NotificationAction[]): string {
    return this.addNotification({
      type: 'error',
      title,
      message,
      autoHide,
      duration: autoHide ? environment.app.notifications.autoHideDelay : 0,
      actions
    });
  }

  /**
   * Mostrar notificación de advertencia
   */
  warning(title: string, message: string, autoHide: boolean = true, duration?: number): string {
    return this.addNotification({
      type: 'warning',
      title,
      message,
      autoHide,
      duration: duration || environment.app.notifications.autoHideDelay
    });
  }

  /**
   * Mostrar notificación informativa
   */
  info(title: string, message: string, autoHide: boolean = true, duration?: number): string {
    return this.addNotification({
      type: 'info',
      title,
      message,
      autoHide,
      duration: duration || environment.app.notifications.autoHideDelay
    });
  }

  /**
   * Remover una notificación específica
   */
  remove(id: string): void {
    const currentNotifications = this.notifications$.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notifications$.next(filteredNotifications);
    console.log('Notificación removida:', id);
  }

  /**
   * Limpiar todas las notificaciones
   */
  clear(): void {
    this.notifications$.next([]);
    console.log('Todas las notificaciones removidas');
  }

  /**
   * Limpiar notificaciones por tipo
   */
  clearByType(type: Notification['type']): void {
    const currentNotifications = this.notifications$.value;
    const filteredNotifications = currentNotifications.filter(n => n.type !== type);
    this.notifications$.next(filteredNotifications);
    console.log(`Notificaciones de tipo '${type}' removidas`);
  }

  /**
   * Métodos de conveniencia para casos comunes
   */

  /**
   * Notificación de producto creado exitosamente
   */
  productCreated(productName: string): string {
    return this.success(
      'Producto Creado',
      `El producto "${productName}" ha sido creado exitosamente.`
    );
  }

  /**
   * Notificación de producto actualizado exitosamente
   */
  productUpdated(productName: string): string {
    return this.success(
      'Producto Actualizado',
      `El producto "${productName}" ha sido actualizado exitosamente.`
    );
  }

  /**
   * Notificación de producto eliminado exitosamente
   */
  productDeleted(productName: string): string {
    return this.success(
      'Producto Eliminado',
      `El producto "${productName}" ha sido eliminado exitosamente.`
    );
  }

  /**
   * Notificación de compra realizada exitosamente
   */
  purchaseCompleted(productName: string, quantity: number): string {
    return this.success(
      'Compra Realizada',
      `Se han comprado ${quantity} unidades de "${productName}" exitosamente.`
    );
  }

  /**
   * Notificación de inventario insuficiente
   */
  insufficientStock(productName: string, available: number, requested: number): string {
    return this.warning(
      'Stock Insuficiente',
      `Solo hay ${available} unidades disponibles de "${productName}". Se solicitaron ${requested} unidades.`,
      false
    );
  }

  /**
   * Notificación de error de conexión
   */
  connectionError(details?: string): string {
    const actions: NotificationAction[] = [
      {
        label: 'Reintentar',
        action: () => window.location.reload(),
        type: 'primary'
      }
    ];

    return this.error(
      'Error de Conexión',
      details || 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      false,
      actions
    );
  }

  /**
   * Notificación de error de autenticación
   */
  authenticationError(): string {
    return this.error(
      'Error de Autenticación',
      'La clave de API no es válida. Contacta al administrador del sistema.',
      false
    );
  }

  /**
   * Notificación de datos cargados exitosamente
   */
  dataLoaded(itemType: string, count: number): string {
    return this.info(
      'Datos Cargados',
      `Se han cargado ${count} ${itemType} exitosamente.`
    );
  }

  /**
   * Notificación de sincronización completada
   */
  syncCompleted(productName?: string): string {
    const message = productName 
      ? `El inventario de "${productName}" ha sido sincronizado.`
      : 'La sincronización de inventario ha sido completada.';
    
    return this.success('Sincronización Completada', message);
  }

  /**
   * Notificación de stock bajo
   */
  lowStockAlert(productName: string, currentStock: number): string {
    return this.warning(
      'Stock Bajo',
      `El producto "${productName}" tiene solo ${currentStock} unidades en stock.`,
      false
    );
  }

  /**
   * Notificación de producto sin stock
   */
  outOfStockAlert(productName: string): string {
    return this.error(
      'Sin Stock',
      `El producto "${productName}" está sin stock.`,
      false
    );
  }

  /**
   * Obtener notificaciones por tipo
   */
  getNotificationsByType(type: Notification['type']): Observable<Notification[]> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        const filtered = notifications.filter(n => n.type === type);
        observer.next(filtered);
      });
    });
  }

  /**
   * Verificar si hay notificaciones de error activas
   */
  hasErrorNotifications(): Observable<boolean> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        const hasErrors = notifications.some(n => n.type === 'error');
        observer.next(hasErrors);
      });
    });
  }

  /**
   * Obtener conteo de notificaciones por tipo
   */
  getNotificationCount(): Observable<{ total: number, errors: number, warnings: number }> {
    return new Observable(observer => {
      this.notifications$.subscribe(notifications => {
        const total = notifications.length;
        const errors = notifications.filter(n => n.type === 'error').length;
        const warnings = notifications.filter(n => n.type === 'warning').length;
        
        observer.next({ total, errors, warnings });
      });
    });
  }
} 