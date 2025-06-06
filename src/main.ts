/**
 * Punto de entrada principal de la aplicación Angular
 * Frontend para microservicios de productos e inventario
 * Desarrollado por Juan José Ariza V.
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error('Error al iniciar la aplicación:', err)); 