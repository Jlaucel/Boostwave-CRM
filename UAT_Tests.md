# Casos de Prueba UAT (User Acceptance Testing) - AlterEstate CRM

Este documento detalla 25 pruebas críticas agrupadas por módulos. Para autorizar el paso a Producción, todos estos escenarios deben ejecutarse exitosamente, garantizando la integridad de datos, seguridad por roles y correcto flujo de negocio.

## 1. Autenticación y Control de Accesos (RBAC)
| ID | Título de la Prueba | Pasos / Condición de Ejecución | Resultado Esperado | Estado |
|---|---|---|---|---|
| **UAT-01** | Inicio de sesión exitoso | Iniciar sesión con credenciales válidas. | Acceso al Dashboard correspondiente según el rol del usuario. | `[ ]` |
| **UAT-02** | Bloqueo por credenciales inválidas | Intentar ingresar con una contraseña incorrecta o correo inexistente. | Mensaje de error claro; acceso denegado. | `[ ]` |
| **UAT-03** | Aislamiento de datos (Multi-Tenant) | Iniciar sesión como Agente de la "Agencia A" y buscar clientes/propiedades. | Solo se ven registros de la "Agencia A". Datos de la "Agencia B" son invisibles. | `[ ]` |
| **UAT-04** | Restricciones de Agente Estándar | Como Agente, intentar editar una propiedad que pertenece a otro agente o acceder a configuraciones globales. | Botones de edición ocultos y acceso a configuraciones denegado (Redirección o Error 403). | `[ ]` |
| **UAT-05** | Privilegios de Admin/Owner | Como Admin, reasignar una oportunidad de un agente a otro. | La oportunidad cambia de dueño y se registra en el historial de la venta. | `[ ]` |

## 2. Gestión de Propiedades (Inventario)
| ID | Título de la Prueba | Pasos / Condición de Ejecución | Resultado Esperado | Estado |
|---|---|---|---|---|
| **UAT-06** | Creación de Propiedad | Llenar el formulario de nueva propiedad con fotos y características. | Propiedad guardada exitosamente, visible en el listado activo. | `[ ]` |
| **UAT-07** | Validación de campos obligatorios | Intentar guardar una propiedad sin Título o Precio. | El formulario muestra errores de validación y no permite guardar. | `[ ]` |
| **UAT-08** | Rediseño de Ficha Técnica | Abrir el detalle de una propiedad. | La vista muestra el diseño "Expediente Completo" moderno, sin cajas anidadas. | `[ ]` | 
| **UAT-09** | Historial de Modificaciones | Editar el precio de una propiedad guardada. | El "Historial de Cambios" refleja la fecha, quién lo hizo, el precio anterior y el nuevo. | `[ ]` |
| **UAT-10** | Propiedades Compartidas (Multiempresa) | Marcar una propiedad como compartida con comisión específica. | La propiedad es visible para otras agencias en la red con el badge de "Comisión Compartida". | `[ ]` |

## 3. Gestión de Clientes y Smart Matches
| ID | Título de la Prueba | Pasos / Condición de Ejecución | Resultado Esperado | Estado |
|---|---|---|---|---|
| **UAT-11** | Registro de Cliente | Crear un cliente con presupuesto y preferencias específicas. | Cliente guardado y listado en la cartera del agente. | `[ ]` |
| **UAT-12** | Smart Match Exacto | Abrir una propiedad cuyo precio esté dentro del presupuesto del cliente y coincida con sus etiquetas. | El cliente aparece en la sección "Matches Ideales" de la propiedad. | `[ ]` |
| **UAT-13** | Smart Match por Intereses | Abrir una propiedad con precio mayor al presupuesto pero con 3+ amenidades en común. | El cliente aparece en la sección "Matches por Intereses". | `[ ]` |

## 4. Pipeline y Oportunidades de Venta
| ID | Título de la Prueba | Pasos / Condición de Ejecución | Resultado Esperado | Estado |
|---|---|---|---|---|
| **UAT-14** | Iniciar Venta (Crear Oportunidad) | Desde el detalle del cliente, iniciar un proceso de venta con una propiedad. | La oportunidad aparece en la columna "Contacto Inicial" del Pipeline Board. | `[ ]` | 
| **UAT-15** | Movimiento en el Pipeline (Drag & Drop) | Arrastrar una oportunidad de "Interesado" a "Negociación". | La tarjeta cambia de columna, la propiedad pasa a estado "Reservada". | `[ ]` |
| **UAT-16** | Regla de Visitas (Clear-on-exit) | Mover una oportunidad fuera de "Visita Programada". | La fecha de la visita se limpia automáticamente para liberar el calendario. | `[ ]` |
| **UAT-17** | Flujo Excepcional (Override) | Intentar saltar de "Contacto Inicial" directamente a "Oferta Realizada". | El sistema exige una justificación escrita (mínimo 10 caracteres) para permitir el salto. | `[ ]` |

## 5. Cierres y Ventas Perdidas
| ID | Título de la Prueba | Pasos / Condición de Ejecución | Resultado Esperado | Estado |
|---|---|---|---|---|
| **UAT-18** | Cierre Exitoso (Ganado) | Mover una oportunidad a "Cerrado/Ganado". | Se calcula la comisión, la propiedad pasa a "Vendida" y desaparece del listado activo. | `[ ]` |
| **UAT-19** | Venta Perdida (Motivo) | Mover una oportunidad a "Perdido" seleccionando un motivo de la lista. | Se registra el motivo, la propiedad se libera ("Disponible") y el cliente pasa a "Inactivo". | `[ ]` |
| **UAT-20** | Venta Perdida (Motivo "Otro") | Seleccionar "Otro" al perder una venta. | Es obligatorio escribir manualmente la razón detallada. | `[ ]` |
| **UAT-21** | Reactivación de Venta | Un Admin/Owner abre una oportunidad perdida e intenta moverla a "Contacto Inicial". | La venta se reactiva exitosamente en el Pipeline. (Falla si lo intenta un Agente). | `[ ]` |
| **UAT-22** | Marcado Manual de Venta | Un Admin presiona "Marcar como Vendida" en el detalle de una propiedad disponible. | Propiedad cambia a "Vendida", sale del inventario y se registra en historial. | `[ ]` |

## 6. Analíticas, Dashboard y UX General
| ID | Título de la Prueba | Pasos / Condición de Ejecución | Resultado Esperado | Estado |
|---|---|---|---|---|
| **UAT-23** | Actualización de Métricas | Tras cerrar una venta (UAT-18), recargar el Dashboard principal. | El volumen de ventas total y las comisiones generadas aumentan reflejando el nuevo cierre. | `[ ]` |
| **UAT-24** | Responsividad Móvil | Abrir el Pipeline y el Detalle de Propiedad desde una pantalla pequeña (simulador móvil). | El diseño se adapta: las columnas hacen scroll horizontal o se apilan, los iconos se ajustan sin romperse. | `[ ]` |
| **UAT-25** | Generación de PDF | Presionar el botón "Descargar PDF" en la ficha técnica de una propiedad. | Se genera un documento limpio, sin botones de acción (no-print), listo para enviar a clientes. | `[ ]` |

---
> **Firma de Aprobación**
> Una vez completados los 25 escenarios con éxito (`[x]`), el aplicativo puede considerarse estable y listo para **Go-Live**. En caso de que un escenario falle, deberá registrarse un ticket de corrección antes del lanzamiento.
