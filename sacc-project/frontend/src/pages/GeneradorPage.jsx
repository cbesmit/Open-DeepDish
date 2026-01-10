import React, { useState } from 'react';
import useGeneradorStore from '../store/generadorStore';
import PersonasSelector from '../components/generador/PersonasSelector';
import NivelSelector from '../components/generador/NivelSelector';
import OpcionesSelector from '../components/generador/OpcionesSelector';
import IngredientesInput from '../components/generador/IngredientesInput';
import ResultadosList from '../components/generador/ResultadosList';
import RecetaDetalle from '../components/recetas/RecetaDetalle';
import LoadingMessage from '../components/ui/LoadingMessage';
import Button from '../components/ui/Button';
import { SparklesIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { Card, CardContent } from '../components/ui/Card';

export default function GeneradorPage() {
  const { status, generar, error, config, resetConfig } = useGeneradorStore();
  const [selectedReceta, setSelectedReceta] = useState(null);

  if (status === 'LOADING') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <LoadingMessage />
      </div>
    );
  }

  // Si hay una receta seleccionada para preview, mostramos su detalle
  if (selectedReceta) {
      return (
          <div className="space-y-4">
              <Button variant="ghost" onClick={() => setSelectedReceta(null)} className="pl-0 text-gray-500">
                  <ArrowLeftIcon className="h-4 w-4 mr-1" /> Volver a Resultados
              </Button>
              <RecetaDetalle receta={selectedReceta} modo="preliminar" />
          </div>
      )
  }

  if (status === 'SUCCESS') {
    return <ResultadosList onSelectReceta={setSelectedReceta} />;
  }

  const isValid = config.personas_ids.length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 animate-fadeIn">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Generador de Recetas IA</h1>
        <p className="text-gray-500 mt-2">Configura los detalles y deja que la Inteligencia Artificial diseñe tu menú.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
           <strong>Error:</strong> {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Sección 1: Comensales */}
        <Card>
            <CardContent>
                <PersonasSelector />
            </CardContent>
        </Card>

        {/* Sección 2: Preferencias */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardContent>
                    <NivelSelector />
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <OpcionesSelector />
                </CardContent>
            </Card>
        </div>

        {/* Sección 3: Ingredientes */}
        <Card>
            <CardContent>
                <IngredientesInput />
            </CardContent>
        </Card>
      </div>

      {/* Footer Fijo en Mobile para Acción Principal */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 md:relative md:bg-transparent md:border-0 md:p-0 z-30">
          <div className="max-w-3xl mx-auto">
            <Button 
                size="lg" 
                className="w-full shadow-xl md:shadow-none" 
                onClick={generar}
                disabled={!isValid}
                icon={SparklesIcon}
            >
                {isValid ? 'Generar Menú con IA' : 'Selecciona comensales para continuar'}
            </Button>
          </div>
      </div>
    </div>
  );
}
