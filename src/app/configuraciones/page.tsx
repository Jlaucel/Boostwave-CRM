import { requireRole } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { getConfiguracionSistema } from '@/app/actions/configuracion'
import { SettingsClient } from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionesPage() {
  const session = await requireRole(['Agente Owner'])
  const empresaId = await getTenantId()

  const config = await getConfiguracionSistema()

  return <SettingsClient config={config} />
}
