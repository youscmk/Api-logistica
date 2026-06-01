# Plan de Desarrollo: API de Seguimiento de Envíos (MVP)

## Propósito
Documento operativo para el desarrollo del Producto Mínimo Viable (MVP) de la API de seguimiento de envíos. Define requerimientos Must, arquitectura, modelo de datos, endpoints, stack tecnológico y plan de pruebas basado en spec.md.txt.

## Variables de Entorno
- **DATABASE_URL**: `mongodb+srv://dylanaleexisb740_db_user:L2EZjdBJy1vVZkud@cluster0.qtbfqb0.mongodb.net/?appName=Cluster0`
- **COLLECION**: `colecciontest0`
- **PORT**: 3000 (local)

## Requerimientos Funcionales (Must — MVP)
Basado en metodología MoSCoW del spec.md.txt:

1. **API de seguimiento funcional** — Base del sistema
2. **Registro de número de guía** — Permitir ingresar envíos (POST)
3. **Consulta de estado** — Obtener estado actual y eventos (GET)
4. **Actualización de estado** — Cambiar estado y guardar evento (PUT)
5. **Historial de eventos** — Mantener trazabilidad completa

Requerimientos Should (MVP secundario):
- Validación de datos (evitar trackingNumber vacío)
- Evitar duplicados (índice unique en trackingNumber)

## Modelo de Datos MongoDB (MVP)
**Colección**: `colecciontest0` (definida en COLLECION)

**Documento de tracking** — Patrón Attribute + Bucket:

```json
{
  "_id": ObjectId,
  "trackingNumber": "ABC123XYZ",
  "estadoActual": "En tránsito",
  "eventos": [
    {
      "estado": "Ingresado",
      "timestamp": "2026-05-30T10:00:00Z",
      "nota": "Registro inicial"
    },
    {
      "estado": "En tránsito",
      "timestamp": "2026-05-30T11:30:00Z",
      "nota": "Salió desde bodega"
    }
  ],
  "metadata": {
    "origen": "bodega",
    "createdAt": "2026-05-30T10:00:00Z",
    "updatedAt": "2026-05-30T11:30:00Z"
  }
}
```

**Patrones aplicados**:
- **Attribute Pattern**: Campo `estadoActual` permite consultas rápidas sin recorrer historial.
- **Bucket Pattern**: Array `eventos` agrupa cambios de estado en un solo documento → búsqueda eficiente.
- **Modelo embebido**: No hay referencias a otras colecciones; simplifica consultas y mejora rendimiento.

**Índices**:
- `trackingNumber` (unique=true) — búsquedas rápidas por guía y prevención de duplicados
- `estadoActual` (regular) — filtros por estado y listados

## Stack Tecnológico (MVP)
Según spec.md.txt:
- **Runtime**: Node.js
- **Framework Web**: Express
- **ODM/Driver MongoDB**: Mongoose (simple, sin complejidad innecesaria)
- **Gestor de paquetes**: npm
- **Testing**: Jest + supertest
- **Documentación API**: Swagger/OpenAPI (opcional pero recomendado)
- **Dev Tools**: nodemon (hot reload), dotenv

**Justificación** (spec.md.txt):
> "Rapidez de implementación y facilidad para construir APIs, junto con Mongoose para trabajar con MongoDB de forma simple, lo que permite enfocarse en la funcionalidad sin agregar complejidad."

## Endpoints (Especificación MVP)

| Método | Endpoint | Descripción | Operación MongoDB | Códigos HTTP |
|--------|----------|-------------|------------------|--------------|
| POST | `/trackings` | Registrar nueva guía | `insertOne()` | 201 Created, 400 Bad Request, 409 Conflict (duplicado) |
| GET | `/trackings/:trackingNumber` | Obtener estado y eventos | `findOne({trackingNumber})` | 200 OK, 404 Not Found |
| PUT | `/trackings/:trackingNumber` | Actualizar estado | `updateOne()` con `$set` + `$push` | 200 OK, 400 Bad Request, 404 Not Found |
| GET | `/trackings` | Listar y filtrar | `find({estadoActual})` con query params | 200 OK |

**Detalles de operaciones**:
- **POST /trackings**: Inserta nuevo documento con índice unique en `trackingNumber`. Retorna el documento creado.
- **GET /trackings/:trackingNumber**: Busca por trackingNumber, retorna estadoActual + array eventos.
- **PUT /trackings/:trackingNumber**: Actualiza `estadoActual` y agrega nuevo evento a array `eventos`.
- **GET /trackings**: Filtra por query param `estado` usando índice en `estadoActual`.

## Arquitectura (MVP — Cliente-Servidor Simple)
Según spec.md.txt:
- Cliente envía solicitudes HTTP a la API
- API valida, procesa y comunica con MongoDB Atlas
- Modelo embebido; sin relaciones complejas
- Logs simples para monitoreo básico

**Estructura de carpetas**:
```
Api-logistica/
├── src/
│   ├── index.js                    # Arranque, carga .env, conexión inicial
│   ├── app.js                      # Config Express, middlewares (CORS, JSON, etc.)
│   ├── config/
│   │   └── database.js             # Conexión Mongoose a DATABASE_URL
│   ├── models/
│   │   └── Tracking.js             # Esquema y modelo MongoDB
│   ├── routes/
│   │   └── trackings.js            # Definición de endpoints
│   ├── controllers/
│   │   └── trackingController.js   # Lógica CRUD (create, findOne, update, find)
│   ├── middleware/
│   │   └── errorHandler.js         # Manejo centralizado de errores
│   └── tests/
│       ├── tracking.unit.test.js   # Tests unitarios (modelo, validación)
│       └── tracking.integration.test.js  # Tests de endpoints (supertest)
├── package.json
├── .env                            # Variables de entorno (no commit)
├── .env.example                    # Plantilla .env (con ejemplos)
├── .gitignore
└── README.md                       # Instrucciones de uso
```

## Configuración y Variables de Entorno (MVP)

**Archivo `.env`** (no versionado, copiar desde `.env.example`):
```
DATABASE_URL=mongodb+srv://dylanaleexisb740_db_user:L2EZjdBJy1vVZkud@cluster0.qtbfqb0.mongodb.net/?appName=Cluster0
COLLECION=colecciontest0
PORT=3000
NODE_ENV=development
```

**Archivo `.env.example`** (versionado, plantilla):
```
DATABASE_URL=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster.mongodb.net/?appName=AppName
COLLECION=trackings
PORT=3000
NODE_ENV=development
```

## Scripts npm (MVP)

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**Uso local**:
```bash
npm install
cp .env.example .env
npm run dev
```

## Validaciones y Manejo de Errores (MVP)

**Validaciones básicas**:
- `trackingNumber`: requerido, string no vacío (min 3 caracteres)
- `estadoInicial` (POST): requerido, string no vacío
- `nuevoEstado` (PUT): requerido, string no vacío
- `nota` (PUT): opcional, string

**Respuestas estándar**:
```json
// 201 Created
{
  "success": true,
  "data": { "trackingNumber": "ABC123", "estadoActual": "Ingresado", ... }
}

// 400 Bad Request
{
  "success": false,
  "error": "trackingNumber es requerido"
}

// 409 Conflict
{
  "success": false,
  "error": "El tracking ABC123 ya existe"
}

// 404 Not Found
{
  "success": false,
  "error": "Tracking no encontrado"
}
```

## Tareas Desglosadas (MVP — Orden de Desarrollo)

### Fase 1: Preparación (0.5 día)
**Objetivo**: Inicializar proyecto Node.js con dependencias y estructura base.

- **Tarea 1.1**: Crear `package.json` manual o con `npm init`
- **Tarea 1.2**: Instalar dependencias:
  - `express` — framework web
  - `mongoose` — ODM MongoDB
  - `dotenv` — cargar variables de entorno
  - `nodemon` — dev: hot reload
  - `jest` `supertest` — testing
  - `cors` — middleware CORS (opcional)

- **Tarea 1.3**: Crear estructura de carpetas (`src/`, `src/models/`, `src/routes/`, `src/controllers/`, `src/tests/`, etc.)
- **Tarea 1.4**: Crear `.env.example` con estructura de variables

### Fase 2: Modelo y Conexión a BD (1 día)
**Objetivo**: Definir esquema MongoDB y conectar a DATABASE_URL.

- **Tarea 2.1**: Implementar `src/config/database.js`
  - Conexión a MongoDB usando `DATABASE_URL` de .env
  - Manejo de errores de conexión
  - Log de conexión exitosa

- **Tarea 2.2**: Implementar `src/models/Tracking.js` (esquema Mongoose)
  - Campo `trackingNumber` (string, unique=true, required=true)
  - Campo `estadoActual` (string, required=true, index=true)
  - Array `eventos` (cada evento: {estado, timestamp, nota})
  - Campo `metadata` (objeto con origen, timestamps)
  - Validadores mínimos (trim, lowercase para trackingNumber si aplica)
  - Índices: trackingNumber (unique), estadoActual (regular)

- **Tarea 2.3**: Crear índices en la colección `COLLECION`
  - Índice único en `trackingNumber`
  - Índice en `estadoActual`

### Fase 3: API Básica (2 días)
**Objetivo**: Implementar endpoints CRUD según especificación.

- **Tarea 3.1**: Crear `src/app.js`
  - Configuración Express (JSON parser, CORS)
  - Rutas base

- **Tarea 3.2**: Crear `src/routes/trackings.js`
  - Definir rutas POST, GET (id y lista), PUT
  - Mapear a controladores

- **Tarea 3.3**: Crear `src/controllers/trackingController.js`
  - **`createTracking`** (POST): validar input, evitar duplicados (catch error unique), insertar, retornar 201
  - **`getTrackingById`** (GET /:trackingNumber): buscar por trackingNumber, retornar 200 o 404
  - **`updateTracking`** (PUT /:trackingNumber): validar nuevo estado, actualizar estadoActual y push evento, retornar 200 o 404
  - **`listTrackings`** (GET): filtrar por query param `estado` (opcional), retornar lista

- **Tarea 3.4**: Crear `src/middleware/errorHandler.js`
  - Capturar errores globales
  - Retornar formato estándar de error

- **Tarea 3.5**: Crear `src/index.js` (arranque)
  - Cargar .env con `dotenv`
  - Conectar a BD
  - Iniciar servidor en PORT

- **Tarea 3.6**: Documentación (opcional): crear Swagger spec o colección Postman

### Fase 4: Testing (1.5 días)
**Objetivo**: Cobertura >= 80% en lógica crítica. Usar Jest + supertest.

- **Tarea 4.1**: Crear `src/tests/tracking.unit.test.js`
  - Tests del modelo: validación de campos, timestamps
  - Tests de lógica: actualización de eventos, cambio de estado

- **Tarea 4.2**: Crear `src/tests/tracking.integration.test.js`
  - Usar `supertest` para llamadas a endpoints
  - Tests: POST (crear, validar 201/409), GET (obtener, validar datos), PUT (actualizar, validar nuevo estado), GET list (filtrar)
  - Tests de casos de error: 400, 404, 409
  - **Opción BD**: usar `mongodb-memory-server` para tests o base de testing en Atlas

- **Tarea 4.3**: Configurar cobertura
  - Ejecutar `npm run test:coverage`
  - Revisar cobertura >= 80%

### Fase 5: Documentación y Entrega (0.5 día)
**Objetivo**: Instrucciones para ejecutar y usar API.

- **Tarea 5.1**: Crear `README.md`
  - Título y descripción del proyecto
  - Requerimientos (Node.js version, npm)
  - Pasos de instalación y arranque
  - Explicación de `.env`
  - Ejemplos de llamadas (curl o Postman)
  - Estructura de carpetas
  - Cómo ejecutar tests

- **Tarea 5.2**: Crear colección Postman o ejemplos `curl` documentados

- **Tarea 5.3**: Crear `.gitignore` (node_modules, .env, logs, etc.)

**Estimación total MVP**: 5.5 días laborables

## Estrategia de Testing y Calidad (MVP)

Según spec.md.txt: "pruebas con Jest, buscando una cobertura mínima del 80%".

### Cobertura objetivo: >= 80%

### Tipos de pruebas:
1. **Unit tests** (modelo y validación):
   - Validación de campos (trackingNumber, estadoActual)
   - Índices únicos (duplicados)
   - Timestamps y eventos

2. **Integration tests** (endpoints con BD):
   - POST: crear tracking → 201, obtener duplicado → 409, validar estructura
   - GET por ID: tracking existente → 200, no existente → 404
   - PUT: actualizar estado → 200, evento agregado, estadoActual actualizado
   - GET lista: filtrar por estado, retornar array

3. **Estrategia de BD para tests**:
   - **Opción A**: `mongodb-memory-server` (BD en memoria, aislada, rápida)
   - **Opción B**: Base de testing en MongoDB Atlas (más cercana a producción)
   - Limpiar/resetear colección entre tests

### Ejecución:
```bash
npm test              # Ejecutar tests una vez
npm run test:watch   # Modo watch (desarrollo)
npm run test:coverage # Generar reporte de cobertura
```

## CI / Pipeline (Opcional — Futuro)

Recomendado para fase posterior (no MVP):
- GitHub Actions: trigger en push/PR
- Instalar dependencias → ejecutar `npm test` → reportar cobertura
- No incluye despliegue automático en MVP

## Entregables Técnicos Finales (MVP)

1. **Código fuente**:
   - Estructura de carpetas según arquitectura definida
   - Archivos JS funcionales (conexión, modelos, rutas, controladores, tests)

2. **Configuración**:
   - `package.json` con dependencias y scripts
   - `.env.example` con variables de template
   - `.gitignore` (excluir node_modules, .env, logs)

3. **Documentación**:
   - `README.md` con instrucciones de instalación, uso y ejemplos
   - Colección Postman (.json) o ejemplos `curl` documentados

4. **Tests**:
   - Archivos de test funcionales
   - Cobertura >= 80%
   - Comando de ejecución documentado

5. **Base de datos**:
   - Colección `colecciontest0` en MongoDB Atlas
   - Índices configurados (trackingNumber unique, estadoActual)

## Checklist Final (MVP)
- [ ] Proyecto Node.js inicializado con dependencias instaladas
- [ ] `.env` configurado (copiar `.env.example`) y testado
- [ ] Modelo Tracking en Mongoose funcional con índices
- [ ] 4 endpoints implementados y validados manualmente (curl/Postman)
- [ ] Validaciones básicas y manejo de errores en lugar
- [ ] Tests unitarios e integración con cobertura >= 80%
- [ ] README.md con pasos de arranque
- [ ] Conexión a BD funcional y datos guardándose en `COLLECION`
- [ ] API responde correctamente en localhost:3000
