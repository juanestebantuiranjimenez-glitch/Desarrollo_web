# Frontend · Admisiones UCP

Interfaz en **React + Vite** para administrar facultades, programas y estudiantes. Usa **JavaScript y CSS puro**, sin TypeScript ni Tailwind.

## Requisitos

- Node.js 20.19 o superior.
- El backend corriendo en `http://127.0.0.1:3000`.
- MongoDB disponible para el backend.

## Arrancar

Desde esta carpeta:

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

Vite redirige las peticiones `/api` al backend en el puerto `3000`. Por eso el frontend no necesita configuración de CORS para desarrollo.

## Compilar

```bash
npm run build
npm run preview
```

El resultado queda en `dist/`.

## Estructura

```text
src/
  api/                 Cliente de la API y recursos
  components/
    dashboard/         Tarjetas y gráfico del resumen
    layout/            Sidebar, topbar y estructura
    reactbits/         Componentes animados de React Bits
    ui/                Modal, campos, badges, toasts, etc.
  context/             Notificaciones globales
  hooks/               Carga de listas desde la API
  pages/               Resumen, facultades, programas y estudiantes
  styles/              Variables, layout, componentes y páginas
  utils/               Formatos y validaciones compartidas
```

## React Bits

Los componentes de `src/components/reactbits` provienen de [React Bits](https://reactbits.dev) y se adaptaron a JavaScript + CSS:

- `SoftAurora`: fondo animado del dashboard.
- `BlurText`: animación de títulos.
- `GradientText`: texto con degradado animado.
- `ClickSpark`: chispas al hacer clic.
- `SpotlightCard`: tarjetas con luz que sigue al cursor.

React Bits es gratuito para uso personal y comercial bajo licencia MIT + Commons Clause. No se deben vender ni redistribuir los componentes por separado.

## Funcionalidad

- Resumen con indicadores, distribución por nivel, facultades y últimos estudiantes.
- CRUD completo de facultades, programas y estudiantes.
- Búsqueda y filtros en las tres tablas.
- Formularios con validación y mensajes de error de la API.
- Confirmación antes de eliminar.
- Notificaciones de éxito y error.
- Diseño responsive con menú lateral en escritorio y deslizable en móvil.
