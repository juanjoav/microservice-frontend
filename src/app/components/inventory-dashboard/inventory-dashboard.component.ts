/**
 * Componente para dashboard de inventario
 * Desarrollado por Juan José Ariza V.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 class="text-gradient mb-0">
                <i class="bi bi-clipboard-data me-2"></i>
                Dashboard de Inventario
              </h2>
              <p class="text-muted mb-0">Gestión y estadísticas de inventario</p>
            </div>
          </div>
          
          <div class="card card-custom">
            <div class="card-body text-center py-5">
              <i class="bi bi-bar-chart display-1 text-muted mb-3"></i>
              <h3>Dashboard de Inventario</h3>
              <p class="text-muted">
                Panel de control de inventario en desarrollo por Juan José Ariza V.
              </p>
              <p class="text-muted">
                Aquí se mostrarán estadísticas, gráficos y gestión de inventario.
              </p>
              <button class="btn btn-primary" routerLink="/products">
                <i class="bi bi-box-seam me-2"></i>
                Ver Productos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InventoryDashboardComponent {
  constructor() {
    console.log('InventoryDashboardComponent inicializado por Juan José Ariza V.');
  }
} 