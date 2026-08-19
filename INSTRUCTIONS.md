# Guía de Instrucciones y Protocolo de Verificación de Correcciones (Fixes)

Este archivo establece las reglas obligatorias de desarrollo y control de calidad que todos los asistentes de IA y desarrolladores deben seguir en este proyecto.

---

## 📋 Protocolo de Verificación de Fixes (Obligatorio)

Siempre que se realice un arreglo de errores (**fix**), refactorización o cambio en el código fuente, se deben seguir estrictamente los siguientes pasos antes de dar la tarea por finalizada:

### 1. Diagnóstico e Inspección Previa
- Leer y analizar los logs completos y tracebacks antes de formular una hipótesis sobre un fallo.
- No asumir lógica, rutas o esquemas de datos sin consultar la fuente de verdad en el código.

### 2. Ejecución y Validación Obligatoria del Fix
- **Verificación en Ejecución/Compilación:** Tras aplicar cualquier edición en los archivos, se **DEBE** ejecutar el comando de verificación correspondiente (por ejemplo: `npm run build`, linters, o comandos de prueba) para confirmar que no existen errores sintácticos ni de compilación.
- **Sin Éxito Prematuro:** Nunca declarar una tarea como "completada" o un "error corregido" basándose únicamente en haber editado un archivo sin haber validado empíricamente su resultado.
- **Sin Correcciones Superficiales:** No resolver errores enmascarando síntomas, silenciando excepciones, comentando pruebas fallidas o retornando valores *fallback* vacíos. Siempre se debe corregir la causa raíz.

### 3. Protocolo de Confirmación
- Toda modificación debe ir acompañada del resultado de las pruebas o comando de verificación ejecutado para asegurar la estabilidad del proyecto.

---

*Fecha de creación:* 2026-08-07  
*Proyecto:* BoostWave CRM
