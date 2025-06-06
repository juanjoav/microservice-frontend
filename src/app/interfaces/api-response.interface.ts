/**
 * Interfaces para respuestas de API siguiendo estándar JSON API
 * Frontend Angular - Desarrollado por Juan José Ariza V.
 */

/**
 * Información de versión de JSON API
 */
export interface JsonApiInfo {
  version: string;
}

/**
 * Metadatos para paginación y información adicional
 */
export interface JsonApiMeta {
  totalRecords?: number;
  page?: number;
  size?: number;
  totalPages?: number;
  [key: string]: any; // Para metadatos adicionales
}

/**
 * Estructura de errores según estándar JSON API
 */
export interface JsonApiError {
  code: string;
  title: string;
  detail: string;
  timestamp: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
  status?: string;
}

/**
 * Respuesta exitosa con un único elemento de datos
 */
export interface JsonApiResponse<T> {
  data: T;
  jsonapi: JsonApiInfo;
  meta?: JsonApiMeta;
}

/**
 * Respuesta exitosa con múltiples elementos de datos (lista)
 */
export interface JsonApiListResponse<T> {
  data: T[];
  jsonapi: JsonApiInfo;
  meta: JsonApiMeta;
}

/**
 * Respuesta de error según estándar JSON API
 */
export interface JsonApiErrorResponse {
  errors: JsonApiError[];
  jsonapi: JsonApiInfo;
}

/**
 * Respuesta de éxito simple (para operaciones que no retornan datos)
 */
export interface JsonApiSuccessResponse {
  data: {
    message: string;
    [key: string]: any;
  };
  jsonapi: JsonApiInfo;
}

/**
 * Union type para cualquier tipo de respuesta API
 */
export type ApiResponse<T> = 
  | JsonApiResponse<T> 
  | JsonApiListResponse<T> 
  | JsonApiSuccessResponse 
  | JsonApiErrorResponse;

/**
 * Opciones de paginación para las requests
 */
export interface PaginationOptions {
  page: number;
  size: number;
}

/**
 * Respuesta paginada con información adicional
 */
export interface PaginatedResponse<T> extends JsonApiListResponse<T> {
  meta: JsonApiMeta & {
    totalRecords: number;
    page: number;
    size: number;
    totalPages: number;
  };
}

/**
 * Interfaz para el estado de loading de las operaciones
 */
export interface LoadingState {
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

/**
 * Interfaz para el estado completo de una entidad con operaciones CRUD
 */
export interface EntityState<T> extends LoadingState {
  items: T[];
  selectedItem: T | null;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  filters: any;
} 