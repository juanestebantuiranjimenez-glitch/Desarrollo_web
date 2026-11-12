# Admitidos-Back

API REST para gestionar **facultades**, **programas académicos** y **estudiantes**, con **login y registro** para estudiantes y administradores. Construida con **Node.js, Express, MongoDB (Mongoose), JWT y bcryptjs**.

Cada estudiante queda inscrito a **un programa** y solo puede consultar su facultad, su programa, los programas de esa facultad y su propio registro. Los administradores gestionan toda la información académica.

## Requisitos

- **Node.js 20.19 o superior**.
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

MONGO_URI=mongodb+srv://USUARIO:CONTRASENA@cluster0.xxxxx.mongodb.net/admitidos_back?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET=CAMBIA_ESTE_VALOR_POR_UNA_CADENA_ALEATORIA_LARGA
JWT_EXPIRES_IN=8h
```

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto del backend. Por defecto `3000`. |
| `HOST` | Interfaz de escucha. `127.0.0.1` para uso local. |
| `APP_NAME` | Nombre que aparece en el mensaje de arranque. |
| `MONGO_URI` | Cadena de conexión de MongoDB. |
| `JWT_SECRET` | Cadena larga y aleatoria para firmar los tokens. Obligatoria. |
| `JWT_EXPIRES_IN` | Duración del token. Por defecto `8h`. |

Genera un secreto seguro con:

```bash
openssl rand -hex 48
```

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

## 4. Crear el primer administrador

El registro público solo crea estudiantes. Para crear el primer administrador (o uno adicional) usa el script incluido:

```bash
npm run crear-admin
```

El script pide nombre, correo y contraseña. También puedes pasarlos como argumentos:

```bash
npm run crear-admin -- "Administrador UCP" admin@admitidos.edu.co "Admin12345"
```

Si la cuenta ya existe, el script lo indica y no crea duplicados.

> En esta instalación de prueba ya existe el administrador `admin@admitidos.edu.co` con contraseña `Admin12345`. Cámbiala o crea tu propia cuenta para producción.

Los demás administradores se crean desde el panel web (página **Administradores**) o con `POST /api/auth/register/admin`, siempre con la sesión de un administrador activo.

## 5. Frontend

El frontend está en `frontend/` y usa **React + Vite** con **JavaScript y CSS puro**. Incluye componentes animados de React Bits.

Primero instala sus dependencias:

```bash
cd frontend
npm install
```

Arranca el frontend en otra terminal, con el backend ya corriendo:

```bash
npm run dev
```

También puedes hacerlo desde la raíz:

```bash
npm run frontend
```

Abre `http://localhost:5173`. Vite redirige las peticiones `/api` al backend en `http://127.0.0.1:3000`, así que no hace falta configurar CORS en desarrollo.

Para compilar la versión de producción:

```bash
npm run frontend:build
```

El resultado queda en `frontend/dist/`.

### Rutas del frontend

| Ruta | Acceso | Contenido |
| --- | --- | --- |
| `/login` | Público | Inicio de sesión |
| `/registro` | Público | Registro de estudiantes con selección de programa |
| `/` | Administrador | Resumen general |
| `/facultades` | Administrador | CRUD de facultades |
| `/programas` | Administrador | CRUD de programas |
| `/estudiantes` | Administrador | CRUD de estudiantes |
| `/administradores` | Administrador | Listado y creación de administradores |
| `/mi-panel` | Estudiante | Panel con sus datos, programa, facultad y programas de la facultad |

Si un estudiante intenta abrir una ruta de administración, se le redirige a `/mi-panel`. Si no hay sesión, cualquier ruta protegida redirige a `/login`.

## Autenticación

- El login devuelve un **JWT** que el frontend guarda en `localStorage` y envía en `Authorization: Bearer <token>`.
- Las contraseñas se guardan con **bcrypt** (nunca en texto plano).
- Las rutas de lectura requieren sesión. Las escrituras de facultades, programas y estudiantes requieren rol `admin`.
- Los estudiantes solo pueden leer:
  - Su propia facultad (`GET /api/facultades/show/` y `/info/:id`).
  - Los programas de su facultad (`GET /api/programas/show/` y `/info/:id`).
  - Su propio registro (`GET /api/estudiantes/show/` y `/info/:id`).
- Cualquier intento de escritura de un estudiante responde `403`.
- El registro público es `POST /api/auth/register/estudiante` y recibe `programa` (el `_id` del programa elegido).

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

### Autenticación

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/auth/programas` | Público | Programas disponibles para el registro (con su facultad) |
| POST | `/api/auth/register/estudiante` | Público | Crea la cuenta y el registro del estudiante |
| POST | `/api/auth/login` | Público | Inicia sesión y devuelve el token |
| GET | `/api/auth/me` | Sesión | Perfil del usuario autenticado |
| PUT | `/api/auth/me/avatar` | Sesión | Actualiza la foto de perfil del usuario autenticado |
| POST | `/api/auth/register/admin` | Admin | Crea otro administrador |
| GET | `/api/auth/admins` | Admin | Lista los administradores |

**Foto de perfil**

```json
{
  "avatar": "mike"
}
```

Valores permitidos: `mike`, `sulley`, `art`, `squishy` o `null` para volver a las iniciales. El campo `avatar` se guarda en el usuario y se devuelve en el login, en `GET /api/auth/me` y en el listado de administradores.

**Login**

```json
{
  "email": "admin@admitidos.edu.co",
  "password": "Admin12345"
}
```

Respuesta:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Sesión iniciada correctamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "usuario": {
      "id": "6af...",
      "nombre": "Administrador UCP",
      "email": "admin@admitidos.edu.co",
      "rol": "admin",
      "activo": true
    },
    "estudiante": null
  }
}
```

**Registro de estudiante**

```json
{
  "tipoDocumento": "CC",
  "numeroDocumento": "1088123456",
  "nombres": "Sofía",
  "apellidos": "Martínez Ríos",
  "email": "sofia.martinez@ucp.edu.co",
  "telefono": "3005557788",
  "password": "Estudiante123",
  "programa": "6af4f2a11823c6dbab24c95a"
}
```

Reglas:

- `tipoDocumento`: `CC`, `TI`, `CE` o `PA`.
- `numeroDocumento`: entre 5 y 20 letras o números, único.
- `nombres` y `apellidos`: entre 2 y 80 caracteres.
- `email`: correo válido y único entre las cuentas.
- `telefono`: opcional, entre 7 y 20 dígitos.
- `password`: entre 8 y 72 caracteres.
- `programa`: `_id` de un programa existente.

La respuesta incluye el token, por lo que el estudiante queda con la sesión iniciada.

**Crear administrador** (`Authorization: Bearer <token-admin>`)

```json
{
  "nombre": "María Fernanda Restrepo",
  "email": "maria.restrepo@ucp.edu.co",
  "password": "Admin12345"
}
```

### Facultades

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/facultades/show/` | Sesión | Lista las facultades (el estudiante solo ve la suya) |
| GET | `/api/facultades/info/:id` | Sesión | Consulta una facultad |
| POST | `/api/facultades/create/` | Admin | Crea una facultad |
| PUT | `/api/facultades/update/:id` | Admin | Actualiza el nombre |
| DELETE | `/api/facultades/delete/:id` | Admin | Elimina una facultad |

Campos: `nombre` (entre 3 y 150 caracteres).

```json
{
  "nombre": "Facultad de Ingeniería"
}
```

### Programas

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/programas/show/` | Sesión | Lista los programas con su facultad (el estudiante solo ve los de su facultad) |
| GET | `/api/programas/info/:id` | Sesión | Consulta un programa |
| POST | `/api/programas/create/` | Admin | Crea un programa |
| PUT | `/api/programas/update/:id` | Admin | Actualiza un programa |
| DELETE | `/api/programas/delete/:id` | Admin | Elimina un programa |

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

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/estudiantes/show/` | Sesión | Lista los estudiantes (el estudiante solo se ve a sí mismo) |
| GET | `/api/estudiantes/info/:id` | Sesión | Consulta un estudiante |
| POST | `/api/estudiantes/create/` | Admin | Crea un estudiante sin cuenta de acceso |
| PUT | `/api/estudiantes/update/:id` | Admin | Actualiza un estudiante |
| DELETE | `/api/estudiantes/delete/:id` | Admin | Elimina el registro del estudiante |

Al listar o consultar, el campo `usuario` incluye el `nombre` y el `avatar` de la cuenta asociada. Si el estudiante fue creado por un administrador y todavía no tiene cuenta, `usuario` es `null`.

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

Los estudiantes creados desde el panel de administración no tienen cuenta de acceso. Para que puedan iniciar sesión deben registrarse con `POST /api/auth/register/estudiante`, que crea la cuenta y asocia el programa.

## Postman

La colección ya está publicada en el workspace **juan xy's Workspace** con el nombre **Api admitidos 2026-2**, junto con el environment **Api-admitidos-2026-2**.

También quedan los archivos locales:

- `Admitidos-Back/postman/Admitidos-Back.postman_collection.json`
- `Admitidos-Back/postman/Admitidos-Back.postman_environment.json`

Para usarla:

1. Abre Postman y selecciona el environment **Api-admitidos-2026-2**.
2. Verifica que `url` sea `http://localhost:3000/api`.
3. Ejecuta la colección completa con **Run collection**, o haz clic en cada solicitud.

La colección guarda automáticamente los tokens y los identificadores en variables:

| Variable | Se llena en |
| --- | --- |
| `adminToken` | Login administrador |
| `estudianteToken` | Registro de estudiante y login estudiante |
| `facultadId` | Crear facultad |
| `programaId` | Crear programa |
| `estudianteId` | Registro de estudiante |
| `estudianteAdminId` | Crear estudiante (admin) |

Orden de ejecución:

1. `Health → Health check`
2. `Autenticación → Programas para registro`, `Login administrador`, `Mi perfil`, `Listar administradores`, `Crear administrador`
3. `Facultades → Listar`, `Crear`, `Consultar`, `Actualizar`
4. `Programas → Listar`, `Crear`, `Consultar`, `Actualizar`
5. `Estudiantes → Registro`, `Login`, `Mi perfil`, `Listar (admin)`, `Listar solo mi registro`, `Crear/Consultar/Actualizar (admin)`, pruebas de `403`
6. `Limpieza → Eliminar estudiante`, `Eliminar programa`, `Eliminar facultad`

Las solicitudes de escritura usan `adminToken` de forma explícita, así puedes probar los permisos del estudiante sin cambiar de sesión. La limpieza elimina el estudiante creado por el administrador, el programa y la facultad. La cuenta creada por el registro público permanece porque no existe un endpoint para eliminar usuarios.

## Estructura

```text
Admitidos-Back/
  src/
    config/database.js         Conexión con Mongoose
    middleware/auth.middleware.js  Verificación de JWT y roles
    modules/
      auth/                    Usuarios, login, registro y JWT
      facultades/              Modelo, servicio, controlador y rutas
      programas/               Modelo, servicio, controlador y rutas
      estudiantes/             Modelo, servicio, controlador y rutas
    app.js                     Middleware, rutas y manejo de errores
    server.js                  Arranque del servidor
    .env.example               Variables de entorno de ejemplo
  scripts/crear-admin.js       Crea el primer administrador
  postman/                     Colección y environment

frontend/
  src/
    api/                       Cliente de la API (adjunta el token)
    components/                Layout, UI, auth, dashboard y React Bits
    context/                   Autenticación y notificaciones
    hooks/                     Carga de datos
    pages/                     Login, registro, panel y páginas de administración
    styles/                    Variables, layout, componentes, páginas y auth
    utils/                     Formatos y validaciones
  vite.config.js               Proxy /api → backend

package.json                   Scripts de arranque, frontend y crear-admin
```

## Notas

- Los identificadores son los `_id` de MongoDB, no números consecutivos.
- Los programas guardan la referencia a la facultad y la devuelven con `populate`.
- El código de un programa y el número de documento de un estudiante son únicos.
- El correo de una cuenta (`usuarios.email`) es único.
- El backend responde `404` para rutas desconocidas y `400` para datos inválidos.
- Los tokens expiran según `JWT_EXPIRES_IN`; al expirar, el frontend cierra la sesión y pide volver a entrar.
