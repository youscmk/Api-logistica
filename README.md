# API de Seguimiento de Envíos (MVP)

API desarrollada con **Node.js + Express + MongoDB** para centralizar el seguimiento de envíos y mantener trazabilidad de estados.

## Características

- ✅ Registrar nuevos envíos con número de guía
- ✅ Consultar estado actual y eventos históricos
- ✅ Actualizar estado de envíos
- ✅ Listar y filtrar envíos por estado
- ✅ Prevención de duplicados (índice único)
- ✅ Validación de datos
- ✅ Manejo centralizado de errores
- ✅ Tests automatizados (Jest + supertest)
- ✅ Cobertura de código

## Requerimientos

- Node.js >= 14.x
- npm >= 6.x
- MongoDB Atlas (gratuito o de pago)

## Instalación

### 1. Clonar o descargar el proyecto

```bash
cd Api-logistica
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar `.env.example` a `.env` y actualizar con tus credenciales:

```bash
cp .env.example .env
```

Editar `.env`:

```
DATABASE_URL=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster.mongodb.net/?appName=Cluster0
COLLECION=colecciontest0
PORT=3000
NODE_ENV=development
```

**Obtener DATABASE_URL**:
1. Ir a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear cluster (versión gratuita disponible)
3. Crear usuario de BD
4. Copiar connection string en formato "Connect your application"
5. Reemplazar `<password>` con la contraseña del usuario

## Uso

### Iniciar en modo desarrollo (con hot reload)

```bash
npm run dev
```

Salida esperada:
```
✓ Conectado a MongoDB Atlas
✓ Base de datos: api_logistica
✓ Colección: colecciontest0

╔════════════════════════════════════════╗
║  API Seguimiento de Envíos - MVP       ║
║  Servidor corriendo en puerto 3000      ║
║  http://localhost:3000                  ║
║  http://localhost:3000/health           ║
╚════════════════════════════════════════╝
```

### Iniciar en producción

```bash
npm start
```

### Ejecutar tests

```bash
# Tests una vez
npm test

# Tests en modo watch (durante desarrollo)
npm run test:watch

# Ver cobertura de código
npm run test:coverage
```

## Endpoints

### 1. POST `/api/trackings` — Registrar nuevo envío

**Crear un nuevo tracking**

```bash
curl -X POST http://localhost:3000/api/trackings \
  -H "Content-Type: application/json" \
  -d '{
    "trackingNumber": "GUIDE001",
    "estadoInicial": "Ingresado",
    "nota": "Recibido en bodega"
  }'
```

**Respuesta (201 Created)**:
```json
{
  "success": true,
  "data": {
    "_id": "6534a1b2c3d4e5f6g7h8i9j0",
    "trackingNumber": "GUIDE001",
    "estadoActual": "Ingresado",
    "eventos": [
      {
        "_id": "6534a1b2c3d4e5f6g7h8i9j1",
        "estado": "Ingresado",
        "timestamp": "2026-05-30T10:00:00.000Z",
        "nota": "Recibido en bodega"
      }
    ],
    "metadata": {
      "origen": "bodega",
      "_id": "6534a1b2c3d4e5f6g7h8i9j2"
    },
    "createdAt": "2026-05-30T10:00:00.000Z",
    "updatedAt": "2026-05-30T10:00:00.000Z",
    "__v": 0
  }
}
```

### 2. GET `/api/trackings/:trackingNumber` — Obtener estado

**Consultar estado de un envío**

```bash
curl http://localhost:3000/api/trackings/GUIDE001
```

**Respuesta (200 OK)**:
```json
{
  "success": true,
  "data": {
    "_id": "6534a1b2c3d4e5f6g7h8i9j0",
    "trackingNumber": "GUIDE001",
    "estadoActual": "Ingresado",
    "eventos": [
      {
        "estado": "Ingresado",
        "timestamp": "2026-05-30T10:00:00.000Z",
        "nota": "Recibido en bodega"
      }
    ],
    "createdAt": "2026-05-30T10:00:00.000Z",
    "updatedAt": "2026-05-30T10:00:00.000Z"
  }
}
```

### 3. PUT `/api/trackings/:trackingNumber` — Actualizar estado

**Cambiar estado de un envío**

```bash
curl -X PUT http://localhost:3000/api/trackings/GUIDE001 \
  -H "Content-Type: application/json" \
  -d '{
    "nuevoEstado": "En tránsito",
    "nota": "Salió desde bodega hacia destino"
  }'
```

**Respuesta (200 OK)**:
```json
{
  "success": true,
  "data": {
    "trackingNumber": "GUIDE001",
    "estadoActual": "En tránsito",
    "eventos": [
      {
        "estado": "Ingresado",
        "timestamp": "2026-05-30T10:00:00.000Z",
        "nota": "Recibido en bodega"
      },
      {
        "estado": "En tránsito",
        "timestamp": "2026-05-30T11:30:00.000Z",
        "nota": "Salió desde bodega hacia destino"
      }
    ]
  }
}
```

### 4. GET `/api/trackings` — Listar envíos

**Listar todos**

```bash
curl http://localhost:3000/api/trackings
```

**Listar con filtro por estado**

```bash
curl "http://localhost:3000/api/trackings?estado=En%20tránsito"
```

**Respuesta (200 OK)**:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "trackingNumber": "GUIDE001",
      "estadoActual": "En tránsito",
      "eventos": [...]
    },
    {
      "trackingNumber": "GUIDE002",
      "estadoActual": "Entregado",
      "eventos": [...]
    }
  ]
}
```

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | OK — Operación exitosa |
| 201 | Created — Recurso creado |
| 400 | Bad Request — Datos inválidos |
| 404 | Not Found — Recurso no existe |
| 409 | Conflict — Duplicado (trackingNumber ya existe) |
| 500 | Internal Server Error — Error del servidor |

**Ejemplo error 409 (duplicado)**:
```json
{
  "success": false,
  "error": "El trackingNumber \"GUIDE001\" ya existe"
}
```

## Estructura de Carpetas

```
Api-logistica/
├── src/
│   ├── index.js                      # Arranque y conexión inicial
│   ├── app.js                        # Configuración Express
│   ├── config/
│   │   └── database.js               # Conexión a MongoDB
│   ├── models/
│   │   └── Tracking.js               # Esquema Mongoose
│   ├── controllers/
│   │   └── trackingController.js     # Lógica CRUD
│   ├── routes/
│   │   └── trackings.js              # Definición de rutas
│   ├── middleware/
│   │   └── errorHandler.js           # Manejo de errores
│   └── tests/
│       ├── tracking.unit.test.js     # Tests unitarios
│       └── tracking.integration.test.js  # Tests de integración
├── package.json                      # Dependencias
├── jest.config.js                    # Configuración Jest
├── .env.example                      # Template de variables
├── .gitignore                        # Archivos ignorados por git
└── README.md                         # Este archivo
```

## Modelo de Datos

**Documento MongoDB**:

```json
{
  "_id": ObjectId,
  "trackingNumber": "GUIDE001",
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
    "origen": "bodega"
  },
  "createdAt": "2026-05-30T10:00:00Z",
  "updatedAt": "2026-05-30T11:30:00Z"
}
```

## Validaciones

- `trackingNumber`: Requerido, único, string no vacío
- `estadoActual`: Requerido, string no vacío
- `estadoInicial` (POST): Requerido, string no vacío
- `nuevoEstado` (PUT): Requerido, string no vacío
- `nota`: Opcional, string

## Testing

### Ejecutar todos los tests

```bash
npm test
```

### Tests incluidos

✅ **Unit Tests** (`tracking.unit.test.js`):
- Validación de campos
- Timestamps y metadata
- Array de eventos

✅ **Integration Tests** (`tracking.integration.test.js`):
- POST /trackings (crear, validar duplicados)
- GET /trackings/:trackingNumber (obtener, no encontrado)
- PUT /trackings/:trackingNumber (actualizar, validar eventos)
- GET /trackings (listar, filtrar)

### Cobertura

Ver cobertura de código:

```bash
npm run test:coverage
```

Objetivo: **>= 80%** de cobertura

## Health Check

Verificar que el servidor está activo:

```bash
curl http://localhost:3000/health
```

Respuesta:
```json
{
  "status": "OK",
  "message": "Servidor activo"
}
```

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Connection string MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/...` |
| `COLLECION` | Nombre de colección MongoDB | `colecciontest0` |
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Ambiente (development/production) | `development` |

## Troubleshooting

### Error: "DATABASE_URL no está definida en .env"
- Verificar que `.env` existe y tiene `DATABASE_URL`
- Copiar desde `.env.example` si es necesario

### Error: "MongoNetworkError: connect ECONNREFUSED"
- Verificar credenciales de MongoDB Atlas
- Revisar que IP está autorizada en MongoDB Atlas (whitelist)
- Probar connection string en MongoDB Compass

### Tests fallan: "mongodb-memory-server not found"
```bash
npm install mongodb-memory-server --save-dev
```

## Próximas Mejoras (Post-MVP)

- [ ] Documentación Swagger/OpenAPI
- [ ] Autenticación (JWT)
- [ ] Paginación en listados
- [ ] Filtros avanzados
- [ ] Logs estructurados (Winston/Pino)
- [ ] Pipeline CI/CD (GitHub Actions)
- [ ] Dockerización

## Contribuir

Para reportar bugs o sugerencias, crear un issue en el repositorio.

## Licencia

ISC

---

**Desarrollado con ❤️ para la asignatura Bases de Datos No Estructuradas**

Fecha: 2026-05-30
