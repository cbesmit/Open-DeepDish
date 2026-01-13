import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useRecetasStore from '../store/recetasStore';
import RecetasFiltros from '../components/recetas/RecetasFiltros';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardContent, CardFooter, CardTitle } from '../components/ui/Card';
import { ClockIcon, FireIcon, FunnelIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';

export default function RecetasPage() {
  const { recetas, isLoading, fetchRecetas, pagination, setPage } = useRecetasStore();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRecetas();
  }, [fetchRecetas]);

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Mis Recetas</h1>
           <p className="text-gray-500">Historial de creaciones guardadas.</p>
        </div>
        
        <Button 
            variant={showFilters ? "primary" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            icon={FunnelIcon}
        >
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>
      </div>

      {/* FILTROS HEADER COLLAPSIBLE */}
      <div className={cn(
          "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300",
          showFilters ? "max-h-[1000px] opacity-100 p-6" : "max-h-0 opacity-0 p-0 border-0"
      )}>
          <RecetasFiltros />
      </div>

      {/* GRID RESULTADOS */}
      <div className="space-y-6">
          {isLoading ? (
              <div className="flex justify-center py-12">
                  <Spinner size="xl" className="text-brand-500" />
              </div>
          ) : recetas.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                  <p>No se encontraron recetas.</p>
                  <Button variant="link" className="mt-2" onClick={() => window.location.reload()}>Limpiar filtros</Button>
              </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recetas.map(receta => {
                      const likes = receta.calificaciones?.filter(c => c.valoracion === 'ME_GUSTO') || [];
                      
                      return (
                      <Link key={receta.id} to={`/recetas/${receta.id}`}>
                          <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col group border-transparent hover:border-brand-200">
                              <CardContent className="flex-1 pb-4">
                                  <div className="flex justify-between items-start mb-3">
                                      <CardTitle className="line-clamp-1 text-xl group-hover:text-brand-600 transition-colors">{receta.titulo}</CardTitle>
                                  </div>
                                  <p className="text-sm text-gray-500 line-clamp-3 mb-4 h-15 leading-relaxed">{receta.descripcion}</p>
                                  
                                  <div className="flex flex-wrap gap-2 mb-4">
                                      <Badge className="bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-1.5 px-2.5 py-1">
                                          <ClockIcon className="h-3.5 w-3.5" /> {receta.tiempo_preparacion || receta.tiempo_estimado}
                                      </Badge>
                                      <Badge className="bg-green-50 text-green-700 border-green-100 flex items-center gap-1.5 px-2.5 py-1">
                                          <FireIcon className="h-3.5 w-3.5" /> Salud: {receta.nivel_saludable}/5
                                      </Badge>
                                      {receta.tipo_cocina && (
                                          <Badge className="bg-orange-50 text-orange-700 border-orange-100 px-2.5 py-1">
                                              {receta.tipo_cocina}
                                          </Badge>
                                      )}
                                  </div>

                                  {/* LIKES SECTION */}
                                  {likes.length > 0 && (
                                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-50">
                                        <div className="flex -space-x-2.5 overflow-hidden">
                                            {likes.map((like, i) => (
                                                <div 
                                                    key={i} 
                                                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-brand-100 flex items-center justify-center text-[10px] font-bold text-brand-700"
                                                    title={like.persona?.nombre}
                                                >
                                                    {like.persona?.nombre?.charAt(0).toUpperCase()}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-[11px] text-gray-400 font-medium">Les gustó a {likes.length} {likes.length === 1 ? 'persona' : 'personas'}</span>
                                    </div>
                                  )}
                              </CardContent>
                              <CardFooter className="pt-3 pb-4 bg-gray-50/50 border-t border-gray-100 mt-auto px-6">
                                  <span className="text-sm text-brand-600 font-semibold ml-auto flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                      Ver Detalle 
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                  </span>
                              </CardFooter>
                          </Card>
                      </Link>
                  )})}
              </div>
          )}

          {/* PAGINACION */}
          {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={pagination.page <= 1}
                    onClick={() => setPage(pagination.page - 1)}
                  >
                      Anterior
                  </Button>
                  <div className="flex items-center gap-1">
                      {[...Array(pagination.totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={cn(
                                "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                                pagination.page === i + 1 
                                    ? "bg-brand-500 text-white" 
                                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                            )}
                          >
                              {i + 1}
                          </button>
                      ))}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage(pagination.page + 1)}
                  >
                      Siguiente
                  </Button>
              </div>
          )}
      </div>
    </div>
  );
}