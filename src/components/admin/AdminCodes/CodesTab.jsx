// src/components/admin/AdminCodes/CodesTab.jsx - VERSIÓN RESPONSIVA
import { useState, useRef } from 'react'
import { useCodes } from '../../../contexts/CodeContext'
import Button from '../../ui/Button'
import { StatsCard } from './AdminComponents' 
import { SecurityManager } from '../../../utils/security'
import { logger } from '../../../utils/logger'

export default function CodesTab({ showImportMessage }) {
  const {
    codes,
    availableCodes,
    usedCodes,
    loading,
    addCode,
    deleteCode,
    generateCode,
    generateBulkCodes,
    importCodes
  } = useCodes()

  const [showAddForm, setShowAddForm] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [clientName, setClientName] = useState('')
  const fileInputRef = useRef(null)

  const handleAddCode = async () => {
    if (!newCode.trim()) {
      alert('Ingresa un código válido')
      return
    }

    const code = SecurityManager.sanitizeInput(newCode.trim().toUpperCase(), 50)
    
    if (!/^[A-Z0-9]+$/.test(code)) {
      alert('El código solo puede contener letras mayúsculas y números')
      return
    }

    if (code.length < 4) {
      alert('El código debe tener al menos 4 caracteres')
      return
    }

    try {
      await addCode({
        code,
        clientName: SecurityManager.sanitizeInput(clientName.trim() || 'Sin nombre', 100)
      })
      
      setNewCode('')
      setClientName('')
      setShowAddForm(false)
      showImportMessage('success', 'Código agregado correctamente')
    } catch (error) {
      logger.error('Error agregando código', error)
      showImportMessage('error', error.message || 'Error al agregar código')
    }
  }

  const handleDeleteCode = async (codeId, codeString) => {
    if (!window.confirm(`¿Eliminar el código ${codeString}?`)) return
    
    try {
      await deleteCode(codeId)
      showImportMessage('success', 'Código eliminado correctamente')
    } catch (error) {
      logger.error('Error eliminando código', error)
      showImportMessage('error', 'Error al eliminar código')
    }
  }

  const handleGenerateBulk = async () => {
    const count = prompt('¿Cuántos códigos deseas generar?', '10')
    if (!count) return

    const num = parseInt(count)
    if (isNaN(num) || num < 1 || num > 100) {
      alert('Por favor ingresa un número entre 1 y 100')
      return
    }

    try {
      const result = await generateBulkCodes(num, 'PROC')
      showImportMessage('success', `${result.codes.length} códigos generados`)
    } catch (error) {
      logger.error('Error generando códigos en lote', error)
      showImportMessage('error', 'Error al generar códigos')
    }
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.type !== 'application/json') {
      showImportMessage('error', 'Solo se permiten archivos JSON')
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result)
        const validCodes = SecurityManager.validateImportedData(data, 'codes')

        if (validCodes.length === 0) {
          showImportMessage('error', 'No se encontraron códigos válidos')
          return
        }

        const confirm = window.confirm(
          `¿Importar ${validCodes.length} código(s)?`
        )

        if (!confirm) return

        const result = await importCodes(validCodes)
        showImportMessage('success', `${result.imported} código(s) importado(s)`)
      } catch (error) {
        logger.error('Error importando códigos', error)
        showImportMessage('error', error.message)
      }
    }

    reader.readAsText(file)
    e.target.value = ''
  }

  const handleExport = () => {
    const data = {
      codes: codes.map(c => ({
        code: c.code,
        clientName: c.clientName,
        used: usedCodes.some(uc => uc.code === c.code)
      })),
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proconing-codes-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Cargando códigos...</p>
      </div>
    )
  }

  return (
    <>
      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatsCard label="Total de códigos" value={codes.length} />
        <StatsCard label="Códigos disponibles" value={availableCodes.length} variant="success" />
        <StatsCard label="Códigos usados" value={usedCodes.length} variant="danger" />
      </div>

      {/* Acciones */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Acciones</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full justify-center text-sm sm:text-base"
          >
            {showAddForm ? 'Cancelar' : '➕ Agregar'}
          </Button>
          <Button 
            onClick={() => {
              setNewCode(generateCode())
              setShowAddForm(true)
            }} 
            variant="outline"
            className="w-full justify-center text-sm sm:text-base"
          >
            🎲 Generar
          </Button>
          <Button 
            onClick={handleGenerateBulk} 
            variant="outline"
            className="w-full justify-center text-sm sm:text-base"
          >
            📦 En lote
          </Button>
          <Button 
            onClick={handleExport} 
            variant="outline"
            className="w-full justify-center text-sm sm:text-base"
          >
            💾 Exportar
          </Button>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline"
            className="w-full justify-center text-sm sm:text-base bg-green-50 hover:bg-green-100 border-green-300"
          >
            📥 Importar
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        {showAddForm && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Nuevo código</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Código</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="PROC2024"
                  maxLength={50}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Nombre del cliente</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Juan Pérez"
                  maxLength={100}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-3 sm:mt-4">
              <Button 
                onClick={handleAddCode}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Guardar código
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de códigos disponibles */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
          Códigos disponibles ({availableCodes.length})
        </h2>
        {availableCodes.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Código</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Cliente</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {availableCodes.map((code) => (
                    <tr key={code.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm font-semibold text-blue-600 break-all">
                        {code.code}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 break-words">
                        {code.clientName}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <button
                          onClick={() => handleDeleteCode(code.id, code.code)}
                          className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8 text-sm sm:text-base">No hay códigos disponibles</p>
        )}
      </div>

      {/* Lista de códigos usados */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
          Códigos usados ({usedCodes.length})
        </h2>
        {usedCodes.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Código</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Cliente</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {usedCodes.map((code) => (
                    <tr key={code.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm font-semibold text-gray-600 break-all">
                        {code.code}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 break-words">
                        {code.clientName}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Usado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8 text-sm sm:text-base">No hay códigos usados</p>
        )}
      </div>
    </>
  )
}