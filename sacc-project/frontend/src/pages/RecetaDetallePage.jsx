import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useRecetasStore from '../store/recetasStore';
import RecetaDetalle from '../components/recetas/RecetaDetalle';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function RecetaDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { recetaActiva, fetchRecetaDetalle, isLoading, error } = useRecetasStore();

  const fromGenerator = location.state?.fromGenerator;

  useEffect(() => {
    if (id) {
      fetchRecetaDetalle(id);
    }
  }, [id, fetchRecetaDetalle]);

  const handleBack = () => {
    if (fromGenerator) {
        navigate('/generador');
    } else {
        navigate('/recetas');
    }
  };

  if (isLoading) {
    return (
        <div className="flex h-[50vh] items-center justify-center">
            <Spinner size="xl" className="text-brand-600" />
        </div>
    );
  }

  if (error || !recetaActiva) {
    return (
        <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error || 'Receta no encontrada'}</p>
            <Button variant="outline" onClick={() => navigate('/recetas')}>
                Volver al Recetario
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={handleBack} className="text-gray-500 hover:text-gray-900 pl-0">
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> 
            {fromGenerator ? 'Volver a resultados de IA' : 'Volver al recetario'}
        </Button>
        <RecetaDetalle receta={recetaActiva} modo="lectura" />
    </div>
  );
}
