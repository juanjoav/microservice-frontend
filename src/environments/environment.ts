/**
 * Configuración de entorno para desarrollo
 * Frontend Angular - Desarrollado por Juan José Ariza V.
 */

export const environment = {
  production: false,
  development: true,
  
  // URLs de los microservicios backend (usando proxy)
  api: {
    products: {
      baseUrl: '/api/products',
      endpoints: {
        products: '',
        productById: '',
        createProduct: '',
        updateProduct: '',
        deleteProduct: ''
      }
    },
    inventory: {
      baseUrl: '/api/inventory',
      endpoints: {
        getQuantity: '',
        purchase: '',
        sync: '/sync'
      }
    }
  },
  
  // Configuración de autenticación
  auth: {
    apiKey: 'clave123',
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
      defaultPageSize: 10,
      pageSizeOptions: [5, 10, 20, 50]
    },
    
    // Configuración de timeouts y reintentos
    http: {
      timeout: 10000, // 10 segundos
      retryAttempts: 3,
      retryDelay: 1000 // 1 segundo
    },
    
    // Configuración de notificaciones
    notifications: {
      autoHideDelay: 5000, // 5 segundos
      position: 'top-right'
    }
  },
  
  // Configuración de logs
  logging: {
    level: 'debug', // debug, info, warn, error
    enableConsole: true,
    enableRemote: false
  },
  
  // Features flags
  features: {
    enableProductCreation: true,
    enableProductUpdate: true,
    enableProductDeletion: true,
    enableInventoryManagement: true,
    enableAdvancedSearch: true,
    enableExportFunctionality: false
  }
}; 