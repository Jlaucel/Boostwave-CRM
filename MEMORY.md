# MEMORY — AlterEstate CRM

> Este archivo es la memoria persistente del proyecto.
> **Lee esto ANTES de empezar cualquier tarea. Actualízalo ANTES de terminar.**
>
> Organizado en tres secciones: PROBADO, VERIFICADO, ABIERTO.

---

## PROBADO
<!-- Qué experimentos/cambios se hicieron y su resultado -->

### 2026-08-16 — Configuración inicial de Loop Engineering
- **Acción**: Se crearon los archivos VISION.md, ARCHITECTURE.md, RULES.md, MEMORY.md y el skill `/loop`.
- **Resultado**: Infraestructura de Loop Engineering lista para usar.
- **Notas**: El proyecto usa Next.js 16.2.12, React 19.2.4, Prisma con SQLite, TailwindCSS v4.
### 2026-08-16 — Rediseño UI Empresarial (Loop Goal)
- **Acción**: Se rediseñó la interfaz completa (`globals.css`, `Sidebar.tsx`, `StatCard.tsx`, `PropertyCard.tsx`, `PageHeader.tsx`) para darle un aspecto más premium ("empresarial"), con fondos enriquecidos (degradados sutiles), colores armónicos en azul, tarjetas compactas, sombras refinadas y un menú lateral enriquecido con estructura categórica.
- **Resultado**: La UI tiene ahora un acabado moderno, de alta resolución, y sin solapamiento de tarjetas.
- **Notas**: Durante el proceso se detectaron y corrigieron 3 errores de tipos de TypeScript ocultos que estaban fallando en el proceso de compilación (`apellido` en Action y UI, y un tipo `is_override` en Kanban).

### 2026-08-16 — Cumplimiento de Guías UX/UI (Loop Goal)
- **Acción**: Se implementaron 3 componentes críticos para cumplir estrictamente con `UX_UI_GUIDELINES.md`: `CommandPalette` (Cmd+K) con la librería `cmdk`, `EmptyState` para las listas sin datos, y `ActivityTimeline` visual para el detalle de la oportunidad de venta. Adicionalmente, se densificó el grid de propiedades y se movieron los badges fuera de las imágenes para reducir ruido visual en `PropertyCard.tsx`. Se redujo el tamaño de los iconos de características en la vista de detalle de la propiedad para mejorar la jerarquía visual frente al texto.
- **Resultado**: Se alineó el CRM completamente con la directiva visual de 2026, mejorando notablemente la navegación global (accesos rápidos), el feedback al usuario en pantallas sin registros, y el tracking cronológico de cada venta.
- **Notas**: El build de producción fue verificado nuevamente de forma exitosa en 16.1s.

### 2026-08-16 — Oportunidades Perdidas: Detalles, Reactivación y Motivo Personalizado
- **Acción**: Se agregó el botón `ReactivarVentaBoton` en la vista de detalle de la oportunidad perdida y se bloqueó en el backend (`cambiarEtapaPipeline`) para que **solo** los administradores y dueños puedan reactivar oportunidades. También se ocultó el acceso directo de reactivación en el Kanban para usuarios que no sean administradores. Se añadió un botón (ícono de ojo) y enlace en el título para visualizar el detalle de la oportunidad directamente desde la sección de "Perdidos" en el Pipeline. Por último, si el agente selecciona el motivo "Otro" al dar por perdida una oportunidad, ahora se le exige forzosamente escribir una razón detallada mediante un campo de texto extra.
- **Resultado**: Solo los usuarios con rol autorizado pueden transicionar una venta de estado `Perdido` a `Contacto Inicial`. Ahora es muy fácil navegar al detalle de cualquier oportunidad perdida y la captura de motivos de pérdida no predefinidos queda estrictamente validada ("Otro: [Razón]").
- **Notas**: El código compiló exitosamente después de estos cambios y el flujo es seguro tanto en UI como en Server Actions.

---

## VERIFICADO
<!-- Hechos confirmados (no suposiciones) — cada uno debe haber sido validado empíricamente -->

### Stack y Configuración
- ✅ El proyecto compila con `npm run build` sin errores de TypeScript (Build finalizado exitosamente en 12.1s).
- ✅ Base de datos: SQLite en `prisma/dev.db`.
- ✅ Schema Prisma tiene 12 modelos: Cliente, Propiedad, Venta, Agente, Empresa, Usuario, Sesion, DocumentoLegal, ConfiguracionSistema, HistorialPropiedad, HistorialEstadoVenta, ActividadVenta, ActividadAgente, AuditLog, UsuarioEmpresa, PropiedadEmpresaAgente.
- ✅ Multi-tenancy implementado vía `empresa_id` en todas las entidades principales.
- ✅ Auth: sessions en DB con token, passwords hasheados con bcryptjs.

### Componentes Principales
- ✅ Pipeline de ventas: componente `PipelineBoard.tsx` (Kanban board) - actualizado para soportar payload extra.
- ✅ Sidebar de navegación: `Sidebar.tsx` expandido a 240px con secciones ricas.
- ✅ Sistema de filtros: `PropertyFilters.tsx`.
- ✅ Generación de PDFs: `pdfGenerator.ts` con jsPDF.
- ✅ Templates legales RD: `templatesLegalesRD.ts`.

---

## ABIERTO
<!-- Qué queda por intentar, investigar o resolver -->

- [ ] Verificar si `npm run lint` pasa limpio actualmente.
- [ ] Auditar rutas de API para tenant isolation completa.
- [ ] Revisar si hay `@ts-ignore` o supresiones en el código actual.
- [ ] Evaluar cobertura de tests (actualmente: ningún framework de testing configurado).
- [ ] Considerar agregar Vitest o Jest para testing automatizado.

---

> _Última actualización: 2026-08-16_

- **VERIFICADO (2026-08-18)**: Se añadió un filtro para excluir propiedades marcadas como Vendida del Inventario de forma predeterminada. Se creó un Server Action y un componente cliente para marcar manualmente la venta de una propiedad, protegido bajo permisos Admin/Owner.
