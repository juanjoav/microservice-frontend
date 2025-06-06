/**
 * Componente About - Información de la aplicación
 * Desarrollado por Juan José Ariza V.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="row">
        <div class="col-12">
          <div class="card card-custom">
            <div class="card-body">
              <div class="text-center mb-4">
                <i class="bi bi-info-circle display-1 text-primary mb-3"></i>
                <h2 class="text-gradient">Acerca de Products Frontend</h2>
              </div>
              
              <div class="row">
                <div class="col-md-8 mx-auto">
                  <div class="text-center mb-4">
                    <h4>Frontend Angular para Microservicios</h4>
                    <p class="lead text-muted">
                      Aplicación web moderna para gestión de productos e inventario
                    </p>
                  </div>
                  
                  <div class="row mb-4">
                    <div class="col-md-6">
                      <div class="card bg-light">
                        <div class="card-body">
                          <h6 class="card-title">
                            <i class="bi bi-person-badge me-2"></i>
                            Desarrollador
                          </h6>
                          <p class="card-text mb-0">Juan José Ariza V.</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card bg-light">
                        <div class="card-body">
                          <h6 class="card-title">
                            <i class="bi bi-tag me-2"></i>
                            Versión
                          </h6>
                          <p class="card-text mb-0">{{appVersion}}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="row mb-4">
                    <div class="col-md-6">
                      <div class="card bg-light">
                        <div class="card-body">
                          <h6 class="card-title">
                            <i class="bi bi-gear me-2"></i>
                            Framework
                          </h6>
                          <p class="card-text mb-0">Angular 17</p>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="card bg-light">
                        <div class="card-body">
                          <h6 class="card-title">
                            <i class="bi bi-palette me-2"></i>
                            UI Framework
                          </h6>
                          <p class="card-text mb-0">Bootstrap 5</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="card border-primary">
                    <div class="card-header bg-primary text-white">
                      <h6 class="mb-0">
                        <i class="bi bi-check-circle me-2"></i>
                        Funcionalidades Implementadas
                      </h6>
                    </div>
                    <div class="card-body">
                      <ul class="list-unstyled mb-0">
                        <li>✅ Gestión completa de productos (CRUD)</li>
                        <li>✅ Consulta de inventario en tiempo real</li>
                        <li>✅ Actualización de stock tras compras</li>
                        <li>✅ Interfaz responsive y moderna</li>
                        <li>✅ Manejo robusto de errores</li>
                        <li>✅ Sistema de notificaciones</li>
                        <li>✅ Estados de carga inteligentes</li>
                        <li>✅ Comunicación con microservicios backend</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div class="text-center mt-4">
                    <button class="btn btn-primary me-2" routerLink="/products">
                      <i class="bi bi-box-seam me-2"></i>
                      Ver Productos
                    </button>
                    <button class="btn btn-outline-primary" routerLink="/inventory">
                      <i class="bi bi-clipboard-data me-2"></i>
                      Dashboard Inventario
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AboutComponent {
  appVersion = environment.app.version;
  
  constructor() {
    console.log('AboutComponent inicializado por Juan José Ariza V.');
  }
} 