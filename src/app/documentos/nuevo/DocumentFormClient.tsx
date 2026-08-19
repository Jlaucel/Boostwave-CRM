'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { FileText, Sparkles } from 'lucide-react'
import { crearDocumentoLegal } from '@/app/actions/documentos'
import { 
  generarContratoArrasRD, 
  generarPromesaCompraventaRD, 
  generarContratoAlquilerRD 
} from '@/lib/templatesLegalesRD'

export function DocumentFormClient({
  clientes,
  propiedades,
  agentes
}: {
  clientes: any[]
  propiedades: any[]
  agentes: any[]
}) {
  const [tipoDoc, setTipoDoc] = useState<string>('Contrato de Arras')
  const [tituloDoc, setTituloDoc] = useState<string>('')
  const [clienteId, setClienteId] = useState<string>('')
  const [propiedadId, setPropiedadId] = useState<string>('')
  const [agenteId, setAgenteId] = useState<string>('')
  const [estado, setEstado] = useState<string>('Borrador')
  const [montoSeparacion, setMontoSeparacion] = useState<string>('5000')
  const [duracionMeses, setDuracionMeses] = useState<string>('12')
  const [contenido, setContenido] = useState<string>('')

  const handleGenerateTemplate = () => {
    const selectedCliente = clientes.find(c => c.id === clienteId)
    const selectedPropiedad = propiedades.find(p => p.id === propiedadId)
    const selectedAgente = agentes.find(a => a.id === agenteId)

    const datos = {
      clienteNombre: selectedCliente?.nombre || selectedCliente?.telefono,
      clienteTelefono: selectedCliente?.telefono,
      clienteCorreo: selectedCliente?.correo_electronico,
      clienteDocumento: '402-0000000-0', // Default placeholder for RD Cédula
      
      propiedadTitulo: selectedPropiedad?.titulo,
      propiedadTipo: selectedPropiedad?.tipo,
      propiedadPrecio: selectedPropiedad?.precio,
      propiedadSector: selectedPropiedad?.sector,
      propiedadProvincia: selectedPropiedad?.provincia,
      propiedadTamano: selectedPropiedad?.tamano_m2,
      
      agenteNombre: selectedAgente?.nombre || 'Asesor Inmobiliario',
      montoSeparacion: parseFloat(montoSeparacion) || 5000,
      duracionMeses: parseInt(duracionMeses) || 12
    }

    let textoGenerado = ''
    if (tipoDoc === 'Contrato de Arras') {
      textoGenerado = generarContratoArrasRD(datos)
      if (!tituloDoc) setTituloDoc(`Contrato de Arras - ${selectedCliente?.nombre || 'Cliente'} (${selectedPropiedad?.titulo || 'Propiedad'})`)
    } else if (tipoDoc === 'Promesa de Compraventa') {
      textoGenerado = generarPromesaCompraventaRD(datos)
      if (!tituloDoc) setTituloDoc(`Promesa Compraventa - ${selectedCliente?.nombre || 'Cliente'}`)
    } else if (tipoDoc === 'Contrato de Alquiler') {
      textoGenerado = generarContratoAlquilerRD(datos)
      if (!tituloDoc) setTituloDoc(`Contrato Alquiler - ${selectedPropiedad?.titulo || 'Propiedad'}`)
    } else {
      textoGenerado = `DOCUMENTO LEGAL / EXPEDIENTE\n\nFecha: ${new Date().toLocaleDateString()}\nCliente: ${selectedCliente?.nombre || 'N/A'}\nPropiedad: ${selectedPropiedad?.titulo || 'N/A'}\n\n[ESCRIBA O PEGUE EL CONTENIDO AQUÍ]`
      if (!tituloDoc) setTituloDoc(`Documento - ${selectedCliente?.nombre || 'Cliente'}`)
    }

    setContenido(textoGenerado)
  }

  return (
    <>
      <PageHeader
        title="Generador de Contratos y Documentos Legales"
        icon={FileText}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Documentos', href: '/documentos' },
          { label: 'Nuevo Documento' }
        ]}
      />

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <form action={crearDocumentoLegal} className="bg-white border rounded-xl shadow-[var(--shadow-card)] p-8 space-y-6">
          
          <div className="border-b border-[var(--border-default)] pb-4">
            <h3 className="text-[16px] font-bold text-[var(--text-primary)]">
              1. Selección de Plantilla y Partes Involucradas
            </h3>
            <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
              Escoge el tipo de contrato legal para República Dominicana y vincula el cliente y la propiedad para auto-completar las cláusulas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="tipo_documento" className="text-[13px] font-semibold text-[var(--text-secondary)]">Tipo de Contrato / Documento <span className="text-red-500">*</span></label>
              <select
                id="tipo_documento"
                name="tipo_documento"
                value={tipoDoc}
                onChange={(e) => setTipoDoc(e.target.value)}
                required
                className="w-full h-10 px-3 border rounded-md text-[13px] bg-white focus:outline-none focus:border-[#1A85E5]"
              >
                <option value="Contrato de Arras">Contrato de Arras / Separación (RD)</option>
                <option value="Promesa de Compraventa">Promesa de Compraventa Inmobiliaria (RD)</option>
                <option value="Contrato de Alquiler">Contrato de Alquiler Residencial / Comercial (RD)</option>
                <option value="Cédula">Cédula / Documento Identidad</option>
                <option value="Título de Propiedad">Título de Propiedad / Deslinde</option>
                <option value="Otro Documento">Otro Documento Adjunto</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="estado" className="text-[13px] font-semibold text-[var(--text-secondary)]">Estado Inicial del Documento</label>
              <select
                id="estado"
                name="estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full h-10 px-3 border rounded-md text-[13px] bg-white focus:outline-none focus:border-[#1A85E5]"
              >
                <option value="Borrador">Borrador</option>
                <option value="Pendiente de Firma">Pendiente de Firma</option>
                <option value="Firmado">Firmado</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cliente_id" className="text-[13px] font-semibold text-[var(--text-secondary)]">Cliente Vinculado</label>
              <select
                id="cliente_id"
                name="cliente_id"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full h-10 px-3 border rounded-md text-[13px] bg-white focus:outline-none focus:border-[#1A85E5]"
              >
                <option value="">-- Sin Cliente Vinculado --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre || c.telefono} ({c.telefono})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="propiedad_id" className="text-[13px] font-semibold text-[var(--text-secondary)]">Propiedad Vinculada</label>
              <select
                id="propiedad_id"
                name="propiedad_id"
                value={propiedadId}
                onChange={(e) => setPropiedadId(e.target.value)}
                className="w-full h-10 px-3 border rounded-md text-[13px] bg-white focus:outline-none focus:border-[#1A85E5]"
              >
                <option value="">-- Sin Propiedad Vinculada --</option>
                {propiedades.map(p => (
                  <option key={p.id} value={p.id}>{p.titulo} (${p.precio.toLocaleString()})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="agente_id" className="text-[13px] font-semibold text-[var(--text-secondary)]">Agente Responsable</label>
              <select
                id="agente_id"
                name="agente_id"
                value={agenteId}
                onChange={(e) => setAgenteId(e.target.value)}
                className="w-full h-10 px-3 border rounded-md text-[13px] bg-white focus:outline-none focus:border-[#1A85E5]"
              >
                <option value="">-- Seleccionar Agente --</option>
                {agentes.map(a => (
                  <option key={a.id} value={a.id}>{a.nombre} ({a.rol})</option>
                ))}
              </select>
            </div>

            {tipoDoc === 'Contrato de Arras' && (
              <div className="space-y-1.5">
                <label htmlFor="monto_separacion" className="text-[13px] font-semibold text-[var(--text-secondary)]">Monto de Separación ($ USD)</label>
                <input
                  type="number"
                  id="monto_separacion"
                  value={montoSeparacion}
                  onChange={(e) => setMontoSeparacion(e.target.value)}
                  className="w-full h-10 px-3 border rounded-md text-[13px] bg-white focus:outline-none focus:border-[#1A85E5]"
                  placeholder="5000"
                />
              </div>
            )}

            {tipoDoc === 'Contrato de Alquiler' && (
              <div className="space-y-1.5">
                <label htmlFor="duracion_meses" className="text-[13px] font-semibold text-[var(--text-secondary)]">Duración del Contrato (Meses)</label>
                <input
                  type="number"
                  id="duracion_meses"
                  value={duracionMeses}
                  onChange={(e) => setDuracionMeses(e.target.value)}
                  className="w-full h-10 px-3 border rounded-md text-[13px] bg-white focus:outline-none focus:border-[#1A85E5]"
                  placeholder="12"
                />
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerateTemplate}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-[13px] font-bold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Auto-Generar Cláusulas del Contrato
            </button>
          </div>

          <div className="border-t border-[var(--border-default)] pt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="titulo" className="text-[13px] font-semibold text-[var(--text-secondary)]">Título del Documento <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={tituloDoc}
                onChange={(e) => setTituloDoc(e.target.value)}
                required
                placeholder="Ej. Promesa de Compraventa - Juan Pérez (Torre Las Palmas)"
                className="w-full h-10 px-3 border rounded-md text-[13px] bg-white focus:outline-none focus:border-[#1A85E5]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contenido" className="text-[13px] font-semibold text-[var(--text-secondary)]">Contenido del Contrato / Texto Legal</label>
              <textarea
                id="contenido"
                name="contenido"
                rows={16}
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="Haz clic en 'Auto-Generar Cláusulas' arriba o escribe libremente el texto del contrato..."
                className="w-full p-4 border rounded-md text-[13px] font-mono leading-relaxed bg-[var(--bg-surface-secondary)] focus:outline-none focus:border-[#1A85E5] resize-y"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
            <Link
              href="/documentos"
              className="px-4 py-2 rounded-md text-[13px] font-medium text-[var(--text-secondary)] border hover:bg-[var(--bg-hover)] transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="bg-[#1A85E5] text-white px-5 py-2 rounded-md hover:bg-blue-600 text-[13px] font-semibold transition-colors shadow-sm"
            >
              Guardar Documento Legal
            </button>
          </div>

        </form>
      </div>
    </>
  )
}
