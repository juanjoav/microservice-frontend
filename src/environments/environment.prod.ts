/**
 * Configuración de entorno para producción
 * Frontend Angular - Desarrollado por Juan José Ariza V.
 */

export const environment = {
  production: true,
  development: false,
  
  // URLs de los microservicios backend en producción
  api: {
    products: {
      baseUrl: 'https://products-api.example.com', // Cambiar por URL real
      endpoints: {
        products: '/products',
        productById: '/products',
        createProduct: '/products',
        updateProduct: '/products',
        deleteProduct: '/products'
      }
    },
    inventory: {
      baseUrl: 'https://inventory-api.example.com', // Cambiar por URL real
      endpoints: {
        getQuantity: '/inventory',
        purchase: '/inventory',
        sync: '/inventory/sync'
      }
    }
  },
  
  // Configuración de autenticación
  auth: {
    apiKey: 'clave123', // En producción usar variable de entorno
    headerName: 'X-API-KEY'
  },
  
  // Configuración de la aplicación
  app: {
    title: 'Products Frontend',
    version: '1.0.0',
    author: 'Juan José Ariza V.',
    description: 'Frontend Angular para microservicios de productos e inventario',
    
    // Configuración de paginación
    pagination: {
      defaultPageSize: 20, // Más elementos en producción
      pageSizeOptions: [10, 20, 50, 100]
    },
    
    // Configuración de timeouts y reintentos
    http: {
      timeout: 15000, // 15 segundos en producción
      retryAttempts: 3,
      retryDelay: 2000 // 2 segundos
    },
    
    // Configuración de notificaciones
    notifications: {
      autoHideDelay: 3000, // Más rápido en producción
      position: 'top-right'
    }
  },
  
  // Configuración de logs
  logging: {
    level: 'warn', // Solo warnings y errores en producción
    enableConsole: false,
    enableRemote: true // Enviar logs a servicio remoto
  },
  
  // Features flags
  features: {
    enableProductCreation: true,
    enableProductUpdate: true,
    enableProductDeletion: false, // Deshabilitado en producción por seguridad
    enableInventoryManagement: true,
    enableAdvancedSearch: true,
    enableExportFunctionality: true
  }
}; 