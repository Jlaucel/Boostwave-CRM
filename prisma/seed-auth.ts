import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed-auth...');

  try {
    // 2. Creates a default Empresa called 'BoostWave Demo' with RNC '000-000000-0'
    const empresa = await prisma.empresa.create({
      data: {
        nombre_comercial: 'BoostWave Demo',
        rnc: '000-000000-0',
      },
    });
    console.log(`Created Empresa: ${empresa.nombre_comercial} (ID: ${empresa.id})`);

    // 3. Updates ALL existing Clientes, Propiedades, Agentes, Ventas, DocumentoLegal records
    await prisma.cliente.updateMany({
      data: { empresa_id: empresa.id },
    });
    console.log('Updated Clientes');

    await prisma.propiedad.updateMany({
      data: { empresa_id: empresa.id },
    });
    console.log('Updated Propiedades');

    await prisma.agente.updateMany({
      data: { empresa_id: empresa.id },
    });
    console.log('Updated Agentes');

    await prisma.venta.updateMany({
      data: { empresa_id: empresa.id },
    });
    console.log('Updated Ventas');

    await prisma.documentoLegal.updateMany({
      data: { empresa_id: empresa.id },
    });
    console.log('Updated DocumentosLegales');

    // 4. Updates ConfiguracionSistema to set empresa_id
    await prisma.configuracionSistema.updateMany({
      data: { empresa_id: empresa.id },
    });
    console.log('Updated ConfiguracionSistema');

    // 5. Creates the Admin Owner Global user
    const adminPasswordHash = await bcrypt.hash('Admin2025!', 10);
    const adminUser = await prisma.usuario.upsert({
      where: { email: 'admin@boostwave.com' },
      update: {},
      create: {
        email: 'admin@boostwave.com',
        password_hash: adminPasswordHash,
        nombre: 'Admin Owner Global',
        is_global_admin: true,
      },
    });
    console.log(`Created global admin: ${adminUser.email}`);

    // 6. Creates a user for each existing Agente
    const agentes = await prisma.agente.findMany();
    const agentePasswordHash = await bcrypt.hash('Agente2025!', 10);

    for (let i = 0; i < agentes.length; i++) {
      const agente = agentes[i];
      const email = agente.email || `agente${i}@boostwave.com`; // Fallback in case email is somehow empty, though it shouldn't be

      const user = await prisma.usuario.upsert({
        where: { email: email },
        update: {},
        create: {
          email: email,
          password_hash: agentePasswordHash,
          nombre: agente.nombre,
          is_global_admin: false,
        },
      });

      // 7. Creates UsuarioEmpresa links: first agent becomes 'Agente Owner', rest become 'Agente Normal'
      const rol = i === 0 ? 'Agente Owner' : 'Agente Normal';

      // Use upsert to avoid Unique constraint failure on [usuario_id, empresa_id]
      await prisma.usuarioEmpresa.upsert({
        where: {
          usuario_id_empresa_id: {
            usuario_id: user.id,
            empresa_id: empresa.id,
          },
        },
        update: {
            agente_id: agente.id,
            rol: rol,
        },
        create: {
          usuario_id: user.id,
          empresa_id: empresa.id,
          agente_id: agente.id,
          rol: rol,
        },
      });
      console.log(`Created user and link for agente: ${agente.nombre} with rol ${rol}`);
    }

    console.log('Seed completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
