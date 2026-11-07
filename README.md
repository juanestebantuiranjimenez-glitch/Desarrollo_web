# Admitidos-Back

API REST para gestionar **facultades**, **programas académicos** y **estudiantes**, construida con **Node.js, Express y MongoDB (Mongoose)**.

El proyecto tiene únicamente los tres módulos académicos. No incluye autenticación, usuarios, JWT ni sesiones: todas las rutas están disponibles directamente.

## Requisitos

- **Node.js 20 o superior**.
- **MongoDB 7 o superior** en local, o una cuenta de **MongoDB Atlas**.

## 1. Configurar MongoDB

Elige una de las dos opciones.

### Opción A: MongoDB local

Si ya tienes MongoDB instalado, el servicio suele escuchar en `mongodb://127.0.0.1:27017`.

Puedes comprobarlo con:

```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

Si prefieres Docker:

```bash
docker run -d \
  --name admitidos-mongo \
  -p 27017:27017 \
  -v admitidos-mongo:/data/db \
  mongo:7
```

La URI para este caso es:

```text
mongodb://127.0.0.1:27017/admitidos_back
```

No hace falta crear la base de datos ni las colecciones a mano: MongoDB las crea cuando se guarda el primer registro.

### Opción B: MongoDB Atlas

1. Entra a <https://cloud.mongodb.com> y crea un clúster gratuito.
2. En **Database Access**, crea un usuario con contraseña.
3. En **Network Access**, agrega tu IP. Para desarrollo también puedes usar `0.0.0.0/0`.
4. En **Connect → Drivers**, copia la cadena de conexión y reemplaza `<password>`.
5. Agrega el nombre de la base al final de la URI, antes de los parámetros:

```text
mongodb+srv://USUARIO:CONTRASENA@cluster0.xxxxx.mongodb.net/admitidos_back?retryWrites=true&w=majority&appName=Cluster0
```

Si la contraseña tiene caracteres especiales (`@`, `#`, `/`, `:`), codifícalos con [encodeURIComponent](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent).

Si al arrancar aparece `Could not connect to any servers in your MongoDB Atlas cluster`, revisa que tu IP esté autorizada en **Network Access** y que el clúster esté activo. También puedes probar temporalmente con `0.0.0.0/0` (solo para desarrollo).

## 2. Configurar las variables de entorno

Copia el archivo de ejemplo:

```bash
cp Admitidos-Back/src/.env.example Admitidos-Back/src/.env
```

Edita `Admitidos-Back/src/.env`:

```env
PORT=3000
HOST=127.0.0.1
APP_NAME=Admitidos UCP

MONGO_URI=mongodb://127.0.0.1:27017/admitidos_back
```

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto del backend. Por defecto `3000`. |
| `HOST` | Interfaz de escucha. `127.0.0.1` para uso local. |
| `APP_NAME` | Nombre que aparece en el mensaje de arranque. |
| `MONGO_URI` | Cadena de conexión de MongoDB. |

El archivo `.env` está ignorado por Git. No lo subas con credenciales reales.

## 3. Instalar y arrancar

Desde la raíz del repositorio:

```bash
npm install
npm start
```

Para desarrollo con recarga automática:

```bash
npm run dev
```

El servidor queda en `http://localhost:3000`. Comprueba que responde:

```bash
curl http://localhost:3000/api/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "success": true,
  "message": "API functioning correctly",
  "version": "1.0.0"
}
```

## Endpoints

Todas las respuestas usan la misma forma:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Descripción del resultado",
  "data": {}
}
```

### Salud

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Estado de la API |

### Facultades

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/facultades/show/` | Lista las facultades ordenadas por nombre |
| GET | `/api/facultades/info/:id` | Consulta una facultad por `_id` |
| POST | `/api/facultades/create/` | Crea una facultad |
| PUT | `/api/facultades/update/:id` | Actualiza el nombre |
| DELETE | `/api/facultades/delete/:id` | Elimina una facultad |

Campos: `nombre` (entre 3 y 150 caracteres).

```json
{
  "nombre": "Facultad de Ingeniería"
}
```

### Programas

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/programas/show/` | Lista los programas con su facultad |
| GET | `/api/programas/info/:id` | Consulta un programa por `_id` |
| POST | `/api/programas/create/` | Crea un programa |
| PUT | `/api/programas/update/:id` | Actualiza un programa |
| DELETE | `/api/programas/delete/:id` | Elimina un programa |

Campos:

- `codigo`: entre 2 y 20 caracteres, único. Se guarda en mayúsculas.
- `nombre`: entre 3 y 150 caracteres.
- `nivel`: `pregrado`, `posgrado` u `otros`.
- `facultad`: `_id` de una facultad existente.

```json
{
  "codigo": "ISI",
  "nombre": "Ingeniería de Sistemas",
  "nivel": "pregrado",
  "facultad": "6aec9003a3038e4228b73c59"
}
```

Al listar o consultar, `facultad` se devuelve como objeto con `_id` y `nombre`.

### Estudiantes

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/estudiantes/show/` | Lista los estudiantes por apellidos y nombres |
| GET | `/api/estudiantes/info/:id` | Consulta un estudiante por `_id` |
| POST | `/api/estudiantes/create/` | Crea un estudiante |
| PUT | `/api/estudiantes/update/:id` | Actualiza un estudiante |
| DELETE | `/api/estudiantes/delete/:id` | Elimina un estudiante |

Campos:

- `tipoDocumento`: `CC`, `TI`, `CE` o `PA`.
- `numeroDocumento`: entre 5 y 20 letras o números, único.
- `nombres` y `apellidos`: entre 2 y 80 caracteres.
- `email`: correo válido.
- `telefono`: opcional, entre 7 y 20 dígitos.

```json
{
  "tipoDocumento": "CC",
  "numeroDocumento": "1088123456",
  "nombres": "Juan José",
  "apellidos": "Velásquez Parra",
  "email": "juan.velasquez@ucp.edu.co",
  "telefono": "3001234567"
}
```

## Postman

La colección ya está publicada en el workspace **juan xy's Workspace** con el nombre **Api admitidos 2026-2**, junto con el environment **Api-admitidos-2026-2**.

También quedan los archivos locales:

- `Admitidos-Back/postman/Admitidos-Back.postman_collection.json`
- `Admitidos-Back/postman/Admitidos-Back.postman_environment.json`

Para usarla:

1. Abre Postman y selecciona el environment **Api-admitidos-2026-2**.
2. Verifica que `url` sea `http://localhost:3000/api`.
3. Ejecuta la colección completa con **Run collection**, o haz clic en cada solicitud.

La colección crea una facultad, un programa y un estudiante, guarda sus `_id` en variables y al final elimina los tres registros. El orden es:

1. `Health → Health check`
2. `Facultades → Listar`, `Crear`, `Consultar`, `Actualizar`
3. `Programas → Listar`, `Crear`, `Consultar`, `Actualizar`
4. `Estudiantes → Listar`, `Crear`, `Consultar`, `Actualizar`
5. `Eliminar estudiante`, `Eliminar programa`, `Eliminar facultad`

Si ejecutas solicitudes sueltas, crea primero la facultad y el programa para que los identificadores estén disponibles.

## Estructura

```text
Admitidos-Back/
  src/
    config/database.js         Conexión con Mongoose
    modules/
      facultades/              Modelo, servicio, controlador y rutas
      programas/               Modelo, servicio, controlador y rutas
      estudiantes/             Modelo, servicio, controlador y rutas
    app.js                     Middleware, rutas y manejo de errores
    server.js                  Arranque del servidor
    .env.example               Variables de entorno de ejemplo
  postman/                     Colección y environment

package.json                   Scripts de arranque
```

## Notas

- Los identificadores son los `_id` de MongoDB, no números consecutivos.
- Los programas guardan la referencia a la facultad y la devuelven con `populate`.
- El código de un programa y el número de documento de un estudiante son únicos.
- El backend responde `404` para rutas desconocidas y `400` para datos inválidos.
