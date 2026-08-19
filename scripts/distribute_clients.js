const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('--- Iniciando Creación y Distribución de Clientes ---')

  // 1. Asegurar al menos 3 agentes en el sistema
  let agentes = await prisma.agente.findMany()
  
  if (agentes.length < 3) {
    console.log('Creando agentes adicionales para distribución...')
    const nuevosAgentes = [
      { nombre: 'María Rodríguez', email: 'maria.rodriguez@boostwave.com', telefono: '809-555-0101', rol: 'Agente Senior', meta_ventas: 1500000 },
      { nombre: 'Alejandro Peralta', email: 'alejandro.peralta@boostwave.com', telefono: '829-555-0102', rol: 'Consultor Inmobiliario', meta_ventas: 1200000 },
      { nombre: 'Laura Fernández', email: 'laura.fernandez@boostwave.com', telefono: '849-555-0103', rol: 'Agente Comercial', meta_ventas: 1000000 }
    ]

    for (const aData of nuevosAgentes) {
      await prisma.agente.upsert({
        where: { email: aData.email },
        update: {},
        create: aData
      })
    }
    agentes = await prisma.agente.findMany()
  }

  console.log(`Total de Agentes disponibles: ${agentes.length}`)

  // 2. Crear 3 nuevos clientes
  const nuevosClientesData = [
    {
      nombre: 'Carlos Mendoza',
      telefono: '809-555-0199',
      correo_electronico: 'carlos.mendoza@email.com',
      origen: 'WhatsApp Lead',
      presupuesto_min: 250000,
      presupuesto_max: 400000,
      etiquetas: JSON.stringify(['apartamento', '3 habitaciones', 'piantini', 'piscina']),
      estado: 'Nuevo'
    },
    {
      nombre: 'Elena Rosario',
      telefono: '829-555-0244',
      correo_electronico: 'elena.rosario@email.com',
      origen: 'Instagram Ads',
      presupuesto_min: 100000,
      presupuesto_max: 180000,
      etiquetas: JSON.stringify(['villa', 'bávaro', 'piscina', '2 habitaciones']),
      estado: 'Nuevo'
    },
    {
      nombre: 'Roberto Gómez',
      telefono: '849-555-0311',
      correo_electronico: 'roberto.gomez@email.com',
      origen: 'Referido',
      presupuesto_min: 300000,
      presupuesto_max: 600000,
      etiquetas: JSON.stringify(['apartamento', 'naco', 'ascensor', 'parqueo techado']),
      estado: 'Inicio de Negociación'
    }
  ]

  for (const cData of nuevosClientesData) {
    const existe = await prisma.cliente.findUnique({ where: { telefono: cData.telefono } })
    if (!existe) {
      const c = await prisma.cliente.create({ data: cData })
      console.log(`✓ Creado nuevo cliente: ${c.nombre} (${c.telefono})`)
    } else {
      console.log(`- Cliente ya existía: ${cData.nombre}`)
    }
  }

  // 3. Obtener todos los clientes y distribuirlos equitativamente entre los agentes
  const todosClientes = await prisma.cliente.findMany()
  console.log(`Total de Clientes en el sistema: ${todosClientes.length}`)

  let agenteIdx = 0
  for (const c of todosClientes) {
    const agenteAsignado = agentes[agenteIdx % agentes.length]
    
    await prisma.cliente.update({
      where: { id: c.id },
      data: {
        agente_asignado_id: agenteAsignado.id
      }
    })

    // También vincular oportunidades/ventas existentes de este cliente con el agente
    await prisma.venta.updateMany({
      where: { cliente_id: c.id },
      data: { agente_id: agenteAsignado.id }
    })

    console.log(`  -> Cliente "${c.nombre || c.telefono}" asignado a "${agenteAsignado.nombre}"`)
    agenteIdx++
  }

  console.log('\n¡Distribución completada exitosamente!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error durante la distribución:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
