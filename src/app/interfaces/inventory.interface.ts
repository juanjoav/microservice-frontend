/**
 * Interfaces para la gestión de inventario
 * Frontend Angular - Desarrollado por Juan José Ariza V.
 */

/**
 * Interfaz para el inventario básico de un producto
 */
export interface Inventory {
  productId: number;
  quantity: number;
}

/**
 * Interfaz para la respuesta de consulta de inventario
 * Según la estructura del backend: { productId, quantity }
 */
export interface InventoryQueryResponse {
  productId: number;
  quantity: number;
}

/**
 * Interfaz para solicitud de compra/actualización de inventario
 */
export interface PurchaseRequest {
  productId: number;
  quantity: number;
}

/**
 * Interfaz para solicitud de sincronización de inventario
 */
export interface SyncInventoryRequest {
  productId: number;
}

/**
 * Interfaz para el estado del stock con categorización
 */
export interface StockStatus {
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  quantity: number;
  threshold?: number; // Para determinar cuándo el stock es bajo
}

/**
 * Interfaz para movimientos de inventario (histórico)
 */
export interface InventoryMovement {
  id: number;
  productId: number;
  type: 'purchase' | 'sale' | 'adjustment' | 'sync';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  timestamp: Date;
  description?: string;
}

/**
 * Interfaz para estadísticas de inventario
 */
export interface InventoryStatistics {
  totalProducts: number;
  inStockProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  lastUpdateTime: Date;
}

/**
 * Interfaz para configuración de alertas de inventario
 */
export interface InventoryAlertConfig {
  lowStockThreshold: number;
  enableAlerts: boolean;
  alertTypes: ('email' | 'notification' | 'sms')[];
}

/**
 * Interfaz para operaciones bulk en inventario
 */
export interface BulkInventoryOperation {
  operations: {
    productId: number;
    operation: 'add' | 'subtract' | 'set';
    quantity: number;
  }[];
  reason?: string;
}

/**
 * Helper function para determinar el estado del stock
 */
export function getStockStatus(quantity: number, lowStockThreshold: number = 10): StockStatus {
  if (quantity === 0) {
    return {
      status: 'out-of-stock',
      quantity,
      threshold: lowStockThreshold
    };
  } else if (quantity <= lowStockThreshold) {
    return {
      status: 'low-stock',
      quantity,
      threshold: lowStockThreshold
    };
  } else {
    return {
      status: 'in-stock',
      quantity,
      threshold: lowStockThreshold
    };
  }
}

/**
 * Helper function para obtener la clase CSS según el estado del stock
 */
export function getStockStatusClass(status: StockStatus['status']): string {
  switch (status) {
    case 'in-stock':
      return 'text-success';
    case 'low-stock':
      return 'text-warning';
    case 'out-of-stock':
      return 'text-danger';
    default:
      return 'text-secondary';
  }
}

/**
 * Helper function para obtener el texto descriptivo del estado del stock
 */
export function getStockStatusText(status: StockStatus['status'], quantity: number): string {
  switch (status) {
    case 'in-stock':
      return `En stock (${quantity} disponibles)`;
    case 'low-stock':
      return `Stock bajo (${quantity} disponibles)`;
    case 'out-of-stock':
      return 'Sin stock';
    default:
      return 'Estado desconocido';
  }
} 