'use server'

import { requireRole } from '@/lib/auth'
import { getTenantId } from '@/lib/tenant'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface ConfiguracionData {
  id: string
  nombre_empresa: string
  moneda_defecto: string
  telefono_contacto: string
  email_contacto: string
  dias_estancamiento_pipeline: number
  dias_inactividad_cliente: number
  alerta_cliente_huerfano_horas: number
  comision_porcentaje_defecto: number
  meta_ventas_defecto: number
  auto_asignar_agente: boolean
  requerir_confirmacion_cierre: boolean
}

const DEFAULT_CONFIG: ConfiguracionData = {
  id: 'default',
  nombre_empresa: 'BoostWave Real Estate',
  moneda_defecto: 'USD',
  telefono_contacto: '+1 (809) 555-0100',
  email_contacto: 'contacto@boostwave.com',
  dias_estancamiento_pipeline: 14,
  dias_inactividad_cliente: 30,
  alerta_cliente_huerfano_horas: 24,
  comision_porcentaje_defecto: 3.0,
  meta_ventas_defecto: 1000000,
  auto_asignar_agente: true,
  requerir_confirmacion_cierre: true
}

export async function getConfiguracionSistema(): Promise<ConfiguracionData> {
  const session = await requireRole(['Agente Owner'])
  const empresaId = await getTenantId()
  try {
    const config = await (prisma as any).configuracionSistema.findFirst({
      where: { empresa_id: empresaId }
    })

    if (!config) {
      const newConfig = await (prisma as any).configuracionSistema.create({
        data: { ...DEFAULT_CONFIG, id: undefined, empresa_id: empresaId }
      })
      return newConfig
    }

    return config
  } catch (error) {
    console.error('ConfiguracionSistema table not yet available in DB, using fallbacks:', error)
    return DEFAULT_CONFIG
  }
}

export async function updateConfiguracionSistema(formData: FormData) {
  const session = await requireRole(['Agente Owner'])
  const empresaId = await getTenantId()
  try {
    const data = {
      nombre_empresa: (formData.get('nombre_empresa') as string) || DEFAULT_CONFIG.nombre_empresa,
      moneda_defecto: (formData.get('moneda_defecto') as string) || DEFAULT_CONFIG.moneda_defecto,
      telefono_contacto: (formData.get('telefono_contacto') as string) || DEFAULT_CONFIG.telefono_contacto,
      email_contacto: (formData.get('email_contacto') as string) || DEFAULT_CONFIG.email_contacto,
      
      dias_estancamiento_pipeline: Number(formData.get('dias_estancamiento_pipeline')) || 14,
      dias_inactividad_cliente: Number(formData.get('dias_inactividad_cliente')) || 30,
      alerta_cliente_huerfano_horas: Number(formData.get('alerta_cliente_huerfano_horas')) || 24,
      
      comision_porcentaje_defecto: Number(formData.get('comision_porcentaje_defecto')) || 3.0,
      meta_ventas_defecto: Number(formData.get('meta_ventas_defecto')) || 1000000,
      
      auto_asignar_agente: formData.get('auto_asignar_agente') === 'on',
      requerir_confirmacion_cierre: formData.get('requerir_confirmacion_cierre') === 'on'
    }

    // First check if config exists for this tenant
    const existing = await (prisma as any).configuracionSistema.findFirst({
      where: { empresa_id: empresaId }
    })

    if (existing) {
      await (prisma as any).configuracionSistema.updateMany({
        where: { empresa_id: empresaId },
        data
      })
    } else {
      await (prisma as any).configuracionSistema.create({
        data: { ...data, empresa_id: empresaId }
      })
    }

    revalidatePath('/configuraciones')
    revalidatePath('/analiticas')
    revalidatePath('/ventas')
    revalidatePath('/documentos')
    revalidatePath('/agentes')
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Error actualizando configuraciones del sistema:', error)
    return { success: false, error: 'Error al guardar configuraciones' }
  }
}
