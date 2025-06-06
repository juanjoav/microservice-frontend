# 🚀 Products Frontend

Frontend Angular para microservicios de productos e inventario

**Desarrollado por:** Juan José Ariza V.

## 📋 Descripción

Aplicación web frontend desarrollada en Angular que consume los microservicios de productos e inventario del backend. Proporciona una interfaz visual limpia y funcional para la gestión completa de productos y su inventario.

## 🎯 Funcionalidades Implementadas

### ✅ Gestión de Productos
- **Listar productos** con paginación inteligente
- **Consultar detalles** de productos específicos
- **Crear nuevos productos** con validación completa
- **Actualizar productos** existentes
- **Eliminar productos** con confirmación

### ✅ Gestión de Inventario
- **Consultar cantidad disponible** desde el microservicio de inventario
- **Actualizar cantidad** tras compras
- **Visualización del estado del stock** (En stock, Stock bajo, Sin stock)
- **Dashboard de inventario** con estadísticas

### ✅ Funcionalidades Técnicas
- **Manejo robusto de errores** de API con reintentos automáticos
- **Estados de carga** con spinners e indicadores visuales
- **Notificaciones inteligentes** para feedback del usuario
- **Interfaz responsive** compatible con dispositivos móviles
- **Pruebas unitarias** con cobertura de componentes principales

## 🛠️ Tecnologías Utilizadas

- **Angular 17** - Framework principal
- **TypeScript** - Lenguaje de programación
- **RxJS** - Programación reactiva
- **Bootstrap 5** - Framework CSS
- **Bootstrap Icons** - Iconografía
- **SCSS** - Preprocesador CSS
- **Jasmine + Karma** - Testing unitario

## 🏗️ Arquitectura

```
src/
├── app/
│   ├── components/           # Componentes de la UI
│   │   ├── product-list/    # Lista de productos con paginación
│   │   ├── product-detail/  # Detalle de producto individual
│   │   ├── product-form/    # Formulario crear/editar producto
│   │   └── inventory-dashboard/ # Dashboard de inventario
│   ├── services/            # Servicios para comunicación con APIs
│   │   ├── products.service.ts   # Servicio de productos
│   │   ├── inventory.service.ts  # Servicio de inventario
│   │   └── notification.service.ts # Servicio de notificaciones
│   ├── interfaces/          # Definición de tipos TypeScript
│   └── environments/        # Configuración por entorno
├── assets/                  # Recursos estáticos
└── styles.scss             # Estilos globales personalizados
```

## 🚀 Instalación y Ejecución

### Prerrequisitos
- **Node.js** 18+ y **npm** 9+
- **Angular CLI** 17+

### Configuración del Proyecto

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar entorno:**
   - Revisar `src/environments/environment.ts` para desarrollo
   - Ajustar URLs de las APIs si es necesario:
     - Products API: `http://localhost:8081`
     - Inventory API: `http://localhost:8082`

3. **Ejecutar en modo desarrollo:**
```bash
# Con proxy configurado para evitar errores CORS (recomendado)
npm start

# Sin proxy (requiere configuración CORS en backend)
npm run start:no-proxy
```

4. **Acceder a la aplicación:**
   - URL: http://localhost:63888 (con proxy configurado)
   - La aplicación se recarga automáticamente al detectar cambios
   - ⚠️ **Importante:** Para evitar errores CORS, asegurar que los microservicios backend estén ejecutándose

### 🔧 Configuración CORS

El proyecto incluye configuración de proxy para evitar errores CORS durante desarrollo:

- ✅ **Proxy configurado** en `proxy.conf.json`
- ✅ **URLs actualizadas** en `environment.ts`
- ✅ **Script npm** listo para uso inmediato

**Ver documentación completa:** [CORS-SETUP.md](./CORS-SETUP.md)

### Comandos Disponibles

```bash
# Desarrollo
npm start                    # Ejecutar servidor de desarrollo
npm run build               # Build para producción
npm run build:dev          # Build para desarrollo
npm run watch              # Build en modo watch

# Testing
npm test                   # Ejecutar pruebas unitarias
npm run test:coverage     # Ejecutar con reporte de cobertura
npm run test:watch        # Ejecutar en modo watch

# Linting y formato
npm run lint              # Verificar código con ESLint
npm run lint:fix          # Corregir problemas automáticamente

# Producción
npm run serve:prod        # Servidor con configuración de producción
```

## 🔧 Configuración de Entorno

### Variables de Entorno (environment.ts)

```typescript
export const environment = {
  production: false,
  api: {
    products: {
      baseUrl: 'http://localhost:8081'  // URL del microservicio de productos
    },
    inventory: {
      baseUrl: 'http://localhost:8082'  // URL del microservicio de inventario
    }
  },
  auth: {
    apiKey: 'clave123'                  // API Key para autenticación
  }
};
```

## 📊 Funcionalidades Detalladas

### 🛍️ Lista de Productos
- **Paginación** configurable (5, 10, 20, 50 elementos)
- **Búsqueda** por nombre y filtros por precio
- **Ordenamiento** por nombre, precio o ID
- **Vista de tarjetas** responsiva con información del producto
- **Indicadores de stock** con colores distintivos
- **Acciones rápidas** (ver, editar, eliminar)

### 📦 Detalle de Producto
- **Información completa** del producto
- **Estado del inventario** en tiempo real
- **Funcionalidad de compra** con validación de stock
- **Navegación** entre productos
- **Breadcrumb** para ubicación contextual

### 📝 Formulario de Producto
- **Validación reactiva** con mensajes descriptivos
- **Modo crear/editar** dinámico
- **Previsualización** de datos ingresados
- **Cancelación** con confirmación si hay cambios

### 📈 Dashboard de Inventario
- **Estadísticas globales** de inventario
- **Gráficos** de estado del stock
- **Lista de productos** con bajo stock
- **Acciones de sincronización** de inventario

## 🎨 Diseño y UX

### Principios de Diseño
- **Interfaz limpia** y moderna siguiendo Material Design
- **Navegación intuitiva** con breadcrumbs y menús contextuales
- **Feedback visual** inmediato para todas las acciones
- **Responsive design** que funciona en desktop y móvil
- **Accesibilidad** con etiquetas ARIA y navegación por teclado

### Estados de la UI
- **Loading states** con spinners personalizados
- **Empty states** informativos cuando no hay datos
- **Error states** con opciones de reintento
- **Success states** con notificaciones de confirmación

## 🧪 Testing

### Estrategia de Pruebas
- **Pruebas unitarias** para todos los servicios
- **Pruebas de componentes** para lógica de presentación
- **Pruebas de integración** para flujos completos
- **Mocking** de servicios HTTP para testing aislado

### Ejecutar Pruebas
```bash
# Pruebas unitarias
npm test

# Con cobertura
npm run test:coverage

# Modo watch para desarrollo
npm run test:watch
```

### Cobertura Objetivo
- **Servicios:** 90%+
- **Componentes:** 80%+
- **Global:** 85%+

## 🔒 Seguridad

### Medidas Implementadas
- **Autenticación** con API Key en headers
- **Validación** de entrada en formularios
- **Sanitización** de datos para prevenir XSS
- **HTTPS** requerido en producción
- **CSP Headers** configurados

## 📱 Compatibilidad

### Navegadores Soportados
- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### Dispositivos
- **Desktop** (1920x1080 y superiores)
- **Tablet** (768px - 1024px)
- **Mobile** (320px - 767px)

## 🚀 Deployment

### Build de Producción
```bash
npm run build
```

### Archivos generados en `dist/`:
- **Optimización** automática de bundles
- **Minificación** de CSS y JavaScript
- **Tree shaking** para reducir tamaño
- **Source maps** para debugging

### Configuración del Servidor
- **Servidor web** estático (Nginx, Apache, etc.)
- **Fallback** a `index.html` para rutas SPA
- **Compresión gzip** recomendada
- **Cache headers** apropiados

## 🔧 Desarrollo

### Estructura del Código
- **Arquitectura modular** con componentes standalone
- **Lazy loading** de componentes para optimización
- **Barrel exports** para imports limpio
- **Tipado estricto** con TypeScript

### Convenciones
- **Nomenclatura** en español para UI, inglés para código
- **Comentarios** descriptivos en métodos públicos
- **Commits** siguiendo conventional commits
- **Linting** con ESLint y Prettier

## 📈 Performance

### Optimizaciones Implementadas
- **OnPush** change detection strategy
- **TrackBy** functions en listas
- **Lazy loading** de componentes
- **Image optimization** para recursos
- **Bundle splitting** por rutas

### Métricas Objetivo
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Time to Interactive:** < 3s
- **Bundle size:** < 500KB inicial

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de conexión con APIs:**
   - Verificar que los microservicios backend estén ejecutándose
   - Revisar URLs en `environment.ts`
   - Verificar la API Key en las configuraciones

2. **Problemas de CORS:**
   ```
   Access to fetch at 'http://localhost:8081/products' from origin 'http://localhost:63888' 
   has been blocked by CORS policy
   ```
   **Soluciones:**
   - ✅ **Usar proxy Angular** (ya configurado): `npm start`
   - 🔧 **Configurar CORS en backend Spring Boot** - Ver [CORS-SETUP.md](./CORS-SETUP.md)
   - 🔍 **Verificar que las URLs** en `environment.ts` coincidan con el proxy

3. **Error de dependencias:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## 🤝 Contribución

### Desarrollador Principal
**Juan José Ariza V.**
- Arquitectura completa del frontend
- Implementación de todos los componentes
- Integración con microservicios backend
- Documentación técnica
- Testing y optimización

### Flujo de Desarrollo
1. **Branch** por feature desde main
2. **Desarrollo** con testing incluido
3. **Pull Request** con descripción detallada
4. **Code Review** y testing
5. **Merge** a main tras aprobación

## 📞 Soporte

**Desarrollador:** Juan José Ariza V.
**Documentación:** README.md y comentarios en código
**Logs:** Console en desarrollo, service workers en producción

## 📄 Licencia

Proyecto desarrollado como parte de prueba técnica.
**Autor:** Juan José Ariza V.
**Año:** 2025

---

## 🏆 Características Destacadas

### ✨ Implementación Completa de Requerimientos
- ✅ **Angular** como framework principal
- ✅ **Interfaz visual limpia y funcional**
- ✅ **Manejo de errores** y estados de carga
- ✅ **Versionado** con Git
- ✅ **Pruebas unitarias** básicas implementadas

### ✨ Funcionalidades Extra
- ✅ **Notificaciones inteligentes** con auto-hide
- ✅ **Cache** de datos para mejor performance
- ✅ **Responsive design** para múltiples dispositivos
- ✅ **Logging estructurado** para debugging
- ✅ **Configuración** por entornos

**¡Desarrollado con dedicación por Juan José Ariza V.!** 🚀 
