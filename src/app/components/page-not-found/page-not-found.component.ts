/**
 * Componente 404 - Página no encontrada
 * Desarrollado por Juan José Ariza V.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="error-state">
            <div class="text-center">
              <div class="error-icon">
                <i class="bi bi-exclamation-triangle-fill text-warning"></i>
              </div>
              <h1 class="display-1 fw-bold text-primary">404</h1>
              <div class="error-title">Página No Encontrada</div>
              <div class="error-message">
                Lo sentimos, la página que estás buscando no existe o ha sido movida.
              </div>
              
              <div class="mt-4">
                <button class="btn btn-primary btn-lg me-3" routerLink="/products">
                  <i class="bi bi-house me-2"></i>
                  Ir a Productos
                </button>
                <button class="btn btn-outline-primary" (click)="goBack()">
                  <i class="bi bi-arrow-left me-2"></i>
                  Volver Atrás
                </button>
              </div>
              
              <div class="mt-4">
                <small class="text-muted">
                  <i class="bi bi-info-circle me-1"></i>
                  Si crees que esto es un error, por favor contacta al desarrollador.
                </small>
              </div>
              
              <div class="mt-3">
                <small class="text-muted">
                  Desarrollado por Juan José Ariza V.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-state {
      padding: 4rem 0;
    }
    
    .error-icon {
      font-size: 5rem;
      margin-bottom: 2rem;
    }
    
    .error-title {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #6c757d;
    }
    
    .error-message {
      font-size: 1.1rem;
      color: #6c757d;
      margin-bottom: 2rem;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }
  `]
})
export class PageNotFoundComponent {
  constructor() {
    console.log('PageNotFoundComponent inicializado por Juan José Ariza V.');
  }
  
  goBack(): void {
    window.history.back();
  }
} 