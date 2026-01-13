import React, { useEffect, useState } from 'react';
import Button from '../components/ui/Button';
import { SparklesIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import recetasService from '../services/recetasService';
import { Card, CardContent, CardTitle, CardFooter } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

export default function DashboardPage() {
  const [recentRecetas, setRecentRecetas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const data = await recetasService.getRecetas({ limit: 5 });
        setRecentRecetas(data.data || []);
      } catch (e) {
        console.error("Error loading recent activity", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadRecent();
  }, []);

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
         
         {isLoading ? (
             <div className="flex justify-center py-8">
                 <Spinner />
             </div>
         ) : recentRecetas.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-400">No hay recetas recientes aún.</p>
             </div>
         ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {recentRecetas.map(receta => (
                     <Link key={receta.id} to={`/recetas/${receta.id}`}>
                        <Card className="h-full hover:shadow-md transition-shadow hover:border-brand-200 cursor-pointer">
                            <CardContent className="pb-2">
                                <CardTitle className="text-lg mb-2 line-clamp-1">{receta.titulo}</CardTitle>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{receta.descripcion}</p>
                                <div className="flex gap-2">
                                    <Badge className="bg-blue-50 text-blue-700 text-xs flex items-center gap-1">
                                        <ClockIcon className="h-3 w-3" /> {receta.tiempo_preparacion}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                     </Link>
                 ))}
             </div>
         )}
      </div>
    </div>
  );
}
