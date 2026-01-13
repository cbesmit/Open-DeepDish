import React, { useEffect, useState } from 'react';
import useIngredientesStore from '../../store/ingredientesStore';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Switch from '../ui/Switch'; // Import Switch
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';

export default function IngredientesModule() {
  const { ingredientes, isLoading, fetchIngredientes, addIngrediente, toggleIngrediente, deleteIngrediente } = useIngredientesStore();
  const [newIngrediente, setNewIngrediente] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchIngredientes();
  }, [fetchIngredientes]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newIngrediente.trim()) return;
    
    setIsAdding(true);
    try {
        await addIngrediente(newIngrediente);
        setNewIngrediente('');
    } finally {
        setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Agregar Ingrediente Local</h3>
        <form onSubmit={handleAdd} className="flex gap-3 items-end">
            <div className="flex-1">
                <Input 
                    placeholder="Ej. Arroz, Lentejas, Tomate..." 
                    value={newIngrediente}
                    onChange={(e) => setNewIngrediente(e.target.value)}
                    disabled={isAdding}
                />
            </div>
            <Button type="submit" disabled={isAdding || !newIngrediente.trim()} icon={PlusIcon}>
                {isAdding ? 'Guardando...' : 'Agregar'}
            </Button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Inventario / Disponibilidad</h3>
            <span className="text-sm text-gray-500">{ingredientes.length} items</span>
        </div>
        
        {isLoading && ingredientes.length === 0 ? (
             <div className="flex justify-center py-8">
                <Spinner size="lg" className="text-brand-500" />
            </div>
        ) : (
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {ingredientes.map(ingrediente => (
                    <div key={ingrediente.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-4">
                             <Switch 
                                checked={ingrediente.activo} // Usar 'activo' que es el campo de DB (Prisma model: activo Boolean)
                                onChange={() => toggleIngrediente(ingrediente.id)}
                             />
                             <span className={cn("text-gray-700 font-medium", !ingrediente.activo && "text-gray-400")}>
                                {ingrediente.nombre}
                             </span>
                        </div>
                        <button 
                            onClick={() => deleteIngrediente(ingrediente.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 p-2"
                            title="Eliminar ingrediente"
                        >
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                ))}
                {ingredientes.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                        Aún no has agregado ingredientes.
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
