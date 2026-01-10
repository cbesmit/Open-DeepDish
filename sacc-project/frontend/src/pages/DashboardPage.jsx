import React from 'react';
import Button from '../components/ui/Button';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-brand-50 rounded-3xl p-8 border border-brand-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Hola! ¿Qué cocinamos hoy?</h1>
           <p className="text-gray-600 text-lg">El Chef IA está listo para ayudarte con los ingredientes que tienes.</p>
        </div>
        <Link to="/generador">
           <Button size="lg" icon={SparklesIcon} className="shadow-lg shadow-brand-200">
             Crear Nueva Receta
           </Button>
        </Link>
      </div>
      
      <div>
         <h2 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h2>
         <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-400">No hay recetas recientes aún.</p>
         </div>
      </div>
    </div>
  );
}