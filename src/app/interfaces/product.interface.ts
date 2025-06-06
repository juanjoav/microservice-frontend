/**
 * Interfaces para la gestión de productos
 * Frontend Angular - Desarrollado por Juan José Ariza V.
 */

/**
 * Interfaz principal para un producto
 * Corresponde al modelo Product del backend
 */
export interface Product {
  id?: number;
  name: string;
  description: string;
  imagen: string;
  price: number;
}

/**
 * Interfaz para crear un nuevo producto
 * Sin ID ya que se genera automáticamente
 */
export interface CreateProductRequest {
  name: string;
  description: string;
  imagen: string;
  price: number;
}

/**
 * Interfaz para actualizar un producto existente
 * Todos los campos son opcionales excepto el ID
 */
export interface UpdateProductRequest {
  name?: string;
  description?: string;
  imagen?: string;
  price?: number;
}

/**
 * Interfaz para la información de inventario de un producto
 */
export interface ProductInventory {
  productId: number;
  quantity: number;
}

/**
 * Interfaz combinada que incluye producto e inventario
 * Utilizada en la vista principal para mostrar información completa
 */
export interface ProductWithInventory extends Product {
  inventory?: ProductInventory;
  stockStatus?: 'in-stock' | 'low-stock' | 'out-of-stock';
}

/**
 * Interfaz para filtros de búsqueda de productos
 */
export interface ProductFilters {
  name?: string;
  priceMin?: number;
  priceMax?: number;
  hasStock?: boolean;
}

/**
 * Interfaz para opciones de ordenamiento
 */
export interface ProductSortOptions {
  field: 'name' | 'price' | 'id';
  direction: 'asc' | 'desc';
} 