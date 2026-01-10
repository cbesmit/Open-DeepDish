import React from 'react';
import PersonasModule from '../components/personas/PersonasModule';
import IngredientesModule from '../components/ingredientes/IngredientesModule';
import { UserGroupIcon, CubeIcon } from '@heroicons/react/24/outline';

export default function ConfigPage() {
  return (
    <div className="space-y-10 animate-fadeIn pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración del Hogar</h1>
        <p className="text-gray-500">Personaliza los perfiles de tu familia y los ingredientes que sueles tener.</p>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-2">
            <UserGroupIcon className="h-6 w-6 text-brand-600" />
            <h2 className="text-xl font-bold text-gray-900">Familia y Comensales</h2>
        </div>
        <PersonasModule />
      </section>

      <section>
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-2">
            <CubeIcon className="h-6 w-6 text-brand-600" />
            <h2 className="text-xl font-bold text-gray-900">Alacena y Tiendas Cercanas</h2>
        </div>
        <IngredientesModule />
      </section>
    </div>
  );
}