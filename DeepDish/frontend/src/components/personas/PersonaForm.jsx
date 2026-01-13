import React, { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import TagInput from '../ui/TagInput';

export default function PersonaForm({ initialData, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    nombre: '',
    edad: '',
    sexo: 'M',
    gustos: [],
    disgustos: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        gustos: initialData.gustos || [],
        disgustos: initialData.disgustos || []
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      edad: parseInt(formData.edad, 10)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        required
        placeholder="Ej. Juan Pérez"
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Edad"
          name="edad"
          type="number"
          value={formData.edad}
          onChange={handleChange}
          required
          min="0"
          max="120"
        />
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1.5">Sexo</label>
           <select
             name="sexo"
             value={formData.sexo}
             onChange={handleChange}
             className="w-full rounded-lg border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 py-3 text-base"
           >
             <option value="M">Masculino</option>
             <option value="F">Femenino</option>
             <option value="O">Otro</option>
           </select>
        </div>
      </div>

      <TagInput
        label="Gustos / Preferencias"
        tags={formData.gustos}
        onTagsChange={(tags) => setFormData(prev => ({ ...prev, gustos: tags }))}
        placeholder="Ej. Pollo, Picante..."
      />

      <TagInput
        label="Alergias / Disgustos"
        tags={formData.disgustos}
        onTagsChange={(tags) => setFormData(prev => ({ ...prev, disgustos: tags }))}
        placeholder="Ej. Maní, Mariscos..."
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
