'use client'

import { useState, useRef } from 'react'
import { X, UploadCloud } from 'lucide-react'

export function ImageUploader({ imagenesIniciales = [] }: { imagenesIniciales?: string[] }) {
  const [imagenesActuales, setImagenesActuales] = useState<string[]>(imagenesIniciales)
  const [imagenesEliminar, setImagenesEliminar] = useState<string[]>([])
  const [newFilesPreview, setNewFilesPreview] = useState<{ file: File; url: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateFileInput = (files: File[]) => {
    if (!fileInputRef.current) return
    try {
      const dt = new DataTransfer()
      files.forEach(f => dt.items.add(f))
      fileInputRef.current.files = dt.files
    } catch (e) {
      console.error('Error actualizando FileList nativo:', e)
    }
  }

  const handleEliminarActual = (url: string) => {
    setImagenesActuales(prev => prev.filter(img => img !== url))
    setImagenesEliminar(prev => [...prev, url])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      const previews = filesArray.map(file => ({
        file,
        url: URL.createObjectURL(file)
      }))
      const updatedPreviews = [...newFilesPreview, ...previews]
      setNewFilesPreview(updatedPreviews)
      updateFileInput(updatedPreviews.map(p => p.file))
    }
  }

  const handleEliminarNueva = (index: number) => {
    setNewFilesPreview(prev => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].url)
      updated.splice(index, 1)
      updateFileInput(updated.map(p => p.file))
      return updated
    })
  }

  return (
    <div className="space-y-4">
      {/* Hidden inputs para mantener el estado de las imágenes guardadas al enviar el formulario (Server Action) */}
      {imagenesActuales.map((url, i) => (
        <input key={`act_${i}`} type="hidden" name="imagenes_actuales" value={url} />
      ))}
      {imagenesEliminar.map((url, i) => (
        <input key={`del_${i}`} type="hidden" name="imagenes_eliminar" value={url} />
      ))}

      {/* Zona de Arrastrar / Seleccionar Archivos */}
      <div className="border-2 border-dashed border-[var(--border-strong)] rounded-lg p-6 text-center hover:bg-[var(--bg-hover)] transition-colors cursor-pointer relative">
        <input 
          ref={fileInputRef}
          type="file" 
          name="nuevas_imagenes" 
          multiple 
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <UploadCloud className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-2" />
        <p className="text-[13px] font-medium text-[var(--text-primary)]">Haz clic o arrastra imágenes aquí</p>
        <p className="text-[11px] text-[var(--text-tertiary)] mt-1">PNG, JPG, JPEG hasta 50MB</p>
      </div>

      {/* Grid de Previsualización y Remoción */}
      {(imagenesActuales.length > 0 || newFilesPreview.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          
          {/* Imágenes Actuales Guardadas */}
          {imagenesActuales.map((url, i) => (
            <div key={`cur_${i}`} className="relative group rounded-lg overflow-hidden border border-[var(--border-default)] aspect-video bg-gray-100 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Foto actual" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  type="button"
                  onClick={() => handleEliminarActual(url)}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-transform hover:scale-105 shadow-md"
                  title="Eliminar esta foto existente"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Nuevas Imágenes a Subir */}
          {newFilesPreview.map((item, i) => (
            <div key={`new_${i}`} className="relative group rounded-lg overflow-hidden border border-[#1A85E5] aspect-video bg-blue-50 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="Nueva foto" className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 bg-[#1A85E5] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                NUEVA
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  type="button"
                  onClick={() => handleEliminarNueva(i)}
                  className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-transform hover:scale-105 shadow-md"
                  title="Quitar esta nueva imagen"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
