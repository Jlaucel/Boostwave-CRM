import { requireAuth } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { DocumentDetailClient } from './DocumentDetailClient'

export const dynamic = 'force-dynamic'

export default async function DocumentoDetallePage({
  params
}: {
  params: { id: string }
}) {
  const session = await requireAuth()
  const empresaId = await getTenantId()
  const { id } = await params

  let doc = null
  try {
    doc = await prisma.documentoLegal.findFirst({
      where: { id, empresa_id: empresaId },
      include: {
        cliente: true,
        propiedad: true,
        agente: true
      }
    })
  } catch (e) {}

  if (!doc) {
    notFound()
  }

  return <DocumentDetailClient doc={doc} />
}
