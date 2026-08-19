import { jsPDF } from 'jspdf'

export interface PropiedadPDFData {
  id: string
  titulo: string
  descripcion: string
  precio: number
  tipo: string
  provincia: string
  sector: string
  tamano_m2?: number | null
  estado_legal?: string | null
  caracteristicas_etiquetas?: string | null
  estado: string
  imagenes?: string | null
  fecha_creacion?: Date | string
  agente?: {
    nombre: string
    email: string
    telefono?: string | null
    rol?: string | null
  } | null
}

async function urlToBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Fetch failed')
    const blob = await res.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth || 600
          canvas.height = img.naturalHeight || 400
          const ctx = canvas.getContext('2d')
          if (!ctx) return resolve(null)
          ctx.drawImage(img, 0, 0)
          resolve(canvas.toDataURL('image/jpeg', 0.85))
        } catch {
          resolve(null)
        }
      }
      img.onerror = () => resolve(null)
      img.src = url
    })
  }
}

export async function generateStructuredPropertyPDF(data: PropiedadPDFData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth() // 210mm
  const pageHeight = doc.internal.pageSize.getHeight() // 297mm
  const margin = 14
  const contentWidth = pageWidth - margin * 2 // 182mm

  // Parse tags
  let tags: string[] = []
  if (data.caracteristicas_etiquetas) {
    try {
      tags = JSON.parse(data.caracteristicas_etiquetas)
    } catch {}
  }

  // Parse images
  let imageList: string[] = []
  if (data.imagenes) {
    try {
      imageList = JSON.parse(data.imagenes)
    } catch {}
  }

  // Helper for drawing headers
  const drawHeader = (pageNum: number) => {
    // Top banner
    doc.setFillColor(15, 23, 42) // Slate 900
    doc.rect(0, 0, pageWidth, 18, 'F')

    // Accent line
    doc.setFillColor(26, 133, 229) // Blue #1A85E5
    doc.rect(0, 18, pageWidth, 1.5, 'F')

    // Logo / Company Name
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.text('BOOSTWAVE CRM', margin, 11)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184) // Slate 400
    doc.text('FICHA TÉCNICA DE PROPIEDAD EXCLUSIVA', margin + 45, 11)

    // SKU / Ref code right aligned
    const sku = `REF: PROP-${data.id.slice(0, 8).toUpperCase()}`
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text(sku, pageWidth - margin, 11, { align: 'right' })

    // Footer banner
    doc.setFillColor(248, 250, 252)
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F')
    doc.setDrawColor(226, 232, 240)
    doc.line(0, pageHeight - 12, pageWidth, pageHeight - 12)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text('BoostWave CRM — Sistema de Gestión Inmobiliaria', margin, pageHeight - 5)
    doc.text(`Página ${pageNum}`, pageWidth - margin, pageHeight - 5, { align: 'right' })
  }

  // ---------------- PAGE 1 ----------------
  drawHeader(1)
  let y = 26

  // 1. Cabecera y Título Comercial
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(15, 23, 42)
  const titleLines = doc.splitTextToSize(data.titulo, contentWidth - 45)
  doc.text(titleLines, margin, y)

  // Price box on the right
  doc.setFillColor(239, 246, 255) // Light blue
  doc.roundedRect(pageWidth - margin - 42, y - 5, 42, 14, 2, 2, 'F')
  doc.setDrawColor(191, 219, 254)
  doc.roundedRect(pageWidth - margin - 42, y - 5, 42, 14, 2, 2, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(26, 133, 229)
  const formattedPrice = `$${data.precio.toLocaleString()} USD`
  doc.text(formattedPrice, pageWidth - margin - 21, y + 3, { align: 'center' })

  y += titleLines.length * 7 + 2

  // Location / Type Info (Clean ASCII / WinAnsi formatting)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text(`${data.sector}, ${data.provincia}   |   ${data.tipo}   |   Estado: ${data.estado}`, margin, y)
  y += 7

  // Divider
  doc.setDrawColor(226, 232, 240)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6

  // Load Main Cover Image
  const loadedImages: (string | null)[] = await Promise.all(
    imageList.slice(0, 5).map((url) => urlToBase64(url))
  )
  const validImages = loadedImages.filter((img): img is string => img !== null)

  if (validImages.length > 0) {
    try {
      // Main Hero Image
      doc.addImage(validImages[0], 'JPEG', margin, y, contentWidth, 75, undefined, 'FAST')
      y += 78

      // Additional thumbnails (up to 4)
      if (validImages.length > 1) {
        const thumbCount = Math.min(validImages.length - 1, 4)
        const thumbWidth = (contentWidth - (thumbCount - 1) * 3) / thumbCount
        const thumbHeight = 28

        for (let i = 0; i < thumbCount; i++) {
          const imgX = margin + i * (thumbWidth + 3)
          doc.addImage(validImages[i + 1], 'JPEG', imgX, y, thumbWidth, thumbHeight, undefined, 'FAST')
        }
        y += thumbHeight + 6
      }
    } catch {
      y += 5
    }
  } else {
    // Placeholder image box if no images loaded
    doc.setFillColor(241, 245, 249)
    doc.roundedRect(margin, y, contentWidth, 40, 2, 2, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(148, 163, 184)
    doc.text('Imágenes de la propiedad no disponibles', pageWidth / 2, y + 22, { align: 'center' })
    y += 46
  }

  // Section 2: Ficha Técnica y Estructura (Grid Cards)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(15, 23, 42)
  doc.text('Ficha Técnica y Especificaciones', margin, y)
  y += 5

  // 4 KPI Grid Cards
  const cardW = (contentWidth - 9) / 4
  const cardH = 16

  const kpis = [
    { label: 'Metraje Total', value: data.tamano_m2 ? `${data.tamano_m2} m2` : 'N/D' },
    { label: 'Estado Legal', value: data.estado_legal || 'Al día' },
    { label: 'Tipo Inmueble', value: data.tipo },
    { label: 'Disponibilidad', value: data.estado },
  ]

  kpis.forEach((kpi, idx) => {
    const kX = margin + idx * (cardW + 3)
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(kX, y, cardW, cardH, 1.5, 1.5, 'F')
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(kX, y, cardW, cardH, 1.5, 1.5, 'D')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(100, 116, 139)
    doc.text(kpi.label, kX + cardW / 2, y + 5, { align: 'center' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(15, 23, 42)
    doc.text(kpi.value, kX + cardW / 2, y + 11.5, { align: 'center' })
  })

  y += cardH + 7

  // Section 3: Descripción de la Propiedad
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(15, 23, 42)
  doc.text('Descripción Detallada', margin, y)
  y += 5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(51, 65, 85)
  const descText = data.descripcion || 'Sin descripción detallada disponible.'
  const descLines = doc.splitTextToSize(descText, contentWidth)
  
  // Limit lines to fit on page 1 cleanly
  const maxDescLines = Math.min(descLines.length, 6)
  doc.text(descLines.slice(0, maxDescLines), margin, y)
  y += maxDescLines * 4.5 + 6

  // Section 4: Amenidades y Características
  if (tags.length > 0 && y < 225) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(15, 23, 42)
    doc.text('Amenidades y Características Destacadas', margin, y)
    y += 6

    const colWidth = contentWidth / 3
    tags.slice(0, 12).forEach((tag, idx) => {
      const col = idx % 3
      const row = Math.floor(idx / 3)
      const tX = margin + col * colWidth
      const tY = y + row * 6

      // Vector bullet point
      doc.setFillColor(26, 133, 229)
      doc.circle(tX + 2, tY - 1.5, 0.9, 'F')

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(51, 65, 85)
      doc.text(tag.charAt(0).toUpperCase() + tag.slice(1), tX + 5, tY)
    })

    y += Math.ceil(Math.min(tags.length, 12) / 3) * 6 + 6
  }

  // Section 5: Datos de Contacto del Agente (Bottom Footer Card)
  const agentY = Math.max(y, 245)
  doc.setFillColor(15, 23, 42) // Dark card background
  doc.roundedRect(margin, agentY, contentWidth, 34, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('INFORMACIÓN Y AGENTE ASIGNADO', margin + 8, agentY + 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(203, 213, 225)
  const agentName = data.agente?.nombre || 'Equipo BoostWave Real Estate'
  const agentRole = data.agente?.rol || 'Asesor Inmobiliario'
  const agentPhone = data.agente?.telefono || '+1 (809) 000-0000'
  const agentEmail = data.agente?.email || 'contacto@boostwave.com'

  doc.text(`Agente: ${agentName} (${agentRole})`, margin + 8, agentY + 16)
  doc.text(`Teléfono / WhatsApp: ${agentPhone}`, margin + 8, agentY + 22)
  doc.text(`Correo Electrónico: ${agentEmail}`, margin + 8, agentY + 28)

  // QR / Brand stamp on right
  doc.setFillColor(26, 133, 229)
  doc.roundedRect(pageWidth - margin - 40, agentY + 6, 34, 22, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text('BOOSTWAVE', pageWidth - margin - 23, agentY + 15, { align: 'center' })
  doc.setFontSize(7)
  doc.text('VERIFICADO', pageWidth - margin - 23, agentY + 20, { align: 'center' })

  // Trigger download
  const cleanTitle = data.titulo.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
  doc.save(`ficha-${cleanTitle || 'propiedad'}.pdf`)
}
