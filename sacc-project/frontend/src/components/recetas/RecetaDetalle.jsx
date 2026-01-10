import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useRecetasStore from '../../store/recetasStore';
import useGeneradorStore from '../../store/generadorStore';
import usePersonasStore from '../../store/personasStore';
import FeedbackModule from './FeedbackModule';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { 
    ClockIcon, 
    FireIcon, 
    CheckCircleIcon, 
    ShoppingCartIcon, 
    BookmarkSquareIcon 
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';

export default function RecetaDetalle({ receta, modo = 'lectura' }) {
  // modo: 'lectura' (guardada) | 'preliminar' (generador)
  const navigate = useNavigate();
  const { guardarGenerada } = useRecetasStore();
  const { config } = useGeneradorStore();
  const { personas } = usePersonasStore();
  
  const [checkedPasos, setCheckedPasos] = useState({});
  const [checkedIngredientes, setCheckedIngredientes] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  if (!receta) return null;

  // Normalizar estructura de datos (la API retorna algo diferente a la generación a veces)
  // Asumimos que receta trae: nombre, descripcion, contenido_full (ingredientes, pasos, tips), tiempo_estimado, calorias, etc.
  // Si viene de DB, el contenido JSON está en 'contenido'. Si viene del generador, está plano o en contenido_full.
  
  const detalles = receta.contenido || receta.contenido_full || receta; 
  // Intentamos extraer arrays seguros
  const ingredientes = detalles.ingredientes || [];
  const pasos = detalles.pasos || [];
  const tips = detalles.tips || [];

  const handleGuardar = async () => {
    setIsSaving(true);
    try {
        // Preparar payload para backend
        const payload = {
            titulo: receta.titulo || receta.nombre, // Backend espera titulo
            descripcion: receta.descripcion,
            tipo_comida: config.tipo_comida || 'Comida', // Usar config si no viene en receta
            tiempo_preparacion: receta.tiempo_estimado || config.tiempo_prep,
            nivel_saludable: receta.nivel_saludable_calculado || config.nivel_saludable || 3,
            contenido_full: detalles,
            config_snapshot: config, // config del store generador
        };
        
        const nueva = await guardarGenerada(payload);
        navigate(`/recetas/${nueva.id}`, { replace: true });
    } catch (e) {
        console.error(e);
        // Error manejado en store
    } finally {
        setIsSaving(false);
    }
  };

  const togglePaso = (idx) => {
    setCheckedPasos(prev => ({ ...prev, [idx]: !prev[idx] }));
  };
  
  const toggleIngrediente = (idx) => {
    setCheckedIngredientes(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fadeIn">
      {/* HEADER */}
      <div className="mb-8">
         <div className="flex flex-wrap gap-2 mb-3">
             <Badge className="bg-orange-100 text-orange-800">{receta.tipo_cocina || 'General'}</Badge>
             <Badge variant="outline" className="flex items-center gap-1"><ClockIcon className="h-3 w-3"/> {receta.tiempo_estimado}</Badge>
             <Badge variant="outline" className="flex items-center gap-1"><FireIcon className="h-3 w-3"/> {receta.calorias} kcal</Badge>
         </div>
         <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{receta.nombre}</h1>
         <p className="text-lg text-gray-600 leading-relaxed">{receta.descripcion}</p>
      </div>

      {/* ACTION BAR (Solo preliminar) */}
      {modo === 'preliminar' && (
          <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl mb-8 flex items-center justify-between">
              <div>
                  <p className="font-bold text-brand-800">¿Te gusta esta opción?</p>
                  <p className="text-sm text-brand-600">Guárdala para habilitar el feedback y seguimiento.</p>
              </div>
              <Button onClick={handleGuardar} isLoading={isSaving} icon={BookmarkSquareIcon}>
                  Guardar Receta
              </Button>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: INGREDIENTES */}
          <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-4">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg border-b border-gray-100 pb-2">Ingredientes</h3>
                  <ul className="space-y-3">
                      {ingredientes.map((ing, idx) => {
                          const isChecked = checkedIngredientes[idx];
                          // Lógica de semáforo
                          const statusIcon = ing.estado === 'tienes' 
                            ? <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                            : <ShoppingCartIcon className="h-5 w-5 text-orange-500 flex-shrink-0" />;
                          
                          return (
                              <li 
                                key={idx} 
                                className={cn(
                                    "flex items-start gap-3 cursor-pointer group transition-all",
                                    isChecked && "opacity-50"
                                )}
                                onClick={() => toggleIngrediente(idx)}
                              >
                                  <div className="mt-0.5">{statusIcon}</div>
                                  <span className={cn(
                                      "text-sm text-gray-700 leading-snug group-hover:text-gray-900",
                                      isChecked && "line-through decoration-gray-400"
                                  )}>
                                      {ing.cantidad} {ing.nombre} {ing.notas && <span className="text-gray-400 italic">({ing.notas})</span>}
                                  </span>
                              </li>
                          )
                      })}
                  </ul>
                  <div className="mt-6 pt-4 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1"><CheckCircleIcon className="h-4 w-4 text-green-500"/> Tienes</div>
                      <div className="flex items-center gap-1"><ShoppingCartIcon className="h-4 w-4 text-orange-500"/> Comprar/Buscar</div>
                  </div>
              </div>
          </div>

          {/* COLUMNA DERECHA: PASOS */}
          <div className="md:col-span-2 space-y-8">
              <section>
                  <h3 className="font-bold text-gray-900 mb-6 text-xl">Instrucciones</h3>
                  <div className="space-y-6">
                      {pasos.map((paso, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => togglePaso(idx)}
                            className={cn(
                                "flex gap-4 p-4 rounded-xl transition-all cursor-pointer border border-transparent hover:border-gray-200 hover:bg-gray-50",
                                checkedPasos[idx] ? "bg-gray-50 opacity-60" : "bg-white"
                            )}
                          >
                              <div className={cn(
                                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                  checkedPasos[idx] ? "bg-gray-200 text-gray-500" : "bg-brand-100 text-brand-700"
                              )}>
                                  {idx + 1}
                              </div>
                              <p className={cn(
                                  "text-gray-700 text-lg leading-relaxed",
                                  checkedPasos[idx] && "line-through text-gray-400"
                              )}>
                                  {paso}
                              </p>
                          </div>
                      ))}
                  </div>
              </section>

              {tips.length > 0 && (
                  <section className="bg-yellow-50 border border-yellow-100 rounded-xl p-6">
                      <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                          💡 Tips del Chef
                      </h4>
                      <ul className="list-disc list-inside space-y-2 text-yellow-900/80">
                          {tips.map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                          ))}
                      </ul>
                  </section>
              )}
              
              {/* FEEDBACK MODULE (Solo guardada) */}
              {modo === 'lectura' && (
                  <FeedbackModule 
                    recetaId={receta.id} 
                    calificacionesIniciales={receta.calificaciones} 
                    personas={personas}
                  />
              )}
          </div>
      </div>
    </div>
  );
}
