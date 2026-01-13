import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { 
  HomeIcon, 
  SparklesIcon, 
  BookOpenIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import useAuthStore from '../../store/authStore';

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Generador IA', href: '/generador', icon: SparklesIcon },
    { name: 'Mis Recetas', href: '/recetas', icon: BookOpenIcon },
    { name: 'Configuración', href: '/config', icon: Cog6ToothIcon },
  ];

  return (
    <>
      <div className="md:hidden fixed top-0 w-full z-40 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center">
            <div className="h-8 w-8 bg-brand-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">DeepDish</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-gray-600 bg-opacity-75 top-16" onClick={() => setIsOpen(false)}></div>
      )}

      {/* Drawer Content */}
      <div
        className={cn(
          "md:hidden fixed z-40 top-16 left-0 w-full bg-white border-b border-gray-200 shadow-lg transition-all duration-300 ease-in-out transform origin-top",
          isOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 h-0"
        )}
      >
        <nav className="px-4 py-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-4 py-4 text-base font-medium rounded-xl transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-700 hover:bg-gray-50"
                )
              }
            >
              <item.icon className="mr-4 h-6 w-6 text-gray-500" />
              {item.name}
            </NavLink>
          ))}
          <div className="border-t border-gray-100 pt-4 mt-4">
             <button
              onClick={() => { logout(); setIsOpen(false); }}
              className="flex w-full items-center px-4 py-4 text-base font-medium text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-700"
            >
              <ArrowRightOnRectangleIcon className="mr-4 h-6 w-6 text-gray-500" />
              Cerrar Sesión
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
