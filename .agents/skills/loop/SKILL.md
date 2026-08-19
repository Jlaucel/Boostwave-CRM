---
name: loop
description: >
  Ejecuta un ciclo de Loop Engineering sobre AlterEstate CRM.
  Activa este skill cuando el usuario envíe /loop seguido de un objetivo verificable.
  El agente ejecutará el ciclo completo: DESCUBRIR → PLANIFICAR → EJECUTAR → VERIFICAR → ITERAR
  hasta cumplir el objetivo o agotar los turnos definidos.
---

# Skill: Loop Engineering (/loop)

## Activación

Este skill se activa cuando el usuario escribe `/loop` seguido de una descripción del objetivo.

**Ejemplo:**
```
/loop todos los tests pasan y el build está limpio
/loop la página de clientes carga correctamente y muestra datos
/loop refactorizar PropertyCard para que sea responsive
```

---

## Protocolo de Ejecución

Al recibir un `/loop`, ejecutar el siguiente ciclo **de forma autónoma** hasta que el objetivo se cumpla o se agoten los turnos:

### FASE 0: PREPARACIÓN (obligatoria, una sola vez)

1. **Leer los archivos de contexto** en este orden:
   - `MEMORY.md` — ¿ya se intentó algo similar? ¿qué se sabe?
   - `RULES.md` — ¿qué restricciones aplican?
   - `ARCHITECTURE.md` — ¿dónde vive el código relevante?
   - `VISION.md` — ¿está alineado el objetivo con la visión?

2. **Validar el objetivo**: debe ser **verificable con un comando o una condición medible**.
   - Si el objetivo es ambiguo (ej: "mejora la app"), pedir al usuario que lo reformule.
   - Si el objetivo es claro, continuar.

3. **Parsear límite de turnos**: si el usuario no lo especificó, usar **máximo 15 iteraciones** por defecto.

---

### FASE 1: DESCUBRIR

- Identificar el estado actual del proyecto respecto al objetivo.
- Ejecutar los comandos de diagnóstico relevantes:
  ```bash
  npm run build 2>&1    # ¿Compila?
  npm run lint 2>&1     # ¿Lint limpio?
  npx prisma validate   # ¿Schema válido?
  ```
- Leer los archivos relevantes al objetivo.
- Documentar hallazgos.

### FASE 2: PLANIFICAR

- Crear un plan de acción concreto con pasos numerados.
- Cada paso debe tener un **criterio de verificación**.
- Presentar el plan al usuario en la primera iteración. En las siguientes, ejecutar directamente.

### FASE 3: EJECUTAR

- Implementar los cambios según el plan.
- Un cambio a la vez, verificar después de cada uno.
- Si un cambio rompe algo, revertir y probar un enfoque diferente.

### FASE 4: VERIFICAR

- Ejecutar los comandos de verificación del Quality Gate:
  ```bash
  npm run build    # OBLIGATORIO después de cada cambio
  npm run lint     # OBLIGATORIO
  ```
- Comparar el resultado contra el objetivo definido.
- **REGLA DE ORO**: ser honesto con la evaluación. Si algo falla, documentarlo y no declarar victoria prematura.

### FASE 5: ITERAR O TERMINAR

**Si el objetivo se cumplió:**
1. Declarar `✅ LOOP COMPLETADO`
2. Actualizar `MEMORY.md` con:
   - En **PROBADO**: qué se hizo y el resultado
   - En **VERIFICADO**: nuevos hechos confirmados
   - En **ABIERTO**: remover items resueltos, agregar nuevos si aplica
3. Presentar resumen al usuario

**Si el objetivo NO se cumplió:**
1. Documentar qué falló y por qué
2. Ajustar el plan
3. Volver a **FASE 3: EJECUTAR**
4. Decrementar el contador de turnos
5. Si se agotaron los turnos: declarar `⏱️ LOOP AGOTADO`, actualizar MEMORY.md con el estado actual y los próximos pasos sugeridos

---

## Formato de Reporte por Iteración

En cada iteración, reportar brevemente:

```
🔄 LOOP [N/MAX] — [objetivo resumido]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Estado: [qué se encontró]
🔧 Acción: [qué se hizo]
✅/❌ Verificación: [resultado del quality gate]
📝 Siguiente: [próximo paso o COMPLETADO]
```

---

## Integración con `/goal`

Si el usuario tiene acceso a la funcionalidad `/goal` de Antigravity, se recomienda usarla para objetivos de largo plazo. El skill `/loop` está diseñado para iteraciones más cortas y controladas dentro de una misma sesión.

**Cuándo usar cada uno:**

| Situación | Recomendación |
|---|---|
| Fix rápido con verificación | `/loop` |
| Feature nueva con múltiples archivos | `/loop` con más turnos |
| Tarea de varias horas sin supervisión | `/goal` |
| Refactorización masiva | `/goal` |

---

## Ejemplo Completo

**Input del usuario:**
```
/loop el build pasa limpio y la página /propiedades renderiza sin errores. Máximo 10 turnos.
```

**Ejecución esperada:**

```
🔄 LOOP [1/10] — Build limpio + /propiedades funcional
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Estado: npm run build falla con 3 errores en PropertyCard.tsx
🔧 Acción: Corregidos tipos faltantes en líneas 45, 78, 112
✅ Build: PASÓ (exit code 0)
✅ Lint: PASÓ
📝 Verificando renderizado de /propiedades...

🔄 LOOP [2/10] — Build limpio + /propiedades funcional
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Estado: /propiedades lanza error de hydration
🔧 Acción: Movido useState a componente client
✅ Build: PASÓ
✅ Renderizado: /propiedades carga correctamente

✅ LOOP COMPLETADO en 2/10 iteraciones
📝 MEMORY.md actualizado
```

---

## Reglas Específicas del Loop

1. **El que ejecuta no es el que juzga**: Sé brutalmente honesto en la verificación. No declares victoria si hay warnings o errores menores.
2. **Documenta los fallos**: Un fallo documentado en MEMORY.md vale más que un fix superficial.
3. **No suprimas errores**: Si un error persiste, escala al usuario en vez de ocultarlo.
4. **Build es ley**: Si `npm run build` no pasa, el loop NO ha terminado.
5. **Empieza pequeño**: Si el objetivo es grande, descompón en sub-objetivos verificables.
