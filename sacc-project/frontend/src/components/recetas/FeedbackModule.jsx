import React, { useState } from 'react';
import useRecetasStore from '../../store/recetasStore';
import Button from '../ui/Button';
import { HandThumbUpIcon, HandThumbDownIcon, MinusCircleIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid, HandThumbDownIcon as HandThumbDownSolid } from '@heroicons/react/24/solid';
import { cn } from '../../utils/cn';

export default function FeedbackModule({ recetaId, calificacionesIniciales = [], personas = [] }) {
  const { enviarCalificacion } = useRecetasStore();
  const [calificaciones, setCalificaciones] = useState(() => {
    // Inicializar estado local con calificaciones existentes o default (null)
    const initialMap = {};
    personas.forEach(p => {
        const existing = calificacionesIniciales.find(c => c.persona_id === p.id);
        initialMap[p.id] = existing ? existing.valoracion : null; // true, false, or null
    });
    return initialMap;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleRate = (personaId, valoracion) => {
    setCalificaciones(prev => ({
        ...prev,
        [personaId]: valoracion
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        const payload = Object.entries(calificaciones)
            .filter(([_, val]) => val !== null)
            .map(([personaId, valoracion]) => ({
                persona_id: personaId, // Mantener como String (UUID)
                valoracion: valoracion === true ? 'ME_GUSTO' : (valoracion === false ? 'NO_ME_GUSTO' : 'INDIFERENTE')
            }));
        
        await enviarCalificacion(recetaId, payload);
        setHasChanges(false);
    } finally {
        setIsSaving(false);
    }
  };

  if (personas.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mt-8">
      <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">¿Qué opinaron los comensales?</h3>
          {hasChanges && (
              <span className="text-xs text-brand-600 font-medium animate-pulse">
                  Cambios sin guardar
              </span>
          )}
      </div>

      <div className="space-y-4">
        {personas.map(persona => (
          <div key={persona.id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0">
            <span className="font-medium text-gray-700">{persona.nombre}</span>
            
            <div className="flex gap-2">
                {/* LIKE */}
                <button
                    onClick={() => handleRate(persona.id, true)}
                    className={cn(
                        "p-2 rounded-full transition-colors",
                        calificaciones[persona.id] === true 
                            ? "bg-green-100 text-green-600 ring-2 ring-green-500 ring-offset-1" 
                            : "bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-500"
                    )}
                >
                    {calificaciones[persona.id] === true ? <HandThumbUpSolid className="h-6 w-6" /> : <HandThumbUpIcon className="h-6 w-6" />}
                </button>

                {/* NEUTRAL / CLEAR */}
                <button
                    onClick={() => handleRate(persona.id, null)}
                    className={cn(
                        "p-2 rounded-full transition-colors",
                        calificaciones[persona.id] === null
                             ? "bg-gray-100 text-gray-500"
                             : "text-gray-300 hover:text-gray-500"
                    )}
                    title="Sin opinión"
                >
                    <MinusCircleIcon className="h-6 w-6" />
                </button>

                {/* DISLIKE */}
                <button
                    onClick={() => handleRate(persona.id, false)}
                    className={cn(
                        "p-2 rounded-full transition-colors",
                        calificaciones[persona.id] === false 
                            ? "bg-red-100 text-red-600 ring-2 ring-red-500 ring-offset-1" 
                            : "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    )}
                >
                    {calificaciones[persona.id] === false ? <HandThumbDownSolid className="h-6 w-6" /> : <HandThumbDownIcon className="h-6 w-6" />}
                </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-2">
        <Button 
            onClick={handleSave} 
            isLoading={isSaving} 
            disabled={!hasChanges}
            className="w-full"
            variant={hasChanges ? 'primary' : 'outline'}
        >
            {hasChanges ? 'Guardar Calificaciones' : 'Calificaciones al día'}
        </Button>
      </div>
    </div>
  );
}
