import React from 'react';
import useGeneradorStore from '../../store/generadorStore';
import { cn } from '../../utils/cn';

function SegmentedControl({ options, value, onChange, label }) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="flex bg-gray-100 p-1 rounded-xl">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50",
                            value === opt.value
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function OpcionesSelector() {
  const { config, setConfig } = useGeneradorStore();

  return (
    <div className="space-y-5">
      <SegmentedControl
        label="Tipo de Comida"
        value={config.tipo_comida}
        onChange={(val) => setConfig('tipo_comida', val)}
        options={[
            { label: 'Desayuno', value: 'Desayuno' },
            { label: 'Comida', value: 'Comida' },
            { label: 'Cena', value: 'Cena' }
        ]}
      />

      <SegmentedControl
        label="Tiempo Disponible"
        value={config.tiempo_prep}
        onChange={(val) => setConfig('tiempo_prep', val)}
        options={[
            { label: 'Rápida', value: 'RAPIDA' },
            { label: 'Normal', value: 'NORMAL' },
            { label: 'Larga', value: 'LARGA' }
        ]}
      />
      
      {/* Nivel de agrado podría ser opcional o avanzado, lo dejo simple por ahora */}
    </div>
  );
}
