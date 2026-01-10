import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useRecetasStore from '../store/recetasStore';
import RecetasFiltros from '../components/recetas/RecetasFiltros';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardContent, CardFooter, CardTitle } from '../components/ui/Card';
import { ClockIcon, FireIcon, FunnelIcon } from '@heroicons/react/24/outline';
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
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            icon={FunnelIcon}
            className="md:hidden"
        >
            Filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* SIDEBAR FILTROS */}
          <div className={cn("md:col-span-1", showFilters ? "block" : "hidden md:block")}>
              <RecetasFiltros />
          </div>

          {/* GRID RESULTADOS */}
          <div className="md:col-span-3 space-y-6">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recetas.map(receta => (
                          <Link key={receta.id} to={`/recetas/${receta.id}`}>
                              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer flex flex-col">
                                  <CardContent className="flex-1 pb-2">
                                      <CardTitle className="mb-2 line-clamp-1">{receta.nombre}</CardTitle>
                                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{receta.descripcion}</p>
                                      <div className="flex flex-wrap gap-2">
                                          <Badge className="bg-gray-100 text-gray-600 text-xs flex items-center gap-1">
                                              <ClockIcon className="h-3 w-3" /> {receta.tiempo_estimado}
                                          </Badge>
                                          <Badge className="bg-orange-50 text-orange-600 text-xs flex items-center gap-1">
                                              <FireIcon className="h-3 w-3" /> {receta.calorias} kcal
                                          </Badge>
                                      </div>
                                  </CardContent>
                                  <CardFooter className="pt-2 bg-gray-50/50 border-t border-gray-100">
                                      <span className="text-xs text-brand-600 font-medium ml-auto">Ver Detalle &rarr;</span>
                                  </CardFooter>
                              </Card>
                          </Link>
                      ))}
                  </div>
              )}

              {/* PAGINACION */}
              {pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={pagination.page <= 1}
                        onClick={() => setPage(pagination.page - 1)}
                      >
                          Anterior
                      </Button>
                      <span className="flex items-center text-sm text-gray-600 px-2">
                          Página {pagination.page} de {pagination.totalPages}
                      </span>
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
    </div>
  );
}