import React from 'react';
import useGeneradorStore from '../../store/generadorStore';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Card, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { ArrowPathIcon, ChevronRightIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';

export default function ResultadosList({ onSelectReceta }) {
  const { recetasGeneradas, limpiarResultados, generar, resetConfig, status } = useGeneradorStore();

  const handleRegenerar = () => {
      generar(true); // Enviar historial
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">¡El Chef ha hablado!</h2>
            <p className="text-gray-500">Aquí tienes 8 opciones basadas en tu perfil.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={resetConfig} icon={ArrowPathIcon}>
                Reiniciar
            </Button>
            <Button 
                variant="primary" 
                onClick={handleRegenerar} 
                icon={ArrowPathIcon}
                isLoading={status === 'LOADING'}
            >
                Volver a Generar
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recetasGeneradas.map((receta, index) => (
          <Card 
            key={index} 
            className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-transparent hover:border-l-brand-500 flex flex-col h-full"
            onClick={() => onSelectReceta(receta)}
          >
            <CardContent className="pb-2 flex-1">
                <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{receta.titulo}</CardTitle>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{receta.descripcion}</p>
                
                <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className="bg-blue-50 text-blue-700 gap-1">
                        <ClockIcon className="h-3 w-3" /> {receta.tiempo_estimado}
                    </Badge>
                    <Badge className="bg-green-50 text-green-700 gap-1">
                        <FireIcon className="h-3 w-3" /> Salud: {receta.nivel_saludable_calculado}/5
                    </Badge>
                </div>
            </CardContent>
            <CardFooter className="pt-2 bg-white border-t-0 mt-auto">
                <Button variant="ghost" size="sm" className="w-full justify-between text-brand-600 hover:text-brand-700 hover:bg-brand-50 p-0 px-2">
                    Ver Receta Completa
                    <ChevronRightIcon className="h-4 w-4" />
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}