import React, { useEffect } from 'react';
import usePersonasStore from '../../store/personasStore';
import useGeneradorStore from '../../store/generadorStore';
import Spinner from '../ui/Spinner';
import { cn } from '../../utils/cn';
import { UserIcon } from '@heroicons/react/24/solid';

export default function PersonasSelector() {
  const { personas, isLoading, fetchPersonas } = usePersonasStore();
  const { config, setConfig } = useGeneradorStore();

  useEffect(() => {
    // Cargar personas si no están cargadas
    if (personas.length === 0) {
      fetchPersonas();
    }
  }, [fetchPersonas, personas.length]);

  const togglePersona = (id) => {
    const currentIds = config.personas_ids;
    if (currentIds.includes(id)) {
      setConfig('personas_ids', currentIds.filter(pid => pid !== id));
    } else {
      setConfig('personas_ids', [...currentIds, id]);
    }
  };

  const handleSelectAll = () => {
      const activeIds = personas.filter(p => p.activo).map(p => p.id);
      if (config.personas_ids.length === activeIds.length) {
          setConfig('personas_ids', []); // Deselect all
      } else {
          setConfig('personas_ids', activeIds);
      }
  }

  if (isLoading && personas.length === 0) {
    return <div className="p-4 flex justify-center"><Spinner className="text-brand-500" /></div>;
  }

  // Filtrar solo personas activas para la selección
  const personasActivas = personas.filter(p => p.activo);

  if (personasActivas.length === 0) {
      return (
          <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500">
              No hay comensales activos. Configúralos primero.
          </div>
      )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">¿Quién va a comer?</label>
        <button 
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
        >
            {config.personas_ids.length === personasActivas.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {personasActivas.map((persona) => {
          const isSelected = config.personas_ids.includes(persona.id);
          return (
            <div
              key={persona.id}
              onClick={() => togglePersona(persona.id)}
              className={cn(
                "cursor-pointer rounded-xl border-2 p-3 transition-all duration-200 flex items-center gap-3 select-none",
                isSelected
                  ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                  : "border-gray-200 hover:border-brand-200 hover:bg-gray-50"
              )}
            >
              <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                  isSelected ? "bg-brand-200 text-brand-700" : "bg-gray-100 text-gray-400"
              )}>
                 <UserIcon className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                 <p className={cn("font-medium truncate", isSelected ? "text-brand-900" : "text-gray-700")}>
                     {persona.nombre}
                 </p>
              </div>
            </div>
          );
        })}
      </div>
      {config.personas_ids.length === 0 && (
          <p className="text-xs text-red-500 animate-pulse">Debes seleccionar al menos un comensal.</p>
      )}
    </div>
  );
}
