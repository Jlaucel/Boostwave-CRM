export interface DatosContratoLegal {
  clienteNombre?: string | null
  clienteTelefono?: string | null
  clienteCorreo?: string | null
  clienteDocumento?: string | null // Cédula/Pasaporte
  
  propiedadTitulo?: string | null
  propiedadTipo?: string | null
  propiedadPrecio?: number | null
  propiedadSector?: string | null
  propiedadProvincia?: string | null
  propiedadTamano?: number | null
  
  agenteNombre?: string | null
  agenteEmpresa?: string | null
  
  montoSeparacion?: number | null
  duracionMeses?: number | null
  fechaActual?: string
}

export function generarContratoArrasRD(datos: DatosContratoLegal): string {
  const precio = datos.propiedadPrecio ? `$${datos.propiedadPrecio.toLocaleString()} USD` : '[PRECIO EN ACUERDO]'
  const separacion = datos.montoSeparacion ? `$${datos.montoSeparacion.toLocaleString()} USD` : '$5,000 USD'
  const fecha = datos.fechaActual || new Date().toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })
  
  return `
================================================================================
CONTRATO DE OPCIÓN DE COMPRA Y RECIBO DE ARRAS / SEPARACIÓN DE INMUEBLE
================================================================================
Lugar y Fecha: Santo Domingo, República Dominicana, a los ${fecha}.

ENTRE LAS PARTES:

DE UNA PARTE: EL VENDEDOR (o su representante autorizado BoostWave Real Estate), representado en este acto por ${datos.agenteNombre || 'el Asesor Inmobiliario Asignado'}.

DE OTRA PARTE: EL COMPRADOR / PROSPECTO, ${datos.clienteNombre || '[NOMBRE DEL CLIENTE]'}, titular del documento de identidad / Cédula No. ${datos.clienteDocumento || '[CÉDULA/PASAPORTE]'}, con teléfono de contacto ${datos.clienteTelefono || '[TELÉFONO]'} y correo electrónico ${datos.clienteCorreo || '[CORREO]'}.

SE HA CONVENIDO Y PACTADO LO SIGUIENTE:

PRIMERO: OBJETO DEL CONTRATO.
EL COMPRADOR manifiesta su intención formal de adquirir el inmueble denominado "${datos.propiedadTitulo || '[TÍTULO DE PROPIEDAD]'}", tipo ${datos.propiedadTipo || 'Inmueble'}, ubicado en el sector ${datos.propiedadSector || '[SECTOR]'}, provincia ${datos.propiedadProvincia || 'Distrito Nacional'}, República Dominicana, con una superficie de aproximadamente ${datos.propiedadTamano ? `${datos.propiedadTamano} m2` : '[METRAJE] m2'}.

SEGUNDO: PRECIO Y MONTO DE SEPARACIÓN (ARRAS).
El precio total pactado para la compraventa del inmueble expresado en este acto es de ${precio}.
En el día de hoy, EL COMPRADOR entrega a título de ARRAS CONFIRMATORIAS Y SEPARACIÓN la suma de ${separacion}, cuyo recibo conforme queda certificado mediante la firma del presente documento.

TERCERO: PLAZO DE FORMALIZACIÓN.
Las partes acuerdan un plazo máximo de treinta (30) días calendario a partir de la firma de este contrato para la redacción, firma e higienización de la PROMESA DE COMPRAVENTA definitiva o firma del Acto de Venta.

CUARTO: PENALIDAD Y DESISTIMIENTO.
Conforme al Código Civil de la República Dominicana sobre los contratos de opción y arras:
a) Si EL COMPRADOR desiste injustificadamente de la compra dentro del plazo establecido, perderá la suma entregada por concepto de arras en favor del VENDEDOR.
b) Si EL VENDEDOR desiste injustificadamente o se niega a vender el inmueble, devolverá a EL COMPRADOR el doble de la suma recibida por concepto de arras.

EN FE DE LO CUAL, las partes firman dos (2) ejemplares de un mismo tenor y efecto en la ciudad de Santo Domingo, República Dominicana.


________________________________________               ________________________________________
             EL COMPRADOR                                           EL VENDEDOR / AGENTE
${datos.clienteNombre || 'Cliente'}                                   ${datos.agenteNombre || 'Asesor Inmobiliario'}
`
}

export function generarPromesaCompraventaRD(datos: DatosContratoLegal): string {
  const precio = datos.propiedadPrecio ? `$${datos.propiedadPrecio.toLocaleString()} USD` : '[PRECIO ACORDADO]'
  const inicial = datos.propiedadPrecio ? `$${(datos.propiedadPrecio * 0.20).toLocaleString()} USD` : '[20% INICIAL]'
  const saldo = datos.propiedadPrecio ? `$${(datos.propiedadPrecio * 0.80).toLocaleString()} USD` : '[80% SALDO DE IMPORTE]'
  const fecha = datos.fechaActual || new Date().toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })

  return `
================================================================================
CONTRATO DE PROMESA DE COMPRAVENTA DE INMUEBLE (CONFORME LEY 108-05 RD)
================================================================================
Fecha de Firma: ${fecha}
Jurisdicción Inmobiliaria: Registrada en la República Dominicana

ENTRE:
PARTES VENDEDORA Y COMPRADORA:

1. DE UNA PARTE: LA PROMOTORA / VENDEDOR, a través de su agente designado ${datos.agenteNombre || 'Agente Comercial BoostWave'}.
2. DE LA OTRA PARTE: ${datos.clienteNombre || '[NOMBRE DEL COMPRADOR]'}, dominicano(a), mayor de edad, titular de la Cédula de Identidad y Electoral No. ${datos.clienteDocumento || '[CÉDULA]'}, domiciliado(a) y residente en República Dominicana, en lo adelante denominado EL PROMITENTE COMPRADOR.

HAN CONVENIDO Y PACTADO LO SIGUIENTE:

ARTÍCULO 1: DESIGNACIÓN DEL INMUEBLE.
EL PROMITENTE VENDEDOR promete vender libre de cargas, gravámenes o hipotecas no declaradas, y EL PROMITENTE COMPRADOR promete comprar el siguiente inmueble:
- Inmueble: "${datos.propiedadTitulo || '[TÍTULO INMUEBLE]'}" (${datos.propiedadTipo || 'Propiedad'}).
- Ubicación: Sector ${datos.propiedadSector || 'Centro'}, Provincia ${datos.propiedadProvincia || 'Distrito Nacional'}, República Dominicana.
- Extensión Superficial: ${datos.propiedadTamano ? `${datos.propiedadTamano} m2` : 'Superficie según título'}.
- Estatus Legal: Sometido al Régimen de Condominio / Registro de Títulos Ley 108-05.

ARTÍCULO 2: PRECIO Y FORMA DE PAGO.
El precio acordado y definitivo para la venta del inmueble es la suma de ${precio}.
La forma de pago convenida es la siguiente:
a) Pago Inicial (20%): La suma de ${inicial}, pagadera a la firma de la presente promesa de compraventa.
b) Saldo Restante (80%): La suma de ${saldo}, la cual será cubierta mediante financiamiento hipotecario bancario o recursos propios contra entrega del título deslindado y llaves del inmueble.

ARTÍCULO 3: IMPUESTOS Y GASTOS DE TRASPASO (DGII).
Conforme a las leyes fiscales de la República Dominicana:
- El impuesto del tres por ciento (3%) sobre transferencia inmobiliaria ante la Dirección General de Impuestos Internos (DGII), los honorarios notariales y gastos del Registro de Títulos serán cubiertos en su totalidad por EL PROMITENTE COMPRADOR.
- La verificación del Impuesto a la Propiedad Inmobiliaria (IPI) al día corresponde a la PARTE VENDEDORA.

ARTÍCULO 4: JURISDICCIÓN Y LEY APLICABLE.
Para todos los fines del presente contrato, las partes se someten al derecho común y a la jurisdicción de los Tribunales de la República Dominicana.

Hecho y firmado de buena fe en dos (2) originales de un mismo tenor y efecto en Santo Domingo, Distrito Nacional, República Dominicana.


________________________________________               ________________________________________
       EL PROMITENTE COMPRADOR                                 EL PROMITENTE VENDEDOR
${datos.clienteNombre || 'Cliente'}                                   ${datos.agenteNombre || 'Agente / Representante'}
`
}

export function generarContratoAlquilerRD(datos: DatosContratoLegal): string {
  const renta = datos.propiedadPrecio ? `$${datos.propiedadPrecio.toLocaleString()} DOP/USD` : '[CANON ACORDADO]'
  const deposito = datos.propiedadPrecio ? `$${(datos.propiedadPrecio * 2).toLocaleString()} DOP/USD` : '[2 MESES DE DEPÓSITO]'
  const fecha = datos.fechaActual || new Date().toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })
  const meses = datos.duracionMeses || 12

  return `
================================================================================
CONTRATO DE ALQUILER / ARRENDAMIENTO RESIDENCIAL (REPÚBLICA DOMINICANA)
================================================================================
Fecha de Emisión: ${fecha}
Ciudad y País: Santo Domingo, República Dominicana

ENTRE:
1. EL PROPIETARIO / ARRENDADOR: Representado legalmente por ${datos.agenteNombre || 'Gestor Inmobiliario BoostWave'}.
2. EL INQUILINO / ARRENDATARIO: ${datos.clienteNombre || '[NOMBRE DEL INQUILINO]'}, titular de la Cédula/Pasaporte No. ${datos.clienteDocumento || '[CÉDULA]'}, Teléfono ${datos.clienteTelefono || '[TELÉFONO]'}.

SE HA ACORDADO LO SIGUIENTE:

PRIMERO: INMUEBLE ARRENDADO.
EL ARRENDADOR cede en calidad de alquiler a EL ARRENDATARIO el inmueble tipo ${datos.propiedadTipo || 'Residencial'} denominado "${datos.propiedadTitulo || '[INMUEBLE]'}", ubicado en ${datos.propiedadSector || '[SECTOR]'}, ${datos.propiedadProvincia || 'Santo Domingo'}, República Dominicana, destinado exclusivamente para uso habitacional.

SEGUNDO: DURACIÓN DEL CONTRATO.
La duración del presente contrato será de ${meses} meses obligatorios para ambas partes, iniciando a partir de la firma de este acto y renovable mediante acuerdo escrito entre las partes.

TERCERO: MONTO DEL ALQUILER Y DEPÓSITO EN GARANTÍA.
- Renta Mensual: EL ARRENDATARIO pagará por concepto de alquiler mensual la suma de ${renta}, pagaderos los primeros cinco (5) días de cada mes.
- Depósito en Garantía: EL ARRENDATARIO entrega en este acto la suma de ${deposito} correspondiente a dos (2) meses de depósito en garantía (conforme a las disposiciones del Banco Agrícola y la legislación dominicana de alquileres).

CUARTO: MANTENIMIENTO Y PROHIBICIONES.
- Los servicios de agua, luz, recolección de basura, internet y mantenimiento del condominio serán pagados puntualmente por EL ARRENDATARIO.
- Queda terminantemente prohibido subarrendar el inmueble o realizar modificaciones estructurales sin autorización previa por escrito del ARRENDADOR.

Firmado en dos (2) ejemplares de un mismo tenor en la ciudad de Santo Domingo, República Dominicana.


________________________________________               ________________________________________
             EL ARRENDATARIO                                        EL ARRENDADOR
${datos.clienteNombre || 'Inquilino'}                                   ${datos.agenteNombre || 'Propietario / Gestor'}
`
}
