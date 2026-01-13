import React from 'react';
import useGeneradorStore from '../../store/generadorStore';
import Textarea from '../ui/Textarea';
import Input from '../ui/Input';
import { CubeIcon } from '@heroicons/react/24/outline';

export default function IngredientesInput() {
  const { config, setConfig } = useGeneradorStore();

  return (
    <div className="space-y-4">
      <Textarea
        label="¿Qué ingredientes tienes en casa?"
        placeholder="Ej. Medio pollo, 3 tomates a punto de pasarse, un poco de arroz..."
        value={config.ingredientes_extra}
        onChange={(e) => setConfig('ingredientes_extra', e.target.value)}
        rows={3}
      />

      <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
        <CubeIcon className="h-6 w-6 text-brand-600" />
        <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Usar Alacena Digital</p>
            <p className="text-xs text-gray-500">Incluir ingredientes guardados en configuración</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={config.usar_tiendas} // Reusing this bool for general "local ingredients" logic
            onChange={(e) => setConfig('usar_tiendas', e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
        </label>
      </div>

      <Input
        label="Antojo o Nota Especial (Opcional)"
        placeholder="Ej. Algo caldoso porque hace frío..."
        value={config.antojo}
        onChange={(e) => setConfig('antojo', e.target.value)}
      />
    </div>
  );
}
