# VISION — AlterEstate CRM

## ¿Qué es este proyecto?

**AlterEstate CRM** (nombre interno: BoostWave CRM) es un sistema de gestión inmobiliaria diseñado para el mercado dominicano. Permite a empresas inmobiliarias gestionar propiedades, clientes, agentes, ventas y documentos legales desde una interfaz web moderna.

## ¿Cómo se ve el éxito?

### Para el usuario final
- Un CRM inmobiliario que **funciona sin fricción**: cargar rápido, navegar intuitivamente, ver el estado de todo en un vistazo.
- Pipeline visual de ventas con drag-and-drop que refleja el flujo real de una operación inmobiliaria dominicana.
- Documentos legales (contratos de arras, promesas de compraventa, contratos de alquiler) generados automáticamente con la legislación de República Dominicana.
- Soporte multiempresa: un admin puede gestionar múltiples inmobiliarias desde una sola plataforma.

### Para el equipo técnico
- **Build limpio**: `npm run build` pasa sin errores ni warnings.
- **Lint limpio**: `npm run lint` pasa sin errores.
- **Zero crashes en runtime**: la app no debe romper en uso normal.
- **Prisma sync**: `prisma/schema.prisma` siempre refleja la verdad de la base de datos.
- **Rendimiento**: las páginas cargan en < 2 segundos con datos reales.

## Objetivos Verificables (Quality Gates)

| Gate | Comando / Criterio |
|---|---|
| Build | `npm run build` → exit code 0, 0 errores |
| Lint | `npm run lint` → exit code 0 |
| Schema | `npx prisma validate` → exit code 0 |
| Runtime | La app inicia con `npm run dev` sin errores en consola |
| UI | Todas las rutas principales renderizan correctamente |

## Principios de Diseño

1. **Mobile-first**: los agentes inmobiliarios trabajan desde el teléfono.
2. **Data-driven**: todo lo que se pueda medir, se mide (pipeline, comisiones, metas).
3. **Contexto dominicano**: moneda USD/DOP, provincias, legislación RD, formato de teléfono local.
4. **Multiempresa desde el día 1**: tenant isolation por empresa_id.
5. **Sin magia oculta**: todo explícito, sin supresiones, sin fallbacks silenciosos.
