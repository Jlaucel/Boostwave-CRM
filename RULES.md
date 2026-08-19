# RULES — AlterEstate CRM

> **Estas reglas son INVARIANTES. El agente no puede romperlas bajo ninguna circunstancia.**
> Si una tarea entra en conflicto con una regla, el agente debe detenerse y pedir clarificación.

---

## 🚫 Lo que NUNCA se puede hacer

### Base de Datos
- **NO borrar `prisma/schema.prisma`** ni reemplazarlo por completo.
- **NO ejecutar `prisma migrate reset`** o `prisma db push --force-reset` sin aprobación explícita del usuario.
- **NO cambiar el provider** de SQLite a otro sin aprobación.
- **NO borrar `dev.db`** sin backup previo ni aprobación.
- **NO eliminar campos existentes** del schema sin aprobación. Solo agregar es permitido por defecto.

### Código
- **NO suprimir errores**: ni `try/catch` vacíos, ni `// @ts-ignore`, ni `eslint-disable` sin justificación documentada.
- **NO eliminar tests existentes** ni comentarlos para que pasen.
- **NO hacer `any` en TypeScript** excepto en interfaces con APIs externas donde el tipo real es desconocido.
- **NO modificar `src/lib/prisma.ts`** (singleton de Prisma — es la instancia compartida).
- **NO hardcodear credenciales** ni secrets en el código fuente.

### Arquitectura
- **NO cambiar la estructura de App Router** (de `app/` a `pages/` o viceversa).
- **NO remover el sistema de multi-tenancy** (`empresa_id`). Todo query nuevo debe incluir filtro por empresa.
- **NO cambiar el sistema de auth** sin aprobación (sessions en DB con token).
- **NO instalar ORMs alternativos** (TypeORM, Drizzle, etc.) — Prisma es el ORM del proyecto.

### Proceso
- **NO dar una tarea por terminada** sin ejecutar `npm run build` y verificar exit code 0.
- **NO hacer commits** sin verificar build + lint.
- **NO ignorar warnings** de compilación — tratarlos como errores potenciales.

---

## ✅ Lo que SIEMPRE se debe hacer

### Antes de cada cambio
1. **Leer `MEMORY.md`** — verificar si ya se intentó algo similar y qué pasó.
2. **Leer `ARCHITECTURE.md`** — entender dónde va el cambio en la estructura.
3. **Leer `VISION.md`** — asegurar que el cambio está alineado con los objetivos.

### Durante cada cambio
4. **Mantener tenant isolation** — todo query nuevo a Prisma debe filtrar por `empresa_id`.
5. **Respetar los tipos** — usar tipos de Prisma generados, no crear interfaces duplicadas.
6. **Mantener convención de nombres** — campos en español (snake_case), componentes en PascalCase.

### Después de cada cambio
7. **Ejecutar `npm run build`** — verificar que compila sin errores.
8. **Ejecutar `npm run lint`** — verificar que no hay errores de lint.
9. **Actualizar `MEMORY.md`** — documentar qué se hizo, qué funcionó, qué falló.

---

## 📏 Convenciones

| Aspecto | Convención |
|---|---|
| Idioma del código | Español (nombres de campos, variables, comentarios) |
| Idioma de UI | Español |
| Estilo de campos DB | snake_case en español (`fecha_creacion`, `estado_venta`) |
| Componentes React | PascalCase (`PropertyCard.tsx`, `PipelineBoard.tsx`) |
| API Routes | kebab-case en la URL, camelCase en el handler |
| Server Actions | Archivos en `src/app/actions/` con funciones `async` |
| Moneda por defecto | USD (configurable por empresa) |
| Contexto geográfico | República Dominicana |
