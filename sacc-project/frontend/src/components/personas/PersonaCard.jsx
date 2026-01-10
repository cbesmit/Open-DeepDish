import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { PencilSquareIcon, UserIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';

export default function PersonaCard({ persona, onEdit, onToggle }) {
  const isInactive = !persona.activo;

  return (
    <Card className={cn("transition-opacity", isInactive && "opacity-60 bg-gray-50")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full", isInactive ? "bg-gray-200" : "bg-brand-100")}>
                <UserIcon className={cn("h-5 w-5", isInactive ? "text-gray-500" : "text-brand-600")} />
            </div>
            <div>
                <CardTitle className="text-base font-bold">
                  {persona.nombre}
                </CardTitle>
                <p className="text-sm text-gray-500">{persona.edad} años • {persona.sexo}</p>
            </div>
        </div>
        <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={persona.activo} 
                onChange={() => onToggle(persona.id, !persona.activo)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-2">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Gustos</span>
          <div className="flex flex-wrap gap-1">
            {persona.gustos?.length > 0 ? (
                persona.gustos.map((tag, i) => (
                <Badge key={i} variant="success" className="text-xs">{tag}</Badge>
                ))
            ) : <span className="text-xs text-gray-400 italic">Sin preferencias</span>}
          </div>
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Evitar</span>
          <div className="flex flex-wrap gap-1">
             {persona.disgustos?.length > 0 ? (
                persona.disgustos.map((tag, i) => (
                <Badge key={i} variant="danger" className="text-xs">{tag}</Badge>
                ))
             ) : <span className="text-xs text-gray-400 italic">Sin restricciones</span>}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-3 bg-transparent border-t-0 justify-end">
        <Button variant="ghost" size="sm" onClick={() => onEdit(persona)} className="text-gray-500">
            <PencilSquareIcon className="h-4 w-4 mr-1" /> Editar
        </Button>
      </CardFooter>
    </Card>
  );
}
