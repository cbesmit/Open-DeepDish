import React, { useEffect } from 'react';
import useRecetasStore from '../../store/recetasStore';
import usePersonasStore from '../../store/personasStore';
import Input from '../ui/Input';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function RecetasFiltros() {
  const { filtros, setFiltro } = useRecetasStore();
  const { personas, fetchPersonas } = usePersonasStore();

  useEffect(() => {
    if (personas.length === 0) fetchPersonas();
  }, [fetchPersonas, personas.length]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
      <h3 className="font-bold text-gray-900">Filtros</h3>
      
      <div>
          <Input 
             placeholder="Buscar receta..." 
             value={filtros.q}
             onChange={(e) => setFiltro('q', e.target.value)}
             className="pl-10" // Simular icon padding si Input lo soportara nativamente
             // En un diseño real, el icono iría dentro del wrapper del input
          />
      </div>

      <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nivel Saludable (Min)</label>
          <input 
             type="range" min="0" max="5" step="1"
             value={filtros.nivel_saludable}
             onChange={(e) => setFiltro('nivel_saludable', parseInt(e.target.value))}
             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />
          <div className="flex justify-between text-xs text-gray-500">
              <span>Cualquiera</span>
              <span>Muy Sano</span>
          </div>
      </div>

      <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">¿A quién le gustó?</label>
          <select 
             className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 py-2 text-sm"
             value={filtros.persona_id}
             onChange={(e) => setFiltro('persona_id', e.target.value)}
          >
              <option value="">Cualquiera</option>
              {personas.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
          </select>
      </div>

      <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo</label>
          <select 
             className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 py-2 text-sm"
             value={filtros.tiempo}
             onChange={(e) => setFiltro('tiempo', e.target.value)}
          >
              <option value="">Cualquiera</option>
              <option value="RAPIDA">Rápida</option>
              <option value="NORMAL">Normal</option>
              <option value="LARGA">Larga</option>
          </select>
      </div>
    </div>
  );
}
