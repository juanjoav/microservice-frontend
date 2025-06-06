/**
 * Configuración principal de la aplicación Angular
 * Frontend para microservicios de productos e inventario
 * Desarrollado por Juan José Ariza V.
 */

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

/**
 * Configuración principal de la aplicación
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Router
    provideRouter(routes),
    
    // HTTP Client con configuración
    provideHttpClient(
      withFetch(), // Usar Fetch API en lugar de XMLHttpRequest
      // withInterceptors([]) // Agregar interceptors aquí si es necesario
    ),
    
    // Animaciones para mejor UX
    provideAnimations(),
    
    // Formularios reactivos
    importProvidersFrom(
      FormsModule,
      ReactiveFormsModule
    ),
    
    // Servicios personalizados se auto-registran con providedIn: 'root'
    // ProductsService, InventoryService, NotificationService
  ]
};

/**
 * Configuración para el entorno de desarrollo
 */
export const devConfig = {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    // Providers específicos para desarrollo
  ]
};

/**
 * Configuración para el entorno de producción
 */
export const prodConfig = {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    // Providers específicos para producción
  ]
};

/**
 * Obtener configuración según el entorno
 */
export function getAppConfig(): ApplicationConfig {
  if (environment.production) {
    console.log('Cargando configuración de producción - Juan José Ariza V.');
    return prodConfig;
  } else {
    console.log('Cargando configuración de desarrollo - Juan José Ariza V.');
    return devConfig;
  }
} 