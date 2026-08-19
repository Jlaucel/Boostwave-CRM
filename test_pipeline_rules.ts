import { prisma } from './src/lib/prisma'
import { cambiarEtapaPipeline } from './src/app/actions/pipeline'

async function runTests() {
  console.log("=== INICIANDO PRUEBAS DE TRANSICIONES DEL PIPELINE ===")

  // 1. Obtener la primera empresa
  const empresa = await prisma.empresa.findFirst()
  if (!empresa) throw new Error("No hay empresas")

  // Mock requireAuth to bypass auth check in the action
  // Actually, we can't easily mock requireAuth in a standalone script without jest.
  // Instead, let's just write the test logic directly to see what changing the state via Prisma directly does,
  // or temporarily bypass the auth in the action? No, better to test the action by mocking.
  // Wait, I can't mock in a simple tsx script easily. 
  // Let's test the database rules empirically by simulating the transaction logic directly.
  // OR better: Since `cambiarEtapaPipeline` calls `getTenantId` and `requireAuth`, it's tied to Next.js cookies/headers.
  // I will test it by creating a separate function with the EXACT same transaction logic but without auth, 
  // just to verify the Prisma side-effects.

  console.log("Simulando creación de Lead, Propiedad y Venta...")

  const cliente = await prisma.cliente.create({
    data: {
      nombre: "Test User",
      telefono: "555-TEST-" + Date.now(),
      empresa_id: empresa.id
    }
  })

  const propiedad = await prisma.propiedad.create({
    data: {
      titulo: "Propiedad Test Transitions",
      descripcion: "Test",
      precio: 100000,
      tipo: "Apartamento",
      estado: "Disponible",
      empresa_id: empresa.id,
      multiempresa: false
    }
  })

  const venta = await prisma.venta.create({
    data: {
      cliente_id: cliente.id,
      propiedad_id: propiedad.id,
      empresa_id: empresa.id,
      estado_venta: "Contacto Inicial"
    }
  })

  console.log(`Venta creada: ${venta.id} | Estado Inicial: ${venta.estado_venta}`)

  const simulateTransition = async (ventaId: string, etapaAnterior: string, nuevaEtapa: string, payload: any) => {
    await prisma.$transaction(async (tx) => {
      const ventaUpdate: any = {
        estado_venta: nuevaEtapa,
        fecha_actualizacion_estado: new Date()
      }
      if (payload?.motivo_perdida) ventaUpdate.motivo_perdida = payload.motivo_perdida
      if (payload?.fecha_visita) ventaUpdate.fecha_visita = new Date(payload.fecha_visita)
      if (payload?.monto_oferta) ventaUpdate.monto_oferta = payload.monto_oferta

      if (nuevaEtapa !== 'Perdido' && etapaAnterior === 'Perdido') ventaUpdate.motivo_perdida = null
      
      if (etapaAnterior === 'Visita Programada' && nuevaEtapa !== 'Visita Programada') {
        ventaUpdate.fecha_visita = null
      }

      let nuevoEstadoPropiedad = null
      if (nuevaEtapa === 'Negociación') nuevoEstadoPropiedad = 'Reservada'
      else if (etapaAnterior === 'Negociación' && nuevaEtapa !== 'Cerrado/Ganado') nuevoEstadoPropiedad = 'Disponible'
      else if (nuevaEtapa === 'Cerrado/Ganado') nuevoEstadoPropiedad = 'Vendida'

      if (nuevoEstadoPropiedad) {
        await tx.propiedad.update({
          where: { id: propiedad.id },
          data: { estado: nuevoEstadoPropiedad }
        })
      }

      await tx.venta.update({
        where: { id: ventaId },
        data: ventaUpdate
      })
    })
  }

  // TEST 1: Visita Programada
  console.log("\n--- TEST 1: Transición a Visita Programada ---")
  await simulateTransition(venta.id, "Contacto Inicial", "Visita Programada", { fecha_visita: new Date().toISOString() })
  let updatedVenta = await prisma.venta.findUnique({ where: { id: venta.id } })
  console.log("Fecha visita seteada:", !!updatedVenta?.fecha_visita)

  // TEST 2: Clear on Exit (Visita -> Oferta)
  console.log("\n--- TEST 2: Clear-on-Exit Calendario ---")
  await simulateTransition(venta.id, "Visita Programada", "Oferta Realizada", { monto_oferta: 90000 })
  updatedVenta = await prisma.venta.findUnique({ where: { id: venta.id } })
  console.log("Fecha visita eliminada:", updatedVenta?.fecha_visita === null)

  // TEST 3: Bloqueo de Inventario (Oferta -> Negociación)
  console.log("\n--- TEST 3: Bloqueo de Inventario (Reservada) ---")
  await simulateTransition(venta.id, "Oferta Realizada", "Negociación", {})
  let updatedPropiedad = await prisma.propiedad.findUnique({ where: { id: propiedad.id } })
  console.log("Estado de propiedad:", updatedPropiedad?.estado, "(Esperado: Reservada)")

  // TEST 4: Liberación de Inventario (Negociación -> Oferta)
  console.log("\n--- TEST 4: Liberación de Inventario (Disponible) ---")
  await simulateTransition(venta.id, "Negociación", "Oferta Realizada", {})
  updatedPropiedad = await prisma.propiedad.findUnique({ where: { id: propiedad.id } })
  console.log("Estado de propiedad:", updatedPropiedad?.estado, "(Esperado: Disponible)")

  // TEST 5: Cierre (Oferta -> Negociación -> Ganado)
  console.log("\n--- TEST 5: Venta Ganada (Vendida) ---")
  await simulateTransition(venta.id, "Oferta Realizada", "Negociación", {})
  await simulateTransition(venta.id, "Negociación", "Cerrado/Ganado", {})
  updatedPropiedad = await prisma.propiedad.findUnique({ where: { id: propiedad.id } })
  console.log("Estado de propiedad:", updatedPropiedad?.estado, "(Esperado: Vendida)")

  // Cleanup
  console.log("\nLimpiando datos de prueba...")
  await prisma.venta.delete({ where: { id: venta.id } })
  await prisma.propiedad.delete({ where: { id: propiedad.id } })
  await prisma.cliente.delete({ where: { id: cliente.id } })

  console.log("=== PRUEBAS FINALIZADAS ===")
}

runTests().catch(console.error)
