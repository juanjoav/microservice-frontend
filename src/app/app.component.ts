/**
 * Componente principal de la aplicación
 * Frontend Angular para microservicios de productos e inventario
 * Desarrollado por Juan José Ariza V.
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../environments/environment';
import { NotificationService, Notification } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  template: `
    <!-- Navbar Principal -->
    <nav class="navbar navbar-expand-lg navbar-dark navbar-custom fixed-top">
      <div class="container">
        <!-- Brand -->
        <a class="navbar-brand" routerLink="/">
          <i class="bi bi-shop"></i>
          Products <span class="brand-highlight">Frontend</span>
          <small class="d-block" style="font-size: 0.6rem; opacity: 0.8;">
            por Juan José Ariza V.
          </small>
        </a>

        <!-- Mobile toggle button -->
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navigation links -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a 
                class="nav-link" 
                routerLink="/products" 
                routerLinkActive="active">
                <i class="bi bi-box-seam me-1"></i>
                Productos
              </a>
            </li>
            <li class="nav-item">
              <a 
                class="nav-link" 
                routerLink="/inventory" 
                routerLinkActive="active">
                <i class="bi bi-clipboard-data me-1"></i>
                Inventario
              </a>
            </li>
            <li class="nav-item">
              <a 
                class="nav-link" 
                routerLink="/about" 
                routerLinkActive="active">
                <i class="bi bi-info-circle me-1"></i>
                Acerca de
              </a>
            </li>
          </ul>

          <!-- Right side info -->
          <div class="navbar-nav">
            <div class="nav-item">
              <span class="navbar-text">
                <i class="bi bi-server me-1"></i>
                <small>API: {{apiStatus}}</small>
              </span>
            </div>
            
            <!-- Notification indicator -->
            <div class="nav-item" *ngIf="notificationCount$ | async as count">
              <div class="navbar-text" *ngIf="count.total > 0">
                <span class="badge bg-warning rounded-pill">
                  {{count.total}}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Notifications Container -->
    <div class="notifications-container">
      <div 
        *ngFor="let notification of notifications$ | async; trackBy: trackNotification"
        class="alert alert-{{getAlertClass(notification.type)}} alert-dismissible fade show alert-custom"
        role="alert">
        
        <div class="d-flex">
          <div class="flex-grow-1">
            <strong>
              <i class="{{getNotificationIcon(notification.type)}} me-2"></i>
              {{notification.title}}
            </strong>
            <div class="mt-1">{{notification.message}}</div>
            
            <!-- Actions if present -->
            <div class="mt-2" *ngIf="notification.actions && notification.actions.length > 0">
              <button 
                *ngFor="let action of notification.actions"
                type="button" 
                class="btn btn-sm btn-{{action.type || 'primary'}} me-2"
                (click)="executeAction(action)">
                {{action.label}}
              </button>
            </div>
          </div>
          
          <button 
            type="button" 
            class="btn-close" 
            (click)="removeNotification(notification.id)"
            aria-label="Close">
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main-container pt-5 mt-3">
      <div class="container-fluid">
        <!-- Loading Overlay -->
        <div class="loading-overlay" *ngIf="isLoading">
          <div class="loading-content">
            <div class="spinner"></div>
            <div class="loading-text">Cargando...</div>
          </div>
        </div>

        <!-- Router Outlet -->
        <router-outlet></router-outlet>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-dark text-light py-4 mt-5">
      <div class="container">
        <div class="row">
          <div class="col-md-6">
            <h6 class="text-gradient">Products Frontend</h6>
            <p class="mb-1">
              <small>
                Frontend Angular para microservicios de productos e inventario
              </small>
            </p>
            <p class="mb-0">
              <small class="text-muted">
                Desarrollado con ❤️ por Juan José Ariza V.
              </small>
            </p>
          </div>
          <div class="col-md-6 text-md-end">
            <div class="mb-2">
              <small class="text-muted">Versión: {{appVersion}}</small>
            </div>
            <div class="mb-2">
              <small class="text-muted">Entorno: {{environment}}</small>
            </div>
            <div>
              <small class="text-muted">
                Última actualización: {{currentYear}}
              </small>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styleUrls: []
})
export class AppComponent implements OnInit, OnDestroy {
  // Propiedades públicas
  appVersion = environment.app.version;
  environment = environment.production ? 'Producción' : 'Desarrollo';
  currentYear = new Date().getFullYear();
  apiStatus = 'Conectando...';
  isLoading = false;

  // Observables
  notifications$: Observable<Notification[]>;
  notificationCount$: Observable<{total: number, errors: number, warnings: number}>;

  // Subject para cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {
    console.log('AppComponent inicializado por Juan José Ariza V.');
    
    // Inicializar observables
    this.notifications$ = this.notificationService.getNotifications();
    this.notificationCount$ = this.notificationService.getNotificationCount();
  }

  ngOnInit(): void {
    this.initializeApp();
    this.setupNotifications();
    this.checkApiStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializar la aplicación
   */
  private initializeApp(): void {
    console.log(`Iniciando ${environment.app.title} v${environment.app.version}`);
    console.log(`Desarrollado por: ${environment.app.author}`);
    
    // Mostrar notificación de bienvenida en desarrollo
    if (environment.development) {
      this.notificationService.info(
        'Modo Desarrollo',
        'La aplicación está ejecutándose en modo desarrollo.',
        true,
        3000
      );
    }
  }

  /**
   * Configurar manejo de notificaciones
   */
  private setupNotifications(): void {
    // Escuchar cambios en las notificaciones
    this.notifications$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(notifications => {
      // Log para debugging
      if (environment.development && notifications.length > 0) {
        console.log('Notificaciones activas:', notifications.length);
      }
    });
  }

  /**
   * Verificar estado de las APIs
   */
  private checkApiStatus(): void {
    // TODO: Implementar health check a las APIs
    // Por ahora simular estado
    setTimeout(() => {
      this.apiStatus = 'Conectado';
    }, 2000);
  }

  /**
   * Track function para ngFor de notificaciones
   */
  trackNotification(index: number, notification: Notification): string {
    return notification.id;
  }

  /**
   * Obtener clase CSS para el tipo de alerta
   */
  getAlertClass(type: Notification['type']): string {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  /**
   * Obtener icono para el tipo de notificación
   */
  getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'success': return 'bi bi-check-circle-fill';
      case 'error': return 'bi bi-exclamation-triangle-fill';
      case 'warning': return 'bi bi-exclamation-circle-fill';
      case 'info': return 'bi bi-info-circle-fill';
      default: return 'bi bi-info-circle-fill';
    }
  }

  /**
   * Remover una notificación
   */
  removeNotification(id: string): void {
    this.notificationService.remove(id);
  }

  /**
   * Ejecutar acción de notificación
   */
  executeAction(action: any): void {
    if (action && typeof action.action === 'function') {
      action.action();
    }
  }

  /**
   * Navegar a una ruta específica
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  /**
   * Limpiar todas las notificaciones
   */
  clearAllNotifications(): void {
    this.notificationService.clear();
  }
} 