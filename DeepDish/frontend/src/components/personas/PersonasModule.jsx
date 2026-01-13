import React, { useEffect, useState } from 'react';
import usePersonasStore from '../../store/personasStore';
import PersonaCard from './PersonaCard';
import PersonaForm from './PersonaForm';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function PersonasModule() {
  const { personas, isLoading, fetchPersonas, addPersona, updatePersona, togglePersona } = usePersonasStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  const handleCreate = async (data) => {
    await addPersona(data);
    setIsFormOpen(false);
  };

  const handleUpdate = async (data) => {
    if (editingPersona) {
      await updatePersona(editingPersona.id, data);
      setEditingPersona(null);
      setIsFormOpen(false);
    }
  };

  const openCreate = () => {
    setEditingPersona(null);
    setIsFormOpen(true);
  };

  const openEdit = (persona) => {
    setEditingPersona(persona);
    setIsFormOpen(true);
  };

  if (isFormOpen) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeIn">
         <h3 className="text-lg font-bold text-gray-900 mb-4">
            {editingPersona ? 'Editar Persona' : 'Nueva Persona'}
         </h3>
         <PersonaForm 
            initialData={editingPersona}
            onSubmit={editingPersona ? handleUpdate : handleCreate}
            onCancel={() => setIsFormOpen(false)}
            isLoading={isLoading}
         />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-500">Gestiona los perfiles de tu familia y comensales.</p>
        <Button onClick={openCreate} icon={PlusIcon} size="sm">
          Agregar
        </Button>
      </div>

      {isLoading && personas.length === 0 ? (
        <div className="flex justify-center py-8">
            <Spinner size="lg" className="text-brand-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map(persona => (
            <PersonaCard 
                key={persona.id} 
                persona={persona} 
                onEdit={openEdit}
                onToggle={togglePersona}
            />
            ))}
            {personas.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    No hay personas registradas.
                </div>
            )}
        </div>
      )}
    </div>
  );
}
