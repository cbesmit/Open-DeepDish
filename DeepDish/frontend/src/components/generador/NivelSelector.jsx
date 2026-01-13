import React from 'react';
import useGeneradorStore from '../../store/generadorStore';
import { cn } from '../../utils/cn';

const NIVELES = [
    { val: 1, label: 'Indulgente', desc: 'Sabor sobre todo. Grasas y azúcares permitidos.' },
    { val: 2, label: 'Casero Rico', desc: 'Comida reconfortante, balance relajado.' },
    { val: 3, label: 'Equilibrado', desc: 'El punto medio ideal. Sano pero sabroso.' },
    { val: 4, label: 'Fitness', desc: 'Alto en proteína, control de carbos.' },
    { val: 5, label: 'Muy Saludable', desc: 'Bajo en calorías, muchas verduras.' },
];

export default function NivelSelector() {
  const { config, setConfig } = useGeneradorStore();

  const currentNivel = NIVELES.find(n => n.val === config.nivel_saludable) || NIVELES[2];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
         <label className="text-sm font-medium text-gray-700">Nivel Saludable</label>
         <span className="text-sm font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
             {currentNivel.label}
         </span>
      </div>

      <input
        type="range"
        min="1"
        max="5"
        step="1"
        value={config.nivel_saludable}
        onChange={(e) => setConfig('nivel_saludable', parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
      />
      
      <div className="flex justify-between text-xs text-gray-400 px-1">
         <span>Grasoso</span>
         <span>Equilibrado</span>
         <span>Healthy</span>
      </div>

      <p className="text-sm text-gray-500 italic text-center">
          "{currentNivel.desc}"
      </p>
    </div>
  );
}
