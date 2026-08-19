import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Limpiar la base de datos (ventas primero por Foreign Keys, luego clientes/propiedades)
  await prisma.venta.deleteMany({})
  await prisma.cliente.deleteMany({})
  await prisma.propiedad.deleteMany({})
  await prisma.agente.deleteMany({})

  // Crear agente
  const agente = await prisma.agente.upsert({
    where: { email: 'agente@alterestate.com' },
    update: {},
    create: {
      nombre: 'Agente Principal',
      email: 'agente@alterestate.com',
    },
  })
  console.log(`Created agent with id: ${agente.id}`)

  // Crear 9 propiedades reales en la República Dominicana
  const propiedadesData = [
    {
      titulo: 'Torre Moderna en Piantini',
      descripcion: 'Apartamento de lujo en el corazón de Piantini. Torre con piscina, gimnasio y lobby climatizado.',
      precio: 350000,
      tipo: 'Apartamento',
      provincia: 'Distrito Nacional',
      sector: 'Piantini',
      caracteristicas_etiquetas: JSON.stringify(['apartamento', '3 habitaciones', 'piscina', 'gimnasio', 'ascensor', 'parqueo techado', 'distrito nacional', 'piantini']),
      imagenes: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800']),
    },
    {
      titulo: 'Casa Familiar en Arroyo Hondo',
      descripcion: 'Amplia casa de 4 habitaciones con patio grande, perfecta para familias y mascotas.',
      precio: 420000,
      tipo: 'Casa',
      provincia: 'Distrito Nacional',
      sector: 'Santo Domingo Norte', // Just as an example location
      caracteristicas_etiquetas: JSON.stringify(['casa', '4+ habitaciones', 'patio', 'pet friendly', 'distrito nacional', 'santo domingo norte']),
      imagenes: JSON.stringify(['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800']),
    },
    {
      titulo: 'Villa Exclusiva en Cap Cana',
      descripcion: 'Villa frente al mar en la marina de Cap Cana. Acabados de primera, amueblada.',
      precio: 1200000,
      tipo: 'Villa',
      provincia: 'La Altagracia',
      sector: 'Cap Cana',
      caracteristicas_etiquetas: JSON.stringify(['villa', '4+ habitaciones', 'frente al mar', 'piscina', 'amueblado', 'seguridad 24/7', 'la altagracia', 'cap cana']),
      imagenes: JSON.stringify(['https://images.unsplash.com/photo-1613490900233-ea8dd30e3868?auto=format&fit=crop&q=80&w=800']),
    },
    {
      titulo: 'Penthouse en Naco',
      descripcion: 'Espectacular penthouse con vista a la ciudad y la montaña. 2 niveles, jacuzzi propio.',
      precio: 550000,
      tipo: 'Apartamento',
      provincia: 'Distrito Nacional',
      sector: 'Naco',
      caracteristicas_etiquetas: JSON.stringify(['apartamento', '3 habitaciones', 'vista a la montaña', 'ascensor', 'parqueo techado', 'distrito nacional', 'naco']),
      imagenes: JSON.stringify(['https://images.unsplash.com/photo-1502672260266-1c1de2d93688?auto=format&fit=crop&q=80&w=800']),
    },
    {
      titulo: 'Apartamento Económico Santo Domingo Este',
      descripcion: 'Apartamento cómodo de 2 habitaciones, ideal para primera vivienda. Proyecto cerrado.',
      precio: 85000,
      tipo: 'Apartamento',
      provincia: 'Santo Domingo',
      sector: 'Santo Domingo Este',
      caracteristicas_etiquetas: JSON.stringify(['apartamento', '2 habitaciones', 'seguridad 24/7', 'balcón', 'santo domingo', 'santo domingo este']),
      imagenes: JSON.stringify(['https://images.unsplash.com/photo-1493809842364-78817add7ff6?auto=format&fit=crop&q=80&w=800']),
    },
    {
      titulo: 'Proyecto de Villas en Bávaro',
      descripcion: 'Villas en pre-construcción a 10 minutos de la playa. Ideal para inversión de Airbnb.',
      precio: 150000,
      tipo: 'Villa',
      provincia: 'La Altagracia',
      sector: 'Bávaro',
      caracteristicas_etiquetas: JSON.stringify(['villa', '2 habitaciones', 'piscina', 'patio', 'seguridad 24/7', 'la altagracia', 'bávaro']),
      imagenes: JSON.stringify(['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800']),
    },
    {
      titulo: 'Torre Clásica en Santiago',
      descripcion: 'Apartamento espacioso en La Trinitaria / Monumento. Vistas increíbles al monumento.',
      precio: 280000,
      tipo: 'Apartamento',
      provincia: 'Santiago',
      sector: 'Monumento',
      caracteristicas_etiquetas: JSON.stringify(['apartamento', '3 habitaciones', 'balcón', 'ascensor', 'parqueo techado', 'santiago', 'monumento']),
      imagenes: JSON.stringify(['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800']),
    },
    {
      titulo: 'Casa en Los Jardines, Santiago',
      descripcion: 'Casa céntrica en zona residencial y comercial de Santiago.',
      precio: 310000,
      tipo: 'Casa',
      provincia: 'Santiago',
      sector: 'Los Jardines',
      caracteristicas_etiquetas: JSON.stringify(['casa', '3 habitaciones', 'patio', 'parqueo techado', 'santiago', 'los jardines']),
      imagenes: JSON.stringify(['https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=800']),
    },
    {
      titulo: 'Solar Comercial en Gazcue',
      descripcion: 'Excelente solar de 1000m2 en pleno Gazcue, listo para desarrollar una torre médica o de apartamentos.',
      precio: 600000,
      tipo: 'Solar',
      provincia: 'Distrito Nacional',
      sector: 'Gazcue',
      caracteristicas_etiquetas: JSON.stringify(['solar', 'distrito nacional', 'gazcue']),
      imagenes: JSON.stringify(['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800']),
    }
  ]

  for (const data of propiedadesData) {
    const prop = await prisma.propiedad.create({ data })
    console.log(`Created property: ${prop.titulo}`)
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
