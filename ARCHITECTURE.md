# ARCHITECTURE — AlterEstate CRM

## Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.12 |
| UI | React + TailwindCSS v4 | React 19.2.4 |
| Animaciones | Framer Motion | 12.43+ |
| Iconos | Lucide React | 1.28+ |
| ORM | Prisma Client | 5.21+ |
| Base de Datos | SQLite (dev.db) | — |
| Auth | Custom (bcryptjs + sessions) | — |
| PDF | jsPDF + html2canvas | — |
| Lenguaje | TypeScript | 5.x |

## Estructura de Carpetas

```
alterestate-crm/
├── prisma/
│   ├── schema.prisma          # Fuente de verdad del esquema de datos
│   ├── dev.db                 # Base de datos SQLite (NO commitear)
│   ├── seed.ts                # Seed principal de datos
│   └── seed-auth.ts           # Seed de usuarios y auth
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Grupo de rutas de autenticación
│   │   ├── api/               # API Routes (REST)
│   │   │   ├── clientes/      # CRUD + upsert clientes
│   │   │   ├── propiedades/   # CRUD + match propiedades
│   │   │   └── ventas/        # CRUD + pipeline ventas
│   │   ├── actions/           # Server Actions (Next.js)
│   │   ├── actions.ts         # Server Actions legacy
│   │   ├── admin/             # Panel de administración
│   │   ├── agentes/           # Gestión de agentes
│   │   ├── analiticas/        # Dashboard de analíticas
│   │   ├── clientes/          # Gestión de clientes
│   │   │   └── [id]/          # Detalle de cliente (ruta dinámica)
│   │   ├── configuraciones/   # Settings del sistema
│   │   ├── documentos/        # Gestión de documentos legales
│   │   ├── multiempresa/      # Gestión multiempresa
│   │   ├── propiedades/       # Gestión de propiedades
│   │   │   └── [id]/editar/   # Edición de propiedad
│   │   ├── ventas/            # Pipeline y gestión de ventas
│   │   ├── DashboardClient.tsx # Dashboard principal (client component)
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Página principal (/)
│   │   └── globals.css        # Estilos globales
│   │
│   ├── components/            # Componentes reutilizables
│   │   ├── Badge.tsx          # Badges de estado
│   │   ├── DownloadPDFButton  # Botón de descarga PDF
│   │   ├── ImageUploader.tsx  # Subida de imágenes
│   │   ├── PageHeader.tsx     # Header de páginas
│   │   ├── PipelineBoard.tsx  # Board Kanban de ventas
│   │   ├── PropertyCard.tsx   # Tarjeta de propiedad
│   │   ├── PropertyFilters    # Filtros de propiedades
│   │   ├── SessionChecker.tsx # Verificador de sesión
│   │   ├── Sidebar.tsx        # Sidebar de navegación
│   │   └── StatCard.tsx       # Tarjeta de estadísticas
│   │
│   ├── config/
│   │   └── pipeline.ts        # Configuración del pipeline de ventas
│   │
│   ├── lib/                   # Utilidades y lógica compartida
│   │   ├── auth.ts            # Lógica de autenticación
│   │   ├── constants.ts       # Constantes del sistema
│   │   ├── permissions.ts     # Sistema de permisos por rol
│   │   ├── prisma.ts          # Instancia singleton de Prisma
│   │   ├── tenant.ts          # Utilidades multi-tenant
│   │   ├── phoneUtils.ts      # Formato de teléfonos RD
│   │   ├── propertySpecs.ts   # Especificaciones de propiedades
│   │   ├── pdfGenerator.ts    # Generador de PDFs
│   │   └── templatesLegalesRD.ts # Templates legales de RD
│   │
│   └── proxy.ts               # Proxy de desarrollo
│
├── scripts/
│   └── distribute_clients.js  # Script de distribución de clientes
│
├── VISION.md                  # Visión del proyecto
├── ARCHITECTURE.md            # Este archivo
├── RULES.md                   # Reglas que el agente no puede romper
├── MEMORY.md                  # Memoria persistente entre loops
├── AGENTS.md                  # Reglas para agentes de IA
├── INSTRUCTIONS.md            # Protocolo de verificación
└── package.json
```

## Modelos de Datos (Prisma)

### Entidades Principales

```
Empresa ──┬── Cliente ──── Venta ──── HistorialEstadoVenta
           │                │ │          ActividadVenta
           │                │ └── Propiedad ── HistorialPropiedad
           │                │
           ├── Agente ──────┘
           │    │
           ├── DocumentoLegal
           ├── ConfiguracionSistema
           ├── UsuarioEmpresa ── Usuario ── Sesion
           ├── AuditLog
           └── PropiedadEmpresaAgente
```

### Multi-tenancy
- **Aislamiento por `empresa_id`**: Clientes, Propiedades, Agentes, Ventas, Documentos.
- **Usuario ↔ Empresa**: relación M:N a través de `UsuarioEmpresa`.
- **Sesión**: incluye `empresa_id` para el contexto activo.

## Patrones Clave

| Patrón | Implementación |
|---|---|
| **Auth** | Sessions en DB con token + cookie, hash bcryptjs |
| **Multi-tenant** | `empresa_id` en todas las queries, `getTenantContext()` |
| **Server Actions** | `src/app/actions/` y `src/app/actions.ts` |
| **API Routes** | `src/app/api/[recurso]/route.ts` (GET/POST/PUT/DELETE) |
| **Pipeline** | Estados definidos en `src/config/pipeline.ts` |
| **Permisos** | Sistema de roles en `src/lib/permissions.ts` |

## Comandos Clave

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción (QUALITY GATE)
npm run lint         # Linting (QUALITY GATE)
npx prisma validate  # Validar schema (QUALITY GATE)
npx prisma db push   # Sincronizar schema con DB
npx prisma generate  # Regenerar cliente Prisma
npx prisma studio    # UI para explorar la DB
npx tsx prisma/seed.ts  # Ejecutar seed
```
