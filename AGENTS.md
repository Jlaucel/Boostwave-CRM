<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Loop Engineering — Protocolo del Agente

## 0. Antes de CUALQUIER tarea (obligatorio)
Antes de escribir una sola línea de código, lee en este orden:
1. **`MEMORY.md`** — ¿qué se ha probado? ¿qué hechos están verificados? ¿qué está abierto?
2. **`RULES.md`** — ¿qué no puedo tocar? ¿qué invariantes debo respetar?
3. **`ARCHITECTURE.md`** — ¿dónde va este cambio? ¿qué patrón sigue?
4. **`VISION.md`** — ¿está alineado con los objetivos del proyecto?

## 1. Verificación Obligatoria de Cada Fix
Siempre que realices una corrección de errores (fix), refactorización o adición de código:
- **Pruebas de Funcionamiento:** Ejecuta comandos de compilación o pruebas (ej. `npm run build`, comprobación de sintaxis, o scripts de verificación) para validar empíricamente que la solución funciona sin errores de compilación ni errores en tiempo de ejecución.
- **Evidencia Empírica:** Nunca des por completada una tarea o corrección únicamente tras editar un archivo; debes verificar la salida de la compilación o ejecución.
- **Sin Supresiones:** No soluciones errores ocultando excepciones, silenciando logs o comentando código. Identifica la causa raíz y valida que la solución solucione el problema.

## 2. Después de CUALQUIER tarea (obligatorio)
Al terminar cada tarea, actualiza **`MEMORY.md`** con:
- **PROBADO**: qué se intentó y cuál fue el resultado
- **VERIFICADO**: nuevos hechos confirmados (con evidencia)
- **ABIERTO**: remover items resueltos, agregar nuevos descubrimientos

## 3. Quality Gates
Ninguna tarea se considera terminada hasta que TODOS estos pasen:
```bash
npm run build    # Exit code 0, 0 errores
npm run lint     # Exit code 0
```

## 4. Regla de Oro
**El que ejecuta no es el que juzga.** Sé brutalmente honesto en la verificación. Si algo falla, documéntalo en MEMORY.md en vez de ocultarlo.
