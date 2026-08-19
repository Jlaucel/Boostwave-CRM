import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Convertir propiedades 'Reservada' a 'Disponible'
  const props = await prisma.propiedad.updateMany({
    where: { estado: 'Reservada' },
    data: { estado: 'Disponible' }
  });
  console.log('Propiedades actualizadas (de Reservada a Disponible):', props.count);

  // 2. Clientes sin nombre
  const clientes = await prisma.cliente.findMany({
    where: { OR: [{ nombre: null }, { nombre: '' }] }
  });
  let updated = 0;
  for (const c of clientes) {
    await prisma.cliente.update({
      where: { id: c.id },
      data: { nombre: c.telefono ? 'Cliente ' + c.telefono : 'Cliente Sin Nombre' }
    });
    updated++;
  }
  console.log('Clientes sin nombre actualizados:', updated);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
