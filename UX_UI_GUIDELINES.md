# Arquitectura UX/UI de un CRM Web Moderno
### Cómo construir cada pieza para transmitir modernidad, robustez y confianza

---

## 0. El principio rector de 2026

Los CRMs top ya no compiten en "cuántos datos muestran", compiten en **cuánto trabajo cognitivo le ahorran al usuario**. Las plataformas líderes (Attio, HubSpot, Salesforce Lightning, monday.com, Pipedrive) están migrando de "dashboards" a **copilotos**: en vez de que el usuario mire una gráfica y deduzca qué pasó, la interfaz le dice directamente "Las ventas en la región Norte cayeron 15%, aquí está el detalle" — con acceso inmediato a los datos que sustentan esa afirmación, porque **la confianza se construye mostrando el "por qué" detrás de cualquier insight automatizado**, no ocultándolo.

Esto te da tu norte para todo lo que sigue: cada componente debe responder a "¿qué decisión ayuda a tomar?", no solo "¿qué dato muestra?".

Robustez visual = jerarquía clara + consistencia sistemática + feedback constante. No es "meterle más elementos", es que cada elemento que existe se sienta intencional.

---

## 1. DASHBOARD PRINCIPAL

**Qué debe transmitir:** control inmediato de la situación, sin esfuerzo de lectura.

**Construcción:**
- **Basado en rol, no genérico.** Un dashboard único forzado para ventas, soporte, administración y ejecutivos genera sobrecarga cognitiva. Un vendedor en campo necesita ver acciones urgentes del pipeline en móvil; un gerente necesita salud de cuentas y renovaciones; un admin necesita tendencias operativas del equipo completo. En tu caso (multi-tenant + RBAC), esto es literal: el dashboard debe leerse del rol/permiso activo, no ser una vista estática.
- **Jerarquía en tres capas:**
  1. Arriba: los 3-5 KPIs que importan hoy (tarjetas grandes, tipografía bold)
  2. Medio: tendencias y comparativas (¿qué está cambiando y dónde?)
  3. Abajo: drill-down — detalle, desgloses, filtros (¿por qué está pasando?)
- **Contexto, no solo números.** Cada métrica debe indicar si mejora, empeora o se mantiene (flecha, color, delta %). Un número solo sin contexto no genera confianza, genera preguntas.
- **Máximo 6-8 widgets por vista.** Menos es más: si el usuario tiene que hacer scroll y "cazar" el dato, el dashboard falló.
- **Estética actual:** tarjetas con **glassmorphism sutil** (fondos translúcidos, blur ligero) sobre superficies limpias, combinadas con bordes de 1px muy suaves y sombras casi imperceptibles (elevación de 2-4px). Esto es lo que hoy transmite "premium" sin caer en el barroquismo de hace unos años.

---

## 2. MENÚ PRINCIPAL (sidebar)

**Qué debe transmitir:** que el sistema tiene profundidad de funcionalidades sin ser abrumador.

**Construcción:**
- Sidebar vertical colapsable (ícono-only en modo compacto, ícono+texto en expandido). Esto solo, visualmente, ya comunica "esta plataforma tiene mucho contenido organizado".
- Agrupar por **dominio funcional**, no alfabéticamente: Ventas / Contactos / Pipeline / Reportes / Configuración. Separadores visuales sutiles (no líneas duras, espacio en blanco + labels pequeños en mayúscula gris).
- Ítem activo con indicador de barra lateral de color (no solo cambio de fondo) — es el patrón que hoy domina en Linear, Attio, Notion: una barrita de 3px de acento a la izquierda del ítem activo.
- El sidebar debe ser **el mismo para todos los roles en estructura, pero renderizar solo los módulos permitidos según RBAC**. Esto refuerza seguridad percibida: el usuario nunca ve lo que no puede tocar.

---

## 3. SUBMENÚS / NAVEGACIÓN SECUNDARIA

**Qué debe transmitir:** organización sin fricción, nada se siente "escondido".

**Construcción:**
- Dos patrones dominantes hoy: (a) tabs horizontales dentro del área de contenido para sub-secciones de un mismo módulo (ej. dentro de "Contacto": Resumen / Actividad / Notas / Documentos), o (b) flyout/mega-menú al hover/click en un ítem del sidebar cuando tiene 4+ hijos.
- Evitar más de 2 niveles de anidación visual — si necesitas un tercer nivel, es señal de que la arquitectura de información necesita repensarse, no de que necesitas más submenús.
- Breadcrumbs siempre visibles en vistas profundas (Inicio > Pipeline > Cliente XYZ > Propuesta #4). Esto es barato de construir y aporta muchísima sensación de orden.

---

## 4. ICONOGRAFÍA

**Qué debe transmitir:** consistencia de marca y claridad instantánea.

**Construcción:**
- Una sola librería de íconos en todo el sistema (Lucide, Phosphor o Tabler son los estándares actuales de plataformas SaaS modernas — trazo lineal de 1.5-2px, sin rellenos, esquinas redondeadas suaves).
- Nunca mezclar estilos (algunos outline, otros filled) — es el error #1 que hace ver una interfaz "hecha por partes" en vez de diseñada como sistema.
- Íconos con significado consistente en toda la app: el mismo ícono de "editar" en la lista de contactos, en el pipeline y en configuración.
- Tamaño estandarizado por contexto (16px en tablas/listas, 20px en menús, 24px en headers de sección) — nunca "a ojo".

---

## 5. LISTAS Y TABLAS DE DATOS (data grids)

**Qué debe transmitir:** que el sistema maneja volumen real de datos con soltura (esto es clave para sentirse "robusto").

**Construcción:**
- Columnas configurables por el usuario (mostrar/ocultar, reordenar por drag).
- Fila con hover state claro + acciones rápidas que aparecen solo al hover (editar, eliminar, más opciones) — mantiene la tabla limpia hasta que el usuario necesita actuar.
- Ordenamiento y filtrado inline en el header de cada columna, no solo en un panel externo.
- Selección múltiple con barra de acciones masivas que aparece en la parte superior al seleccionar (patrón Gmail/Airtable).
- Paginación o scroll infinito con virtualización — con datasets grandes (que tu caso de multi-tenant real estate seguro tendrá), esto es lo que separa un CRM que "se ve profesional" de uno que se traba.
- Estados vacíos diseñados (no solo "no hay datos") — con ilustración simple + CTA claro de qué hacer primero.

---

## 6. VISTA KANBAN / PIPELINE

**Qué debe transmitir:** movimiento, control del flujo, transparencia del proceso — esto es directamente tu módulo actual.

**Construcción:**
- Columnas = etapas, con conteo y valor total ($ o unidades) visible en el header de cada columna — esto da inmediatamente sensación de "vista de negocio", no solo lista de tarjetas.
- Tarjetas con jerarquía visual clara: nombre del deal/lead en bold, monto destacado, avatar del responsable, badges de prioridad/etiqueta, fecha de última actividad.
- Drag & drop con feedback físico claro (la columna destino se resalta, la tarjeta se eleva con sombra al arrastrar).
- **Validación de transición visible en el momento**, no después: si una transición requiere aprobación o está bloqueada por regla de negocio, comunícalo con un estado visual inmediato (ícono de candado, tooltip explicando el motivo) en vez de dejar soltar la tarjeta y luego rechazar con un error genérico.
- Log de auditoría accesible desde la propia tarjeta (ícono de historial) — refuerza confianza: todo cambio de etapa queda trazado y es visible para quien tenga permiso.
- Límite de WIP (work in progress) opcional por columna con indicador visual si se excede — signo de un pipeline maduro.

---

## 7. VISTA DE DETALLE (registro individual: contacto, cuenta, propiedad, deal)

**Qué debe transmitir:** que cada registro es un "expediente completo", no una fila más.

**Construcción:**
- Layout de dos columnas: panel principal (info + tabs de actividad/notas/documentos) + panel lateral fijo con datos clave, contactos relacionados y próximas acciones.
- Timeline de actividad unificado (llamadas, correos, cambios de etapa, notas) en orden cronológico — es lo que hace sentir a un CRM como "fuente única de verdad".
- Edición inline (click sobre el campo, se convierte en input, guarda al perder foco) en vez de forzar modales para cada cambio pequeño.

---

## 8. BUSCADOR GLOBAL / COMMAND PALETTE

**Qué debe transmitir:** velocidad y sofisticación técnica.

**Construcción:**
- Atajo de teclado universal (Cmd/Ctrl+K) que abre un modal centrado con búsqueda que cruza todos los módulos (contactos, deals, documentos, configuración).
- Resultados agrupados por tipo con íconos distintivos.
- Incluir acciones, no solo navegación ("Crear nuevo contacto", "Ir a Configuración de roles") — este patrón (hoy estándar en Linear, Notion, Attio) es de los que más comunican "producto moderno" con menor esfuerzo de construcción.

---

## 9. FILTROS Y SEGMENTACIÓN

**Qué debe transmitir:** control granular sin complejidad visual.

**Construcción:**
- Filtros como "chips" apilables encima de listas/tablas, cada uno removible individualmente con un click.
- Guardado de vistas/segmentos personalizados ("Mis leads calientes", "Cuentas por renovar este mes") — esto es lo que hace que un usuario recurrente sienta que la herramienta "lo conoce".
- Filtro avanzado en panel lateral desplegable para condiciones compuestas (AND/OR), reservado para power users, no forzado a todos.

---

## 10. CENTRO DE NOTIFICACIONES / ACTIVIDAD

**Qué debe transmitir:** que nada se pierde, el sistema está siempre "vigilando" por el usuario.

**Construcción:**
- Ícono de campana con badge numérico, panel deslizante (no página completa) al hacer click.
- Agrupación por tipo (menciones, cambios de asignación, alertas del sistema, recordatorios) con opción de marcar como leídas en lote.
- Diferenciación visual clara entre notificación informativa vs. accionable (esta última con botón de acción directo dentro de la notificación).

---

## 11. FORMULARIOS Y MODALES

**Qué debe transmitir:** precisión y prevención de errores — esto pesa mucho en percepción de "profesionalismo".

**Construcción:**
- Validación en tiempo real, no solo al enviar.
- Agrupación lógica de campos con espaciado generoso — nunca un formulario de 20 campos en una sola columna sin secciones.
- Modales para acciones rápidas y contenidas; páginas completas para creación/edición de registros complejos. Mezclar mal esto (modal gigante con scroll interno) es señal de arquitectura de información débil.
- Autosave con indicador sutil ("Guardado" con check verde que aparece y se desvanece) en vistas de edición prolongada.

---

## 12. SISTEMA DE ROLES Y PERMISOS (RBAC) — visible en la UI

**Qué debe transmitir:** seguridad y control empresarial serio — clave para tu módulo activo.

**Construcción:**
- Matriz de permisos visual (tabla: Rol × Módulo × Acción con toggles o checkboxes), no un formulario JSON crudo — esto solo ya hace que el módulo se vea "enterprise-grade".
- Indicadores visuales consistentes en toda la app cuando un usuario ve un elemento en modo solo-lectura por su rol (candado, opacidad reducida, tooltip explicativo) en vez de simplemente ocultarlo — a veces mostrar "esto existe pero no tienes acceso" comunica más robustez que ocultarlo silenciosamente (depende del nivel de confidencialidad que definas).
- Vista de auditoría/log de accesos y cambios por tenant, filtrable por usuario, fecha y acción — este es el componente que más diferencia un CRM "de juguete" de uno multi-tenant serio.
- Selector de tenant/compañía siempre visible en el header cuando el usuario tiene acceso a más de una — nunca ambigüedad sobre "en qué espacio estoy trabajando".

---

## 13. REPORTES Y ANALÍTICA

**Qué debe transmitir:** inteligencia de negocio, no solo gráficas bonitas.

**Construcción:**
- Constructor de reportes drag-and-drop (elegir dimensión, métrica, filtro) en vez de reportes 100% fijos — comunica flexibilidad enterprise.
- Gráficas simples y directas: si necesita leyenda + tutorial + respirar hondo para entenderla, es la gráfica equivocada para este contexto. Barras y líneas simples superan a gráficas "creativas" en un CRM.
- Exportación clara (CSV, PDF, programado por correo) siempre visible, no escondida en un menú de tres puntos.

---

## 14. CONFIGURACIÓN / AJUSTES

**Qué debe transmitir:** que la plataforma es configurable a fondo sin ser intimidante.

**Construcción:**
- Navegación de configuración en su propio sidebar secundario (patrón "ajustes dentro de ajustes"), organizada por categoría: General / Usuarios y roles / Integraciones / Facturación / Seguridad.
- Cada sección con descripción de una línea de qué controla, antes de los controles mismos.
- Cambios críticos (eliminar tenant, cambiar rol de owner) siempre con confirmación explícita de doble paso.

---

## 15. ONBOARDING Y EMPTY STATES

**Qué debe transmitir:** que la plataforma guía, no abandona al usuario nuevo.

**Construcción:**
- Checklist de progreso inicial persistente y descartable ("3 de 5 pasos completados") en vez de un tour de una sola vez que se olvida.
- Cada módulo vacío (sin datos aún) con ilustración simple + explicación de una línea + botón de acción directo — nunca una tabla vacía sin contexto.

---

## 16. SISTEMA DE DISEÑO BASE (lo que sostiene todo lo anterior)

Esto es lo que realmente determina si el CRM "se ve robusto" o "se ve amateur", más que cualquier componente individual:

- **Tipografía:** una sola familia (Inter, Geist o similar — sans-serif geométrica, muy usada en SaaS 2026 por su legibilidad en pantallas de datos), con escala tipográfica clara: título de página, título de sección, cuerpo, texto secundario, caption. Nunca más de 4-5 tamaños en toda la app.
- **Color:** paleta neutra (grises con temperatura ligeramente fría o cálida, consistente) + 1 color de marca para acciones primarias + colores semánticos fijos (verde=éxito, rojo=error/riesgo, ámbar=advertencia, azul=información) usados SIEMPRE con ese significado, nunca decorativamente.
- **Espaciado:** sistema de múltiplos de 4px u 8px en todo (4, 8, 12, 16, 24, 32, 48). Esto es invisible al usuario pero es lo que hace que todo se sienta "alineado" sin que nadie sepa explicar por qué.
- **Elevación/sombras:** 3-4 niveles máximo (superficie base, tarjeta, dropdown/popover, modal), sombras suaves y consistentes, nunca sombras duras tipo Material antiguo.
- **Modo oscuro real** (no solo invertir colores) — hoy es tabla de entrada en cualquier CRM que quiera verse moderno, no un "extra".
- **Micro-interacciones:** transiciones de 150-250ms en hover/click/apertura de paneles. Nada instantáneo (se siente roto), nada lento (se siente pesado). Skeleton loaders en vez de spinners genéricos al cargar datos — comunican mucho mejor "esto tiene datos reales cargando" que un círculo girando.

---

## Resumen ejecutivo: la fórmula de percepción

| Quieres transmitir... | Se logra con... |
|---|---|
| **Modernidad** | Glassmorphism sutil, modo oscuro, command palette, microinteracciones fluidas |
| **Profesionalismo** | Tipografía y espaciado sistemáticos, paleta neutra + acento único, iconografía consistente |
| **Confianza** | Trazabilidad visible (auditoría, timelines), contexto en cada métrica, estados de permiso explícitos |
| **Robustez / muchas funcionalidades** | Sidebar con agrupación por dominio, tablas con configuración avanzada, constructor de reportes, RBAC visual como matriz |

Para tu caso específico: el punto donde más se juega la percepción de "plataforma enterprise seria" es el cruce entre **el Kanban del pipeline y el RBAC** — que las reglas de transición y los overrides se vean como parte natural del flujo (candados, tooltips, badges de aprobación pendiente) y no como errores genéricos, es lo que separa un pipeline "que funciona" de uno que se percibe como construido con criterio de producto real.
