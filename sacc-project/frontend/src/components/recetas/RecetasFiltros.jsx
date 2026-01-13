import React, { useEffect } from 'react';
import useRecetasStore from '../../store/recetasStore';
import usePersonasStore from '../../store/personasStore';
import Input from '../ui/Input';
import SegmentedControl from '../ui/SegmentedControl';
import Button from '../ui/Button';
import { UserIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';

export default function RecetasFiltros() {
  const { filtros, setFiltro, fetchRecetas } = useRecetasStore();
  const { personas, fetchPersonas } = usePersonasStore();

  useEffect(() => {
    if (personas.length === 0) fetchPersonas();
  }, [fetchPersonas, personas.length]);

  const togglePersona = (id) => {
    const currentIds = filtros.persona_id ? filtros.persona_id.split(',').filter(i => i) : [];
    let newIds;
    if (currentIds.includes(id)) {
      newIds = currentIds.filter(pid => pid !== id);
    } else {
      newIds = [...currentIds, id];
    }
    setFiltro('persona_id', newIds.join(','));
  };

  const handleLimpiar = () => {
      const resetFiltros = {
          q: '',
          min_salud: 1,
          max_salud: 5,
          tiempo: '',
          persona_id: '',
          tipo_comida: '',
          dificultad: '',
          objetivo_agrado: '',
          tipo_cocina: ''
      };
      Object.entries(resetFiltros).forEach(([key, val]) => {
          setFiltro(key, val);
      });
  };

  const selectedPersonas = filtros.persona_id ? filtros.persona_id.split(',') : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* BUSQUEDA */}
          <div className="space-y-1.5">
             <label className="text-sm font-medium text-gray-700">Buscar</label>
             <Input 
                 placeholder="Título o descripción..." 
                 value={filtros.q}
                 onChange={(e) => setFiltro('q', e.target.value)}
                 className="bg-white"
             />
          </div>

          {/* TIPO COMIDA */}
          <SegmentedControl
            label="Tipo de Comida"
            value={filtros.tipo_comida}
            onChange={(val) => setFiltro('tipo_comida', val)}
            options={[
                { label: 'Todas', value: '' },
                { label: 'Desayuno', value: 'Desayuno' },
                { label: 'Comida', value: 'Comida' },
                { label: 'Cena', value: 'Cena' }
            ]}
          />

          {/* TIEMPO / DIFICULTAD */}
          <SegmentedControl
            label="Tiempo / Dificultad"
            value={filtros.dificultad}
            onChange={(val) => setFiltro('dificultad', val)}
            options={[
                { label: 'Todas', value: '' },
                { label: 'Rápida', value: 'RAPIDA' },
                { label: 'Normal', value: 'NORMAL' },
                { label: 'Larga', value: 'LARGA' }
            ]}
          />

          {/* OBJETIVO DE AGRADO */}
          <SegmentedControl
            label="Objetivo de Agrado"
            value={filtros.objetivo_agrado}
            onChange={(val) => setFiltro('objetivo_agrado', val)}
            options={[
                { label: 'Todas', value: '' },
                { label: 'Consenso', value: 'CONSENSO' },
                { label: 'Mayoría', value: 'MAYORIA' },
                { label: 'Experim.', value: 'EXPERIMENTAL' }
            ]}
          />
          
          {/* TIPO COCINA */}
          <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Tipo de Cocina</label>
              <select 
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 py-2.5 text-sm"
                value={filtros.tipo_cocina}
                onChange={(e) => setFiltro('tipo_cocina', e.target.value)}
              >
                  <option value="">Todas</option>
                  <option value="Mexicana">Mexicana</option>
                  <option value="Italiana">Italiana</option>
                  <option value="Japonesa">Japonesa</option>
                  <option value="China">China</option>
                  <option value="Americana">Americana</option>
                  <option value="Mediterránea">Mediterránea</option>
                  <option value="Vegetariana">Vegetariana</option>
                  <option value="Internacional">Internacional</option>
              </select>
          </div>

          {/* RANGO SALUD */}
           <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                  Nivel Saludable ({filtros.min_salud || 1} - {filtros.max_salud || 5})
              </label>
              <div className="flex gap-4 items-center mt-2">
                  <div className="flex-1">
                      <label className="text-[10px] text-gray-400 block mb-1">Mínimo</label>
                      <input 
                        type="range" min="1" max="5" step="1"
                        value={filtros.min_salud || 1}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val <= (filtros.max_salud || 5)) setFiltro('min_salud', val);
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                      />
                  </div>
                  <div className="flex-1">
                      <label className="text-[10px] text-gray-400 block mb-1">Máximo</label>
                      <input 
                        type="range" min="1" max="5" step="1"
                        value={filtros.max_salud || 5}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val >= (filtros.min_salud || 1)) setFiltro('max_salud', val);
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                      />
                  </div>
              </div>
          </div>
      </div>

      {/* A QUIEN LE GUSTO */}
      <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">¿A quién le gustó? (Coincidir todas)</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {personas.filter(p => p.activo).map(persona => {
                  const isSelected = selectedPersonas.includes(persona.id);
                  return (
                      <div
                          key={persona.id}
                          onClick={() => togglePersona(persona.id)}
                          className={cn(
                              "cursor-pointer rounded-lg border p-2 transition-all duration-200 flex items-center gap-2 select-none",
                              isSelected
                                  ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                                  : "border-gray-100 bg-white hover:border-brand-200 hover:bg-gray-50"
                          )}
                      >
                          <div className={cn(
                              "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]",
                              isSelected ? "bg-brand-200 text-brand-700" : "bg-gray-100 text-gray-400"
                          )}>
                              {persona.nombre.charAt(0).toUpperCase()}
                          </div>
                          <p className={cn("text-xs font-medium truncate", isSelected ? "text-brand-900" : "text-gray-700")}>
                              {persona.nombre}
                          </p>
                      </div>
                  );
              })}
          </div>
      </div>

      <div className="flex justify-end pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            icon={ArrowPathIcon}
            onClick={handleLimpiar}
            className="text-gray-500 hover:text-brand-600"
          >
              Limpiar Filtros
          </Button>
      </div>
    </div>
  );
}