# 🔧 Guía de Configuración CORS - Products Frontend

**Desarrollado por: Juan José Ariza V.**

Este documento explica cómo resolver los errores de CORS entre el frontend Angular y los microservicios backend.

## 🚨 Problema CORS

El error que experimentaste:
```
Access to fetch at 'http://localhost:8081/products' from origin 'http://localhost:63888' 
has been blocked by CORS policy
```

Ocurre porque el navegador bloquea peticiones entre diferentes orígenes (puertos en este caso).

## ✅ Solución 1: Proxy Angular (Recomendado para Desarrollo)

### Archivos Configurados:
- ✅ `proxy.conf.json` - Configuración del proxy
- ✅ `package.json` - Script actualizado con `--proxy-config`
- ✅ `environment.ts` - URLs cambiadas a rutas del proxy

### Cómo Funciona:
```
Frontend (63888) → Proxy Angular → Backend (8081/8082)
```

### Rutas del Proxy:
- `/api/products/*` → `http://localhost:8081`
- `/api/inventory/*` → `http://localhost:8082`

### Comandos:
```bash
# Iniciar con proxy (recomendado)
npm start

# Iniciar sin proxy
npm run start:no-proxy
```

## 🔧 Solución 2: Configurar CORS en Spring Boot

Si prefieres configurar CORS en el backend, agrega esta configuración:

### Para Products Service (Puerto 8081):

```java
// src/main/java/com/example/products/config/CorsConfig.java
@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:63888",  // Angular dev server
                    "http://localhost:4200",   // Angular default port
                    "http://localhost:3000"    // React/otros frontends
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### Para Inventory Service (Puerto 8082):

```java
// src/main/java/com/example/inventory/config/CorsConfig.java
@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:63888",  // Angular dev server
                    "http://localhost:4200",   // Angular default port
                    "http://localhost:3000"    // React/otros frontends
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### O con Anotaciones en Controladores:

```java
@RestController
@RequestMapping("/products")
@CrossOrigin(origins = {
    "http://localhost:63888", 
    "http://localhost:4200",
    "http://localhost:3000"
})
public class ProductsController {
    // ... resto del código
}
```

## 📝 Recomendaciones

### Para Desarrollo:
- ✅ **Usar Proxy Angular** (Solución 1) - Ya configurado
- Más fácil de mantener
- No requiere cambios en backend
- Configuración centralizada

### Para Producción:
- ✅ **Configurar CORS en Backend** (Solución 2)
- URLs específicas del dominio de producción
- Mayor control de seguridad
- Performance optimizada

## 🔍 Verificación

### 1. Verificar que el proxy funciona:
```bash
# Verificar que el servidor Angular está corriendo con proxy
ps aux | grep "ng serve"
```

### 2. Verificar las peticiones en DevTools:
- Abrir F12 → Network
- Las peticiones deben ir a `/api/products` y `/api/inventory`
- No debe haber errores CORS

### 3. Test de conectividad:
```bash
# Verificar que los microservicios están corriendo
curl -H "X-API-KEY: clave123" http://localhost:8081/products
curl -H "X-API-KEY: clave123" http://localhost:8082/inventory
```

## 🚀 Próximos Pasos

1. ✅ Servidor Angular reiniciado con proxy
2. ⏳ Verificar conexión exitosa con backend
3. ⏳ Probar funcionalidades del frontend
4. ⏳ Implementar autenticación si es necesario

---

**Documentación creada por Juan José Ariza V.**  
**Fecha:** $(date)  
**Versión:** 1.0.0 